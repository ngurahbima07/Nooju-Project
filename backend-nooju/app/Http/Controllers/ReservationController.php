<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reservation;
use App\Models\Payment;



class ReservationController extends Controller
{
    // GET all reservations
public function index()
{
    $reservations = Reservation::all();

    // Loop dan tambahkan paid_amount ke setiap reservasi
    $reservations->transform(function ($reservation) {
        $totalPaid = Payment::where('booking_id', $reservation->id)->sum('payment_amount');
        $reservation->paid_amount = $totalPaid;
        return $reservation;
    });

    return response()->json($reservations);
}

    // POST create reservation
    public function store(Request $request)
    {

        
        $data = $request->validate([
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => 'nullable|email|max:100',
            'room_type'       => 'required|string|in:Standard,Superior',
            'sub_room'        => 'required|string|max:20',
            'rate_plan'       => 'nullable|string|in:Rooms Only,Breakfast Included',
            'adult'           => 'required|integer|min:1',
            'children'        => 'nullable|integer|min:0',
            'check_in_date'   => 'required|date|date_format:Y-m-d',
            'check_out_date'  => 'required|date|date_format:Y-m-d|after:check_in_date',
            'total_price'     => 'required|numeric|min:0',
            'daily_rates'     => 'required|array',
             'status' => 'sometimes|string|in:confirm,onhold,cancel',
            
        ]);

        try {
            $reservation = Reservation::create($data);

            return response()->json([
                'success' => true,
                'data'    => $reservation,
                'message' => 'Reservasi berhasil dibuat'
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat reservasi',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // PUT update reservation

    
public function update(Request $request, $id)
{
    $reservation = Reservation::find($id);

    if (!$reservation) {
        return response()->json(['message' => 'Reservasi tidak ditemukan'], 404);
    }

    // Dulu endpoint ini tidak divalidasi sama sekali (beda dengan store()),
    // jadi room_type/tanggal yang tidak valid bisa lolos tersimpan dan
    // "menghilang" dari perhitungan Occupancy/Reports/Smart Pricing karena
    // tidak cocok dengan config('rooms.inventory'). Disamakan dengan aturan
    // validasi di store().
    $data = $request->validate([
        'first_name'      => 'required|string|max:100',
        'last_name'       => 'required|string|max:100',
        'email'           => 'nullable|email|max:100',
        'room_type'       => 'required|string|in:Standard,Superior',
        'sub_room'        => 'required|string|max:20',
        'rate_plan'       => 'nullable|string|in:Rooms Only,Breakfast Included',
        'adult'           => 'required|integer|min:1',
        'children'        => 'nullable|integer|min:0',
        'check_in_date'   => 'required|date|date_format:Y-m-d',
        'check_out_date'  => 'required|date|date_format:Y-m-d|after:check_in_date',
        'total_price'     => 'required|numeric|min:0',
        'daily_rates'     => 'required|array',
        'status'          => 'sometimes|string|in:confirm,onhold,cancel',
    ]);

    // fill() + save() supaya mutator setDailyRatesAttribute() di model yang
    // menangani encode-nya secara konsisten (sama seperti alur store()),
    // tidak perlu json_encode manual di sini lagi.
    $reservation->fill($data);
    $reservation->save();

    return response()->json([
        'message' => 'Reservasi berhasil diperbarui',
        'data' => $reservation
    ]);
}

    // DELETE reservation
    public function destroy($id)
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $reservation->delete();

        return response()->json(['message' => 'Reservasi berhasil dihapus']);

        
    }

    //recent booking

    public function recent()
{
    $recentBookings = \App\Models\Reservation::orderBy('created_at', 'desc')
        ->take(5)
        ->get(['id', 'first_name', 'last_name', 'room_type', 'check_in_date', 'check_out_date', 'total_price']);

    return response()->json($recentBookings);
}
    
}
