<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    /**
     * Generate & download invoice PDF untuk satu booking.
     * Dipanggil dari tombol "Download Invoice" di BookingChart.jsx.
     */
    public function show($bookingId)
    {
        $reservation = Reservation::findOrFail($bookingId);

        $payments = Payment::where('booking_id', $reservation->id)
            ->orderBy('payment_date')
            ->get();

        $paidAmount = $payments->sum('payment_amount');
        $balanceDue = $reservation->total_price - $paidAmount;

        $checkIn = Carbon::parse($reservation->check_in_date);
        $checkOut = Carbon::parse($reservation->check_out_date);
        $nights = max(1, $checkIn->diffInDays($checkOut));

        $pdf = Pdf::loadView('invoices.invoice', [
            'reservation' => $reservation,
            'payments' => $payments,
            'paidAmount' => $paidAmount,
            'balanceDue' => $balanceDue,
            'nights' => $nights,
            'checkIn' => $checkIn,
            'checkOut' => $checkOut,
        ]);

        return $pdf->download('invoice-'.$reservation->id.'.pdf');
    }
}
