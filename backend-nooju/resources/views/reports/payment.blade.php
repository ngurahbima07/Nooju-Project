<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Payment</title>
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
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .status-lunas { background-color: #d1fae5; color: #065f46; }
        .status-sebagian { background-color: #fef3c7; color: #92400e; }
        .status-belum-bayar { background-color: #fee2e2; color: #991b1b; }
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
                <p class="report-title">LAPORAN PAYMENT</p>
                <p class="report-meta">
                    Periode: {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }} &ndash; {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}
                </p>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th>Tamu</th>
                <th>Kamar</th>
                <th>Check-in</th>
                <th class="text-right">Total Tagihan</th>
                <th class="text-right">Sudah Dibayar</th>
                <th class="text-right">Sisa</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($reservations as $r)
                <tr>
                    <td>{{ $r['guest'] }}</td>
                    <td>{{ $r['room'] }}</td>
                    <td>{{ \Carbon\Carbon::parse($r['check_in_date'])->translatedFormat('d F Y') }}</td>
                    <td class="text-right">Rp {{ number_format($r['total_price'], 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($r['paid_amount'], 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($r['balance_due'], 0, ',', '.') }}</td>
                    <td>
                        @php
                            $badgeClass = match($r['status_label']) {
                                'Lunas' => 'status-lunas',
                                'Sebagian' => 'status-sebagian',
                                default => 'status-belum-bayar',
                            };
                        @endphp
                        <span class="status-badge {{ $badgeClass }}">{{ $r['status_label'] }}</span>
                    </td>
                </tr>
            @empty
                <tr><td colspan="7">Tidak ada booking pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-box">
        <table style="width: 100%;">
            <tr>
                <td>Total Tagihan</td>
                <td class="text-right">Rp {{ number_format($total_billed, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Total Sudah Dibayar</td>
                <td class="text-right">Rp {{ number_format($total_paid, 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td class="big">Total Piutang (Outstanding)</td>
                <td class="text-right big">Rp {{ number_format($total_outstanding, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>
</body>
</html>
