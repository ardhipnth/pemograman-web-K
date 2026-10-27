<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    use HasFactory;
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'id', 'nama', 'hp', 'alamat', 'paket', 'layanan', 'berat',
        'hargaPerKg', 'total', 'antarJemput', 'status',
        'kurirJemput', 'kurirAntar', 'kurir', 'log',
        'dibuat', 'dijemputPada', 'selesaiPada'
    ];
    protected $casts = [
        'kurirJemput' => 'array', 'kurirAntar' => 'array', 'kurir' => 'array',
        'log' => 'array', 'antarJemput' => 'boolean',
    ];
}
