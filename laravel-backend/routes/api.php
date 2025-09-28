<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\InstallController;
use App\Http\Controllers\Api\EmailConfigController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Installation routes (no auth required, but protected by CheckInstallation middleware)
Route::prefix('install')->group(function () {
    Route::post('/check-requirements', [InstallController::class, 'checkRequirements']);
    Route::post('/test-database', [InstallController::class, 'testDatabase']);
    Route::post('/run-migrations', [InstallController::class, 'runMigrations']);
    Route::post('/configure-app', [InstallController::class, 'configureApp']);
    Route::post('/configure-smtp', [InstallController::class, 'configureSmtp']);
    Route::post('/configure-payments', [InstallController::class, 'configurePayments']);
    Route::post('/create-admin', [InstallController::class, 'createAdmin']);
    Route::post('/finalize', [InstallController::class, 'finalize']);
});

// Webhook routes (no auth required)
Route::post('/webhooks/moneroo', [PaymentController::class, 'monerooWebhook']);
Route::post('/webhooks/nowpayments', [PaymentController::class, 'nowpaymentsWebhook']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    
    // Transaction routes
    Route::apiResource('transactions', TransactionController::class);
    Route::post('/transactions/{transaction}/payment', [TransactionController::class, 'processPayment']);
    
    // Payment routes
    Route::post('/payments/moneroo', [PaymentController::class, 'processMoneroo']);
    Route::post('/payments/nowpayments', [PaymentController::class, 'processNowPayments']);
    Route::post('/payments/{transaction}/retry', [PaymentController::class, 'retryPayment']);
    
    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    
    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/transactions', [AdminController::class, 'transactions']);
        Route::put('/transactions/{transaction}', [AdminController::class, 'updateTransaction']);
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);
        Route::get('/users', [AdminController::class, 'users']);
        
        // Email configuration routes
        Route::get('/email-config', [EmailConfigController::class, 'getEmailConfig']);
        Route::post('/email-config', [EmailConfigController::class, 'saveEmailConfig']);
        Route::post('/test-smtp', [EmailConfigController::class, 'testSMTP']);
        Route::post('/send-template-preview', [EmailConfigController::class, 'sendTemplatePreview']);
    });
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});