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
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = ['profile_picture_url'];

    protected function profilePictureUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->profile_picture ? Storage::disk('supabase')->url($this->profile_picture) : null,
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
