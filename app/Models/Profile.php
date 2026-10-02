<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'telephone',
        'birth_date',
        'sexe',
        'bio',
        'skills',
        'education',
        'profile_picture',
        'cv',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = ['profile_picture_url', 'cv_url'];

    protected function profilePictureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->profile_picture ? Storage::disk('supabase')->url($this->profile_picture) : null,
        );
    }

    protected function cvUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->cv ? Storage::disk('supabase')->url($this->cv) : null,
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
