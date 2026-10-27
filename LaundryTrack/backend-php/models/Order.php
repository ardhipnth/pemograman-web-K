<?php
class Order {
    private $conn;
    private $table_name = "orders";

    public function __construct($db) {
        $this->conn = $db;
    }

    private function decodeJsonData($data) {
        while (is_string($data)) {
            $decoded = json_decode($data);
            if (json_last_error() !== JSON_ERROR_NONE) {
                break;
            }
            $data = $decoded;
        }
        return $data;
    }

    private function formatRow($row) {
        if (!$row) return $row;
        $row['kurirJemput'] = $this->decodeJsonData($row['kurirJemput'] ?? null);
        $row['kurirAntar'] = $this->decodeJsonData($row['kurirAntar'] ?? null);
        $row['kurir'] = $this->decodeJsonData($row['kurir'] ?? null);
        $row['log'] = json_decode($row['log'] ?? '[]') ?: [];
        $row['berat'] = $row['berat'] !== null ? floatval($row['berat']) : null;
        $row['hargaPerKg'] = $row['hargaPerKg'] !== null ? intval($row['hargaPerKg']) : null;
        $row['total'] = $row['total'] !== null ? intval($row['total']) : null;
        $row['antarJemput'] = boolval($row['antarJemput']);
        $row['dibuat'] = $row['dibuat'] !== null ? intval($row['dibuat']) : null;
        return $row;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map([$this, 'formatRow'], $results);
    }

    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $this->formatRow($row);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  (id, nama, hp, alamat, paket, layanan, berat, hargaPerKg, total, antarJemput, status, kurirJemput, kurirAntar, kurir, log, dibuat) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        $kj = $this->decodeJsonData($data->kurirJemput ?? null);
        $ka = $this->decodeJsonData($data->kurirAntar ?? null);
        $k = $this->decodeJsonData($data->kurir ?? null);

        return $stmt->execute([
            $data->id, $data->nama ?? "-", $data->hp ?? "-", $data->alamat ?? "-", 
            $data->paket ?? "Regular", $data->layanan ?? "Biasa", 
            $data->berat ?? null, $data->hargaPerKg ?? null, $data->total ?? null, 
            !empty($data->antarJemput) ? 1 : 0, $data->status ?? "menunggu", 
            json_encode($kj), json_encode($ka), json_encode($k), 
            json_encode($data->log ?? []), $data->dibuat ?? round(microtime(true) * 1000)
        ]);
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . " SET 
            nama=?, hp=?, alamat=?, paket=?, layanan=?, berat=?, hargaPerKg=?, total=?, antarJemput=?, 
            status=?, kurirJemput=?, kurirAntar=?, kurir=?, log=?, dibuat=?, dijemputPada=?, selesaiPada=? 
            WHERE id=?";
        $stmt = $this->conn->prepare($query);
        
        $kj = $this->decodeJsonData($data->kurirJemput ?? null);
        $ka = $this->decodeJsonData($data->kurirAntar ?? null);
        $k = $this->decodeJsonData($data->kurir ?? null);

        return $stmt->execute([
            $data->nama ?? "-", $data->hp ?? "-", $data->alamat ?? "-", 
            $data->paket ?? "Regular", $data->layanan ?? "Biasa", 
            $data->berat ?? null, $data->hargaPerKg ?? null, $data->total ?? null, 
            !empty($data->antarJemput) ? 1 : 0, $data->status ?? "menunggu", 
            json_encode($kj), json_encode($ka), json_encode($k), 
            json_encode($data->log ?? []), 
            $data->dibuat ?? null, $data->dijemputPada ?? null, $data->selesaiPada ?? null,
            $id
        ]);
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM " . $this->table_name . " WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function deleteAll() {
        $stmt = $this->conn->prepare("DELETE FROM " . $this->table_name);
        return $stmt->execute();
    }
}
?>