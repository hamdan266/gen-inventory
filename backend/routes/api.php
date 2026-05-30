<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn() => ['status' => 'ok']);

Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('transactions', TransactionController::class);
Route::apiResource('expenses', ExpenseController::class);

Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
Route::get('/reports/profit-loss', [ReportController::class, 'profitLoss']);
Route::get('/reports/inventory', [ReportController::class, 'inventoryReport']);
