<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Profile;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'portfolioProfile' => $request->user()->profile,
        ]);
    }

    /**
     * Update the user's account information (name & email on users table).
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Upsert the public portfolio profile (profiles table).
     */
    public function updatePortfolio(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'email'           => ['required', 'email', 'max:255'],
            'telephone'       => ['required', 'string', 'max:50'],
            'birth_date'      => ['required', 'date'],
            'sexe'            => ['required', 'in:M,F'],
            'bio'             => ['nullable', 'string', 'max:1000'],
            'skills'          => ['nullable', 'string', 'max:1000'],
            'education'       => ['nullable', 'string', 'max:2000'],
            'profile_picture' => ['nullable', 'image', 'max:2048'],
        ]);

        /** @var \App\Models\Profile|null $profile */
        $profile = $request->user()->profile;

        if ($request->hasFile('profile_picture')) {
            // Delete old picture if exists
            if ($profile && $profile->profile_picture) {
                Storage::disk('public')->delete($profile->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')->store('profiles', 'public');
        }

        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil portfolio mis à jour.']);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
