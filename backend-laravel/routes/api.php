<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController; // <-- TAMBAHKAN INI

// Route Login (Publik)
Route::post('/login', [AuthController::class, 'login']);

// Route Publik untuk Customer (Buat pesanan & cek status)
Route::apiResource('orders', OrderController::class);

// Route Terlindungi (Wajib pakai Token JWT)
Route::middleware('auth:api')->group(function () {
    Route::apiResource('services', ServiceController::class);
    Route::post('/logout', [AuthController::class, 'logout']);
});
