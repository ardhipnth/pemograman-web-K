<?php
/* =========================================================
   TASK 01 — PHP PAGE
   Menampilkan informasi dengan PHP variables
========================================================= */

// Variable PHP
$namaSistem    = "LaundryTrack";
$versi         = "1.0.0";
$totalPesanan  = 2;
$statusSistem  = "active";
$tanggalHariIni = date("d F Y");
$namaAdmin     = "Admin Pusat";
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo $namaSistem; ?> - Demo PHP</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f0f9ff;
      padding: 40px;
      color: #1e293b;
    }
    .card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.08);
      max-width: 600px;
      margin: 0 auto;
    }
    h1 { color: #0ea5e9; margin-bottom: 20px; }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 600; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-off { background: #fee2e2; color: #dc2626; }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #94a3b8;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>🧺 <?php echo $namaSistem; ?></h1>

    <div class="row">
      <span class="label">Versi Aplikasi</span>
      <span class="value"><?php echo $versi; ?></span>
    </div>

    <div class="row">
      <span class="label">Total Pesanan</span>
      <span class="value"><?php echo $totalPesanan; ?> pesanan</span>
    </div>

    <div class="row">
      <span class="label">Admin</span>
      <span class="value"><?php echo $namaAdmin; ?></span>
    </div>

    <div class="row">
      <span class="label">Status Sistem</span>
      <span class="value">
        <?php if ($statusSistem === "active"): ?>
          <span class="badge badge-active">✅ Aktif</span>
        <?php else: ?>
          <span class="badge badge-off">❌ Nonaktif</span>
        <?php endif; ?>
      </span>
    </div>

    <div class="row" style="border-bottom: none;">
      <span class="label">Tanggal</span>
      <span class="value"><?php echo $tanggalHariIni; ?></span>
    </div>

    <div class="footer">
      Halaman ini di-generate oleh PHP pada <?php echo date("H:i:s"); ?>
    </div>
  </div>
</body>
</html>