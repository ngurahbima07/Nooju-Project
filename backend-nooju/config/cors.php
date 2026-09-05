<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Backend ini diakses dari frontend React/Vite yang jalan di origin
    | berbeda (mis. http://localhost:3000), sedangkan backend sendiri di
    | http://backend-nooju.test. Karena browser mengirim header
    | "Authorization: Bearer <token>" di setiap request (bukan cookie sesi),
    | request tsb butuh preflight CORS -- jadi konfigurasi ini WAJIB ada,
    | tidak bisa mengandalkan default framework.
    |
    | Login/logout di sistem ini pakai Bearer token (Sanctum personal access
    | token), BUKAN cookie sesi lintas domain, jadi supports_credentials
    | sengaja dibiarkan false. Ini lebih aman dan artinya daftar origin di
    | bawah tidak perlu 100% lengkap sebelum sistem bisa jalan (tidak ada
    | risiko kebocoran cookie), tapi tetap sebaiknya diisi origin yang benar
    | supaya browser tidak menolak request di awal (preflight tetap perlu
    | Access-Control-Allow-Origin yang cocok).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        env('FRONTEND_URL'),
    ])),

    'allowed_origins_patterns' => [
        // Jaga-jaga kalau suatu saat frontend juga di-park lewat Laravel Herd
        // (mis. http://nooju-frontend.test) alih-alih dijalankan lewat
        // "npm run dev" di localhost:3000.
        '#^https?://([a-z0-9-]+\.)*test(:\d+)?$#i',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
