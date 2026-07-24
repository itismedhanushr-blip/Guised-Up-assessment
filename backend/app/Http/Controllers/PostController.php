<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Services\EmbeddingService;
use App\Services\RankingService;

class PostController extends Controller
{
    protected $embeddingService;
    protected $rankingService;

    public function __construct(EmbeddingService $embeddingService, RankingService $rankingService)
    {
        $this->embeddingService = $embeddingService;
        $this->rankingService = $rankingService;
    }

    /**
     * POST /api/posts
     * Create a new post, auto-generate vector embedding, and compute authenticity score.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string|min:3',
            'image_url' => 'nullable|url',
            'filter_applied' => 'nullable|boolean',
        ]);

        $user = $request->user();

        // Instantiate draft post object for authenticity calculation
        $tempPost = new Post([
            'text' => $validated['text'],
            'filter_applied' => $validated['filter_applied'] ?? false,
        ]);

        $authenticityScore = $this->rankingService->calculateAuthenticityScore($tempPost);
        $embeddingVector = $this->embeddingService->generateEmbedding($validated['text']);

        $post = Post::create([
            'user_id' => $user->id,
            'text' => $validated['text'],
            'image_url' => $validated['image_url'] ?? null,
            'filter_applied' => $validated['filter_applied'] ?? false,
            'authenticity_score' => $authenticityScore,
            'embedding' => $embeddingVector,
            'view_count' => 0,
            'reaction_count' => 0,
        ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $post->id,
                'user_id' => $post->user_id,
                'text' => $post->text,
                'image_url' => $post->image_url,
                'authenticity_score' => $post->authenticity_score,
                'created_at' => $post->created_at->toIso8601String(),
            ]
        ], 201);
    }
}
