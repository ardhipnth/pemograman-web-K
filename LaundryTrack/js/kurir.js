// ==================================================
// DATA KURIR
// ==================================================

let kurirAktif = "";

let sisa = 3;

let selesai = 0;

// Menyimpan tugas yang selesai
let riwayatTugas = [];

// ==================================================
// LOGIN
// ==================================================

function prosesLogin() {
  const kurir = document.getElementById("kurirSelect").value;

  const pin = document.getElementById("pinInput").value;

  // Cek nama kurir

  if (!kurir) {
    alert("Pilih nama kurir dulu cak (Budi atau Andi)!");

    return;
  }

  // Cek PIN

  if (pin.trim() === "") {
    alert("Masukkan PIN terlebih dahulu!");

    return;
  }

  // Simpan kurir yang login

  kurirAktif = kurir;

  // Sembunyikan login

  document.getElementById("loginScreen").style.display = "none";

  // Tampilkan dashboard

  document.getElementById("dashboardScreen").style.display = "block";

  // Tampilkan nama

  document.getElementById("namaKurirText").innerText = "Mas " + kurir;

  // Tampilkan informasi akun

  document.getElementById("akunNama").innerText = "Mas " + kurir;

  // Tentukan ID kurir

  let idKurir = "-";

  if (kurir === "Budi") {
    idKurir = "KR-01";
  } else if (kurir === "Andi") {
    idKurir = "KR-02";
  }

  document.getElementById("akunId").innerText = "ID: " + idKurir;

  // Pastikan halaman Tugas aktif

  bukaSection("tugas");
}

// ==================================================
// LOGOUT
// ==================================================

function logout() {
  // Sembunyikan dashboard

  document.getElementById("dashboardScreen").style.display = "none";

  // Tampilkan login

  document.getElementById("loginScreen").style.display = "flex";

  // Reset pilihan kurir

  document.getElementById("kurirSelect").value = "";

  // Reset PIN

  document.getElementById("pinInput").value = "";

  // Reset kurir aktif

  kurirAktif = "";
}

// ==================================================
// PINDAH SECTION
// ==================================================

function bukaSection(namaSection, navElement) {
  // Semua section

  const sections = document.querySelectorAll(".content-section");

  // Sembunyikan semua section

  sections.forEach(function (section) {
    section.classList.remove("active-section");
  });

  // Tentukan section yang dibuka

  let sectionTujuan = null;

  if (namaSection === "tugas") {
    sectionTujuan = document.getElementById("sectionTugas");
  } else if (namaSection === "riwayat") {
    sectionTujuan = document.getElementById("sectionRiwayat");

    tampilkanRiwayat();
  } else if (namaSection === "akun") {
    sectionTujuan = document.getElementById("sectionAkun");
  }

  // Tampilkan section

  if (sectionTujuan) {
    sectionTujuan.classList.add("active-section");
  }

  // Update tombol navigasi

  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(function (item) {
    item.classList.remove("active");
  });

  // Jika fungsi dipanggil dari tombol

  if (navElement) {
    navElement.classList.add("active");
  } else {
    // Tentukan nav secara otomatis

    navItems.forEach(function (item) {
      const text = item.innerText.trim().toLowerCase();

      if (text === namaSection) {
        item.classList.add("active");
      }
    });
  }
}

// ==================================================
// FILTER TUGAS
// ==================================================

function filterTugas(tipe, btnElement) {
  // Semua tombol filter

  const buttons = document.querySelectorAll(".filter-btn");

  // Hilangkan active

  buttons.forEach(function (button) {
    button.classList.remove("active");
  });

  // Aktifkan tombol yang dipilih

  if (btnElement) {
    btnElement.classList.add("active");
  }

  // Semua kartu tugas

  const cards = document.querySelectorAll(".task-card");

  cards.forEach(function (card) {
    if (card.classList.contains("selesai")) {
      card.style.display = "none";
    } else if (tipe === "semua") {
      card.style.display = "block";
    } else if (tipe === "jemput" && card.classList.contains("tipe-jemput")) {
      card.style.display = "block";
    } else if (tipe === "antar" && card.classList.contains("tipe-antar")) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// ==================================================
// SELESAIKAN TUGAS
// ==================================================

function selesaikanTugas(id) {
  const card = document.getElementById(id);

  // Kalau kartu tidak ditemukan

  if (!card) {
    return;
  }

  // Ambil informasi tugas

  const nomor = card.querySelector(".task-id")?.innerText || "-";

  const nama = card.querySelector(".t-name")?.innerText || "-";

  const alamat = card.querySelector(".t-address")?.innerText || "-";

  const badge = card.querySelector(".t-badge")?.innerText || "Tugas";

  // Simpan ke riwayat

  riwayatTugas.push({
    nomor: nomor,

    nama: nama,

    alamat: alamat,

    jenis: badge,

    waktu: new Date().toLocaleString("id-ID"),
  });

  // Hilangkan kartu dari Tugas

  card.style.display = "none";
  card.classList.add("selesai");

  // Kurangi sisa tugas

  if (sisa > 0) {
    sisa--;
  }

  // Tambah jumlah selesai

  selesai++;

  // Update statistik

  document.getElementById("countSisa").innerText = sisa;

  document.getElementById("countSelesai").innerText = selesai;

  // Update riwayat

  tampilkanRiwayat();

  // Jika semua selesai

  if (sisa === 0) {
    alert("Mantap cak! Semua tugas hari ini sudah selesai.");
  }
}

// ==================================================
// TAMPILKAN RIWAYAT
// ==================================================

function tampilkanRiwayat() {
  const historyList = document.getElementById("historyList");

  const emptyHistory = document.getElementById("emptyHistory");

  // Kalau belum ada riwayat

  if (riwayatTugas.length === 0) {
    historyList.innerHTML = "";

    emptyHistory.style.display = "block";

    return;
  }

  // Kalau sudah ada

  emptyHistory.style.display = "none";

  historyList.innerHTML = "";

  // Tampilkan dari yang terbaru

  riwayatTugas
    .slice()
    .reverse()
    .forEach(function (tugas) {
      const card = document.createElement("div");

      card.className = "history-card";

      card.innerHTML = `

          <div class="history-icon">
            <i class="fa-solid fa-check"></i>
          </div>

          <div class="history-content">

            <div class="history-top">

              <strong>
                ${tugas.nomor}
              </strong>

              <span>
                Selesai
              </span>

            </div>

            <h3>
              ${tugas.nama}
            </h3>

            <p>
              ${tugas.jenis}
            </p>

            <small>
              ${tugas.waktu}
            </small>

          </div>

        `;

      historyList.appendChild(card);
    });
}

// ==================================================
// BUKA PETA
// ==================================================

function bukaPeta() {
  alert("Aplikasi Google Maps akan terbuka (Simulasi).");
}

// ==================================================
// SAAT HALAMAN DIBUKA
// ==================================================

document.addEventListener("DOMContentLoaded", function () {
  tampilkanRiwayat();
});
