<?php
// Tampilkan error jika ada masalah (untuk development)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Panggil semua file yang dibutuhkan
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/models/Order.php';
require_once __DIR__ . '/controllers/OrderController.php';

// 1. Inisialisasi Koneksi Database
$database = new Database();
$db = $database->getConnection();

// 2. Jalankan Controller
if ($db) {
    $controller = new OrderController($db);
    $controller->handleRequest();
} else {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
}
?>