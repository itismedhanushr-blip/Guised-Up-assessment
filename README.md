![image](https://github.com/itismedhanushr-blip/Guised-Up-assessment/blob/master/collage.png?raw=true)
# Guised Up — Technical Take-Home Project

**Role**: Full-Stack Developer Assessment  
**Repository**: `Guised Up-assessment-candidate`  
**Stack**: React Native / React Web • Laravel PHP • Python ML (SentenceTransformers) • SQL (PostgreSQL/MySQL) • Vector DB (`pgvector` / Cosine Engine)  

---

## 📂 Repository Structure

```
guised-up-assessment/
├── docs/
│   └── TSD.md                # Comprehensive Technical Solution Document
├── sql/
│   └── queries.sql           # Raw SQL queries for queries D1 - D4
├── backend/
│   ├── app/                  # Laravel Eloquent Models, Controllers, & Services
│   │   ├── Http/Controllers/ # PostController, FeedController, InteractionController, AuthController
│   │   ├── Models/           # User, Post, Interaction
│   │   └── Services/         # RankingService, EmbeddingService
│   ├── database/             # Migrations & Seeders
│   ├── python_service/       # Python FastAPI SentenceTransformers Embedding Microservice
│   ├── tests/                # PHPUnit / Feature Tests for Feed Ranking & Vector Similarity
│   ├── server.js             # Runnable Backend API Gateway Server
│   └── package.json
├── frontend/
│   ├── index.html            # Standalone Interactive Mobile Web Feed Runner
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

Open `frontend/index.html` in your web browser

```bash
Start-Process "C:\Users\Admin\guised-up-assessment\frontend\index.html"
```

---


