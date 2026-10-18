<?php
/* =========================================================
   TASK 02 — PROCESS DATA WITH PHP
   Array + Conditional + Loop
========================================================= */

// Data array (multiple data)
$programs = [
  [
    "nama"    => "Cuci Komplit",
    "harga"   => 8000,
    "status"  => "active",
    "icon"    => "🧺",
    "warna"   => "#e0f2fe",
  ],
  [
    "nama"    => "Cuci Biasa",
    "harga"   => 6000,
    "status"  => "active",
    "icon"    => "👕",
    "warna"   => "#dcfce7",
  ],
  [
    "nama"    => "Setrika Saja",
    "harga"   => 5000,
    "status"  => "inactive",
    "icon"    => "🔥",
    "warna"   => "#fef3c7",
  ],
];

// Function: format rupiah
function formatRupiah($angka) {
  return "Rp " . number_format($angka, 0, ",", ".");
}

// Function: hitung total harga jika beli 3 kg
function hitungTotal($hargaPerKg, $berat) {
  return $hargaPerKg * $berat;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Paket Layanan - Demo PHP</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f0f9ff;
      padding: 40px;
      color: #1e293b;
    }
    h1 { color: #0ea5e9; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-top: 30px;
      max-width: 900px;
    }
    .card {
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border-left: 4px solid #0ea5e9;
    }
    .card .icon { font-size: 32px; margin-bottom: 12px; }
    .card .nama { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .card .harga { font-size: 22px; font-weight: 700; color: #0ea5e9; }
    .card .harga small { font-size: 12px; color: #94a3b8; font-weight: 400; }
    .card .status { margin-top: 12px; font-size: 12px; }
    .badge-active { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 12px; }
    .badge-off { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 12px; }
    .info { background: #eff6ff; padding: 16px; border-radius: 12px; margin-top: 30px; max-width: 900px; }
    .info strong { color: #0ea5e9; }
  </style>
</head>
<body>
  <h1>🧺 Paket Layanan LaundryTrack</h1>
  <p>Data ini di-generate otomatis oleh PHP menggunakan <strong>array</strong> + <strong>loop foreach</strong>.</p>

  <div class="grid">
    <?php foreach ($programs as $p): ?>
      <div class="card">
        <div class="icon"><?php echo $p["icon"]; ?></div>
        <div class="nama"><?php echo $p["nama"]; ?></div>
        <div class="harga">
          <?php echo formatRupiah($p["harga"]); ?>
          <small>/kg</small>
        </div>
        <div class="status">
          <?php if ($p["status"] === "active"): ?>
            <span class="badge-active">✅ Tersedia</span>
          <?php else: ?>
            <span class="badge-off">❌ Tidak Tersedia</span>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="info">
    <strong>💡 Info:</strong> Jika kamu laundry 3 kg dengan paket
    <strong>Cuci Komplit</strong>, total yang harus dibayar adalah
    <strong><?php echo formatRupiah(hitungTotal(8000, 3)); ?></strong>
  </div>
</body>
</html>