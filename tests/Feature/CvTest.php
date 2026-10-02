<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('portfolio cv can be uploaded from settings', function () {
    Storage::fake('supabase');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('profile.portfolio.update'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'telephone' => '+33123456789',
        'birth_date' => '1990-01-01',
        'sexe' => 'M',
        'cv' => UploadedFile::fake()->createWithContent('cv.pdf', '%PDF-1.4 fake content'),
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect(route('profile.edit'));

    $profile = $user->fresh()->profile;
    expect($profile->cv)->not->toBeNull();
    Storage::disk('supabase')->assertExists($profile->cv);
});

test('public can view cv inline', function () {
    Storage::fake('supabase');
    $user = User::factory()->create();
    $profile = $user->profile()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'telephone' => '+33123456789',
        'birth_date' => '1990-01-01',
        'sexe' => 'M',
        'cv' => 'cvs/mon-cv.pdf',
    ]);
    Storage::disk('supabase')->put('cvs/mon-cv.pdf', '%PDF-1.4 fake content');

    $response = $this->get(route('cv.show'));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toBe('application/pdf');
    expect($response->headers->get('Content-Disposition'))->toContain('inline');
});

test('public can download cv', function () {
    Storage::fake('supabase');
    $user = User::factory()->create();
    $user->profile()->create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'telephone' => '+33123456789',
        'birth_date' => '1990-01-01',
        'sexe' => 'M',
        'cv' => 'cvs/mon-cv.pdf',
    ]);
    Storage::disk('supabase')->put('cvs/mon-cv.pdf', '%PDF-1.4 fake content');

    $response = $this->get(route('cv.download'));

    $response->assertOk();
    expect($response->headers->get('Content-Disposition'))->toContain('attachment');
});

test('cv routes return 404 when no cv uploaded', function () {
    $this->get(route('cv.show'))->assertNotFound();
    $this->get(route('cv.download'))->assertNotFound();
});
