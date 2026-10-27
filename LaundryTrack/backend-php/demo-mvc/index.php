<?php
require_once __DIR__ . '/Controller/LayananController.php';

// Menerima request user
$controller = new LayananController();

// Menjalankan alur MVC
$controller->index(); 
?>
