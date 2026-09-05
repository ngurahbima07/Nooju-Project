<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Jumlah Kamar per Tipe
    |--------------------------------------------------------------------------
    |
    | Belum ada tabel "rooms" di database, jadi jumlah kamar per tipe
    | disimpan di sini sebagai satu-satunya sumber kebenaran (dipakai oleh
    | ReportController, DashboardController, dan SmartPricingService).
    | Kalau jumlah kamar berubah, cukup update di sini saja - juga update
    | daftar kamar yang di-hardcode di frontend (BookingChart.jsx ->
    | initializeResources) supaya tetap sinkron.
    |
    */
    'inventory' => [
        'Standard' => 4,
        'Superior' => 8,
    ],
];
