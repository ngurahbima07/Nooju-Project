<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;

class PaymentController extends Controller
{
    // GET all payments (optional)
public function index()
{
    $reservations = \App\Models\Reservation::with('payments')->get();

    // Tambahkan paid_amount secara manual
    $reservations->each(function ($reservation) {
        $reservation->paid_amount = $reservation->payments->sum('payment_amount');
        unset($reservation->payments); // opsional, hapus agar respons lebih ringan
    });

    return response()->json($reservations);
}

    // PaymentController.php
public function byBooking($bookingId)
{
    return Payment::where('booking_id', $bookingId)->get();
}


    // POST create new payment
    public function store(Request $request)
    {
        $data = $request->validate([
            'bookingId'      => 'required|exists:reservations,id',
            'paymentDate'    => 'required|date',
            'paymentType'    => 'required|string|max:50',
            'paymentAmount'  => 'required|numeric|min:1',
        ]);

        try {
            $payment = Payment::create([
                'booking_id'     => $data['bookingId'],
                'payment_date'   => $data['paymentDate'],
                'payment_type'   => $data['paymentType'],
                'payment_amount' => $data['paymentAmount'],
            ]);

            return response()->json([
                'success' => true,
                'data'    => $payment,
                'message' => 'Pembayaran berhasil disimpan'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan pembayaran',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // DELETE a payment
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $payment->delete();

        return response()->json(['message' => 'Pembayaran berhasil dihapus']);
    }
}
