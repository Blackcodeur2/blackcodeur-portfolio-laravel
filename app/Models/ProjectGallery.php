<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProjectGallery extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'description', 'image_item'];

    protected $appends = ['image_item_url'];

    protected function imageItemUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_item ? Storage::disk('supabase')->url($this->image_item) : null,
        );
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
