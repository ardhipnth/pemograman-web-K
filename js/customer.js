(function () {
  "use strict";

  let hpAktif = "";
  let pollingCustomer = null;
  let ordersCache = [];
  let ordersLoading = false;
  let ordersError = null;

  function getOrders() {
    return Array.isArray(ordersCache) ? ordersCache : [];
  }

  async function loadOrdersFromAPI() {
    if (typeof getOrdersAPI !== "function") {
      console.error(
        "getOrdersAPI() tidak ditemukan. Pastikan api.js dimuat sebelum customer.js.",
      );
      return getOrders();
    }

    try {
      ordersLoading = true;
      ordersError = null;

      const data = await getOrdersAPI();
      ordersCache = Array.isArray(data) ? data : [];
      ordersLoading = false;

      if (hpAktif) {
        const order = getOrders()
          .filter((o) => normalisasiHp(o.hp) === hpAktif)
          .sort((a, b) => Number(b.dibuat || 0) - Number(a.dibuat || 0))[0];
        if (order) tampilkanHasil(order);
      }
      return ordersCache;
    } catch (error) {
      ordersLoading = false;
      ordersError = error.message || "Tidak dapat terhubung ke server.";
      console.error("Gagal memuat order dari API:", error);
      return getOrders();
    }
  }

  function init() {
    const hpInput = document.getElementById("noHpInput");
    const orderHp = document.getElementById("orderHp");

    if (hpInput) {
      hpInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") cekStatus();
      });
    }
    if (orderHp) {
      orderHp.addEventListener("input", function () {
        const hp = this.value.trim();
        const input = document.getElementById("noHpInput");
        if (hp && input) input.value = hp;
      });
    }

    updatePackageInfo();
    const paket = document.getElementById("orderPaket");
    const layanan = document.getElementById("orderLayanan");
    if (paket) paket.addEventListener("change", updatePackageInfo);
    if (layanan) layanan.addEventListener("change", updatePackageInfo);
  }

  function updatePackageInfo() {
    const paket = document.getElementById("orderPaket")?.value;
    const layanan = document.getElementById("orderLayanan")?.value;
    const info = document.getElementById("packageInfo");
    if (!paket || !layanan || !info) return;

    const harga = hargaLayanan(paket, layanan);
    const estimasi = estimasiLayanan(paket, layanan);

    info.innerHTML = `
      <strong>${esc(paket)} - ${esc(layanan)}</strong><br>
      Harga: ${rupiah(harga)}/kg<br>
      Estimasi: ${esc(estimasi)}<br><br>
      <strong>Berat dan total ditentukan Admin setelah pakaian ditimbang.</strong>`;
  }

  window.cekStatus = async function () {
    const input = document.getElementById("noHpInput");
    const hp = normalisasiHp(input?.value || "");
    const error = document.getElementById("errorMsg");

    if (!hp) {
      tampilError("Masukkan nomor HP terlebih dahulu.");
      return;
    }
    if (!hpValid(hp)) {
      tampilError("Nomor HP tidak valid.");
      return;
    }

    /* Loading state */
    if (error) {
      error.textContent = "Memuat data dari server...";
      error.style.color = "#0284c7";
      error.style.display = "block";
    }

    await loadOrdersFromAPI();

    /* Error state */
    if (ordersError) {
      if (error) {
        error.textContent = "Gagal terhubung ke server: " + ordersError;
        error.style.color = "#dc2626";
        error.style.display = "block";
      }
      return;
    }

    const pelanggan = getOrders()
      .filter((o) => normalisasiHp(o.hp) === hp)
      .sort((a, b) => Number(b.dibuat || 0) - Number(a.dibuat || 0));

    if (!pelanggan.length) {
      tampilError("Pesanan dengan nomor HP tersebut belum ditemukan.");
      return;
    }

    if (error) error.style.display = "none";
    hpAktif = hp;
    tampilkanHasil(pelanggan[0]);
  };

  function tampilError(message) {
    const error = document.getElementById("errorMsg");
    if (!error) {
      alert(message);
      return;
    }
    error.textContent = message;
    error.style.color = "#dc2626";
    error.style.display = "block";
  }

  function tampilkanHasil(order) {
    const search = document.getElementById("searchSection");
    const result = document.getElementById("resultSection");
    if (search) search.style.display = "none";
    if (result) result.style.display = "block";

    const nama = document.getElementById("cNama");
    const nota = document.getElementById("cNota");
    const statusMsg = document.getElementById("statusMsg");

    if (nama) nama.textContent = order.nama;
    if (nota)
      nota.textContent = `${order.id} • ${order.paket} - ${order.layanan}`;
    if (statusMsg) {
      const status = STATUS[order.status] || STATUS.menunggu;
      statusMsg.textContent = status.label;
    }

    renderTimeline(order);
    renderOrderDetail(order);
  }

  function renderTimeline(order) {
    const timeline = document.getElementById("timeline");
    if (!timeline) return;

    const steps = timeline.querySelectorAll(".step");
    steps.forEach((step) => step.classList.remove("done", "active"));

    let index = 0;
    switch (order.status) {
      case "menunggu":
      case "ditugaskan_jemput":
        index = 0;
        break;
      case "dijemput":
      case "dicuci":
      case "disetrika":
        index = 1;
        break;
      case "siap":
      case "ditugaskan_antar":
        index = 2;
        break;
      case "selesai":
        index = 3;
        break;
    }

    steps.forEach(function (step, i) {
      if (i < index) step.classList.add("done");
      else if (i === index) step.classList.add("active");
    });
  }

  function renderOrderDetail(order) {
    const container = document.getElementById("customerOrderInfo");
    if (!container) return;

    const berat = order.berat ? `${order.berat} kg` : "Belum ditimbang";
    const total = order.total ? rupiah(order.total) : "Belum ditentukan";
    const harga = order.hargaPerKg
      ? `${rupiah(order.hargaPerKg)}/kg`
      : "Belum ditentukan";
    const kurirJemput = order.kurirJemput?.nama || "Belum ditugaskan";
    const kurirAntar = order.kurirAntar?.nama || "Belum ditugaskan";

    container.innerHTML = `
      <div class="detail-box"><span>Paket</span><strong>${esc(order.paket)}</strong></div>
      <div class="detail-box"><span>Layanan</span><strong>${esc(order.layanan)}</strong></div>
      <div class="detail-box"><span>Berat</span><strong>${esc(berat)}</strong></div>
      <div class="detail-box"><span>Harga / Kg</span><strong>${esc(harga)}</strong></div>
      <div class="detail-box"><span>Total</span><strong>${esc(total)}</strong></div>
      <div class="detail-box"><span>Kurir Jemput</span><strong>${esc(kurirJemput)}</strong></div>
      <div class="detail-box"><span>Kurir Antar</span><strong>${esc(kurirAntar)}</strong></div>
      <div class="detail-box"><span>Estimasi</span><strong>${esc(estimasiLayanan(order.paket, order.layanan))}</strong></div>`;
  }

  window.buatPesananCustomer = async function () {
    const nama = document.getElementById("orderNama")?.value.trim();
    const hp = document.getElementById("orderHp")?.value.trim();
    const alamat = document.getElementById("orderAlamat")?.value.trim();
    const paket = document.getElementById("orderPaket")?.value;
    const layanan = document.getElementById("orderLayanan")?.value;
    const success = document.getElementById("orderSuccess");

    if (!nama || !hp || !alamat || !paket || !layanan) {
      alert("Semua data pesanan wajib diisi.");
      return;
    }
    if (!hpValid(hp)) {
      alert("Nomor HP tidak valid.");
      return;
    }

    await loadOrdersFromAPI();
    const existingOrders = getOrders();

    let id;
    if (typeof buatIdNotaDariList === "function")
      id = buatIdNotaDariList(existingOrders);
    else id = "INV-" + String(existingOrders.length + 1).padStart(4, "0");

    const order = {
      id,
      nama,
      hp: normalisasiHp(hp),
      alamat,
      paket,
      layanan,
      berat: null,
      hargaPerKg: null,
      total: null,
      antarJemput: true,
      kurirJemput: null,
      kurirAntar: null,
      kurir: null,
      status: "menunggu",
      dibuat: Date.now(),
      log: [
        {
          waktu: Date.now(),
          status: "menunggu",
          keterangan: "Pesanan dibuat oleh customer",
        },
      ],
    };

    if (typeof createOrderAPI !== "function") {
      alert("createOrderAPI() tidak ditemukan.");
      return;
    }

    try {
      const created = await createOrderAPI(order);
      const finalOrder = created || order;
      ordersCache.unshift(finalOrder);

      const inputHp = document.getElementById("noHpInput");
      if (inputHp) inputHp.value = finalOrder.hp;

      if (success) {
        success.style.display = "block";
        success.innerHTML = `
          <strong>Pesanan berhasil dibuat!</strong><br>
          Nomor Nota: <strong>${esc(finalOrder.id)}</strong><br>
          Data sudah tersimpan di server dan dapat dilihat Admin.`;
      }

      const namaInput = document.getElementById("orderNama");
      const hpInput = document.getElementById("orderHp");
      const alamatInput = document.getElementById("orderAlamat");
      if (namaInput) namaInput.value = "";
      if (hpInput) hpInput.value = "";
      if (alamatInput) alamatInput.value = "";

      hpAktif = finalOrder.hp;
      tampilkanHasil(finalOrder);
      alert("Pesanan berhasil dibuat dan sudah masuk ke server LaundryTrack.");
    } catch (error) {
      console.error("Gagal membuat pesanan customer:", error);
      alert("Pesanan gagal dibuat. Pastikan server API sedang berjalan.");
    }
  };

  window.resetForm = function () {
    const search = document.getElementById("searchSection");
    const result = document.getElementById("resultSection");
    if (search) search.style.display = "block";
    if (result) result.style.display = "none";

    const input = document.getElementById("noHpInput");
    if (input) input.value = "";

    const error = document.getElementById("errorMsg");
    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }
    hpAktif = "";
  };

  document.addEventListener("DOMContentLoaded", async function () {
    init();
    await loadOrdersFromAPI();

    if (pollingCustomer) clearInterval(pollingCustomer);
    pollingCustomer = setInterval(loadOrdersFromAPI, 3000);
  });
})();
