/* =========================================================
   LAUNDRYTRACK - ADMIN PORTAL (FINAL LENGKAP)
========================================================= */

const REQUIRE_ADMIN_LOGIN = true;
const ADMIN_USERNAME = "admin";
const ADMIN_PIN = "admin123";
const ADMIN_SESSION_KEY = "laundrytrack_admin_session";

let adminLoggedIn = false;
let ordersCache = [];
let ordersLoading = false;
let ordersError = null;

function getOrders() {
  return Array.isArray(ordersCache) ? ordersCache : [];
}

async function loadOrdersFromAPI() {
  try {
    ordersLoading = true;
    ordersError = null;
    renderOrders();
    const data = await getOrdersAPI();
    ordersCache = Array.isArray(data) ? data : [];
    ordersLoading = false;
    renderOrders();

    const active = document.querySelector(".nav-link.active");
    if (active && active.dataset.page !== "dashboard") {
      tampilkanHalaman(active.dataset.page);
    }
    if (typeof tampilkanOrdersAPI === "function") tampilkanOrdersAPI();
  } catch (error) {
    ordersLoading = false;
    ordersError = error.message || "Tidak dapat terhubung ke server.";
    renderOrders();
  }
}

function money(value) {
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStatusInfo(status) {
  const fallback = {
    menunggu: { label: "Menunggu Penjemputan", badge: "badge-jemput" },
    ditugaskan_jemput: {
      label: "Kurir Ditugaskan - Jemput",
      badge: "badge-assigned",
    },
    dijemput: { label: "Sudah Dijemput", badge: "badge-assigned" },
    dicuci: { label: "Sedang Dicuci", badge: "badge-cuci" },
    disetrika: { label: "Sedang Disetrika", badge: "badge-cuci" },
    siap: { label: "Siap Diantar", badge: "badge-antar" },
    ditugaskan_antar: {
      label: "Kurir Ditugaskan - Antar",
      badge: "badge-assigned",
    },
    selesai: { label: "Selesai", badge: "badge-selesai" },
  };
  return fallback[status] || { label: status, badge: "badge-assigned" };
}

function updateDashboard() {
  const orders = getOrders();
  if (document.getElementById("statMasuk"))
    document.getElementById("statMasuk").textContent = orders.length;
  if (document.getElementById("statJemput"))
    document.getElementById("statJemput").textContent = orders.filter(
      (o) => o.status === "menunggu" || o.status === "ditugaskan_jemput",
    ).length;
  if (document.getElementById("statProses"))
    document.getElementById("statProses").textContent = orders.filter((o) =>
      ["dijemput", "dicuci", "disetrika"].includes(o.status),
    ).length;
  if (document.getElementById("statUang"))
    document.getElementById("statUang").textContent = money(
      orders
        .filter((o) => o.status === "selesai")
        .reduce((sum, o) => sum + Number(o.total || 0), 0),
    );
}

function renderOrders() {
  const tbody = document.getElementById("orderBody");
  if (!tbody) return;

  if (ordersLoading) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><strong>Memuat data...</strong></div></td></tr>`;
    return;
  }
  if (ordersError) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state" style="color:#dc2626"><strong>Gagal memuat</strong><p>${escapeHTML(ordersError)}</p><button class="btn btn-primary" onclick="loadOrdersFromAPI()">Coba Lagi</button></div></td></tr>`;
    return;
  }

  let orders = getOrders();
  const search = (document.getElementById("searchOrder")?.value || "")
    .toLowerCase()
    .trim();
  const filter = document.getElementById("filterStatus")?.value || "semua";

  if (search)
    orders = orders.filter(
      (o) =>
        String(o.id).toLowerCase().includes(search) ||
        String(o.nama).toLowerCase().includes(search),
    );
  if (filter !== "semua") orders = orders.filter((o) => o.status === filter);

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><strong>Tidak ada pesanan</strong><p>Belum ada data.</p></div></td></tr>`;
    updateDashboard();
    return;
  }

  tbody.innerHTML = orders.map(renderOrderRow).join("");
  updateDashboard();
}

function renderOrderRow(order) {
  const status = getStatusInfo(order.status);
  let kj = order.kurirJemput;
  if (typeof kj === "string") {
    try {
      kj = JSON.parse(kj);
    } catch (e) {}
  }
  let ka = order.kurirAntar;
  if (typeof ka === "string") {
    try {
      ka = JSON.parse(ka);
    } catch (e) {}
  }

  const weight = order.berat ? `${order.berat} kg` : "-";
  const total = order.total ? money(order.total) : "Belum ditimbang";
  const pickupCourier = kj?.nama || order.kurir?.nama || "-";
  const deliveryCourier = ka?.nama || "-";
  let courierText = pickupCourier !== "-" ? pickupCourier : deliveryCourier;

  let actions = `<button class="btn btn-info" onclick="bukaDetail('${order.id}')">Detail</button>`;
  if (order.status === "menunggu")
    actions += `<button class="btn btn-primary" onclick="bukaAssign('${order.id}', 'jemput')">Tugaskan Jemput</button>`;
  if (order.status === "dijemput")
    actions += order.berat
      ? `<button class="btn btn-success" onclick="lanjutStatus('${order.id}')">Lanjut Proses</button>`
      : `<button class="btn btn-warning" onclick="timbangOrder('${order.id}')">Timbang</button>`;
  if (order.status === "dicuci" || order.status === "disetrika")
    actions += `<button class="btn btn-success" onclick="lanjutStatus('${order.id}')">Lanjut</button>`;
  if (order.status === "siap")
    actions += `<button class="btn btn-primary" onclick="bukaAssign('${order.id}', 'antar')">Tugaskan Antar</button>`;

  return `<tr><td><span class="order-id">${escapeHTML(order.id)}</span></td><td><strong>${escapeHTML(order.nama || "-")}</strong><br><small>${escapeHTML(order.hp || "-")}</small></td><td>${escapeHTML(order.paket || "-")}</td><td>${escapeHTML(order.layanan || "-")}</td><td>${weight}</td><td><strong>${total}</strong></td><td><span class="badge ${status.badge}">${escapeHTML(status.label)}</span></td><td>${escapeHTML(courierText)}</td><td><div class="action-buttons">${actions}</div></td></tr>`;
}

function bukaFormOrder() {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Buat Order Baru</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div>
    <form onsubmit="simpanOrderBaru(event)">
      <div class="form-group"><label>Nama Pelanggan</label><input id="orderNama" type="text" required /></div>
      <div class="form-group"><label>Nomor HP</label><input id="orderHp" type="text" required /></div>
      <div class="form-group"><label>Alamat</label><textarea id="orderAlamat" required></textarea></div>
      <div class="form-group"><label>Paket</label><select id="orderPaket" required><option value="">Pilih</option><option value="Kilat">Kilat</option><option value="Express">Express</option><option value="Regular">Regular</option></select></div>
      <div class="form-group"><label>Layanan</label><select id="orderLayanan" required><option value="">Pilih</option><option value="Komplit">Komplit</option><option value="Biasa">Biasa</option><option value="Setrika">Setrika</option></select></div>
      <div class="form-actions"><button type="button" class="btn btn-secondary" onclick="tutupModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
    </form></div></div>`;
}

async function simpanOrderBaru(e) {
  e.preventDefault();
  const nama = document.getElementById("orderNama").value.trim();
  const hp = document.getElementById("orderHp").value.trim();
  const alamat = document.getElementById("orderAlamat").value.trim();
  const paket = document.getElementById("orderPaket").value;
  const layanan = document.getElementById("orderLayanan").value;

  if (!nama || !hp || !alamat || !paket || !layanan) {
    alert("Semua data harus diisi.");
    return;
  }

  const orders = getOrders();
  const id =
    typeof buatIdNota === "function"
      ? buatIdNota()
      : "INV-" + String(orders.length + 1).padStart(4, "0");
  const order = {
    id,
    nama,
    hp,
    alamat,
    paket,
    layanan,
    berat: null,
    hargaPerKg: null,
    total: null,
    antarJemput: true,
    status: "menunggu",
    kurirJemput: null,
    kurirAntar: null,
    kurir: null,
    log: [
      { waktu: Date.now(), status: "menunggu", keterangan: "Order dibuat" },
    ],
    dibuat: Date.now(),
  };

  try {
    await createOrderAPI(order);
    tutupModal();
    loadOrdersFromAPI();
  } catch (error) {
    alert("Gagal membuat order.");
  }
}

function bukaAssign(orderId, tipe) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;
  const daftar =
    typeof DAFTAR_KURIR !== "undefined"
      ? DAFTAR_KURIR
      : [
          { id: "KR-01", nama: "Budi" },
          { id: "KR-02", nama: "Andi" },
        ];
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Tugaskan Kurir</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div>
    <div style="background:#f8fafc;padding:14px;border-radius:10px;margin-bottom:16px"><strong>${escapeHTML(order.id)}</strong><p style="font-size:12px">${escapeHTML(order.nama)}</p></div>
    <div class="form-group"><label>Pilih Kurir</label><select id="selectedCourier">${daftar.map((k) => `<option value="${k.id}">${escapeHTML(k.nama)} (${k.id})</option>`).join("")}</select></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="tutupModal()">Batal</button><button class="btn btn-primary" onclick="tugaskanKurir('${orderId}', '${tipe}')">Tugaskan</button></div></div></div>`;
}

async function tugaskanKurir(orderId, tipe) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;
  const courierId = document.getElementById("selectedCourier").value;
  const daftar =
    typeof DAFTAR_KURIR !== "undefined"
      ? DAFTAR_KURIR
      : [
          { id: "KR-01", nama: "Budi" },
          { id: "KR-02", nama: "Andi" },
        ];
  const courier = daftar.find((k) => k.id === courierId);
  if (!courier) return;

  const update = { ...order };
  if (tipe === "jemput") {
    update.kurirJemput = courier;
    update.kurir = courier;
    update.status = "ditugaskan_jemput";
    tambahLog(
      update,
      "ditugaskan_jemput",
      "Kurir ditugaskan untuk penjemputan",
    );
  } else {
    update.kurirAntar = courier;
    update.status = "ditugaskan_antar";
    tambahLog(update, "ditugaskan_antar", "Kurir ditugaskan untuk pengantaran");
  }

  try {
    await updateOrderAPI(orderId, update);
    tutupModal();
    loadOrdersFromAPI();
    alert("Kurir berhasil ditugaskan.");
  } catch (e) {
    alert("Gagal menugaskan kurir.");
  }
}

function timbangOrder(orderId) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Timbang Pakaian</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="form-group"><label>Berat (kg)</label><input id="inputBerat" type="number" min="0.1" step="0.1" required /></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="tutupModal()">Batal</button><button class="btn btn-success" onclick="simpanTimbangan('${orderId}')">Simpan</button></div></div></div>`;
}

async function simpanTimbangan(orderId) {
  const berat = Number(document.getElementById("inputBerat").value);
  if (!berat || berat <= 0) {
    alert("Berat tidak valid.");
    return;
  }
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;

  let harga =
    typeof hargaLayanan === "function"
      ? hargaLayanan(order.paket, order.layanan)
      : 0;
  const update = {
    ...order,
    berat,
    hargaPerKg: harga,
    total: Math.round(berat * harga),
  };
  tambahLog(
    update,
    "ditimbang",
    `Pakaian ditimbang ${berat} kg, total ${money(update.total)}`,
  );

  try {
    await updateOrderAPI(orderId, update);
    tutupModal();
    loadOrdersFromAPI();
    alert(`Berat disimpan. Total: ${money(update.total)}`);
  } catch (e) {
    alert("Gagal menyimpan.");
  }
}

async function lanjutStatus(orderId) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;
  let nextStatus = null;
  if (order.status === "dijemput")
    nextStatus = order.layanan === "Setrika" ? "disetrika" : "dicuci";
  else if (order.status === "dicuci")
    nextStatus = order.layanan === "Komplit" ? "disetrika" : "siap";
  else if (order.status === "disetrika") nextStatus = "siap";
  if (!nextStatus) return;

  const update = { ...order, status: nextStatus };
  tambahLog(update, nextStatus, getStatusInfo(nextStatus).label);
  try {
    await updateOrderAPI(orderId, update);
    loadOrdersFromAPI();
  } catch (e) {
    alert("Gagal update status.");
  }
}

function bukaDetail(orderId) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;
  const status = getStatusInfo(order.status);
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Detail ${escapeHTML(order.id)}</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="info-grid"><div class="info-card"><h3>Pelanggan</h3><p>Nama: ${escapeHTML(order.nama)}</p><p>HP: ${escapeHTML(order.hp)}</p><p>Alamat: ${escapeHTML(order.alamat)}</p></div>
    <div class="info-card"><h3>Layanan</h3><p>Paket: ${escapeHTML(order.paket)}</p><p>Layanan: ${escapeHTML(order.layanan)}</p><p>Status: ${escapeHTML(status.label)}</p></div>
    <div class="info-card"><h3>Timbangan</h3><p>Berat: ${order.berat ? order.berat + " kg" : "-"}</p><p>Total: ${order.total ? money(order.total) : "-"}</p></div></div>
    <div class="form-actions"><button class="btn btn-secondary" onclick="tutupModal()">Tutup</button></div></div></div>`;
}

function tambahLog(order, status, keterangan) {
  if (!Array.isArray(order.log)) order.log = [];
  order.log.push({ waktu: Date.now(), status, keterangan });
}

async function resetData() {
  if (!confirm("Yakin hapus SEMUA data?")) return;
  try {
    await deleteOrderAPI("");
    loadOrdersFromAPI();
    alert("Data direset.");
  } catch (e) {
    alert("Gagal reset.");
  }
}

function setupNavigation() {
  document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
      tampilkanHalaman(this.dataset.page);
    });
  });
}

function tampilkanHalaman(page) {
  const dashboard = document.getElementById("dashboardPage");
  const dynamic = document.getElementById("dynamicPage");
  const title = document.getElementById("pageTitle");
  const desc = document.getElementById("pageDescription");

  if (page === "dashboard") {
    dashboard.style.display = "block";
    dynamic.style.display = "none";
    title.textContent = "Dashboard Overview";
    desc.textContent = "Pantau operasional hari ini.";
    renderOrders();
    return;
  }
  dashboard.style.display = "none";
  dynamic.style.display = "block";

  if (page === "pesanan") {
    title.textContent = "Kelola Pesanan";
    desc.textContent = "Semua pesanan.";
    dynamic.innerHTML = `<section class="content-card"><div class="table-container"><table><thead><tr><th>ID</th><th>Pelanggan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${getOrders().map(renderOrderRow).join("")}</tbody></table></div></section>`;
  } else if (page === "armada") {
    title.textContent = "Armada Kurir";
    desc.textContent = "Info kurir.";
    dynamic.innerHTML = `<section class="content-card"><p>Total Kurir: 2 (Budi, Andi)</p></section>`;
  } else if (page === "pelanggan") {
    title.textContent = "Pelanggan";
    desc.textContent = "Data pelanggan.";
    dynamic.innerHTML = `<section class="content-card"><p>Data pelanggan ada di pesanan.</p></section>`;
  } else if (page === "laporan") {
    title.textContent = "Laporan";
    desc.textContent = "Ringkasan transaksi.";
    dynamic.innerHTML = `<section class="content-card"><h3>Total Pendapatan: ${money(
      getOrders()
        .filter((o) => o.status === "selesai")
        .reduce((s, o) => s + Number(o.total || 0), 0),
    )}</h3></section>`;
  } else if (page === "paket") {
    title.textContent = "Paket Layanan";
    desc.textContent = "Daftar harga.";
    dynamic.innerHTML = `<section class="content-card"><p>Kilat, Express, Regular</p></section>`;
  }
}

function tutupModal() {
  document.getElementById("modalRoot").innerHTML = "";
}

function checkAdminSession() {
  if (localStorage.getItem(ADMIN_SESSION_KEY)) {
    adminLoggedIn = true;
    document.getElementById("adminLoginOverlay").classList.add("hidden");
    return true;
  }
  document.getElementById("adminLoginOverlay").classList.remove("hidden");
  return false;
}

function adminLogin() {
  const user = document.getElementById("adminUserInput")?.value.trim();
  const pin = document.getElementById("adminPinInput")?.value.trim();
  const err = document.getElementById("adminLoginError");

  if (user === ADMIN_USERNAME && pin === ADMIN_PIN) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    document.getElementById("adminLoginOverlay").classList.add("hidden");
    loadOrdersFromAPI();
  } else {
    if (err) err.textContent = "Username atau PIN salah.";
  }
}

function adminLogout() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  location.reload();
}

document.addEventListener("DOMContentLoaded", async function () {
  setupNavigation();
  const loggedIn = checkAdminSession();
  document
    .getElementById("adminLoginBtn")
    ?.addEventListener("click", adminLogin);
  document
    .getElementById("searchOrder")
    ?.addEventListener("input", renderOrders);
  document
    .getElementById("filterStatus")
    ?.addEventListener("change", renderOrders);

  if (loggedIn) await loadOrdersFromAPI();
});

window.addEventListener("laundrytrack:orders-updated", function () {
  if (adminLoggedIn) {
    renderOrders();
  }
});
