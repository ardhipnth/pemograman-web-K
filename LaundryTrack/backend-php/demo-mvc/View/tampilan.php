<!DOCTYPE html>
<html>
<head>
    <title>Demo MVC - LaundryTrack</title>
    <style>body { font-family: sans-serif; padding: 20px; }</style>
</head>
<body>
    <h1>Daftar Layanan Laundry</h1>
    <p>Data ini di-generate dari Model, dikirim oleh Controller, dan ditampilkan oleh View.</p>
    <ul>
        <li><strong><?= $layanan->nama; ?></strong> - Rp <?= number_format($layanan->harga, 0, ',', '.'); ?></li>
    </ul>
</body>
</html>
