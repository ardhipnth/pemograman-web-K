<?php

use App\Http\Controllers\OrderController;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/orders', [OrderController::class, 'index'])
    ->withoutMiddleware([ThrottleRequests::class]);

Route::post('/orders', [OrderController::class, 'store'])
    ->withoutMiddleware([ThrottleRequests::class]);

Route::put('/orders/{id}', [OrderController::class, 'update'])
    ->withoutMiddleware([ThrottleRequests::class]);

Route::delete('/orders/{id}', [OrderController::class, 'destroy'])
    ->withoutMiddleware([ThrottleRequests::class]);