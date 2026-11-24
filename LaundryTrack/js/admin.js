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
  if (ordersLoading) return getOrders();
  if (typeof getOrdersAPI !== "function") return getOrders();
  ordersLoading = true;
  try {
    const data = await getOrdersAPI();
    ordersCache = Array.isArray(data) ? data : [];
    ordersError = null;
    renderOrders();
    if (typeof tampilkanOrdersAPI === "function") tampilkanOrdersAPI();
    return ordersCache;
  } catch (error) {
    ordersError = error.message || "Tidak dapat terhubung ke server.";
    if (!ordersCache.length) renderOrders();
    return getOrders();
  } finally {
    ordersLoading = false;
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
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><strong>Memuat data...</strong></div></td></tr>`;
    return;
  }
  if (ordersError) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state" style="color:#dc2626"><strong>Gagal memuat</strong><p>${escapeHTML(ordersError)}</p></div></td></tr>`;
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
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><strong>Tidak ada pesanan</strong></div></td></tr>`;
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
    actions += `<button class="btn btn-primary" onclick="bukaAssign('${order.id}', 'jemput')">Tugaskan</button>`;
  if (order.status === "dijemput")
    actions += order.berat
      ? `<button class="btn btn-success" onclick="lanjutStatus('${order.id}')">Lanjut</button>`
      : `<button class="btn btn-warning" onclick="timbangOrder('${order.id}')">Timbang</button>`;
  if (order.status === "dicuci" || order.status === "disetrika")
    actions += `<button class="btn btn-success" onclick="lanjutStatus('${order.id}')">Lanjut</button>`;
  if (order.status === "siap")
    actions += `<button class="btn btn-primary" onclick="bukaAssign('${order.id}', 'antar')">Antar</button>`;

  return `<tr><td><span class="order-id">${escapeHTML(order.id)}</span></td><td><strong>${escapeHTML(order.nama || "-")}</strong><br><small>${escapeHTML(order.hp || "-")}</small></td><td>${escapeHTML(order.paket || "-")}</td><td>${escapeHTML(order.layanan || "-")}</td><td>${weight}</td><td><strong>${total}</strong></td><td><span class="badge ${status.badge}">${escapeHTML(status.label)}</span></td><td>${escapeHTML(courierText)}</td><td><div class="action-buttons">${actions}</div></td></tr>`;
}

function bukaFormOrder() {
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Buat Order Baru</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div><form onsubmit="simpanOrderBaru(event)"><div class="form-group"><label>Nama</label><input id="orderNama" required /></div><div class="form-group"><label>HP</label><input id="orderHp" required /></div><div class="form-group"><label>Alamat</label><textarea id="orderAlamat" required></textarea></div><div class="form-group"><label>Paket</label><select id="orderPaket" required><option value="Regular">Regular</option><option value="Kilat">Kilat</option><option value="Express">Express</option></select></div><div class="form-group"><label>Layanan</label><select id="orderLayanan" required><option value="Biasa">Biasa</option><option value="Komplit">Komplit</option><option value="Setrika">Setrika</option></select></div><div class="form-actions"><button type="button" class="btn btn-secondary" onclick="tutupModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div></form></div></div>`;
}
async function simpanOrderBaru(e) {
  e.preventDefault();
  const nama = document.getElementById("orderNama").value.trim(),
    hp = document.getElementById("orderHp").value.trim(),
    alamat = document.getElementById("orderAlamat").value.trim(),
    paket = document.getElementById("orderPaket").value,
    layanan = document.getElementById("orderLayanan").value;
  const id = "INV-" + String(Date.now()).slice(-4);
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
    log: [],
    dibuat: Date.now(),
  };
  try {
    await createOrderAPI(order);
    tutupModal();
    loadOrdersFromAPI();
  } catch (e) {
    alert("Gagal.");
  }
}
function bukaAssign(orderId, tipe) {
  /* Fungsi lama tetap sama */
}
async function tugaskanKurir(orderId, tipe) {
  /* Fungsi lama tetap sama */
}
function timbangOrder(orderId) {
  /* Fungsi lama tetap sama */
}
async function simpanTimbangan(orderId) {
  /* Fungsi lama tetap sama */
}
async function lanjutStatus(orderId) {
  /* Fungsi lama tetap sama */
}
function bukaDetail(orderId) {
  /* Fungsi lama tetap sama */
}
function tambahLog(order, status, keterangan) {
  if (!Array.isArray(order.log)) order.log = [];
  order.log.push({ waktu: Date.now(), status, keterangan });
}
async function resetData() {
  if (!confirm("Hapus semua?")) return;
  try {
    await deleteOrderAPI("");
    loadOrdersFromAPI();
  } catch (e) {
    alert("Gagal.");
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
  const dash = document.getElementById("dashboardPage"),
    dyn = document.getElementById("dynamicPage"),
    title = document.getElementById("pageTitle"),
    desc = document.getElementById("pageDescription");
  if (!dash || !dyn) return;
  if (page === "dashboard") {
    dash.style.display = "block";
    dyn.style.display = "none";
    title.textContent = "Dashboard";
    desc.textContent = "Pantau operasional.";
    renderOrders();
    return;
  }
  dash.style.display = "none";
  dyn.style.display = "block";
  title.textContent = page.toUpperCase();
  desc.textContent = "";
  if (page === "pesanan")
    dyn.innerHTML = `<section class="content-card"><table><thead><tr><th>ID</th><th>Pelanggan</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${getOrders().map(renderOrderRow).join("")}</tbody></table></section>`;
  else if (page === "paket") {
    title.textContent = "Kelola Layanan";
    desc.textContent = "CRUD Layanan (Laravel)";
    renderLayananPage();
  } else
    dyn.innerHTML = `<section class="content-card"><p>Halaman ${page}.</p></section>`;
}

function tutupModal() {
  document.getElementById("modalRoot").innerHTML = "";
}
function checkAdminSession() {
  if (!REQUIRE_ADMIN_LOGIN) return true;
  if (localStorage.getItem(ADMIN_SESSION_KEY)) {
    document.getElementById("adminLoginOverlay").classList.add("hidden");
    return true;
  }
  document.getElementById("adminLoginOverlay").classList.remove("hidden");
  return false;
}
function adminLogin() {
  if (
    document.getElementById("adminUserInput").value === ADMIN_USERNAME &&
    document.getElementById("adminPinInput").value === ADMIN_PIN
  ) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    document.getElementById("adminLoginOverlay").classList.add("hidden");
    loadOrdersFromAPI();
  } else {
    document.getElementById("adminLoginError").textContent = "Salah.";
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
  if (adminLoggedIn) renderOrders();
});

/* =====================================================
   FITUR CRUD LAYANAN (WEEK 9 + 10)
===================================================== */

async function renderLayananPage() {
  const dynamic = document.getElementById("dynamicPage");
  dynamic.innerHTML = `
    <section class="content-card">
      <div class="section-header">
        <div><h2>Daftar Layanan</h2><p>Data dari database Laravel.</p></div>
        <button class="btn btn-primary" onclick="bukaFormLayanan()">+ Tambah Layanan</button>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>No</th><th>Nama</th><th>Deskripsi</th><th>Harga/Kg</th><th>Aksi</th></tr></thead>
          <tbody id="serviceBody"><tr><td colspan="5">Memuat data...</td></tr></tbody>
        </table>
      </div>
    </section>
  `;
  loadServices();
}

async function loadServices() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/services");
    const result = await res.json();
    const data = result.data || [];
    const tbody = document.getElementById("serviceBody");
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Belum ada layanan</td></tr>';
      return;
    }

    tbody.innerHTML = data
      .map(
        (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nama}</strong></td>
        <td>${s.deskripsi || "-"}</td>
        <td>${Number(s.harga_per_kg).toLocaleString("id-ID")}</td>
        <td>
          <button class="btn btn-warning" onclick="bukaEditLayanan(${s.id})">Edit</button>
          <button class="btn btn-danger" onclick="hapusLayanan(${s.id})">Hapus</button>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (err) {
    document.getElementById("serviceBody").innerHTML =
      '<tr><td colspan="5" style="color:red;">Gagal memuat data API</td></tr>';
  }
}

function bukaFormLayanan() {
  document.getElementById("modalRoot").innerHTML = `
    <div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Tambah Layanan</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div>
    <form onsubmit="simpanLayanan(event)">
      <div class="form-group"><label>Nama Layanan</label><input id="layananNama" type="text" required /></div>
      <div class="form-group"><label>Deskripsi</label><textarea id="layananDeskripsi" required></textarea></div>
      <div class="form-group"><label>Harga per Kg</label><input id="layananHarga" type="number" required /></div>
      <div class="form-actions"><button type="button" class="btn btn-secondary" onclick="tutupModal()">Batal</button><button type="submit" class="btn btn-primary">Simpan</button></div>
    </form></div></div>
  `;
}

async function simpanLayanan(e) {
  e.preventDefault();
  const payload = {
    nama: document.getElementById("layananNama").value,
    deskripsi: document.getElementById("layananDeskripsi").value,
    harga_per_kg: document.getElementById("layananHarga").value,
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 422) {
      const errData = await res.json();
      const errorMsg = Object.values(errData.errors).flat().join("\n");
      alert("Validasi Gagal:\n" + errorMsg);
      return;
    }

    tutupModal();
    loadServices();
    alert("Layanan berhasil ditambahkan!");
  } catch (err) {
    alert("Gagal menghubungi server.");
  }
}

async function bukaEditLayanan(id) {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/services/${id}`);
    const result = await res.json();
    const s = result.data;

    document.getElementById("modalRoot").innerHTML = `
      <div class="modal-overlay"><div class="modal"><div class="modal-header"><h3>Edit Layanan</h3><button class="close-modal" onclick="tutupModal()"><i class="fa-solid fa-xmark"></i></button></div>
      <form onsubmit="simpanEditLayanan(event, ${s.id})">
        <div class="form-group"><label>Nama Layanan</label><input id="editLayananNama" type="text" value="${s.nama}" required /></div>
        <div class="form-group"><label>Deskripsi</label><textarea id="editLayananDeskripsi" required>${s.deskripsi}</textarea></div>
        <div class="form-group"><label>Harga per Kg</label><input id="editLayananHarga" type="number" value="${s.harga_per_kg}" required /></div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" onclick="tutupModal()">Batal</button><button type="submit" class="btn btn-primary">Update</button></div>
      </form></div></div>
    `;
  } catch (err) {
    alert("Gagal mengambil data layanan.");
  }
}

async function simpanEditLayanan(e, id) {
  e.preventDefault();
  const payload = {
    nama: document.getElementById("editLayananNama").value,
    deskripsi: document.getElementById("editLayananDeskripsi").value,
    harga_per_kg: document.getElementById("editLayananHarga").value,
  };

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/services/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 422) {
      const errData = await res.json();
      const errorMsg = Object.values(errData.errors).flat().join("\n");
      alert("Validasi Gagal:\n" + errorMsg);
      return;
    }

    tutupModal();
    loadServices();
    alert("Layanan berhasil diperbarui!");
  } catch (err) {
    alert("Gagal menghubungi server.");
  }
}

async function hapusLayanan(id) {
  if (!confirm("Yakin hapus layanan ini?")) return;
  try {
    await fetch(`http://127.0.0.1:8000/api/services/${id}`, {
      method: "DELETE",
    });
    loadServices();
  } catch (err) {
    alert("Gagal menghapus layanan.");
  }
}
