<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SmartPricingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommentController;

// Auth (publik, tidak perlu login)
Route::post('/login', [AuthController::class, 'login']);

// Semua route di bawah ini WAJIB login (kirim header Authorization: Bearer <token>)
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Reservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    Route::get('/reservations/recent', [ReservationController::class, 'recent']);

    // Maintenance
    Route::post('/maintenance', [MaintenanceController::class, 'store']);

    // Payments
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
    Route::get('/payments/by-booking/{id}', [PaymentController::class, 'byBooking']);

    // Comment
    Route::get('/comments/by-booking/{bookingId}', [CommentController::class, 'getCommentsByBooking']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // Invoice
    Route::get('/invoice/{bookingId}', [InvoiceController::class, 'show']);

    // Laporan Operasional
    Route::prefix('reports')->group(function () {
        Route::get('/occupancy', [ReportController::class, 'occupancy']);
        Route::get('/occupancy/pdf', [ReportController::class, 'occupancyPdf']);
        Route::get('/occupancy/excel', [ReportController::class, 'occupancyExcel']);

        Route::get('/sales', [ReportController::class, 'sales']);
        Route::get('/sales/pdf', [ReportController::class, 'salesPdf']);
        Route::get('/sales/excel', [ReportController::class, 'salesExcel']);

        Route::get('/revenue', [ReportController::class, 'revenue']);
        Route::get('/revenue/pdf', [ReportController::class, 'revenuePdf']);
        Route::get('/revenue/excel', [ReportController::class, 'revenueExcel']);

        Route::get('/payment', [ReportController::class, 'payment']);
        Route::get('/payment/pdf', [ReportController::class, 'paymentPdf']);
        Route::get('/payment/excel', [ReportController::class, 'paymentExcel']);
    });

    // Smart Pricing (rule-based)
    Route::prefix('pricing')->group(function () {
        Route::post('/calculate', [SmartPricingController::class, 'calculate']);

        Route::get('/room-prices', [SmartPricingController::class, 'roomPrices']);
        Route::put('/room-prices/{id}', [SmartPricingController::class, 'updateRoomPrice']);

        Route::get('/seasons', [SmartPricingController::class, 'seasons']);
        Route::post('/seasons', [SmartPricingController::class, 'storeSeason']);
        Route::put('/seasons/{id}', [SmartPricingController::class, 'updateSeason']);
        Route::delete('/seasons/{id}', [SmartPricingController::class, 'destroySeason']);
    });
});
