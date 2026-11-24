<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ServiceController;

// Route bawaan Laravel (biarkan saja)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// TASK 03: RESTful API Route
Route::apiResource('services', ServiceController::class);
