<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('nama');
            $table->string('hp');
            $table->text('alamat');
            $table->string('paket');
            $table->string('layanan');
            $table->decimal('berat', 8, 2)->nullable();
            $table->integer('hargaPerKg')->nullable();
            $table->integer('total')->nullable();
            $table->boolean('antarJemput')->default(true);
            $table->string('status')->default('menunggu');
            $table->json('kurirJemput')->nullable();
            $table->json('kurirAntar')->nullable();
            $table->json('kurir')->nullable();
            $table->json('log')->nullable();
            $table->bigInteger('dibuat')->nullable();
            $table->bigInteger('dijemputPada')->nullable();
            $table->bigInteger('selesaiPada')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
