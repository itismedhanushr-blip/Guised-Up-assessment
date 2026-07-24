<?php

namespace Tests\Feature;

use PHPUnit\Framework\TestCase;
use App\Services\RankingService;
use App\Services\EmbeddingService;
use App\Models\Post;

class FeedRankingTest extends TestCase
{
    protected $rankingService;
    protected $embeddingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->rankingService = new RankingService();
        $this->embeddingService = new EmbeddingService();
    }

    /** @test */
    public function it_ranks_unfiltered_authentic_posts_higher_than_heavily_filtered_posts()
    {
        $authenticPost = new Post([
            'text' => 'Unfiltered coffee spill on my laptop. Just keeping it real.',
            'filter_applied' => false,
        ]);

        $filteredPost = new Post([
            'text' => 'PERFECT MORNING VIBES ✨ #BLISSED #INFLUENCER',
            'filter_applied' => true,
        ]);

        $authenticScore = $this->rankingService->calculateAuthenticityScore($authenticPost);
        $filteredScore = $this->rankingService->calculateAuthenticityScore($filteredPost);

        $this->assertGreaterThan(
            $filteredScore,
            $authenticScore,
            'Authentic unfiltered post should have a higher authenticity score than heavily filtered promotional post.'
        );
    }

    /** @test */
    public function it_applies_time_decay_correctly_to_older_posts()
    {
        $newPostDate = now()->subMinutes(10);
        $oldPostDate = now()->subHours(48);

        $recentDecay = $this->rankingService->calculateTimeDecay($newPostDate);
        $olderDecay = $this->rankingService->calculateTimeDecay($oldPostDate);

        $this->assertGreaterThan(
            $olderDecay,
            $recentDecay,
            'Recent content should yield a higher decay score coefficient than 48-hour old content.'
        );
    }

    /** @test */
    public function it_generates_valid_normalized_384d_embedding_vector()
    {
        $text = 'funny travel stories from last week';
        $embedding = $this->embeddingService->generateEmbedding($text);

        $this->assertCount(384, $embedding, 'Vector embedding must be 384 dimensions.');
        
        $similarityToSelf = $this->embeddingService->cosineSimilarity($embedding, $embedding);
        $this->assertEqualsWithDelta(1.0, $similarityToSelf, 0.001, 'Cosine similarity of a vector with itself must be 1.0.');
    }
}
