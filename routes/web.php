<?php

use App\Http\Controllers\EnterpriseController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\DevisController;
use App\Http\Controllers\ProjectGalleryController;
use Illuminate\Support\Facades\Route;

use App\Models\Enterprise;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectGallery;

Route::get('/', function () {
    $projects = Project::where('is_published', true)->with(['enterprises'])->latest()->take(6)->get();
    $gallery = ProjectGallery::whereHas('project', function ($query) {
        $query->where('is_published', true);
    })->with('project')->latest()->take(8)->get();

    $stats = [
        'enterprises_count' => Enterprise::count(),
        'projects_count'    => Project::where('is_published', true)->count(),
        'projects_finished' => Project::where('is_published', true)->where('is_finished', true)->count(),
    ];

    return Inertia\Inertia::render('welcome', [
        'projects' => $projects,
        'gallery'  => $gallery,
        'stats'    => $stats,
        'profile'  => Profile::first(),
    ]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');
    Route::resource('enterprises', EnterpriseController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('devis', DevisController::class)->only(['index', 'store', 'destroy']);
    Route::resource('gallery', ProjectGalleryController::class)->only(['index', 'store', 'destroy']);
    Route::inertia('settings', 'settings/appearance')->name('settings.appearance');
});

require __DIR__.'/settings.php';
