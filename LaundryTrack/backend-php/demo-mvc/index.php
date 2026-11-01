<?php
// Memanggil Controller
require_once __DIR__ . '/Controller/LayananController.php';

// Menjalankan aplikasi
$controller = new LayananController();
$controller->index();
?>