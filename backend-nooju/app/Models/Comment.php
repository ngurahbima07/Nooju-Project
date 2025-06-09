<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Reservation;




class Comment extends Model
{
    protected $fillable = ['booking_id', 'comment'];

    public function booking()
    {
        return $this->belongsTo(Reservation::class);
    }
}



