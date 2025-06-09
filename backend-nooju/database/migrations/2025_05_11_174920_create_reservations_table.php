<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('reservations', function (Blueprint $table) {
        $table->id();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('email')->nullable();
        $table->string('room_type');
        $table->string('sub_room');
        $table->string('rate_plan')->nullable();
        $table->integer('adult');
        $table->integer('children')->nullable();
        $table->date('check_in_date');
        $table->date('check_out_date');
        $table->decimal('total_price', 10, 2);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
