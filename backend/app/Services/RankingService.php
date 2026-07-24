<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use App\Models\Interaction;
use Carbon\Carbon;

class RankingService
{
    /**
     * Compute Personalized Feed Score for a User and Post
     */
    public function computeRankScore(User $user, Post $post, array $userVector = []): float
    {
        // 1. Authenticity Score (Weight: 0.35)
        $authenticity = $this->calculateAuthenticityScore($post);

        // 2. Relationship Depth Score (Weight: 0.30)
        $relationshipDepth = $this->calculateRelationshipDepth($user->id, $post->user_id);

        // 3. Vector Semantic Similarity (Weight: 0.20)
        $semanticSim = $this->calculateSemanticSimilarity($userVector, $post->embedding ?? []);

        // 4. Time Decay Score (Weight: 0.15)
        $timeDecay = $this->calculateTimeDecay($post->created_at);

        // Final Composite Score Calculation
        $finalScore = (0.35 * $authenticity) +
                      (0.30 * $relationshipDepth) +
                      (0.20 * $semanticSim) +
                      (0.15 * $timeDecay);

        return round($finalScore, 4);
    }

    /**
     * Calculate Authenticity Score based on filters and text indicators
     */
    public function calculateAuthenticityScore(Post $post): float
    {
        // Posts with zero filters get higher base score
        $baseScore = $post->filter_applied ? 0.40 : 0.95;

        // Text authenticity heuristic (penalize excessive hashtags/all-caps marketing speak)
        $text = $post->text;
        $hashtagCount = substr_count($text, '#');
        $isAllCaps = (strtoupper($text) === $text && strlen($text) > 10);

        $penalty = ($hashtagCount * 0.05) + ($isAllCaps ? 0.20 : 0.0);

        return max(0.10, min(1.0, $baseScore - $penalty));
    }

    /**
     * Calculate Relationship Depth between target user and author over rolling 30 days
     */
    public function calculateRelationshipDepth(int $userId, int $authorId): float
    {
        if ($userId === $authorId) {
            return 1.0; // Self-posts have high relationship relevance
        }

        $thirtyDaysAgo = Carbon::now()->subDays(30);

        // Sum interaction weights (views = 0.1, reactions = 0.5, replies = 1.0)
        $interactionSum = Interaction::where('user_id', $userId)
            ->whereHas('post', function ($query) use ($authorId) {
                $query->where('user_id', $authorId);
            })
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->sum('weight');

        // Normalize between 0.0 and 1.0 (10 cumulative weight points = max relationship)
        return min(1.0, round($interactionSum / 10.0, 3));
    }

    /**
     * Cosine similarity between user interest profile vector and post embedding vector
     */
    public function calculateSemanticSimilarity(array $vecA, array $vecB): float
    {
        if (empty($vecA) || empty($vecB) || count($vecA) !== count($vecB)) {
            return 0.5; // Fallback neutral similarity
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < count($vecA); $i++) {
            $dotProduct += $vecA[$i] * $vecB[$i];
            $normA += $vecA[$i] * $vecA[$i];
            $normB += $vecB[$i] * $vecB[$i];
        }

        if ($normA == 0 || $normB == 0) {
            return 0.0;
        }

        $similarity = $dotProduct / (sqrt($normA) * sqrt($normB));
        return max(0.0, min(1.0, round($similarity, 4)));
    }

    /**
     * Exponential Time Decay based on hours since post creation
     */
    public function calculateTimeDecay($createdAt): float
    {
        $created = Carbon::parse($createdAt);
        $hoursOld = max(0, Carbon::now()->diffInMinutes($created) / 60.0);
        
        // Decay lambda = 0.05 (Half-life of ~14 hours)
        $decay = exp(-0.05 * $hoursOld);
        return round($decay, 4);
    }
}
