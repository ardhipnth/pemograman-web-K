<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    // READ: Mengambil semua data
    public function index()
    {
        return response()->json([
            'data' => Service::all()
        ], 200);
    }

    // FORM CREATE (Untuk API, kita cukup return pesan)
    public function create()
    {
        return response()->json(['message' => 'Form tambah layanan']);
    }

    // CREATE: Simpan data baru + VALIDATION
    public function store(Request $request)
    {
        // Validasi sesuai PPT Task 02
        $request->validate([
            'nama' => 'required|max:100',
            'deskripsi' => 'required',
            'harga_per_kg' => 'required|integer|min:1000'
        ]);

        $service = Service::create([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'harga_per_kg' => $request->harga_per_kg,
        ]);

        return response()->json([
            'message' => 'Berhasil',
            'data' => $service
        ], 201); // 201 Created
    }

    // READ DETAIL
    public function show($id)
    {
        $service = Service::findOrFail($id);
        return response()->json([
            'data' => $service
        ], 200);
    }

    // FORM EDIT
    public function edit($id)
    {
        $service = Service::findOrFail($id);
        return response()->json(['message' => 'Form edit layanan', 'data' => $service]);
    }

    // UPDATE: Ubah data + VALIDATION
    public function update(Request $request, $id)
    {
        // Validasi sesuai PPT Task 02
        $request->validate([
            'nama' => 'required|max:100',
            'deskripsi' => 'required',
            'harga_per_kg' => 'required|integer|min:1000'
        ]);

        $service = Service::findOrFail($id);
        $service->update([
            'nama' => $request->nama,
            'deskripsi' => $request->deskripsi,
            'harga_per_kg' => $request->harga_per_kg,
        ]);

        return response()->json([
            'message' => 'Berhasil diperbarui',
            'data' => $service
        ], 200);
    }

    // DELETE
    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'message' => 'Berhasil dihapus'
        ], 200);
    }
}
