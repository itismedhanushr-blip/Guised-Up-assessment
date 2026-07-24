<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'text',
        'image_url',
        'filter_applied',
        'authenticity_score',
        'view_count',
        'reaction_count',
        'embedding',
    ];

    protected $casts = [
        'filter_applied' => 'boolean',
        'authenticity_score' => 'float',
        'view_count' => 'integer',
        'reaction_count' => 'integer',
        'embedding' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function interactions()
    {
        return $this->hasMany(Interaction::class);
    }
}
