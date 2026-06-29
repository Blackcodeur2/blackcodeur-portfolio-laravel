<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enterprise extends Model
{
    use HasFactory;
    protected $fillable = ['category_id', 'name', 'description', 'email_address', 'google_maps_link', 'telephone', 'address', 'website', 'has_website', 'rating', 'reviews_count', 'outreach_status'];

    public function categorie(): BelongsTo {
        return $this->belongsTo(Category::class);
    }

    public function projects(): HasMany {
        return $this->hasMany(Project::class);
    }
}
