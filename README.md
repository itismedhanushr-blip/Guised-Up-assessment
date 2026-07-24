# Guised Up — Technical Take-Home Project

**Role**: Full-Stack Developer Assessment  
**Repository**: `Guised Up-assessment-candidate`  
**Stack**: React Native / React Web • Laravel PHP • Python ML (SentenceTransformers) • SQL (PostgreSQL/MySQL) • Vector DB (`pgvector` / Cosine Engine)  

---

## 🌟 Overview & Architecture

Guised Up is a social platform built to foster authentic connections online—replacing traditional engagement-driven algorithms (likes, rage bait, follower counts) with an **Authentic Relevance Scoring Engine**:

$$\text{Rank Score} = 0.35 \cdot \text{Authenticity} + 0.30 \cdot \text{RelationshipDepth} + 0.20 \cdot \text{SemanticSim} + 0.15 \cdot \text{TimeDecay}$$

---

## 📂 Repository Structure

```
guised-up-assessment/
├── docs/
│   └── TSD.md                # Part A: Comprehensive Technical Solution Document
├── sql/
│   └── queries.sql           # Part D: Raw SQL queries for queries D1 - D4
├── backend/
│   ├── app/                  # Part B: Laravel Eloquent Models, Controllers, & Services
│   │   ├── Http/Controllers/ # PostController, FeedController, InteractionController, AuthController
│   │   ├── Models/           # User, Post, Interaction
│   │   └── Services/         # RankingService, EmbeddingService
│   ├── database/             # Migrations & Seeders
│   ├── python_service/       # Python FastAPI SentenceTransformers Embedding Microservice
│   ├── tests/                # PHPUnit / Feature Tests for Feed Ranking & Vector Similarity
│   ├── server.js             # Runnable Backend API Gateway Server
│   └── package.json
├── frontend/
│   ├── index.html            # Part C: Standalone Interactive Mobile Web Feed Runner
│   ├── App.js                # React Native / Web App Root
│   └── src/
│       ├── components/       # PostCard, SearchHeader
│       ├── screens/          # FeedScreen (Infinite scroll, Semantic search, Post modal)
│       └── services/         # API HTTP Client
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Run the Backend API Server

Navigate to the `backend/` directory and start the server:

```bash
cd backend
npm install
npm start
```

The API server will launch at `http://localhost:8010`.

- `POST /api/login` -> Authenticate test user and receive Sanctum bearer token.
- `GET /api/feed` -> Fetch personalized feed sorted by multi-factor score.
- `GET /api/search?q={query}` -> Perform 384-dimensional natural language vector search.
- `POST /api/posts` -> Publish post, compute authenticity score, and generate vector embedding.
- `POST /api/interactions` -> Log `view`, `reply`, or `reaction` interaction.

---

### 2. Run Backend Unit / Feature Tests

To verify ranking logic, vector generation, and authenticity calculations:

```bash
cd backend
npm test
```

Or for Laravel PHPUnit:
```bash
php artisan test
```

---

### 3. Launch the React Native Feed Screen (Frontend)

To launch and test the Feed Screen interactively in your browser:

Open `frontend/index.html` in your web browser (or serve via any local HTTP server like Live Server / `npx serve frontend`).

#### Features to test on the Feed Screen:
1. **Personalized Feed**: Renders posts ordered by the multi-factor ranking score with breakdown badges (`High Authenticity 96%`, `Relationship Depth`, `Rank Score`).
2. **Natural Language Semantic Search**: Type queries such as *"funny travel stories from last week"* or *"sourdough attempt"* in the top search bar to see instant 384-d vector matches.
3. **Interactive Reaction Button**: Click `React` on any post to log a real-time `reaction` interaction, which feeds the relationship depth matrix.
4. **Publish Post**: Click `Share an Authentic Post` to open the post modal, type unfiltered thoughts, toggle raw vs filtered status, and watch the system generate embeddings in real time!

---

## 📑 Deliverable Checklist

| Part | Description | File Location | Status |
| :--- | :--- | :--- | :--- |
| **Part A** | **Technical Solution Document (TSD)** | [`docs/TSD.md`](./docs/TSD.md) | ✅ Complete |
| **Part B** | **Backend API & Vector Engine** | [`backend/`](./backend/) | ✅ Complete |
| **Part C** | **React Native Feed Screen** | [`frontend/`](./frontend/) | ✅ Complete |
| **Part D** | **SQL Challenge Queries** | [`sql/queries.sql`](./sql/queries.sql) | ✅ Complete |

---

## 🎥 Video Demonstration Guide (Script Outline)

When recording the walkthrough video:
1. **Technical Solution Document (1 min)**:
   - Walk through the ASCII architecture diagram in `docs/TSD.md`.
   - Explain why `pgvector` was selected for ACID compliance and hybrid SQL+vector filtering.
   - Explain the 4-factor scoring formula: Authenticity ($35\%$) + Relationship ($30\%$) + Vector Similarity ($20\%$) + Time Decay ($15\%$).
2. **Backend & Vector Search (1.5 mins)**:
   - Demonstrate `GET /api/feed` returning ranked JSON responses with authentic posts placed higher than filtered promotional posts.
   - Show `GET /api/search?q=funny travel stories` matching Kyoto travel stories via 384-d vector embeddings without relying on keyword matches.
3. **React Native Feed Screen UI (1.5 mins)**:
   - Demonstrate smooth rendering, authenticity badges, reaction counter increments via `POST /api/interactions`, inline search, and creating a new post.
4. **SQL Queries (1 min)**:
   - Walk through `sql/queries.sql` queries D1 (Top 10 active 7d), D2 (Interacted authors 30d), D3 (Unreacted high-view posts), and D4 (Spam detection >20 posts/24h).
