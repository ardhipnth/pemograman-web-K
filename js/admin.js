/* =====================================================
   LAUNDRYTRACK - ADMIN PORTAL
   Pertemuan 3 (Auth) + Pertemuan 4 (API)
===================================================== */

/* =====================================================
   KONFIGURASI LOGIN
===================================================== */

const REQUIRE_ADMIN_LOGIN = true; // set false untuk bypass saat dev
const ADMIN_USERNAME = "admin";
const ADMIN_PIN = "admin123";
const ADMIN_SESSION_KEY = "laundrytrack_admin_session";

let adminLoggedIn = false;
let pollingAdmin = null;

/* =====================================================
   API CACHE
===================================================== */

let ordersCache = [];
let ordersLoading = false;
let ordersError = null;

/* =====================================================
   GET / SAVE ORDERS
===================================================== */

function getOrders() {
  return Array.isArray(ordersCache) ? ordersCache : [];
}

function saveOrders(data) {
  ordersCache = Array.isArray(data) ? data : [];
  window.dispatchEvent(new Event("storage"));
}

/* =====================================================
   LOAD ORDERS DARI API
===================================================== */

async function loadOrdersFromAPI() {
  if (typeof getOrdersAPI !== "function") {
    console.error(
      "getOrdersAPI() tidak ditemukan. Pastikan api.js sudah dimuat.",
    );
    return getOrders();
  }

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

    return ordersCache;
  } catch (error) {
    ordersLoading = false;
    ordersError = error.message || "Tidak dapat terhubung ke server.";
    console.error("Gagal memuat order dari API:", error);
    renderOrders();
    return getOrders();
  }
}

/* =====================================================
   MONEY
===================================================== */

function money(value) {
  if (typeof rupiah === "function") return rupiah(Number(value || 0));
  return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {
  if (typeof esc === "function") return esc(value);
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   STATUS
===================================================== */

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
  if (typeof STATUS !== "undefined" && STATUS[status]) return STATUS[status];
  return fallback[status] || { label: status, badge: "badge-assigned" };
}

/* =====================================================
   DASHBOARD
===================================================== */

function updateDashboard() {
  const orders = getOrders();

  const statMasuk = document.getElementById("statMasuk");
  const statJemput = document.getElementById("statJemput");
  const statProses = document.getElementById("statProses");
  const statUang = document.getElementById("statUang");

  if (statMasuk) statMasuk.textContent = orders.length;
  if (statJemput)
    statJemput.textContent = orders.filter(
      (o) => o.status === "menunggu" || o.status === "ditugaskan_jemput",
    ).length;
  if (statProses)
    statProses.textContent = orders.filter((o) =>
      ["dijemput", "dicuci", "disetrika"].includes(o.status),
    ).length;
  if (statUang) {
    const total = orders
      .filter((o) => o.status === "selesai")
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    statUang.textContent = money(total);
  }
}

/* =====================================================
   TABLE PESANAN
===================================================== */

function renderOrders() {
  const tbody = document.getElementById("orderBody");
  if (!tbody) return;

  /* ===== LOADING ===== */
  if (ordersLoading) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <i class="fa-solid fa-spinner fa-spin" style="color:#0ea5e9"></i>
            <strong style="display:block;color:#334155;margin-bottom:6px">
              Memuat data dari server...
            </strong>
            <p>Mohon tunggu sebentar.</p>
          </div>
        </td>
      </tr>`;
    updateDashboard();
    return;
  }

  /* ===== ERROR ===== */
  if (ordersError) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state" style="color:#dc2626">
            <i class="fa-solid fa-triangle-exclamation" style="color:#f87171"></i>
            <strong style="display:block;color:#991b1b;margin-bottom:6px">
              Gagal memuat data
            </strong>
            <p style="color:#b91c1c;margin-bottom:14px">${escapeHTML(ordersError)}</p>
            <button class="btn btn-primary" onclick="loadOrdersFromAPI()">
              <i class="fa-solid fa-rotate-right"></i> Coba Lagi
            </button>
          </div>
        </td>
      </tr>`;
    updateDashboard();
    return;
  }

  let orders = getOrders();
  const search = (document.getElementById("searchOrder")?.value || "")
    .toLowerCase()
    .trim();
  const filter = document.getElementById("filterStatus")?.value || "semua";

  if (search) {
    orders = orders.filter(
      (o) =>
        String(o.id || "")
          .toLowerCase()
          .includes(search) ||
        String(o.nama || "")
          .toLowerCase()
          .includes(search) ||
        String(o.hp || "")
          .toLowerCase()
          .includes(search),
    );
  }
  if (filter !== "semua") orders = orders.filter((o) => o.status === filter);

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="empty-state">
            <i class="fa-solid fa-box-open"></i>
            <strong style="display:block;color:#334155;margin-bottom:6px">
              Tidak ada pesanan
            </strong>
            <p>Belum ada data pesanan yang sesuai.</p>
          </div>
        </td>
      </tr>`;
    updateDashboard();
    return;
  }

  tbody.innerHTML = orders.map(renderOrderRow).join("");
  updateDashboard();
}

/* =====================================================
   ORDER ROW
===================================================== */

function renderOrderRow(order) {
  const status = getStatusInfo(order.status);
  const weight = order.berat ? `${order.berat} kg` : "-";
  const total = order.total ? money(order.total) : "Belum ditimbang";
  const pickupCourier = order.kurirJemput?.nama || order.kurir || "-";
  const deliveryCourier = order.kurirAntar?.nama || "-";
  let courierText = pickupCourier !== "-" ? pickupCourier : deliveryCourier;

  let actions = `
    <button class="btn btn-info" onclick="bukaDetail('${order.id}')">
      Detail
    </button>`;

  if (order.status === "menunggu") {
    actions += `
      <button class="btn btn-primary" onclick="bukaAssign('${order.id}', 'jemput')">
        <i class="fa-solid fa-motorcycle"></i> Tugaskan Jemput
      </button>`;
  }
  if (order.status === "dijemput") {
    if (!order.berat) {
      actions += `
        <button class="btn btn-warning" onclick="timbangOrder('${order.id}')">
          <i class="fa-solid fa-scale-balanced"></i> Timbang
        </button>`;
    } else {
      actions += `
        <button class="btn btn-success" onclick="lanjutStatus('${order.id}')">
          Lanjut Proses
        </button>`;
    }
  }
  if (order.status === "dicuci" || order.status === "disetrika") {
    actions += `
      <button class="btn btn-success" onclick="lanjutStatus('${order.id}')">
        Lanjut
      </button>`;
  }
  if (order.status === "siap") {
    actions += `
      <button class="btn btn-primary" onclick="bukaAssign('${order.id}', 'antar')">
        <i class="fa-solid fa-motorcycle"></i> Tugaskan Antar
      </button>`;
  }

  return `
    <tr>
      <td><span class="order-id">${escapeHTML(order.id)}</span></td>
      <td>
        <strong>${escapeHTML(order.nama || "-")}</strong><br>
        <small>${escapeHTML(order.hp || "-")}</small>
      </td>
      <td>${escapeHTML(order.paket || "-")}</td>
      <td>${escapeHTML(order.layanan || "-")}</td>
      <td>${weight}</td>
      <td><strong>${total}</strong></td>
      <td><span class="badge ${status.badge}">${escapeHTML(status.label)}</span></td>
      <td>
        ${escapeHTML(courierText)}
        ${deliveryCourier !== "-" ? `<br><small>Antar: ${escapeHTML(deliveryCourier)}</small>` : ""}
      </td>
      <td><div class="action-buttons">${actions}</div></td>
    </tr>`;
}

/* =====================================================
   ORDER BARU ADMIN
===================================================== */

function bukaFormOrder() {
  const modal = document.getElementById("modalRoot");
  if (!modal) {
    alert("Elemen #modalRoot tidak ditemukan.");
    return;
  }

  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Buat Order Baru</h3>
          <button class="close-modal" onclick="tutupModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onsubmit="simpanOrderBaru(event)">
          <div class="form-group">
            <label>Nama Pelanggan</label>
            <input id="orderNama" type="text" required />
          </div>
          <div class="form-group">
            <label>Nomor HP</label>
            <input id="orderHp" type="text" required />
          </div>
          <div class="form-group">
            <label>Alamat</label>
            <textarea id="orderAlamat" required></textarea>
          </div>
          <div class="form-group">
            <label>Paket</label>
            <select id="orderPaket" required>
              <option value="">Pilih paket</option>
              <option value="Kilat">Kilat</option>
              <option value="Express">Express</option>
              <option value="Regular">Regular</option>
            </select>
          </div>
          <div class="form-group">
            <label>Layanan</label>
            <select id="orderLayanan" required>
              <option value="">Pilih layanan</option>
              <option value="Komplit">Komplit</option>
              <option value="Biasa">Biasa</option>
              <option value="Setrika">Setrika</option>
            </select>
          </div>
          <div style="background:#eff6ff;padding:14px;border-radius:10px;font-size:12px;color:#2563eb">
            <i class="fa-solid fa-circle-info"></i>
            Berat dan harga akan ditentukan admin setelah pakaian ditimbang.
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="tutupModal()">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Order</button>
          </div>
        </form>
      </div>
    </div>`;
}

async function simpanOrderBaru(event) {
  event.preventDefault();

  const nama = document.getElementById("orderNama")?.value.trim();
  const hp = document.getElementById("orderHp")?.value.trim();
  const alamat = document.getElementById("orderAlamat")?.value.trim();
  const paket = document.getElementById("orderPaket")?.value;
  const layanan = document.getElementById("orderLayanan")?.value;

  if (!nama || !hp || !alamat || !paket || !layanan) {
    alert("Semua data harus diisi.");
    return;
  }

  const orders = getOrders();
  let id =
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
    const created = await createOrderAPI(order);
    ordersCache.push(created || order);
    tutupModal();
    renderOrders();
    alert("Order " + id + " berhasil dibuat melalui API.");
  } catch (error) {
    console.error("Gagal membuat order:", error);
    alert("Order gagal dibuat. Pastikan server API sedang berjalan.");
  }
}

/* =====================================================
   ASSIGN KURIR
===================================================== */

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

  const modal = document.getElementById("modalRoot");
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>${tipe === "jemput" ? "Tugaskan Kurir Penjemputan" : "Tugaskan Kurir Pengantaran"}</h3>
          <button class="close-modal" onclick="tutupModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style="background:#f8fafc;padding:14px;border-radius:10px;margin-bottom:16px">
          <strong>${escapeHTML(order.id)}</strong>
          <p style="font-size:12px;color:#64748b;margin-top:4px">Pelanggan: ${escapeHTML(order.nama)}</p>
          <p style="font-size:12px;color:#64748b">Alamat: ${escapeHTML(order.alamat)}</p>
        </div>

        <div class="form-group">
          <label>Pilih Kurir</label>
          <select id="selectedCourier">
            ${daftar.map((k) => `<option value="${k.id}">${escapeHTML(k.nama)} (${k.id})</option>`).join("")}
          </select>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="tutupModal()">Batal</button>
          <button class="btn btn-primary" onclick="tugaskanKurir('${orderId}', '${tipe}')">Tugaskan</button>
        </div>
      </div>
    </div>`;
}

async function tugaskanKurir(orderId, tipe) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  const courierId = document.getElementById("selectedCourier")?.value;
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
    const saved = await updateOrderAPI(orderId, update);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index >= 0) ordersCache[index] = saved || update;
    tutupModal();
    renderOrders();
    alert(courier.nama + " berhasil ditugaskan.");
  } catch (error) {
    console.error("Gagal menugaskan kurir:", error);
    alert(
      "Gagal menyimpan penugasan kurir. Pastikan server API sedang berjalan.",
    );
  }
}

/* =====================================================
   TIMBANG
===================================================== */

function timbangOrder(orderId) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById("modalRoot");
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Timbang Pakaian</h3>
          <button class="close-modal" onclick="tutupModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style="background:#f8fafc;padding:14px;border-radius:10px;margin-bottom:16px">
          <h3 style="font-size:15px">${escapeHTML(order.nama)}</h3>
          <p style="font-size:12px;color:#64748b">
            ${escapeHTML(order.paket)} - ${escapeHTML(order.layanan)}
          </p>
        </div>

        <div class="form-group">
          <label>Berat Pakaian (kg)</label>
          <input id="inputBerat" type="number" min="0.1" step="0.1" placeholder="Contoh: 3.5" required />
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="tutupModal()">Batal</button>
          <button class="btn btn-success" onclick="simpanTimbangan('${orderId}')">Simpan Timbangan</button>
        </div>
      </div>
    </div>`;
}

async function simpanTimbangan(orderId) {
  const berat = Number(document.getElementById("inputBerat")?.value);
  if (!berat || berat <= 0) {
    alert("Masukkan berat yang valid.");
    return;
  }

  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  let harga = 0;
  if (typeof hargaLayanan === "function") {
    harga = hargaLayanan(order.paket, order.layanan);
  } else {
    const hargaData = {
      Kilat: { Komplit: 20000, Biasa: 18000, Setrika: 15000 },
      Express: { Komplit: 15000, Biasa: 12000, Setrika: 9000 },
      Regular: { Komplit: 8000, Biasa: 6000, Setrika: 5000 },
    };
    harga = hargaData[order.paket]?.[order.layanan] || 0;
  }

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
    const saved = await updateOrderAPI(orderId, update);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index >= 0) ordersCache[index] = saved || update;
    tutupModal();
    renderOrders();
    alert(
      `Berat ${berat} kg berhasil disimpan.\nTotal: ${money(update.total)}`,
    );
  } catch (error) {
    console.error("Gagal menyimpan timbangan:", error);
    alert("Gagal menyimpan hasil timbangan ke API.");
  }
}

/* =====================================================
   LANJUT STATUS
===================================================== */

async function lanjutStatus(orderId) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  let nextStatus = null;
  if (order.status === "dijemput") {
    nextStatus = order.layanan === "Setrika" ? "disetrika" : "dicuci";
  } else if (order.status === "dicuci") {
    nextStatus = order.layanan === "Komplit" ? "disetrika" : "siap";
  } else if (order.status === "disetrika") {
    nextStatus = "siap";
  }
  if (!nextStatus) {
    alert("Tidak ada proses berikutnya.");
    return;
  }

  const update = { ...order, status: nextStatus };
  tambahLog(update, nextStatus, getStatusInfo(nextStatus).label);

  try {
    const saved = await updateOrderAPI(orderId, update);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index >= 0) ordersCache[index] = saved || update;
    renderOrders();
  } catch (error) {
    console.error("Gagal memperbarui status:", error);
    alert("Gagal memperbarui status order ke API.");
  }
}

/* =====================================================
   DETAIL
===================================================== */

function bukaDetail(orderId) {
  const order = getOrders().find((o) => o.id === orderId);
  if (!order) return;

  const status = getStatusInfo(order.status);
  const modal = document.getElementById("modalRoot");

  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Detail ${escapeHTML(order.id)}</h3>
          <button class="close-modal" onclick="tutupModal()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <h3>Pelanggan</h3>
            <p>Nama: ${escapeHTML(order.nama)}</p>
            <p>HP: ${escapeHTML(order.hp)}</p>
            <p>Alamat: ${escapeHTML(order.alamat)}</p>
          </div>
          <div class="info-card">
            <h3>Layanan</h3>
            <p>Paket: ${escapeHTML(order.paket)}</p>
            <p>Layanan: ${escapeHTML(order.layanan)}</p>
            <p>Status: ${escapeHTML(status.label)}</p>
          </div>
          <div class="info-card">
            <h3>Timbangan</h3>
            <p>Berat: ${order.berat ? order.berat + " kg" : "Belum ditimbang"}</p>
            <p>Harga/kg: ${order.hargaPerKg ? money(order.hargaPerKg) : "Belum ditentukan"}</p>
            <p>Total: ${order.total ? money(order.total) : "Belum ditentukan"}</p>
          </div>
        </div>

        <div style="background:#f8fafc;padding:14px;border-radius:10px;margin-top:16px">
          <h3 style="font-size:14px;margin-bottom:8px">Kurir</h3>
          <p style="font-size:12px;color:#64748b">Jemput: ${order.kurirJemput ? escapeHTML(order.kurirJemput.nama) : "-"}</p>
          <p style="font-size:12px;color:#64748b">Antar: ${order.kurirAntar ? escapeHTML(order.kurirAntar.nama) : "-"}</p>
        </div>

        <div style="background:#f8fafc;padding:14px;border-radius:10px;margin-top:12px">
          <h3 style="font-size:14px;margin-bottom:8px">Riwayat</h3>
          ${(order.log || [])
            .map(
              (log) => `
            <p style="font-size:12px;color:#64748b">
              • ${escapeHTML(log.keterangan || log.status || log.aksi || "")}
            </p>`,
            )
            .join("")}
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" onclick="tutupModal()">Tutup</button>
        </div>
      </div>
    </div>`;
}

/* =====================================================
   LOG
===================================================== */

function tambahLog(order, status, keterangan) {
  if (!Array.isArray(order.log)) order.log = [];
  order.log.push({ waktu: Date.now(), status, keterangan });
}

/* =====================================================
   RESET DATA
===================================================== */

async function resetData() {
  const yakin = confirm(
    "Yakin ingin menghapus SEMUA data pesanan?\n\nData tidak dapat dikembalikan.",
  );
  if (!yakin) return;

  const orders = getOrders();

  try {
    for (const order of orders) {
      await deleteOrderAPI(order.id);
    }
    ordersCache = [];
    renderOrders();
    alert("Semua data LaundryTrack berhasil direset.");
  } catch (error) {
    console.error("Gagal mereset data:", error);
    alert("Gagal mereset data dari API.");
  }
}

/* =====================================================
   NAVIGASI
===================================================== */

function setupNavigation() {
  const links = document.querySelectorAll(".nav-link[data-page]");
  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      links.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
      tampilkanHalaman(this.dataset.page);
    });
  });
}

function tampilkanHalaman(page) {
  const dashboard = document.getElementById("dashboardPage");
  const dynamic = document.getElementById("dynamicPage");
  if (!dashboard || !dynamic) return;

  const title = document.getElementById("pageTitle");
  const description = document.getElementById("pageDescription");

  if (page === "dashboard") {
    dashboard.style.display = "block";
    dynamic.style.display = "none";
    title.textContent = "Dashboard Overview";
    description.textContent = "Pantau semua operasional laundry hari ini.";
    renderOrders();
    return;
  }

  dashboard.style.display = "none";
  dynamic.style.display = "block";

  if (page === "pesanan") {
    title.textContent = "Kelola Pesanan";
    description.textContent = "Kelola seluruh pesanan pelanggan.";
    renderPesananPage();
  } else if (page === "armada") {
    title.textContent = "Armada Kurir";
    description.textContent = "Kelola kurir penjemputan dan pengantaran.";
    renderArmadaPage();
  } else if (page === "pelanggan") {
    title.textContent = "Pelanggan";
    description.textContent = "Daftar pelanggan LaundryTrack.";
    renderPelangganPage();
  } else if (page === "laporan") {
    title.textContent = "Laporan";
    description.textContent = "Ringkasan transaksi LaundryTrack.";
    renderLaporanPage();
  } else if (page === "paket") {
    title.textContent = "Paket Layanan";
    description.textContent = "Daftar harga paket laundry.";
    renderPaketPage();
  }
}

/* =====================================================
   PESANAN PAGE
===================================================== */

function renderPesananPage() {
  const dynamic = document.getElementById("dynamicPage");
  const orders = getOrders();

  dynamic.innerHTML = `
    <section class="content-card">
      <div class="section-header">
        <div>
          <h2>Semua Pesanan</h2>
          <p>Total ${orders.length} pesanan.</p>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Pelanggan</th><th>Paket</th><th>Layanan</th>
              <th>Berat</th><th>Total</th><th>Status</th><th>Kurir</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(renderOrderRow).join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

/* =====================================================
   ARMADA
===================================================== */

function renderArmadaPage() {
  const dynamic = document.getElementById("dynamicPage");
  const daftar =
    typeof DAFTAR_KURIR !== "undefined"
      ? DAFTAR_KURIR
      : [
          { id: "KR-01", nama: "Budi" },
          { id: "KR-02", nama: "Andi" },
        ];
  const orders = getOrders();

  dynamic.innerHTML = `
    <section class="content-card">
      <div class="section-header">
        <div>
          <h2>Armada Kurir</h2>
          <p>Kurir hanya bertugas menjemput dan mengantar.</p>
        </div>
      </div>
      <div class="info-grid">
        ${daftar
          .map((kurir) => {
            const pickup = orders.filter(
              (o) =>
                o.kurirJemput?.id === kurir.id &&
                o.status === "ditugaskan_jemput",
            ).length;
            const delivery = orders.filter(
              (o) =>
                o.kurirAntar?.id === kurir.id &&
                o.status === "ditugaskan_antar",
            ).length;

            return `
            <div class="info-card">
              <h3><i class="fa-solid fa-motorcycle"></i> ${escapeHTML(kurir.nama)}</h3>
              <p>ID: <strong>${kurir.id}</strong></p>
              <p>Tugas Jemput: <strong>${pickup}</strong></p>
              <p>Tugas Antar: <strong>${delivery}</strong></p>
            </div>`;
          })
          .join("")}
      </div>
    </section>`;
}

/* =====================================================
   PELANGGAN
===================================================== */

function renderPelangganPage() {
  const dynamic = document.getElementById("dynamicPage");
  const orders = getOrders();
  const pelanggan = {};

  orders.forEach((order) => {
    const hp = order.hp || "-";
    if (!pelanggan[hp]) {
      pelanggan[hp] = { nama: order.nama, hp, alamat: order.alamat, jumlah: 0 };
    }
    pelanggan[hp].jumlah++;
  });

  dynamic.innerHTML = `
    <section class="content-card">
      <div class="section-header">
        <div>
          <h2>Data Pelanggan</h2>
          <p>Daftar pelanggan berdasarkan pesanan.</p>
        </div>
      </div>
      <div class="info-grid">
        ${Object.values(pelanggan)
          .map(
            (p) => `
          <div class="info-card">
            <h3>${escapeHTML(p.nama)}</h3>
            <p>HP: ${escapeHTML(p.hp)}</p>
            <p>Alamat: ${escapeHTML(p.alamat)}</p>
            <p>Jumlah Pesanan: <strong>${p.jumlah}</strong></p>
          </div>`,
          )
          .join("")}
      </div>
    </section>`;
}

/* =====================================================
   LAPORAN
===================================================== */

function renderLaporanPage() {
  const dynamic = document.getElementById("dynamicPage");
  const orders = getOrders();
  const selesai = orders.filter((o) => o.status === "selesai");
  const pendapatan = selesai.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const berat = orders.reduce((sum, o) => sum + Number(o.berat || 0), 0);

  dynamic.innerHTML = `
    <section class="content-card">
      <div class="section-header">
        <div>
          <h2>Laporan Laundry</h2>
          <p>Ringkasan data operasional.</p>
        </div>
      </div>
      <div class="info-grid">
        <div class="info-card">
          <h3><i class="fa-solid fa-box"></i> Total Pesanan</h3>
          <p>${orders.length}</p>
        </div>
        <div class="info-card">
          <h3><i class="fa-solid fa-shirt"></i> Total Berat</h3>
          <p>${berat.toFixed(1)} kg</p>
        </div>
        <div class="info-card">
          <h3><i class="fa-solid fa-money-bill"></i> Pendapatan</h3>
          <p>${money(pendapatan)}</p>
        </div>
      </div>
    </section>`;
}

/* =====================================================
   PAKET
===================================================== */

function renderPaketPage() {
  const dynamic = document.getElementById("dynamicPage");
  const data = {
    Kilat: {
      Komplit: 20000,
      Biasa: 18000,
      Setrika: 15000,
      estimasi: "2–3 jam",
    },
    Express: { Komplit: 15000, Biasa: 12000, Setrika: 9000, estimasi: "5 jam" },
    Regular: { Komplit: 8000, Biasa: 6000, Setrika: 5000, estimasi: "1 hari" },
  };

  dynamic.innerHTML = `
    <section class="content-card">
      <div class="section-header">
        <div>
          <h2>Paket Layanan</h2>
          <p>Harga ditentukan berdasarkan paket, layanan, dan berat.</p>
        </div>
      </div>
      <div class="info-grid">
        ${Object.entries(data)
          .map(
            ([nama, paket]) => `
          <div class="info-card">
            <h3>${nama}</h3>
            <p>Komplit: <strong>${money(paket.Komplit)}/kg</strong></p>
            <p>Biasa: <strong>${money(paket.Biasa)}/kg</strong></p>
            <p>Setrika: <strong>${money(paket.Setrika)}/kg</strong></p>
            <p>Estimasi: <strong>${paket.estimasi}</strong></p>
          </div>`,
          )
          .join("")}
      </div>
    </section>`;
}

/* =====================================================
   MODAL CLOSE
===================================================== */

function tutupModal() {
  const modal = document.getElementById("modalRoot");
  if (modal) modal.innerHTML = "";
}

/* =====================================================
   LOGIN ADMIN
===================================================== */

function checkAdminSession() {
  if (!REQUIRE_ADMIN_LOGIN) {
    adminLoggedIn = true;
    hideLoginOverlay();
    return true;
  }
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      adminLoggedIn = true;
      hideLoginOverlay();
      return true;
    }
  } catch (e) {}
  adminLoggedIn = false;
  showLoginOverlay();
  return false;
}

function showLoginOverlay() {
  const overlay = document.getElementById("adminLoginOverlay");
  if (overlay) overlay.classList.remove("hidden");
}

function hideLoginOverlay() {
  const overlay = document.getElementById("adminLoginOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function adminLogin() {
  const user = document.getElementById("adminUserInput")?.value.trim();
  const pin = document.getElementById("adminPinInput")?.value.trim();
  const err = document.getElementById("adminLoginError");

  if (!user || !pin) {
    if (err) err.textContent = "Username dan PIN wajib diisi.";
    return;
  }

  if (user === ADMIN_USERNAME && pin === ADMIN_PIN) {
    try {
      localStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ user, waktu: Date.now() }),
      );
    } catch (e) {}
    adminLoggedIn = true;
    if (err) err.textContent = "";
    hideLoginOverlay();
    startAdminData();
  } else {
    if (err) err.textContent = "Username atau PIN salah.";
  }
}

function adminLogout() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {}
  adminLoggedIn = false;
  if (pollingAdmin) clearInterval(pollingAdmin);
  location.reload();
}

/* =====================================================
   START DATA SETELAH LOGIN
===================================================== */

async function startAdminData() {
  renderOrders();
  await loadOrdersFromAPI();

  if (typeof tampilkanOrdersAPI === "function") {
    try {
      await tampilkanOrdersAPI();
    } catch (e) {
      console.warn(e);
    }
  }

  if (pollingAdmin) clearInterval(pollingAdmin);
  pollingAdmin = setInterval(async function () {
    await loadOrdersFromAPI();
    if (typeof tampilkanOrdersAPI === "function") {
      try {
        await tampilkanOrdersAPI();
      } catch (e) {}
    }
  }, 3000);
}

/* =====================================================
   EVENT
===================================================== */

document.addEventListener("DOMContentLoaded", async function () {
  setupNavigation();

  const loggedIn = checkAdminSession();

  const loginBtn = document.getElementById("adminLoginBtn");
  if (loginBtn) loginBtn.addEventListener("click", adminLogin);

  const pinInput = document.getElementById("adminPinInput");
  if (pinInput) {
    pinInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") adminLogin();
    });
  }
  const userInput = document.getElementById("adminUserInput");
  if (userInput) {
    userInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        document.getElementById("adminPinInput")?.focus();
      }
    });
  }

  const search = document.getElementById("searchOrder");
  const filter = document.getElementById("filterStatus");
  if (search) search.addEventListener("input", renderOrders);
  if (filter) filter.addEventListener("change", renderOrders);

  if (loggedIn) {
    await startAdminData();
  } else {
    renderOrders();
  }
});

/* =====================================================
   STORAGE SYNC
===================================================== */

window.addEventListener("storage", function () {
  if (!adminLoggedIn) return;
  renderOrders();

  const active = document.querySelector(".nav-link.active");
  if (active && active.dataset.page !== "dashboard") {
    tampilkanHalaman(active.dataset.page);
  }
});

/* =====================================================
   ESCAPE
===================================================== */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") tutupModal();
});
