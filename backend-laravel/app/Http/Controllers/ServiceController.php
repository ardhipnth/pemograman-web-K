<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Service::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga_per_kg' => 'required|integer|min:0',
        ]);

        $service = Service::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Layanan berhasil ditambahkan',
            'data' => $service
        ], 201);
    }

    public function show($id)
    {
        $service = Service::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $service
        ]);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga_per_kg' => 'required|integer|min:0',
        ]);

        $service->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Layanan berhasil diperbarui',
            'data' => $service
        ]);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Layanan berhasil dihapus'
        ]);
    }
}
