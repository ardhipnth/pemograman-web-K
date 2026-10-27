<?php
require_once __DIR__ . '/../Model/Layanan.php';

class LayananController {
        public function index() {
        // 1. Memanggil Model (Samakan namanya jadi $layanan)
        $layanan = new Layanan("Cuci Komplit", 8000);

        // 2. Meneruskan data tersebut ke View
        require_once __DIR__ . '/../View/tampilan.php';
    }
}
?>
