<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\RoomPrice;
use App\Models\Season;
use Carbon\Carbon;

/**
 * Mesin Smart Pricing berbasis aturan (rule-based), BUKAN dynamic pricing
 * dengan machine learning. Sesuai skripsi Bab 1.5: harga dihitung dari 3
 * variabel per malam menginap:
 *
 *   Harga Akhir = Harga Dasar x Multiplier Okupansi x Multiplier Musiman x Multiplier Lead-Time
 *
 * Dihitung PER MALAM (bukan per masa inap), jadi satu reservasi 3 malam
 * bisa punya harga berbeda tiap malamnya tergantung okupansi/musim/lead-time
 * malam tersebut.
 */
class SmartPricingService
{
    /**
     * Hitung rincian harga untuk satu masa inap (check-in s/d check-out).
     */
    public function calculateStay(string $roomType, string $checkIn, string $checkOut, ?string $bookingDate = null): array
    {
        $checkInDate = Carbon::parse($checkIn)->startOfDay();
        $checkOutDate = Carbon::parse($checkOut)->startOfDay();
        $bookingDate = $bookingDate ? Carbon::parse($bookingDate)->startOfDay() : Carbon::today();

        $basePrice = (float) (RoomPrice::where('room_type', $roomType)->value('base_price') ?? 0);

        $nights = [];
        $cursor = $checkInDate->copy();

        while ($cursor->lt($checkOutDate)) {
            $nights[] = $this->calculateNight($roomType, $basePrice, $cursor->copy(), $bookingDate);
            $cursor->addDay();
        }

        $total = array_sum(array_column($nights, 'final_price'));

        return [
            'room_type' => $roomType,
            'base_price' => $basePrice,
            'check_in' => $checkInDate->format('Y-m-d'),
            'check_out' => $checkOutDate->format('Y-m-d'),
            'total_nights' => count($nights),
            'nights' => $nights,
            'total_price' => $total,
        ];
    }

    /**
     * Hitung harga untuk satu malam spesifik.
     */
    private function calculateNight(string $roomType, float $basePrice, Carbon $date, Carbon $bookingDate): array
    {
        $occupancyMultiplier = $this->occupancyMultiplier($roomType, $date);
        $seasonalMultiplier = $this->seasonalMultiplier($date);
        $leadTimeMultiplier = $this->leadTimeMultiplier($bookingDate, $date);

        $finalPrice = round($basePrice * $occupancyMultiplier * $seasonalMultiplier * $leadTimeMultiplier);

        return [
            'date' => $date->format('Y-m-d'),
            'base_price' => $basePrice,
            'occupancy_multiplier' => $occupancyMultiplier,
            'seasonal_multiplier' => $seasonalMultiplier,
            'lead_time_multiplier' => $leadTimeMultiplier,
            'final_price' => $finalPrice,
            'is_weekend' => $this->isWeekendNight($date),
            'is_high_season' => $seasonalMultiplier > 1.15,
        ];
    }

    /**
     * Variabel 1: Okupansi internal. Semakin penuh tipe kamar tsb pada
     * malam itu, semakin tinggi harganya (mendekati kondisi supply/demand).
     */
    private function occupancyMultiplier(string $roomType, Carbon $date): float
    {
        $roomInventory = config('rooms.inventory');
        $totalRooms = $roomInventory[$roomType] ?? 0;

        if ($totalRooms === 0) {
            return 1.0;
        }

        $occupied = Reservation::where('room_type', $roomType)
            ->whereDate('check_in_date', '<=', $date)
            ->whereDate('check_out_date', '>', $date)
            ->count();

        $rate = $occupied / $totalRooms;

        if ($rate >= 0.9) {
            return 1.30;
        }
        if ($rate >= 0.7) {
            return 1.15;
        }
        if ($rate >= 0.4) {
            return 1.0;
        }

        return 0.90;
    }

    /**
     * Akhir pekan ala Bali: pola leisure travel ramai di Jumat & Sabtu
     * malam (BUKAN Sabtu/Minggu standar).
     */
    private function isWeekendNight(Carbon $date): bool
    {
        return in_array($date->dayOfWeek, [Carbon::FRIDAY, Carbon::SATURDAY], true);
    }

    /**
     * Variabel 2: Kalender musiman. Kalau tanggal ini masuk periode
     * "Season" yang didefinisikan admin (mis. Nyepi, liburan sekolah,
     * Tahun Baru), pakai multiplier season tsb (ambil yang tertinggi kalau
     * ada beberapa season yang tumpang tindih). Kalau tidak ada season
     * khusus, pakai aturan weekend/weekday biasa.
     */
    private function seasonalMultiplier(Carbon $date): float
    {
        $season = Season::whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->orderByDesc('multiplier')
            ->first();

        if ($season) {
            return (float) $season->multiplier;
        }

        return $this->isWeekendNight($date) ? 1.15 : 1.0;
    }

    /**
     * Variabel 3: Lead-time. Booking jauh-jauh hari dapat diskon (early
     * bird), booking mendadak/last-minute kena premium.
     */
    private function leadTimeMultiplier(Carbon $bookingDate, Carbon $checkInDate): float
    {
        $leadDays = $bookingDate->diffInDays($checkInDate, false);

        if ($leadDays < 0) {
            $leadDays = 0;
        }

        if ($leadDays >= 30) {
            return 0.90;
        }
        if ($leadDays >= 7) {
            return 1.0;
        }
        if ($leadDays >= 1) {
            return 1.10;
        }

        return 1.15;
    }
}
