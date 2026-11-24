<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_layanan' => $this->nama, // Key diubah agar lebih rapi
            'deskripsi' => $this->deskripsi ?? '-',
            'harga' => $this->harga_per_kg, // Integer asli
            'harga_format' => 'Rp ' . number_format($this->harga_per_kg, 0, ',', '.'),
            'dibuat_pada' => $this->created_at->format('d M Y'),
        ];
    }
}
