<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $today = Carbon::today();
        $roomInventory = config('rooms.inventory');
        $totalRooms = array_sum($roomInventory);

        // Kamar yang sedang ditempati hari ini (termasuk maintenance, karena
        // kamar maintenance juga tidak bisa dijual ke tamu).
        $occupiedToday = Reservation::whereDate('check_in_date', '<=', $today)
            ->whereDate('check_out_date', '>', $today)
            ->count();

        $bookingsToday = Reservation::where('is_maintenance', false)
            ->whereDate('check_in_date', $today)
            ->count();

        $revenueToday = Payment::whereDate('payment_date', $today)->sum('payment_amount');

        $startOfMonth = $today->copy()->startOfMonth();
        $endOfMonth = $today->copy()->endOfMonth();

        $bookingsThisMonth = Reservation::where('is_maintenance', false)
            ->whereDate('check_in_date', '>=', $startOfMonth)
            ->whereDate('check_in_date', '<=', $endOfMonth)
            ->count();

        // Grafik jumlah booking 6 bulan terakhir (berdasarkan tanggal check-in).
        $monthlyLabels = [];
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $today->copy()->subMonths($i);
            $monthlyLabels[] = ucfirst($month->translatedFormat('M'));
            $monthlyData[] = Reservation::where('is_maintenance', false)
                ->whereYear('check_in_date', $month->year)
                ->whereMonth('check_in_date', $month->month)
                ->count();
        }

        // Trend booking & jumlah tamu 7 hari terakhir (berdasarkan tanggal check-in).
        $weeklyLabels = [];
        $weeklyBookings = [];
        $weeklyGuests = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = $today->copy()->subDays($i);
            $weeklyLabels[] = ucfirst($day->translatedFormat('D'));
            $dayReservations = Reservation::where('is_maintenance', false)
                ->whereDate('check_in_date', $day)
                ->get(['adult', 'children']);
            $weeklyBookings[] = $dayReservations->count();
            $weeklyGuests[] = (int) $dayReservations->sum(fn ($r) => (int) $r->adult + (int) $r->children);
        }

        // Distribusi tipe kamar bulan ini. Ini menggantikan chart "Booking by
        // Platform" versi lama yang datanya full hardcode/fiktif -- sistem ini
        // belum punya kolom sumber booking (OTA) di database, jadi belum bisa
        // ditampilkan secara jujur sampai fitur sinkronisasi OTA dibuat.
        $roomTypeCounts = Reservation::where('is_maintenance', false)
            ->whereDate('check_in_date', '>=', $startOfMonth)
            ->whereDate('check_in_date', '<=', $endOfMonth)
            ->selectRaw('room_type, count(*) as total')
            ->groupBy('room_type')
            ->pluck('total', 'room_type');

        $roomTypeDistribution = collect($roomInventory)->keys()->map(function ($type) use ($roomTypeCounts) {
            return [
                'label' => $type,
                'value' => (int) ($roomTypeCounts[$type] ?? 0),
            ];
        })->values();

        $checkinsToday = Reservation::where('is_maintenance', false)
            ->whereDate('check_in_date', $today)
            ->get()
            ->map(fn ($r) => [
                'guest' => trim($r->first_name.' '.$r->last_name),
                'room' => $r->room_type.' - '.$r->sub_room,
            ])->values();

        $checkoutsToday = Reservation::where('is_maintenance', false)
            ->whereDate('check_out_date', $today)
            ->get()
            ->map(fn ($r) => [
                'guest' => trim($r->first_name.' '.$r->last_name),
                'room' => $r->room_type.' - '.$r->sub_room,
            ])->values();

        $maintenanceToday = Reservation::where('is_maintenance', true)
            ->whereDate('check_in_date', '<=', $today)
            ->whereDate('check_out_date', '>', $today)
            ->get()
            ->map(fn ($r) => [
                'room' => $r->room_type.' - '.$r->sub_room,
                'reason' => $r->maintenance_reason,
            ])->values();

        return response()->json([
            'date' => $today->format('Y-m-d'),
            'bookings_today' => $bookingsToday,
            'rooms_available_today' => max(0, $totalRooms - $occupiedToday),
            'total_rooms' => $totalRooms,
            'revenue_today' => (float) $revenueToday,
            'bookings_this_month' => $bookingsThisMonth,
            'monthly_chart' => ['labels' => $monthlyLabels, 'data' => $monthlyData],
            'weekly_trend' => ['labels' => $weeklyLabels, 'bookings' => $weeklyBookings, 'guests' => $weeklyGuests],
            'room_type_distribution' => $roomTypeDistribution,
            'checkins_today' => $checkinsToday,
            'checkouts_today' => $checkoutsToday,
            'maintenance_today' => $maintenanceToday,
        ]);
    }
}
