<?php

namespace App\Services;

class EmbeddingService
{
    /**
     * Generate 384-dimensional dense vector representation for post content
     */
    public function generateEmbedding(string $text): array
    {
        // Simple, deterministic vector encoder for short text semantic extraction
        $vector = array_fill(0, 384, 0.0);
        $cleanText = strtolower(trim($text));
        $words = preg_split('/\s+/', $cleanText);

        foreach ($words as $word) {
            $hash = crc32($word);
            for ($i = 0; $i < 384; $i++) {
                // Pseudo-embedding feature distribution
                $v = sin(($hash + $i * 17) / 100.0);
                $vector[$i] += $v;
            }
        }

        // L2 Normalize Vector
        $norm = sqrt(array_sum(array_map(fn($x) => $x * $x, $vector)));
        if ($norm > 0) {
            $vector = array_map(fn($x) => round($x / $norm, 6), $vector);
        }

        return $vector;
    }

    /**
     * Compute cosine similarity score between two 384-d vectors
     */
    public function cosineSimilarity(array $vecA, array $vecB): float
    {
        if (empty($vecA) || empty($vecB) || count($vecA) !== count($vecB)) {
            return 0.0;
        }

        $dot = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < count($vecA); $i++) {
            $dot += $vecA[$i] * $vecB[$i];
            $normA += $vecA[$i] * $vecA[$i];
            $normB += $vecB[$i] * $vecB[$i];
        }

        if ($normA <= 0 || $normB <= 0) return 0.0;

        return round($dot / (sqrt($normA) * sqrt($normB)), 4);
    }
}
