<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'payment_date',
        'payment_type',
        'payment_amount'
    ];

    /**
     * Booking (reservasi) yang terkait dengan pembayaran ini.
     * Dipakai oleh ReportController untuk laporan revenue/payment.
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'booking_id');
    }
}
