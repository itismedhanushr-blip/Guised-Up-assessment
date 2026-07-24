<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\InteractionController;

/*
|--------------------------------------------------------------------------
| API Routes - Guised Up
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

// Sanctum Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/feed', [FeedController::class, 'feed']);
    Route::get('/search', [FeedController::class, 'search']);
    Route::post('/interactions', [InteractionController::class, 'store']);
});
