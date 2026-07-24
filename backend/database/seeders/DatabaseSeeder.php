<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Post;
use App\Models\Interaction;
use App\Services\EmbeddingService;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $embeddingService = new EmbeddingService();

        // Seed User 1: Authentic Poster
        $user1 = User::create([
            'name' => 'Aarav Sharma',
            'email' => 'aarav@guisedup.com',
            'password' => Hash::make('password123'),
            'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        ]);

        // Seed User 2: Curated / Polished Poster
        $user2 = User::create([
            'name' => 'Priya Patel',
            'email' => 'priya@guisedup.com',
            'password' => Hash::make('password123'),
            'avatar_url' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        ]);

        // Seed Posts for User 1 (High Authenticity)
        $post1 = Post::create([
            'user_id' => $user1->id,
            'text' => 'Failed my first homemade sourdough attempt today... look at this brick! But it smelled amazing.',
            'image_url' => 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800',
            'filter_applied' => false,
            'authenticity_score' => 0.96,
            'embedding' => $embeddingService->generateEmbedding('Failed my first homemade sourdough attempt today... look at this brick! But it smelled amazing.'),
            'created_at' => now()->subMinutes(15),
        ]);

        $post2 = Post::create([
            'user_id' => $user1->id,
            'text' => 'Funny travel stories from last week: missed my train in Kyoto because I was figuring out a vending machine button!',
            'image_url' => 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
            'filter_applied' => false,
            'authenticity_score' => 0.92,
            'embedding' => $embeddingService->generateEmbedding('Funny travel stories from last week: missed my train in Kyoto because I was figuring out a vending machine button!'),
            'created_at' => now()->subHours(2),
        ]);

        // Seed Posts for User 2 (Filtered / Marketing)
        $post3 = Post::create([
            'user_id' => $user2->id,
            'text' => 'CHASING SUNSETS IN BALI! 🌅✨ PERFECT VIBES ONLY #TRAVEL #INFLUENCER #LIFESTYLE',
            'image_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            'filter_applied' => true,
            'authenticity_score' => 0.35,
            'embedding' => $embeddingService->generateEmbedding('CHASING SUNSETS IN BALI PERFECT VIBES ONLY TRAVEL INFLUENCER LIFESTYLE'),
            'created_at' => now()->subHours(4),
        ]);

        // Seed Interactions
        Interaction::create([
            'user_id' => $user2->id,
            'post_id' => $post1->id,
            'type' => 'reaction',
            'weight' => 0.5,
        ]);

        Interaction::create([
            'user_id' => $user2->id,
            'post_id' => $post1->id,
            'type' => 'reply',
            'weight' => 1.0,
        ]);
    }
}
