<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\DevisController;
use App\Http\Controllers\EnterpriseController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectGalleryController;
use App\Models\Enterprise;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectGallery;
use Illuminate\Support\Facades\Route;

Route::get('/migrate', function () {
    \Artisan::call(' db:seed --class=DatabaseSeeder');
    return 'Database migrated and seeded successfully!';
})->name('migrate');


Route::get('/', function () {
    $projects = Project::where('is_published', true)->with(['enterprises'])->latest()->take(6)->get();
    $gallery = ProjectGallery::whereHas('project', function ($query) {
        $query->where('is_published', true);
    })->with('project')->latest()->take(8)->get();

    $stats = [
        'enterprises_count' => Enterprise::count(),
        'projects_count' => Project::where('is_published', true)->count(),
        'projects_finished' => Project::where('is_published', true)->where('is_finished', true)->count(),
    ];

    return Inertia\Inertia::render('welcome', [
        'projects' => $projects,
        'gallery' => $gallery,
        'stats' => $stats,
        'profile' => Profile::first(),
    ]);
})->name('home');

// Public contact form submission (no auth required)
Route::post('contact', [ContactMessageController::class, 'store'])->name('contact.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [ProjectController::class, 'dashboard'])->name('dashboard');
    Route::resource('enterprises', EnterpriseController::class);
    Route::resource('projects', ProjectController::class);
    Route::resource('devis', DevisController::class)->only(['index', 'store', 'destroy']);
    Route::resource('gallery', ProjectGalleryController::class)->only(['index', 'store', 'destroy']);
    Route::resource('categories', CategoryController::class);
    Route::inertia('settings', 'settings/appearance')->name('settings.appearance');

    // Contact messages management
    Route::get('contact-messages', [ContactMessageController::class, 'index'])->name('contact-messages.index');
    Route::patch('contact-messages/{contactMessage}/read', [ContactMessageController::class, 'markRead'])->name('contact-messages.read');
    Route::delete('contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy'])->name('contact-messages.destroy');
});

require __DIR__.'/settings.php';
