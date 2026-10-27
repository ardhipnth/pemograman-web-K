<?php
class OrderController {
    private $order_model;

    public function __construct($db) {
        $this->order_model = new Order($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Accept");

        if ($method === 'OPTIONS') { http_response_code(200); exit; }

        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $input = json_decode(file_get_contents("php://input"));

        try {
            if ($method === 'GET') {
                if ($id) {
                    $result = $this->order_model->getById($id);
                    echo json_encode(["status" => "success", "data" => $result]);
                } else {
                    $result = $this->order_model->getAll();
                    echo json_encode(["status" => "success", "data" => $result]);
                }
            } 
            elseif ($method === 'POST') {
                if (!empty($input->id)) {
                    if ($this->order_model->create($input)) {
                        $clean_data = $this->order_model->getById($input->id); // Ambil data bersih
                        echo json_encode(["status" => "success", "message" => "Order ditambahkan", "data" => $clean_data]);
                    } else {
                        echo json_encode(["status" => "error", "message" => "Gagal menyimpan"]);
                    }
                }
            } 
            elseif ($method === 'PUT') {
                if ($id && !empty($input)) {
                    if ($this->order_model->update($id, $input)) {
                        $clean_data = $this->order_model->getById($id); // Ambil data bersih
                        echo json_encode(["status" => "success", "message" => "Order diperbarui", "data" => $clean_data]);
                    } else {
                        echo json_encode(["status" => "error", "message" => "Gagal update"]);
                    }
                }
            } 
            elseif ($method === 'DELETE') {
                if ($id) {
                    $this->order_model->delete($id);
                    echo json_encode(["status" => "success", "message" => "Order dihapus"]);
                } else {
                    $this->order_model->deleteAll();
                    echo json_encode(["status" => "success", "message" => "Semua order direset"]);
                }
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}
?>