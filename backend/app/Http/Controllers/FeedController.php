<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Services\RankingService;
use App\Services\EmbeddingService;

class FeedController extends Controller
{
    protected $rankingService;
    protected $embeddingService;

    public function __construct(RankingService $rankingService, EmbeddingService $embeddingService)
    {
        $this->rankingService = $rankingService;
        $this->embeddingService = $embeddingService;
    }

    /**
     * GET /api/feed
     * Return personalized feed using multi-factor ranking (Authenticity + Relationship + Similarity + Time Decay)
     */
    public function feed(Request $request)
    {
        $user = $request->user();
        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(1, (int) $request->query('limit', 20)));

        // Retrieve user interest vector (fallback to user's first post embedding or neutral)
        $userVector = $this->getUserInterestVector($user->id);

        $allPosts = Post::with('user')->get();

        // Score each post using the TSD ranking algorithm
        $scoredPosts = $allPosts->map(function ($post) use ($user, $userVector) {
            $rankScore = $this->rankingService->computeRankScore($user, $post, $userVector);
            return [
                'id' => $post->id,
                'author' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar_url' => $post->user->avatar_url ?? 'https://i.pravatar.cc/150?u=' . $post->user->id,
                ],
                'text' => $post->text,
                'image_url' => $post->image_url,
                'authenticity_score' => $post->authenticity_score,
                'relationship_score' => $this->rankingService->calculateRelationshipDepth($user->id, $post->user_id),
                'semantic_similarity' => $this->rankingService->calculateSemanticSimilarity($userVector, $post->embedding ?? []),
                'final_rank_score' => $rankScore,
                'view_count' => $post->view_count,
                'reaction_count' => $post->reaction_count,
                'created_at' => $post->created_at->toIso8601String(),
                'time_ago' => $post->created_at->diffForHumans(),
            ];
        });

        // Sort descending by final rank score
        $sortedPosts = $scoredPosts->sortByDesc('final_rank_score')->values();

        // Paginate results
        $total = $sortedPosts->count();
        $sliced = $sortedPosts->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'status' => 'success',
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'has_more' => ($page * $perPage) < $total,
            ],
            'data' => $sliced,
        ]);
    }

    /**
     * GET /api/search?q={query}
     * Natural language semantic vector search
     */
    public function search(Request $request)
    {
        $queryText = $request->query('q', '');
        if (empty($queryText)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Search query parameter "q" is required.',
            ], 400);
        }

        $queryEmbedding = $this->embeddingService->generateEmbedding($queryText);
        $posts = Post::with('user')->get();

        $searchResults = $posts->map(function ($post) use ($queryEmbedding) {
            $similarity = $this->embeddingService->cosineSimilarity($queryEmbedding, $post->embedding ?? []);
            return [
                'id' => $post->id,
                'author' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar_url' => $post->user->avatar_url ?? 'https://i.pravatar.cc/150?u=' . $post->user->id,
                ],
                'text' => $post->text,
                'image_url' => $post->image_url,
                'authenticity_score' => $post->authenticity_score,
                'similarity_score' => $similarity,
                'created_at' => $post->created_at->toIso8601String(),
                'time_ago' => $post->created_at->diffForHumans(),
            ];
        });

        // Filter and sort by top 10 similarity scores
        $topResults = $searchResults->sortByDesc('similarity_score')->take(10)->values();

        return response()->json([
            'status' => 'success',
            'query' => $queryText,
            'total_results' => $topResults->count(),
            'data' => $topResults,
        ]);
    }

    private function getUserInterestVector(int $userId): array
    {
        $recentPost = Post::where('user_id', $userId)->latest()->first();
        return $recentPost->embedding ?? array_fill(0, 384, 0.01);
    }
}
