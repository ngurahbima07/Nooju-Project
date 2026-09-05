<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomPrice extends Model
{
    protected $fillable = [
        'room_type',
        'base_price',
    ];

    protected $casts = [
        'base_price' => 'float',
    ];
}
