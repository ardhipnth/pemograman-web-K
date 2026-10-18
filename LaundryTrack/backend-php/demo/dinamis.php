<?php
/* =========================================================
   TASK 03 — DYNAMIC SERVER-SIDE CONTENT
   HTML yang isinya di-generate oleh PHP
========================================================= */

// Konfigurasi halaman
$judulHalaman = "Dashboard LaundryTrack";
$namaAdmin    = "Admin Pusat";

// Data order dari "database" (contoh)
$orders = [
  ["id" => "INV-0001", "nama" => "Ardhi",  "status" => "selesai",   "total" => 18000],
  ["id" => "INV-0002", "nama" => "Panji",  "status" => "proses",    "total" => 48000],
  ["id" => "INV-0003", "nama" => "Rani",   "status" => "menunggu",  "total" => 0],
];

// Function: warna badge berdasarkan status
function badgeStatus($status) {
  $map = [
    "selesai"  => ["bg" => "#dcfce7", "color" => "#15803d", "label" => "Selesai"],
    "proses"   => ["bg" => "#dbeafe", "color" => "#2563eb", "label" => "Diproses"],
    "menunggu" => ["bg" => "#fef3c7", "color" => "#b45309", "label" => "Menunggu"],
  ];
  return $map[$status] ?? ["bg" => "#e2e8f0", "color" => "#64748b", "label" => $status];
}

// Function: hitung statistik
function hitungStatistik($orders) {
  $total = count($orders);
  $selesai = 0;
  $pendapatan = 0;

  foreach ($orders as $o) {
    if ($o["status"] === "selesai") {
      $selesai++;
      $pendapatan += $o["total"];
    }
  }

  return [
    "total" => $total,
    "selesai" => $selesai,
    "pendapatan" => $pendapatan,
  ];
}

$stat = hitungStatistik($orders);
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title><?php echo $judulHalaman; ?></title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #f5f7fb;
      padding: 40px;
      color: #1e293b;
      margin: 0;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: #0ea5e9; margin-bottom: 8px; }
    .subtitle { color: #64748b; margin-bottom: 30px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .stat-box {
      background: white;
      padding: 20px;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .stat-box .label { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
    .stat-box .value { font-size: 26px; font-weight: 700; color: #0ea5e9; }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    th, td {
      padding: 14px 18px;
      text-align: left;
      border-bottom: 1px solid #f1f5f9;
    }
    th {
      background: #f8fafc;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
    }
    td { font-size: 14px; }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 600;
    }
    .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧺 <?php echo $judulHalaman; ?></h1>
    <p class="subtitle">Selamat datang, <?php echo $namaAdmin; ?>! Halaman ini di-generate PHP pada <?php echo date("d/m/Y H:i:s"); ?></p>

    <div class="stats">
      <div class="stat-box">
        <div class="label">Total Pesanan</div>
        <div class="value"><?php echo $stat["total"]; ?></div>
      </div>
      <div class="stat-box">
        <div class="label">Selesai</div>
        <div class="value"><?php echo $stat["selesai"]; ?></div>
      </div>
      <div class="stat-box">
        <div class="label">Pendapatan</div>
        <div class="value">Rp <?php echo number_format($stat["pendapatan"], 0, ",", "."); ?></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID Nota</th>
          <th>Nama</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($orders as $o): ?>
          <?php $b = badgeStatus($o["status"]); ?>
          <tr>
            <td><strong><?php echo $o["id"]; ?></strong></td>
            <td><?php echo $o["nama"]; ?></td>
            <td>
              <span class="badge" style="background:<?php echo $b["bg"]; ?>;color:<?php echo $b["color"]; ?>">
                <?php echo $b["label"]; ?>
              </span>
            </td>
            <td>
              <?php if ($o["total"] > 0): ?>
                Rp <?php echo number_format($o["total"], 0, ",", "."); ?>
              <?php else: ?>
                <em style="color:#94a3b8">Belum ditimbang</em>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>

    <div class="footer">
      Halaman ini di-render dari server-side PHP — bukan JavaScript.
    </div>
  </div>
</body>
</html>