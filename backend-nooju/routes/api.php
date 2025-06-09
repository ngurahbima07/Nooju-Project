<?php

use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommentController;


// Reservations
Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::put('/reservations/{id}', [ReservationController::class, 'update']);
Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);



// Maintenance
Route::post('/maintenance', [MaintenanceController::class, 'store']);

// Payments (💰 TAMBAHKAN DI SINI)
Route::post('/payments', [PaymentController::class, 'store']);
Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);
Route::get('/payments/by-booking/{id}', [PaymentController::class, 'byBooking']);

//Comment
Route::get('/comments/by-booking/{bookingId}', [CommentController::class, 'getCommentsByBooking']);
Route::post('/comments', [CommentController::class, 'store']);
Route::delete('/comments/{id}', [CommentController::class, 'destroy']);


