<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'harga_per_kg' => 'required|integer|min:1000', // Harga minimal 1000
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama layanan wajib diisi.',
            'harga_per_kg.required' => 'Harga wajib diisi.',
            'harga_per_kg.integer' => 'Harga harus berupa angka.',
            'harga_per_kg.min' => 'Harga tidak boleh di bawah Rp 1.000.',
        ];
    }
}
