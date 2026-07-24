<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Interaction;
use App\Services\RankingService;

class InteractionController extends Controller
{
    protected $rankingService;

    public function __construct(RankingService $rankingService)
    {
        $this->rankingService = $rankingService;
    }

    /**
     * POST /api/interactions
     * Log user interaction against a post (view, reply, reaction)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'post_id' => 'required|exists:posts,id',
            'type' => 'required|in:view,reply,reaction,unreaction',
        ]);

        $user = $request->user();
        $post = Post::findOrFail($validated['post_id']);

        $weightMap = [
            'view' => 0.1,
            'reaction' => 0.5,
            'unreaction' => -0.5,
            'reply' => 1.0,
        ];

        $weight = $weightMap[$validated['type']];

        // Record interaction
        Interaction::create([
            'user_id' => $user->id,
            'post_id' => $post->id,
            'type' => $validated['type'],
            'weight' => $weight,
        ]);

        // Increment or decrement post counters
        if ($validated['type'] === 'view') {
            $post->increment('view_count');
        } elseif ($validated['type'] === 'reaction') {
            $post->increment('reaction_count');
        } elseif ($validated['type'] === 'unreaction') {
            $post->decrement('reaction_count');
        }

        // Calculate updated relationship score with author
        $updatedDepth = $this->rankingService->calculateRelationshipDepth($user->id, $post->user_id);

        return response()->json([
            'status' => 'success',
            'message' => 'Interaction logged successfully',
            'data' => [
                'post_id' => $post->id,
                'interaction_type' => $validated['type'],
                'updated_relationship_depth' => $updatedDepth,
            ]
        ], 200);
    }
}
