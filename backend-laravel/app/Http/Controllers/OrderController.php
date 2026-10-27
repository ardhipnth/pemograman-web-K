<?php
namespace App\Http\Controllers;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller {
    public function index() {
        return response()->json(['status' => 'success', 'data' => Order::orderBy('created_at', 'desc')->get()]);
    }
    public function store(Request $request) {
        $order = Order::updateOrCreate(['id' => $request->id], $request->all());
        return response()->json(['status' => 'success', 'data' => $order], 201);
    }
    public function update(Request $request, $id) {
        $order = Order::find($id);
        if ($order) {
            $order->update($request->all());
            return response()->json(['status' => 'success', 'data' => $order]);
        }
        return response()->json(['status' => 'error'], 404);
    }
    public function destroy($id = null) {
        if ($id) { Order::destroy($id); } else { Order::truncate(); }
        return response()->json(['status' => 'success']);
    }
}
