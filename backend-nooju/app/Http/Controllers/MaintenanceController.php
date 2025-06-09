<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MaintenanceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_type' => 'required|string|in:Standard,Superior',
            'sub_room' => 'required|string|max:10',
            'reason' => 'required|string|max:500',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date'
        ]);

        DB::beginTransaction();
        try {
            $maintenance = new Reservation();
            $maintenance->first_name = 'Maintenance';
            $maintenance->last_name = 'System';
            $maintenance->email = 'maintenance@system.com';
            $maintenance->room_type = $validated['room_type'];
            $maintenance->sub_room = $validated['sub_room'];
            $maintenance->rate_plan = 'Maintenance';
            $maintenance->check_in_date = $validated['start_date'];
            $maintenance->check_out_date = $validated['end_date'];
            $maintenance->adult = 0;
            $maintenance->children = 0;
            $maintenance->total_price = 0;
            $maintenance->is_maintenance = true;
            $maintenance->maintenance_reason = $validated['reason'];
            $maintenance->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'reservation' => $maintenance,
                    'color' => '#ff9800' // Warna orange untuk maintenance
                ],
                'message' => 'Maintenance berhasil dibuat'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Maintenance Error: '.$e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat maintenance',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}