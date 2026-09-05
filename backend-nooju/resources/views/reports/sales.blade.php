<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Sales</title>
    <style>
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 12px; color: #1f2937; }
        .header-table { width: 100%; border-bottom: 2px solid #1f2937; padding-bottom: 10px; margin-bottom: 20px; }
        .company-name { font-size: 18px; font-weight: bold; margin: 0; }
        .company-sub { font-size: 11px; color: #6b7280; margin: 2px 0 0 0; }
        .report-title { font-size: 18px; font-weight: bold; text-align: right; margin: 0; }
        .report-meta { font-size: 11px; text-align: right; color: #6b7280; }
        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.data-table th { background-color: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 11px; text-transform: uppercase; color: #374151; border-bottom: 1px solid #d1d5db; }
        table.data-table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        .summary-box { width: 100%; background-color: #f5f5f5; padding: 10px 14px; border-radius: 4px; margin-top: 10px; }
        .summary-box .big { font-size: 16px; font-weight: bold; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td style="width: 60%;">
                <p class="company-name">Nooju Homestay Pererenan</p>
                <p class="company-sub">Pererenan, Canggu, Bali</p>
            </td>
            <td style="width: 40%;">
                <p class="report-title">LAPORAN SALES</p>
                <p class="report-meta">
                    Periode: {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }} &ndash; {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}<br>
                    Jumlah booking: {{ $total_bookings }}
                </p>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th>Check-in</th>
                <th>Tamu</th>
                <th>Kamar</th>
                <th class="text-right">Malam</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($bookings as $b)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($b['check_in_date'])->translatedFormat('d F Y') }}</td>
                    <td>{{ $b['guest'] }}</td>
                    <td>{{ $b['room_type'] }} - {{ $b['sub_room'] }}</td>
                    <td class="text-right">{{ $b['nights'] }}</td>
                    <td class="text-right">Rp {{ number_format($b['total_price'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="5">Tidak ada booking pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-box">
        <table style="width: 100%;">
            <tr>
                <td class="big">Total Sales</td>
                <td class="text-right big">Rp {{ number_format($total_sales, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>
</body>
</html>
