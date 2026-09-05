<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Occupancy</title>
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
                <p class="report-title">LAPORAN OCCUPANCY</p>
                <p class="report-meta">
                    Periode: {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }} &ndash; {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}<br>
                    Total kamar: {{ $total_rooms }} ({{ $room_inventory['Standard'] }} Standard, {{ $room_inventory['Superior'] }} Superior)
                </p>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th>Tanggal</th>
                <th class="text-right">Kamar Terisi</th>
                <th class="text-right">Kamar Tersedia</th>
                <th class="text-right">Okupansi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($daily as $day)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($day['date'])->translatedFormat('d F Y') }}</td>
                    <td class="text-right">{{ $day['occupied'] }}</td>
                    <td class="text-right">{{ $day['available'] }}</td>
                    <td class="text-right">{{ $day['rate'] }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary-box">
        <table style="width: 100%;">
            <tr>
                <td>Total kamar-malam terisi</td>
                <td class="text-right">{{ $total_occupied }}</td>
            </tr>
            <tr>
                <td>Total kamar-malam tersedia</td>
                <td class="text-right">{{ $total_available }}</td>
            </tr>
            <tr>
                <td class="big">Rata-rata Okupansi</td>
                <td class="text-right big">{{ $overall_rate }}%</td>
            </tr>
        </table>
    </div>
</body>
</html>
