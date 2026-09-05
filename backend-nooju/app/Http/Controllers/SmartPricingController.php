<?php

namespace App\Http\Controllers;

use App\Models\RoomPrice;
use App\Models\Season;
use App\Services\SmartPricingService;
use Illuminate\Http\Request;

class SmartPricingController extends Controller
{
    public function __construct(private SmartPricingService $pricingService)
    {
    }

    /**
     * Simulasikan / hitung harga untuk satu tipe kamar & rentang tanggal.
     * Dipakai oleh halaman pengaturan Smart Pricing (simulator) dan nanti
     * oleh form booking untuk hitung harga otomatis.
     */
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'room_type' => 'required|string',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'booking_date' => 'nullable|date',
        ]);

        $result = $this->pricingService->calculateStay(
            $validated['room_type'],
            $validated['check_in_date'],
            $validated['check_out_date'],
            $validated['booking_date'] ?? null
        );

        return response()->json($result);
    }

    /* =====================  HARGA DASAR PER TIPE KAMAR  ===================== */

    public function roomPrices()
    {
        return response()->json(RoomPrice::orderBy('room_type')->get());
    }

    public function updateRoomPrice(Request $request, $id)
    {
        $roomPrice = RoomPrice::findOrFail($id);

        $validated = $request->validate([
            'base_price' => 'required|numeric|min:0',
        ]);

        $roomPrice->update($validated);

        return response()->json($roomPrice);
    }

    /* =====================  SEASONS (KALENDER MUSIMAN)  ===================== */

    public function seasons()
    {
        return response()->json(Season::orderBy('start_date')->get());
    }

    public function storeSeason(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'multiplier' => 'required|numeric|min:0.1|max:9.99',
        ]);

        $season = Season::create($validated);

        return response()->json($season, 201);
    }

    public function updateSeason(Request $request, $id)
    {
        $season = Season::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'multiplier' => 'required|numeric|min:0.1|max:9.99',
        ]);

        $season->update($validated);

        return response()->json($season);
    }

    public function destroySeason($id)
    {
        $season = Season::findOrFail($id);
        $season->delete();

        return response()->json(['message' => 'Season berhasil dihapus']);
    }
}
