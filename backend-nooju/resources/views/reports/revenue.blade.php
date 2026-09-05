<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Revenue</title>
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
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin: 16px 0 4px 0; }
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
                <p class="report-title">LAPORAN REVENUE</p>
                <p class="report-meta">
                    Periode: {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }} &ndash; {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}
                </p>
            </td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th>Tanggal Bayar</th>
                <th>Tamu</th>
                <th>Metode</th>
                <th class="text-right">Jumlah</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $p)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($p['payment_date'])->translatedFormat('d F Y') }}</td>
                    <td>{{ $p['guest'] }}</td>
                    <td>{{ $p['payment_type'] }}</td>
                    <td class="text-right">Rp {{ number_format($p['payment_amount'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="4">Tidak ada pembayaran pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    @if($by_type->count() > 0)
        <div class="section-title">Ringkasan per Metode Pembayaran</div>
        <table class="data-table">
            <thead>
                <tr><th>Metode</th><th class="text-right">Jumlah</th></tr>
            </thead>
            <tbody>
                @foreach($by_type as $type => $amount)
                    <tr>
                        <td>{{ $type }}</td>
                        <td class="text-right">Rp {{ number_format($amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="summary-box">
        <table style="width: 100%;">
            <tr>
                <td class="big">Total Revenue</td>
                <td class="text-right big">Rp {{ number_format($total_revenue, 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>
</body>
</html>
