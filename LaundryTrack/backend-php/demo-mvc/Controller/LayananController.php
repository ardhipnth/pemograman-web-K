<?php
// Memanggil Model
require_once __DIR__ . '/../Model/Layanan.php';

class LayananController {
    public function index() {
        // 1. Membuat data dari Model (Namanya HARUS $layanan)
        $layanan = new Layanan("Cuci Komplit", 8000);

        // 2. Mengirim data ke View
        require_once __DIR__ . '/../View/tampilan.php';
    }
}
?>