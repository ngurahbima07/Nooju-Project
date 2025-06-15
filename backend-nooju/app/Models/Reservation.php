<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
 'first_name', 'last_name', 'email', 'room_type', 'sub_room',
    'rate_plan', 'adult', 'children', 'check_in_date',
    'check_out_date', 'total_price', 'daily_rates', 'status'
    ];
    
    protected $casts = [
    'check_in_date' => 'date:Y-m-d',
    'check_out_date' => 'date:Y-m-d',
    'daily_rates' => 'array'
    ];

    // Method untuk memastikan daily_rates selalu di-encode saat disimpan
    public function setDailyRatesAttribute($value)
    {
        $this->attributes['daily_rates'] = is_array($value) 
            ? json_encode($value) 
            : $value;
    }

    

    
}