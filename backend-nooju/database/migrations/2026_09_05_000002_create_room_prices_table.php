<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_prices', function (Blueprint $table) {
            $table->id();
            $table->string('room_type')->unique();
            $table->decimal('base_price', 12, 2);
            $table->timestamps();
        });

        // Isi harga dasar awal, disamakan dengan angka yang sebelumnya
        // di-hardcode di frontend (src/utils/booking.js) supaya tidak ada
        // perubahan harga mendadak begitu Smart Pricing dinyalakan.
        DB::table('room_prices')->insert([
            ['room_type' => 'Standard', 'base_price' => 500000, 'created_at' => now(), 'updated_at' => now()],
            ['room_type' => 'Superior', 'base_price' => 750000, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_prices');
    }
};
