<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Devis extends Model
{
    use HasFactory;

    protected $fillable = ['project_id', 'content', 'document'];

    protected $appends = ['document_url'];

    protected function documentUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->document ? Storage::disk('supabase')->url($this->document) : null,
        );
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
