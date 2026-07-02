<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'enterprise_id',
        'name',
        'description',
        'is_finished',
        'is_published',
        'public_link',
        'github_link',
        'logo',
    ];

    protected $casts = [
        'is_finished' => 'boolean',
        'is_published' => 'boolean',
    ];

    protected $appends = ['logo_url'];

    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->logo ? Storage::disk('supabase')->url($this->logo) : null,
        );
    }

    public function enterprises(): BelongsTo
    {
        return $this->belongsTo(Enterprise::class)->withDefault();
    }

    public function projectGaleries(): HasMany
    {
        return $this->hasMany(ProjectGallery::class);
    }
}
