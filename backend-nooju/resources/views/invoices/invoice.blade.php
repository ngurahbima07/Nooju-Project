<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ str_pad($reservation->id, 6, '0', STR_PAD_LEFT) }}</title>
    <style>
        body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: 12px;
            color: #1f2937;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #1f2937;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header-table td {
            vertical-align: top;
        }
        .company-name {
            font-size: 20px;
            font-weight: bold;
            margin: 0;
        }
        .company-sub {
            font-size: 11px;
            color: #6b7280;
            margin: 2px 0 0 0;
        }
        .invoice-title {
            font-size: 22px;
            font-weight: bold;
            text-align: right;
            margin: 0;
        }
        .invoice-meta {
            font-size: 11px;
            text-align: right;
            color: #6b7280;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 4px;
        }
        table.info-table {
            width: 100%;
            margin-bottom: 20px;
        }
        table.info-table td {
            vertical-align: top;
            width: 50%;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table.data-table th {
            background-color: #f3f4f6;
            text-align: left;
            padding: 8px;
            font-size: 11px;
            text-transform: uppercase;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
        }
        table.data-table td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        table.summary-table {
            width: 40%;
            margin-left: 60%;
        }
        table.summary-table td {
            padding: 6px 8px;
        }
        table.summary-table .label {
            color: #6b7280;
        }
        table.summary-table .total-row td {
            border-top: 2px solid #1f2937;
            font-weight: bold;
            font-size: 13px;
        }
        .text-right {
            text-align: right;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-lunas {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-belum-lunas {
            background-color: #fef3c7;
            color: #92400e;
        }
        .footer-note {
            margin-top: 30px;
            font-size: 10px;
            color: #9ca3af;
            text-align: center;
        }
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
                <p class="invoice-title">INVOICE</p>
                <p class="invoice-meta">
                    No. INV-{{ str_pad($reservation->id, 6, '0', STR_PAD_LEFT) }}<br>
                    Tanggal cetak: {{ now()->translatedFormat('d F Y') }}
                </p>
            </td>
        </tr>
    </table>

    <table class="info-table">
        <tr>
            <td>
                <div class="section-title">Ditagihkan kepada</div>
                {{ $reservation->first_name }} {{ $reservation->last_name }}<br>
                @if($reservation->email)
                    {{ $reservation->email }}<br>
                @endif
                Jumlah tamu: {{ $reservation->adult }} dewasa
                @if($reservation->children)
                    , {{ $reservation->children }} anak
                @endif
            </td>
            <td>
                <div class="section-title">Detail Menginap</div>
                Kamar: {{ $reservation->room_type }} &ndash; {{ $reservation->sub_room }}<br>
                @if($reservation->rate_plan)
                    Rate plan: {{ $reservation->rate_plan }}<br>
                @endif
                Check-in: {{ $checkIn->translatedFormat('d F Y') }}<br>
                Check-out: {{ $checkOut->translatedFormat('d F Y') }}<br>
                Lama menginap: {{ $nights }} malam
            </td>
        </tr>
    </table>

    <div class="section-title">Rincian Biaya</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Deskripsi</th>
                <th class="text-right">Malam</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ $reservation->room_type }} ({{ $reservation->sub_room }})</td>
                <td class="text-right">{{ $nights }}</td>
                <td class="text-right">Rp {{ number_format($reservation->total_price, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @if($payments->count() > 0)
        <div class="section-title">Riwayat Pembayaran</div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Metode</th>
                    <th class="text-right">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payments as $payment)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($payment->payment_date)->translatedFormat('d F Y') }}</td>
                        <td>{{ $payment->payment_type }}</td>
                        <td class="text-right">Rp {{ number_format($payment->payment_amount, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <table class="summary-table">
        <tr>
            <td class="label">Total Biaya</td>
            <td class="text-right">Rp {{ number_format($reservation->total_price, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Sudah Dibayar</td>
            <td class="text-right">Rp {{ number_format($paidAmount, 0, ',', '.') }}</td>
        </tr>
        <tr class="total-row">
            <td>{{ $balanceDue > 0 ? 'Sisa Tagihan' : 'Status' }}</td>
            <td class="text-right">
                @if($balanceDue > 0)
                    Rp {{ number_format($balanceDue, 0, ',', '.') }}
                @else
                    <span class="status-badge status-lunas">Lunas</span>
                @endif
            </td>
        </tr>
    </table>

    <p class="footer-note">
        Invoice ini dibuat otomatis oleh sistem Nooju Homestay Pererenan. Terima kasih telah menginap bersama kami.
    </p>
</body>
</html>
