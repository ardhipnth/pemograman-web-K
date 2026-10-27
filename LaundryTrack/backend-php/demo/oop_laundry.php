<?php
/* =========================================================
   DEMO OOP & DYNAMIC HTML (Sesuai PPT Week 6)
   ========================================================= */

// --- TASK 01 & 02: CLASS, PROPERTY, METHOD, CONSTRUCTOR, ENCAPSULATION ---
class LayananLaundry {
    // Encapsulation: Menggunakan 'private' agar tidak bisa diubah sembarangan dari luar
    private $nama;
    private $hargaPerKg;
    private $status;

    // Constructor: Inisialisasi data saat object dibuat
    public function __construct($nama, $hargaPerKg, $status) {
        $this->nama = $nama;
        $this->hargaPerKg = $hargaPerKg;
        $this->status = $status;
    }

    // Method untuk mengambil profil (mengembalikan string)
    public function getProfile() {
        return "Paket " . $this->nama . " - Rp " . number_format($this->hargaPerKg, 0, ',', '.') . "/kg";
    }

    // Method untuk mengecek ketersediaan
    public function getStatusBadge() {
        if ($this->status === "Aktif") {
            return "<span style='background:#dcfce7; color:#15803d; padding:4px 8px; border-radius:8px; font-size:12px;'>&#10004; Tersedia</span>";
        } else {
            return "<span style='background:#fee2e2; color:#dc2626; padding:4px 8px; border-radius:8px; font-size:12px;'>&#10008; Tidak Tersedia</span>";
        }
    }
}

// --- TASK 03: OBJECT -> PHP -> HTML ---
// Membuat Object dari Class
$layanan1 = new LayananLaundry("Cuci Komplit", 8000, "Aktif");
$layanan2 = new LayananLaundry("Setrika Saja", 5000, "Tidak Aktif");

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Demo OOP LaundryTrack</title>
    <style>
        body { font-family: sans-serif; background: #f8fafc; padding: 40px; }
        .card { background: white; border-radius: 12px; padding: 20px; max-width: 400px; margin-bottom: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 4px solid #0ea5e9; }
        h3 { margin: 0 0 10px 0; color: #1e293b; }
    </style>
</head>
<body>
    <h2 style="color:#0f172a;">Demo OOP & Dynamic HTML</h2>
    <p style="color:#64748b; margin-bottom: 20px;">Halaman ini di-generate langsung dari Class PHP (bukan JSON).</p>

    <!-- Memanggil Object dan Method untuk menghasilkan HTML -->
    <div class="card">
        <h3><?= $layanan1->getProfile(); ?></h3>
        <?= $layanan1->getStatusBadge(); ?>
    </div>

    <div class="card">
        <h3><?= $layanan2->getProfile(); ?></h3>
        <?= $layanan2->getStatusBadge(); ?>
    </div>

</body>
</html>