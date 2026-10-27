/* =========================================================
   LAUNDRYTRACK - PORTAL KURIR (FINAL FIX)
========================================================= */

let kurirAktif = null;
let filterAktif = "semua";
let ordersCache = [];
let ordersLoading = false;
let ordersError = null;
let pollingKurir = null;

const KURIR_SESSION_KEY = "laundrytrack_kurir_aktif";

function getOrders() {
  return Array.isArray(ordersCache) ? ordersCache : [];
}

async function loadOrdersFromAPI() {
  if (typeof getOrdersAPI !== "function") return getOrders();
  try {
    ordersLoading = true;
    ordersError = null;
    renderCurrentPage();
    const data = await getOrdersAPI();
    ordersCache = Array.isArray(data) ? data : [];
    ordersLoading = false;
    renderCurrentPage();
    return ordersCache;
  } catch (error) {
    ordersLoading = false;
    ordersError = error.message || "Gagal koneksi.";
    renderCurrentPage();
    return getOrders();
  }
}

function escapeHtml(text) {
  if (typeof esc === "function") return esc(text);
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function simpanSessionKurir(kurir) {
  kurirAktif = kurir;
  try {
    localStorage.setItem(KURIR_SESSION_KEY, JSON.stringify(kurir));
  } catch (e) {}
}

function ambilSessionKurir() {
  try {
    const raw = localStorage.getItem(KURIR_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hapusSessionKurir() {
  try {
    localStorage.removeItem(KURIR_SESSION_KEY);
  } catch (e) {}
  kurirAktif = null;
}

function prosesLogin() {
  const select = document.getElementById("kurirSelect");
  const pinInput = document.getElementById("pinInput");
  const errorEl = document.getElementById("loginError");
  const id = select?.value?.trim();
  const pin = pinInput?.value?.trim();

  if (errorEl) errorEl.style.display = "none";
  if (!id) {
    if (errorEl) {
      errorEl.textContent = "Pilih kurir.";
      errorEl.style.display = "block";
    }
    return;
  }
  if (!pin || pin.length < 4) {
    if (errorEl) {
      errorEl.textContent = "PIN minimal 4 digit.";
      errorEl.style.display = "block";
    }
    return;
  }

  const daftar =
    typeof DAFTAR_KURIR !== "undefined"
      ? DAFTAR_KURIR
      : [
          { id: "KR-01", nama: "Budi" },
          { id: "KR-02", nama: "Andi" },
        ];
  const kurir = daftar.find((k) => k.id === id);
  if (!kurir) {
    if (errorEl) {
      errorEl.textContent = "Kurir tidak ditemukan.";
      errorEl.style.display = "block";
    }
    return;
  }

  simpanSessionKurir({ id: kurir.id, nama: kurir.nama });
  renderCurrentPage();
}

function logout() {
  hapusSessionKurir();
  if (pollingKurir) clearInterval(pollingKurir);
  location.reload();
}

function initKurir() {
  kurirAktif = ambilSessionKurir() || null;
}

function filterTugas(filter, button) {
  filterAktif = filter || "semua";
  document
    .querySelectorAll(".filter-btn")
    .forEach((item) => item.classList.remove("active"));
  if (button) button.classList.add("active");
  renderTugas();
}

// MENGAMBIL DATA KURIR (ANTI DOUBLE ENCODE)
function parseKurir(data) {
  if (!data) return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }
  return data;
}

function getTugasKurir() {
  if (!kurirAktif) return [];
  const idKurir = kurirAktif.id;

  return getOrders().filter((order) => {
    const kj = parseKurir(order.kurirJemput);
    const ka = parseKurir(order.kurirAntar);

    // LOGIKA MUTLAK: Hanya lihat status pesanan
    const tugasJemput =
      order.status === "ditugaskan_jemput" && kj && kj.id === idKurir;
    const tugasAntar =
      order.status === "ditugaskan_antar" && ka && ka.id === idKurir;

    if (filterAktif === "jemput") return tugasJemput;
    if (filterAktif === "antar") return tugasAntar;
    return tugasJemput || tugasAntar;
  });
}

function getRiwayatKurir() {
  if (!kurirAktif) return [];
  const idKurir = kurirAktif.id;
  return getOrders().filter((order) => {
    const kj = parseKurir(order.kurirJemput);
    const ka = parseKurir(order.kurirAntar);
    const pernahJemput =
      kj?.id === idKurir &&
      Array.isArray(order.log) &&
      order.log.some(
        (log) =>
          log.status === "dijemput" &&
          (log.oleh === kurirAktif.nama ||
            log.keterangan?.toLowerCase().includes("penjemputan")),
      );
    const pernahAntar = ka?.id === idKurir && order.status === "selesai";
    return pernahJemput || pernahAntar;
  });
}

function renderCurrentPage() {
  if (!kurirAktif) {
    renderLogin();
    return;
  }
  const halamanAktif =
    document.querySelector(".bottom-nav .nav-item.active")?.dataset?.page ||
    "tugas";
  if (halamanAktif === "riwayat") tampilkanRiwayat();
  else if (halamanAktif === "akun") renderAkun();
  else renderTugas();
}

function renderLogin() {
  const loginScreen = document.getElementById("loginScreen");
  const dashboardScreen = document.getElementById("dashboardScreen");
  if (loginScreen) loginScreen.style.display = "flex";
  if (dashboardScreen) dashboardScreen.style.display = "none";
}

function renderApp() {
  const loginScreen = document.getElementById("loginScreen");
  const dashboardScreen = document.getElementById("dashboardScreen");
  const nameEl = document.getElementById("namaKurirText");
  if (loginScreen) loginScreen.style.display = "none";
  if (dashboardScreen) dashboardScreen.style.display = "block";
  if (nameEl && kurirAktif) nameEl.textContent = kurirAktif.nama;
}

function updateStatistik() {
  const sisaEl = document.getElementById("countSisa");
  const selesaiEl = document.getElementById("countSelesai");
  if (!kurirAktif) {
    if (sisaEl) sisaEl.textContent = "0";
    if (selesaiEl) selesaiEl.textContent = "0";
    return;
  }
  const idKurir = kurirAktif.id;

  const sisa = getOrders().filter((order) => {
    const kj = parseKurir(order.kurirJemput);
    const ka = parseKurir(order.kurirAntar);
    const tugasJemput =
      order.status === "ditugaskan_jemput" && kj && kj.id === idKurir;
    const tugasAntar =
      order.status === "ditugaskan_antar" && ka && ka.id === idKurir;
    return tugasJemput || tugasAntar;
  }).length;

  const selesai = getRiwayatKurir().length;
  if (sisaEl) sisaEl.textContent = String(sisa);
  if (selesaiEl) selesaiEl.textContent = String(selesai);
}

function renderTugas() {
  if (!kurirAktif) {
    renderLogin();
    return;
  }
  renderApp();
  updateStatistik();
  const taskList = document.getElementById("taskList");
  if (!taskList) return;

  if (ordersLoading) {
    taskList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-spinner fa-spin" style="color:#2563eb"></i><strong style="display:block;color:#334155;margin-bottom:6px">Memuat tugas...</strong></div>`;
    return;
  }
  if (ordersError) {
    taskList.innerHTML = `<div class="empty-state" style="color:#dc2626"><strong>Gagal memuat</strong><p>${escapeHtml(ordersError)}</p><button class="btn-primary" onclick="loadOrdersFromAPI()">Coba Lagi</button></div>`;
    return;
  }

  const tugas = getTugasKurir();
  if (!tugas.length) {
    taskList.innerHTML = `<div class="empty-state"><i class="fa-solid fa-motorcycle"></i><strong style="display:block;color:#334155;margin-bottom:6px">Tidak ada tugas</strong><p>Belum ada tugas aktif.</p></div>`;
    return;
  }

  taskList.innerHTML = tugas
    .map((order) => {
      // LOGIKA MUTLAK: Tipe ditentukan status
      const isPickup = order.status === "ditugaskan_jemput";
      const tipe = isPickup ? "jemput" : "antar";
      const judul = isPickup ? "Penjemputan" : "Pengantaran";
      const tombol = isPickup
        ? "Konfirmasi Sudah Dijemput"
        : "Konfirmasi Sudah Diantar";

      const alamatLengkap = String(order.alamat || "").trim();
      const mapsUrl = alamatLengkap
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alamatLengkap)}`
        : null;

      return `
      <div class="task-card">
        <div class="t-header"><span class="task-id">${escapeHtml(order.id)}</span><span class="t-badge ${isPickup ? "bg-jemput" : "bg-antar"}">${judul}</span></div>
        <h3 class="t-name">${escapeHtml(order.nama || "-")}</h3>
        <p class="t-address"><i class="fa-solid fa-location-dot location-icon"></i> ${escapeHtml(order.alamat || "-")}</p>
        <p style="font-size:0.75rem;color:#64748b;margin-bottom:6px"><i class="fa-solid fa-phone" style="color:#2563eb;margin-right:4px"></i> ${escapeHtml(order.hp || "-")}</p>
        <div class="action-row">
          ${mapsUrl ? `<button class="btn-map" onclick="bukaMaps('${mapsUrl.replace(/'/g, "\\'")}')"><i class="fa-solid fa-map-location-dot"></i> Buka Maps</button>` : ""}
          <button class="btn-done" onclick="selesaikanOrder('${order.id}', '${tipe}')"><i class="fa-solid fa-circle-check"></i> ${tombol}</button>
        </div>
      </div>`;
    })
    .join("");
}

function bukaMaps(url) {
  if (url) window.open(url, "_blank");
}

async function selesaikanOrder(orderId, tipe) {
  if (!kurirAktif) return;
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;
  const update = { ...order };
  if (!Array.isArray(update.log)) update.log = [];

  if (tipe === "jemput") {
    update.status = "dijemput";
    update.dijemputPada = Date.now();
    update.log.push({
      waktu: Date.now(),
      status: "dijemput",
      aksi: "Dijemput",
      oleh: kurirAktif.nama,
      keterangan: "Kurir menyelesaikan penjemputan",
    });
  } else {
    update.status = "selesai";
    update.selesaiPada = Date.now();
    update.log.push({
      waktu: Date.now(),
      status: "selesai",
      aksi: "Diantar",
      oleh: kurirAktif.nama,
      keterangan: "Kurir menyelesaikan pengantaran",
    });
  }

  try {
    const saved = await updateOrderAPI(orderId, update);
    const index = ordersCache.findIndex((o) => o.id === orderId);
    if (index >= 0) ordersCache[index] = saved || update;
    renderCurrentPage();
    alert(
      tipe === "jemput" ? "Penjemputan berhasil." : "Pengantaran berhasil.",
    );
  } catch (error) {
    alert("Gagal update status.");
  }
}

function tampilkanRiwayat() {
  if (!kurirAktif) return;
  renderApp();
  const container = document.getElementById("riwayatSection");
  if (!container) return;
  const riwayat = getRiwayatKurir();

  if (!riwayat.length) {
    container.innerHTML = `<div class="section-title" style="padding:20px;font-weight:700;font-size:18px">Riwayat</div><div class="empty-state"><i class="fa-solid fa-clock-rotate-left"></i><p>Belum ada riwayat.</p></div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-title" style="padding:20px;font-weight:700;font-size:18px">Riwayat</div>
    <div class="history-list">
      ${riwayat
        .map((order) => {
          const wJ = order.dijemputPada
            ? new Date(order.dijemputPada).toLocaleString("id-ID", {
                dateStyle: "short",
              })
            : null;
          const wS = order.selesaiPada
            ? new Date(order.selesaiPada).toLocaleString("id-ID", {
                dateStyle: "short",
              })
            : null;
          const st =
            order.status === "selesai"
              ? "Selesai"
              : order.status === "dijemput"
                ? "Sudah Dijemput"
                : order.status;
          return `<div class="history-card"><div class="history-icon"><i class="fa-solid fa-circle-check"></i></div><div class="history-content"><div class="history-top"><strong>${escapeHtml(order.id)}</strong><span>${escapeHtml(st)}</span></div><h3>${escapeHtml(order.nama || "-")}</h3><p>${escapeHtml(order.alamat || "-")}</p><small>${wJ ? "Jemput: " + wJ : ""} ${wS ? " · Selesai: " + wS : ""}</small></div></div>`;
        })
        .join("")}
    </div>`;
}

function renderAkun() {
  if (!kurirAktif) {
    renderLogin();
    return;
  }
  renderApp();
  const container = document.getElementById("akunSection");
  if (!container) return;
  const riwayat = getRiwayatKurir();
  const totalSelesai = riwayat.length;
  const totalJemput = getOrders().filter(
    (o) =>
      parseKurir(o.kurirJemput)?.id === kurirAktif.id &&
      o.status === "dijemput",
  ).length;

  container.innerHTML = `
    <div class="profile-card"><div class="profile-icon"><i class="fa-solid fa-motorcycle"></i></div><h2>${escapeHtml(kurirAktif.nama)}</h2><p>${escapeHtml(kurirAktif.id)}</p><div class="profile-status"><i class="fa-solid fa-circle"></i> Aktif</div></div>
    <div class="account-info">
      <div class="account-item"><i class="fa-solid fa-user"></i><div><span>Nama</span><strong>${escapeHtml(kurirAktif.nama)}</strong></div></div>
      <div class="account-item"><i class="fa-solid fa-id-badge"></i><div><span>ID</span><strong>${escapeHtml(kurirAktif.id)}</strong></div></div>
      <div class="account-item"><i class="fa-solid fa-circle-check"></i><div><span>Selesai</span><strong>${totalSelesai} tugas</strong></div></div>
    </div>
    <button class="btn-logout-account" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Keluar</button>`;
}

function tampilkanHalaman(halaman) {
  const taskList = document.getElementById("taskList");
  const filterContainer = document.querySelector(".filter-container");
  const statsWrapper = document.querySelector(".stats-wrapper");
  const riwayat = document.getElementById("riwayatSection");
  const akun = document.getElementById("akunSection");
  if (taskList) taskList.style.display = halaman === "tugas" ? "block" : "none";
  if (filterContainer)
    filterContainer.style.display = halaman === "tugas" ? "flex" : "none";
  if (statsWrapper)
    statsWrapper.style.display = halaman === "tugas" ? "grid" : "none";
  if (riwayat) riwayat.style.display = halaman === "riwayat" ? "block" : "none";
  if (akun) akun.style.display = halaman === "akun" ? "block" : "none";

  document.querySelectorAll(".bottom-nav .nav-item").forEach(function (item) {
    item.classList.remove("active");
    if (item.dataset.page === halaman) item.classList.add("active");
  });

  if (halaman === "tugas") renderTugas();
  else if (halaman === "riwayat") tampilkanRiwayat();
  else if (halaman === "akun") renderAkun();
}

function setupEvent() {
  const btnLogin = document.getElementById("btnMulaiBertugas");
  if (btnLogin) btnLogin.addEventListener("click", prosesLogin);
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) btnLogout.addEventListener("click", logout);
  document.querySelectorAll(".filter-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      filterTugas(button.dataset.filter, button);
    });
  });
  document.querySelectorAll(".bottom-nav .nav-item").forEach(function (button) {
    button.addEventListener("click", function () {
      tampilkanHalaman(button.dataset.page);
    });
  });
  const pin = document.getElementById("pinInput");
  if (pin)
    pin.addEventListener("keydown", function (event) {
      if (event.key === "Enter") prosesLogin();
    });
  window.addEventListener("storage", function () {
    renderCurrentPage();
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  initKurir();
  setupEvent();
  if (!kurirAktif) {
    renderLogin();
  } else {
    renderApp();
    renderTugas();
  }
  await loadOrdersFromAPI();
  if (pollingKurir) clearInterval(pollingKurir);
  pollingKurir = setInterval(async function () {
    await loadOrdersFromAPI();
  }, 3000);
});
