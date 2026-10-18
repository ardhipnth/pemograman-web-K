# 🧺 LaundryTrack — Aplikasi Laundry Berbasis Web

Aplikasi manajemen laundry dengan 3 portal terintegrasi: **Admin**, **Customer**, dan **Kurir**. Dibangun dengan arsitektur client-server, mendukung dua backend (Node.js & PHP), dan database MySQL.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Project](#-struktur-project)
- [Cara Menjalankan](#-cara-menjalankan)
- [Dokumentasi API](#-dokumentasi-api)
- [Alur Data](#-alur-data)
- [Screenshot](#-screenshot)
- [Roadmap Perkuliahan](#-roadmap-perkuliahan)

---

## ✨ Fitur Utama

### Portal Customer

- Buat pesanan laundry tanpa perlu daftar akun
- Cek status cucian berdasarkan nomor HP
- Lihat timeline progress (Jemput → Cuci → Siap → Selesai)
- Informasi harga otomatis per paket & layanan

### Portal Admin

- Login dengan username & PIN
- Dashboard statistik real-time (pesanan masuk, proses, pendapatan)
- Kelola semua pesanan (buat, lihat detail, timbang, update status)
- Tugaskan kurir untuk penjemputan & pengantaran
- Data pelanggan, laporan, dan paket layanan

### Portal Kurir

- Login dengan pilih nama & PIN bebas
- Daftar tugas aktif (penjemputan / pengantaran)
- **Tombol Buka Maps** — langsung navigasi ke alamat pelanggan via Google Maps
- Konfirmasi tugas selesai
- Riwayat tugas & profil kurir

---

## 🏗️ Arsitektur Sistem

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ admin.html │ │ customer.html │ │ kurir.html │
│ admin.js │ │ customer.js │ │ kurir.js │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
│ │ │
└───────────────────────┼───────────────────────┘
│
┌──────▼──────┐
│ api.js │
│ (API Bridge)│
└──────┬──────┘
│
┌──────────────────┴──────────────────┐
│ │
┌───────▼────────┐ ┌────────▼────────┐
│ Node.js Server │ │ PHP + MySQL │
│ (server.js) │ │ (backend-php/) │
│ Port: 3000 │ │ XAMPP + MySQL │
└─────────────────┘ └─────────────────┘

Sistem mendukung 2 backend yang bisa ditukar cukup dengan 1 baris konfigurasi di `js/api.js`:

```js
const BACKEND_MODE = "php"; // atau "node"
```

## 🛠️ Teknologi yang Digunakan

### Frontend

- **HTML5** — struktur halaman
- **CSS3** — styling custom + responsive
- **JavaScript (ES6+)** — logika aplikasi, async/await, Fetch API
- **Tailwind CSS** — utility classes
- **Font Awesome** — ikon
- **Google Fonts (Poppins)** — tipografi

### Backend (Pilih Salah Satu)

- **Node.js + Express** — REST API server (`server.js`)
- **PHP 8 + PDO** — REST API server (`backend-php/`)

### Database

- **MySQL / MariaDB** — via XAMPP
- Tabel: `orders`
- Format kolom JSON untuk data `kurir`, `kurirJemput`, `kurirAntar`, `log`

### Development Tools

- **XAMPP** — Apache + MySQL + PHP
- **VSCode Live Server** — untuk frontend
- **phpMyAdmin** — manajemen database
- **Git + GitHub** — version control

---

## 📁 Struktur Project

LaundryTrack/
│
├── 📄 admin.html # Portal admin
├── 📄 customer.html # Portal customer
├── 📄 kurir.html # Portal kurir
├── 📄 README.md # File ini
│
├── 📁 js/ # JavaScript frontend
│ ├── 📄 data.js # Data statis (paket, kurir, status)
│ ├── 📄 api.js # API bridge (fetch ke backend)
│ ├── 📄 admin.js # Logika portal admin
│ ├── 📄 customer.js # Logika portal customer
│ └── 📄 kurir.js # Logika portal kurir
│
├── 📁 css/ # Stylesheet
│ ├── 📄 kurir.css # Style portal kurir
│ └── 📄 customer.css # Style portal customer
│
├── 📁 backend-php/ # Backend PHP (Pertemuan 5)
│ ├── 📄 cek.php # Test koneksi PHP + MySQL
│ ├── 📄 config.php # Koneksi database (PDO)
│ └── 📄 orders.php # REST API endpoint
│
├── 📄 server.js # Backend Node.js (backup)
├── 📄 db.json # Data storage Node.js
├── 📄 package.json # NPM dependencies
└── 📄 package-lock.json
