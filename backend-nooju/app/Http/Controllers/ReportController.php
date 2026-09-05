<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Ambil rentang tanggal dari query string (?start_date=&end_date=),
     * default ke bulan berjalan kalau tidak diisi / tidak valid.
     */
    private function resolvePeriod(Request $request): array
    {
        try {
            $start = $request->query('start_date')
                ? Carbon::parse($request->query('start_date'))->startOfDay()
                : now()->startOfMonth();
        } catch (\Exception $e) {
            $start = now()->startOfMonth();
        }

        try {
            $end = $request->query('end_date')
                ? Carbon::parse($request->query('end_date'))->endOfDay()
                : now()->endOfMonth();
        } catch (\Exception $e) {
            $end = now()->endOfMonth();
        }

        if ($end->lt($start)) {
            $end = $start->copy()->endOfDay();
        }

        return [$start, $end];
    }

    /* =====================  1. OCCUPANCY REPORT  ===================== */

    public function occupancy(Request $request)
    {
        return response()->json($this->buildOccupancyData($request));
    }

    public function occupancyPdf(Request $request)
    {
        $data = $this->buildOccupancyData($request);

        return Pdf::loadView('reports.occupancy', $data)
            ->download('laporan-occupancy-'.$data['period_label'].'.pdf');
    }

    public function occupancyExcel(Request $request)
    {
        $data = $this->buildOccupancyData($request);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Occupancy');
        $sheet->fromArray(['Tanggal', 'Kamar Terisi', 'Kamar Tersedia', 'Okupansi (%)'], null, 'A1');

        $row = 2;
        foreach ($data['daily'] as $day) {
            $sheet->fromArray([$day['date'], $day['occupied'], $day['available'], $day['rate']], null, 'A'.$row);
            $row++;
        }
        $sheet->fromArray(['TOTAL', $data['total_occupied'], $data['total_available'], $data['overall_rate']], null, 'A'.$row);

        return $this->streamExcel($spreadsheet, 'laporan-occupancy-'.$data['period_label'].'.xlsx');
    }

    private function buildOccupancyData(Request $request): array
    {
        [$start, $end] = $this->resolvePeriod($request);

        $reservations = Reservation::whereDate('check_in_date', '<=', $end)
            ->whereDate('check_out_date', '>', $start)
            ->get();

        $period = CarbonPeriod::create($start->copy()->startOfDay(), $end->copy()->startOfDay());
        $roomInventory = config('rooms.inventory');
        $totalRoomsAll = array_sum($roomInventory);

        $daily = [];
        $totalOccupied = 0;

        foreach ($period as $date) {
            $occupiedToday = $reservations->filter(function ($r) use ($date) {
                return Carbon::parse($r->check_in_date)->lte($date) && Carbon::parse($r->check_out_date)->gt($date);
            })->count();

            $daily[] = [
                'date' => $date->format('Y-m-d'),
                'occupied' => $occupiedToday,
                'available' => $totalRoomsAll,
                'rate' => $totalRoomsAll > 0 ? round($occupiedToday / $totalRoomsAll * 100, 1) : 0,
            ];

            $totalOccupied += $occupiedToday;
        }

        $totalAvailable = $totalRoomsAll * max(1, count($daily));

        return [
            'start' => $start->format('Y-m-d'),
            'end' => $end->format('Y-m-d'),
            'period_label' => $start->format('Ymd').'-'.$end->format('Ymd'),
            'room_inventory' => $roomInventory,
            'total_rooms' => $totalRoomsAll,
            'daily' => $daily,
            'total_occupied' => $totalOccupied,
            'total_available' => $totalAvailable,
            'overall_rate' => $totalAvailable > 0 ? round($totalOccupied / $totalAvailable * 100, 1) : 0,
        ];
    }

    /* =====================  2. SALES REPORT  ===================== */
    // Sales = nilai booking berdasarkan tanggal check-in di periode ini
    // (nilai transaksi yang "terjadi" di periode tsb, terlepas dari kapan dibayar).

    public function sales(Request $request)
    {
        return response()->json($this->buildSalesData($request));
    }

    public function salesPdf(Request $request)
    {
        $data = $this->buildSalesData($request);

        return Pdf::loadView('reports.sales', $data)
            ->download('laporan-sales-'.$data['period_label'].'.pdf');
    }

    public function salesExcel(Request $request)
    {
        $data = $this->buildSalesData($request);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Sales');
        $sheet->fromArray(['Check-in', 'Tamu', 'Tipe Kamar', 'No Kamar', 'Malam', 'Total'], null, 'A1');

        $row = 2;
        foreach ($data['bookings'] as $b) {
            $sheet->fromArray(
                [$b['check_in_date'], $b['guest'], $b['room_type'], $b['sub_room'], $b['nights'], $b['total_price']],
                null,
                'A'.$row
            );
            $row++;
        }
        $sheet->fromArray(['', '', '', '', 'TOTAL', $data['total_sales']], null, 'A'.$row);

        return $this->streamExcel($spreadsheet, 'laporan-sales-'.$data['period_label'].'.xlsx');
    }

    private function buildSalesData(Request $request): array
    {
        [$start, $end] = $this->resolvePeriod($request);

        $reservations = Reservation::where('is_maintenance', false)
            ->whereDate('check_in_date', '>=', $start)
            ->whereDate('check_in_date', '<=', $end)
            ->orderBy('check_in_date')
            ->get();

        $bookings = $reservations->map(function ($r) {
            $nights = max(1, Carbon::parse($r->check_in_date)->diffInDays(Carbon::parse($r->check_out_date)));

            return [
                'id' => $r->id,
                'guest' => trim($r->first_name.' '.$r->last_name),
                'room_type' => $r->room_type,
                'sub_room' => $r->sub_room,
                'check_in_date' => $r->check_in_date,
                'check_out_date' => $r->check_out_date,
                'nights' => $nights,
                'total_price' => (float) $r->total_price,
            ];
        })->values();

        return [
            'start' => $start->format('Y-m-d'),
            'end' => $end->format('Y-m-d'),
            'period_label' => $start->format('Ymd').'-'.$end->format('Ymd'),
            'bookings' => $bookings,
            'total_sales' => $bookings->sum('total_price'),
            'total_bookings' => $bookings->count(),
        ];
    }

    /* =====================  3. REVENUE REPORT  ===================== */
    // Revenue = uang yang benar-benar diterima (dari tabel payments),
    // berdasarkan tanggal bayar di periode ini.

    public function revenue(Request $request)
    {
        return response()->json($this->buildRevenueData($request));
    }

    public function revenuePdf(Request $request)
    {
        $data = $this->buildRevenueData($request);

        return Pdf::loadView('reports.revenue', $data)
            ->download('laporan-revenue-'.$data['period_label'].'.pdf');
    }

    public function revenueExcel(Request $request)
    {
        $data = $this->buildRevenueData($request);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Revenue');
        $sheet->fromArray(['Tanggal Bayar', 'Tamu', 'Metode', 'Jumlah'], null, 'A1');

        $row = 2;
        foreach ($data['payments'] as $p) {
            $sheet->fromArray([$p['payment_date'], $p['guest'], $p['payment_type'], $p['payment_amount']], null, 'A'.$row);
            $row++;
        }
        $sheet->fromArray(['', '', 'TOTAL', $data['total_revenue']], null, 'A'.$row);

        return $this->streamExcel($spreadsheet, 'laporan-revenue-'.$data['period_label'].'.xlsx');
    }

    private function buildRevenueData(Request $request): array
    {
        [$start, $end] = $this->resolvePeriod($request);

        $payments = Payment::with('reservation')
            ->whereDate('payment_date', '>=', $start)
            ->whereDate('payment_date', '<=', $end)
            ->orderBy('payment_date')
            ->get();

        $rows = $payments->map(function ($p) {
            return [
                'payment_date' => $p->payment_date,
                'guest' => $p->reservation ? trim($p->reservation->first_name.' '.$p->reservation->last_name) : '(booking dihapus)',
                'payment_type' => $p->payment_type,
                'payment_amount' => (float) $p->payment_amount,
            ];
        })->values();

        $byType = $rows->groupBy('payment_type')->map(fn ($group) => $group->sum('payment_amount'));

        return [
            'start' => $start->format('Y-m-d'),
            'end' => $end->format('Y-m-d'),
            'period_label' => $start->format('Ymd').'-'.$end->format('Ymd'),
            'payments' => $rows,
            'by_type' => $byType,
            'total_revenue' => $rows->sum('payment_amount'),
        ];
    }

    /* =====================  4. PAYMENT REPORT  ===================== */
    // Status pembayaran per booking: sudah lunas, sebagian, atau belum
    // bayar sama sekali. Berbeda dari Revenue Report (yang fokus ke
    // uang masuk), ini fokus ke piutang/tagihan yang masih outstanding.

    public function payment(Request $request)
    {
        return response()->json($this->buildPaymentStatusData($request));
    }

    public function paymentPdf(Request $request)
    {
        $data = $this->buildPaymentStatusData($request);

        return Pdf::loadView('reports.payment', $data)
            ->download('laporan-payment-'.$data['period_label'].'.pdf');
    }

    public function paymentExcel(Request $request)
    {
        $data = $this->buildPaymentStatusData($request);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Payment Status');
        $sheet->fromArray(['Tamu', 'Kamar', 'Check-in', 'Total Tagihan', 'Sudah Dibayar', 'Sisa', 'Status'], null, 'A1');

        $row = 2;
        foreach ($data['reservations'] as $r) {
            $sheet->fromArray(
                [$r['guest'], $r['room'], $r['check_in_date'], $r['total_price'], $r['paid_amount'], $r['balance_due'], $r['status_label']],
                null,
                'A'.$row
            );
            $row++;
        }

        return $this->streamExcel($spreadsheet, 'laporan-payment-'.$data['period_label'].'.xlsx');
    }

    private function buildPaymentStatusData(Request $request): array
    {
        [$start, $end] = $this->resolvePeriod($request);

        $reservations = Reservation::where('is_maintenance', false)
            ->whereDate('check_in_date', '>=', $start)
            ->whereDate('check_in_date', '<=', $end)
            ->orderBy('check_in_date')
            ->get();

        $rows = $reservations->map(function ($r) {
            $paid = Payment::where('booking_id', $r->id)->sum('payment_amount');
            $balance = $r->total_price - $paid;

            return [
                'id' => $r->id,
                'guest' => trim($r->first_name.' '.$r->last_name),
                'room' => $r->room_type.' - '.$r->sub_room,
                'check_in_date' => $r->check_in_date,
                'total_price' => (float) $r->total_price,
                'paid_amount' => (float) $paid,
                'balance_due' => (float) $balance,
                'status_label' => $balance <= 0 ? 'Lunas' : ($paid > 0 ? 'Sebagian' : 'Belum Bayar'),
            ];
        })->values();

        return [
            'start' => $start->format('Y-m-d'),
            'end' => $end->format('Y-m-d'),
            'period_label' => $start->format('Ymd').'-'.$end->format('Ymd'),
            'reservations' => $rows,
            'total_billed' => $rows->sum('total_price'),
            'total_paid' => $rows->sum('paid_amount'),
            'total_outstanding' => $rows->sum('balance_due'),
        ];
    }

    /* =====================  HELPERS  ===================== */

    private function streamExcel(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
