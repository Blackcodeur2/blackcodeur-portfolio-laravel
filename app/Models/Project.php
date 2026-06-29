<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'is_finished'  => 'boolean',
        'is_published' => 'boolean',
    ];

    public function enterprises(): BelongsTo
    {
        return $this->belongsTo(Enterprise::class);
    }

    public function projectGaleries(): HasMany
    {
        return $this->hasMany(ProjectGallery::class);
    }
}
