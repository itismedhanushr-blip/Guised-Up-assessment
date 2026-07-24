const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8010;

// Seeded Users
const users = [
  {
    id: 1,
    name: 'Aarav Sharma',
    email: 'aarav@guisedup.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 2,
    name: 'Priya Patel',
    email: 'priya@guisedup.com',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    id: 3,
    name: 'Karan Mehta',
    email: 'karan@guisedup.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  }
];

// Vector Encoder (384-dimensional)
function generateVector(text) {
  const vector = new Array(384).fill(0);
  const clean = text.toLowerCase().trim();
  const words = clean.split(/\s+/);
  
  words.forEach(word => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) hash += word.charCodeAt(i);
    for (let i = 0; i < 384; i++) {
      vector[i] += Math.sin((hash + i * 17) / 100);
    }
  });

  const norm = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0));
  return norm > 0 ? vector.map(v => Number((v / norm).toFixed(6))) : vector;
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return (normA > 0 && normB > 0) ? Number((dot / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(4)) : 0;
}

function computeAuthenticity(text, filterApplied) {
  if (filterApplied) return 0.38;
  let score = 0.96;
  const hashtags = (text.match(/#/g) || []).length;
  if (hashtags > 2) score -= 0.15;
  if (text.toUpperCase() === text && text.length > 10) score -= 0.25;
  return Math.max(0.10, Number(score.toFixed(2)));
}

// Seeded Database State
let posts = [
  {
    id: 101,
    user_id: 1,
    text: 'Failed my first homemade sourdough attempt today... look at this brick! But it smelled incredible.',
    image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800',
    filter_applied: false,
    authenticity_score: 0.96,
    view_count: 142,
    reaction_count: 28,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 102,
    user_id: 1,
    text: 'Funny travel stories from last week: missed my train in Kyoto because I was trying to decipher a vending machine button for 20 mins!',
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    filter_applied: false,
    authenticity_score: 0.94,
    view_count: 88,
    reaction_count: 15,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 103,
    user_id: 3,
    text: 'Spent the evening sitting by the balcony watching rainy traffic with a hot cup of chai. Simple peace.',
    image_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    filter_applied: false,
    authenticity_score: 0.95,
    view_count: 65,
    reaction_count: 12,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 104,
    user_id: 2,
    text: 'CHASING SUNSETS IN BALI! 🌅✨ PERFECT VIBES ONLY #TRAVEL #INFLUENCER #LIFESTYLE',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    filter_applied: true,
    authenticity_score: 0.35,
    view_count: 310,
    reaction_count: 4,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  }
];

// Compute vector embeddings for initial posts
posts = posts.map(p => ({ ...p, embedding: generateVector(p.text) }));

let interactions = [
  { id: 1, user_id: 1, post_id: 101, type: 'reaction', weight: 0.5, created_at: new Date().toISOString() },
  { id: 2, user_id: 1, post_id: 102, type: 'reply', weight: 1.0, created_at: new Date().toISOString() },
];

// Auth Endpoint
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email) || users[0];
  res.json({
    status: 'success',
    token: 'sanctum_token_' + user.id + '_secret',
    user,
  });
});

// Middleware Mock for Sanctum Auth
app.use((req, res, next) => {
  req.user = users[0]; // Default authenticated test user (Aarav Sharma)
  next();
});

// POST /api/posts
app.post('/api/posts', (req, res) => {
  const { text, image_url, filter_applied } = req.body;
  if (!text) return res.status(400).json({ error: 'Text content is required' });

  let cleanImageUrl = image_url ? image_url.trim() : null;
  if (cleanImageUrl && !cleanImageUrl.startsWith('http://') && !cleanImageUrl.startsWith('https://')) {
    cleanImageUrl = 'https://' + cleanImageUrl;
  }

  const authScore = computeAuthenticity(text, filter_applied);
  const embedding = generateVector(text);

  const newPost = {
    id: posts.length + 101,
    user_id: req.user.id,
    text,
    image_url: cleanImageUrl,
    filter_applied: !!filter_applied,
    authenticity_score: authScore,
    view_count: 0,
    reaction_count: 0,
    embedding,
    created_at: new Date().toISOString(),
  };

  posts.unshift(newPost);

  res.status(201).json({
    status: 'success',
    data: {
      id: newPost.id,
      user_id: newPost.user_id,
      text: newPost.text,
      image_url: newPost.image_url,
      authenticity_score: newPost.authenticity_score,
      created_at: newPost.created_at,
    }
  });
});

// GET /api/feed (4-Factor Algorithm: Authenticity + Relationship + Similarity + Time Decay)
app.get('/api/feed', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const userVec = posts.find(p => p.user_id === req.user.id)?.embedding || generateVector("authentic quiet thoughts");

  const scored = posts.map(post => {
    const author = users.find(u => u.id === post.user_id) || users[0];

    // 1. Authenticity
    const authScore = post.authenticity_score;

    // 2. Relationship Depth
    const userInteractions = interactions.filter(i => i.user_id === req.user.id && i.post_id === post.id);
    const rawWeight = userInteractions.reduce((acc, i) => acc + i.weight, 0);
    const relScore = Math.min(1.0, rawWeight / 5.0);

    // 3. Semantic Similarity
    const simScore = cosineSimilarity(userVec, post.embedding);

    // 4. Time Decay
    const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
    const decayScore = Number(Math.exp(-0.05 * hoursOld).toFixed(4));

    // Final Composite Score
    const finalRankScore = Number((
      0.35 * authScore +
      0.30 * relScore +
      0.20 * simScore +
      0.15 * decayScore
    ).toFixed(4));

    const timeAgoMinutes = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 60000);
    const timeAgo = timeAgoMinutes < 60 ? `${timeAgoMinutes} mins ago` : `${Math.floor(timeAgoMinutes / 60)} hours ago`;

    return {
      id: post.id,
      author: {
        id: author.id,
        name: author.name,
        avatar_url: author.avatar_url,
      },
      text: post.text,
      image_url: post.image_url,
      authenticity_score: post.authenticity_score,
      relationship_score: Number(relScore.toFixed(2)),
      semantic_similarity: simScore,
      final_rank_score: finalRankScore,
      view_count: post.view_count,
      reaction_count: post.reaction_count,
      created_at: post.created_at,
      time_ago: timeAgo,
    };
  });

  scored.sort((a, b) => b.final_rank_score - a.final_rank_score);

  const paginated = scored.slice((page - 1) * limit, page * limit);

  res.json({
    status: 'success',
    pagination: {
      current_page: page,
      per_page: limit,
      total: scored.length,
      has_more: (page * limit) < scored.length,
    },
    data: paginated,
  });
});

// GET /api/search?q={query} (Top 10 Vector Similarity Search)
app.get('/api/search', (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Search query parameter "q" is required' });

  const queryVec = generateVector(query);

  const results = posts.map(post => {
    const author = users.find(u => u.id === post.user_id) || users[0];
    const similarity = cosineSimilarity(queryVec, post.embedding);

    const timeAgoMinutes = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 60000);
    const timeAgo = timeAgoMinutes < 60 ? `${timeAgoMinutes} mins ago` : `${Math.floor(timeAgoMinutes / 60)} hours ago`;

    return {
      id: post.id,
      author: {
        id: author.id,
        name: author.name,
        avatar_url: author.avatar_url,
      },
      text: post.text,
      image_url: post.image_url,
      authenticity_score: post.authenticity_score,
      similarity_score: similarity,
      created_at: post.created_at,
      time_ago: timeAgo,
    };
  });

  results.sort((a, b) => b.similarity_score - a.similarity_score);
  const top10 = results.slice(0, 10);

  res.json({
    status: 'success',
    query,
    total_results: top10.length,
    data: top10,
  });
});

// POST /api/interactions
app.post('/api/interactions', (req, res) => {
  const { post_id, type } = req.body;
  const post = posts.find(p => p.id === parseInt(post_id));
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const weights = { view: 0.1, reaction: 0.5, unreaction: -0.5, reply: 1.0 };
  const weight = weights[type] || 0.1;

  interactions.push({
    id: interactions.length + 1,
    user_id: req.user.id,
    post_id: post.id,
    type,
    weight,
    created_at: new Date().toISOString(),
  });

  if (type === 'reaction') post.reaction_count += 1;
  if (type === 'unreaction') post.reaction_count = Math.max(0, post.reaction_count - 1);
  if (type === 'view') post.view_count += 1;

  res.json({
    status: 'success',
    message: 'Interaction logged',
    data: {
      post_id: post.id,
      type,
      updated_reaction_count: post.reaction_count,
    }
  });
});

// Start Server if called directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Guised Up Backend API Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
