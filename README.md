# 🧺 LaundryTrack — Aplikasi Manajemen Laundry Terintegrasi

Aplikasi manajemen laundry berbasis web yang dibangun secara bertahap dari awal (Week 1) hingga menggunakan Framework Laravel (Week 7). Proyek ini memiliki 3 portal utama: **Admin**, **Customer**, dan **Kurir**.

---

## 🛠️ Teknologi yang Digunakan

### Frontend

- **HTML5 & CSS3** (Semantik & Responsif)
- **JavaScript (ES6+)** (DOM, Async/Await, Fetch API)
- **Tailwind CSS** (Utility classes)
- **Font Awesome** (Ikon)

### Backend

- **PHP Native** (Procedural & OOP/MVC Manual)
- **Laravel 10** (Framework MVC, Eloquent ORM)
- **Node.js + Express** (Backend API awal untuk Week 4)

### Database & Tools

- **MySQL / MariaDB**
- **XAMPP** (Apache & MySQL)
- **Composer** (PHP Package Manager)
- **Git & GitHub** (Version Control)

---

## 📅 Perjalanan Project (Week 1 - Week 7)

Project ini dibangun mengikuti _roadmap_ perkuliahan:

- **Week 1:** Kickoff, perancangan ide, dan pembuatan _Product Canvas_.
- **Week 2:** Pembuatan UI/UX menggunakan HTML semantik dan CSS/Tailwind (Portal Admin, Customer, Kurir).
- **Week 3:** Implementasi JavaScript (DOM manipulation) dan sistem autentikasi dasar (Login Admin & Kurir).
- **Week 4:** Integrasi Frontend dengan REST API (menggunakan `fetch`, async/await) dan sinkronisasi _LocalStorage_.
- **Week 5:** Pembuatan backend PHP Native + MySQL, migrasi data dari LocalStorage ke Database asli.
- **Week 6:** _Refactoring_ backend PHP dari _Procedural_ menjadi **OOP (Object-Oriented Programming)** dan struktur **MVC (Model-View-Controller)** manual.
- **Week 7:** Migrasi total backend ke **Framework Laravel** (menggunakan Eloquent ORM dan API Routes) untuk standar industri.

---

## 📁 Struktur Repositori

Repositori ini dibagi menjadi 3 bagian utama:

1. **Frontend (Root Folder)**
   Berisi `admin.html`, `customer.html`, `kurir.html`, folder `js/`, dan `css/`. Frontend ini bersifat _decoupled_ (terpisah) dan berkomunikasi dengan backend melalui API.
2. **Backend PHP Native (`backend-php/`)**
   Merupakan arsip backend Week 5 & 6. Berisi implementasi API dengan PHP Native, serta folder `demo-mvc/` untuk demonstrasi alur MVC murni (Tugas Week 7).
3. **Backend Laravel (`backend-laravel/`)**
   Merupakan backend utama (Week 7) yang digunakan saat ini. Menggunakan Laravel dan database `laundrytrack_laravel`.

---

## 🚀 Cara Menjalankan Project

### Prasyarat

- XAMPP (Apache & MySQL) menyala.
- Composer terinstall.
- VSCode dengan ekstensi **Live Server**.

### 1. Menjalankan Frontend

1. Buka folder utama di VSCode.
2. Klik kanan `admin.html` -> **Open with Live Server**.
3. Buka `http://127.0.0.1:5500` di browser.
   _(Pastikan URL di `js/api.js` sesuai dengan backend yang sedang dijalankan)._

### 2. Menjalankan Backend Laravel (Utama)

1. Buat database baru di phpMyAdmin: `laundrytrack_laravel`.
2. Buka terminal, masuk ke folder Laravel: `cd backend-laravel`
3. Copy `.env.example` ke `.env`, atur `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
4. Jalankan migrasi: `php artisan migrate`
5. Nyalakan server: `php artisan serve`
6. Akses API di: `http://127.0.0.1:8000/api/orders`
   _(Pastikan `js/api.js` mengarah ke `http://127.0.0.1:8000/api`)._

### 3. Menjalankan Backend PHP Native (Arsip / Demo MVC)

1. Pindahkan folder `backend-php` ke `D:\xampp\htdocs\laundrytrack\`.
2. **API Utama:** `http://localhost/laundrytrack/backend-php/index.php`
3. **Demo MVC:** `http://localhost/laundrytrack/backend-php/demo-mvc/index.php`

---

## 🎯 Fitur Utama per Portal

### Admin

- Login dengan validasi.
- Dashboard statistik pesanan (pendapatan, proses, dll).
- CRUD pesanan (Buat, Timbang, Update Status).
- Tugaskan kurir untuk penjemputan/pengantaran.

### Customer

- Membuat pesanan tanpa perlu daftar akun.
- Melacak status cucian berdasarkan nomor HP (Timeline interaktif).
- Melihat rincian biaya dan kurir yang bertugas.

### Kurir

- Login dengan PIN.
- Melihat daftar tugas aktif (Jemput/Antar).
- **Integrasi Google Maps** untuk navigasi ke alamat pelanggan.
- Konfirmasi status tugas.

---

## 📡 Dokumentasi API (Laravel)

**Base URL:** `http://127.0.0.1:8000/api`

| Method   | Endpoint       | Deskripsi                       |
| -------- | -------------- | ------------------------------- |
| `GET`    | `/orders`      | Mengambil semua data pesanan    |
| `POST`   | `/orders`      | Membuat pesanan baru            |
| `PUT`    | `/orders/{id}` | Memperbarui status/data pesanan |
| `DELETE` | `/orders/{id}` | Menghapus pesanan               |

---

## 👨‍💻 Tim Pengembang

1. _[Muhammad Ardhi Pontoh -202410370110290]_
2. _[Nat nat]_
3. _[EKAK]_

---

_Proyek ini dibuat untuk memenuhi tugas mata kuliah Pemrograman Web._
