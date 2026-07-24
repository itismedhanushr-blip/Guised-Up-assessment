-- =============================================================================
-- Guised Up - 
-- File: /sql/queries.sql
-- Description: Optimized raw SQL queries for feed analytics and moderation
-- =============================================================================

-- -----------------------------------------------------------------------------
-- D1: Top 10 Most Active Users in the Last 7 Days
-- Requirement: Return the top 10 most active users in the last 7 days,
--              ranked by total interactions (views + replies + reactions).
-- -----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(i.id) AS total_interactions,
    SUM(CASE WHEN i.type = 'view' THEN 1 ELSE 0 END) AS total_views,
    SUM(CASE WHEN i.type = 'reply' THEN 1 ELSE 0 END) AS total_replies,
    SUM(CASE WHEN i.type = 'reaction' THEN 1 ELSE 0 END) AS total_reactions
FROM 
    users u
JOIN 
    interactions i ON u.id = i.user_id
WHERE 
    i.created_at >= NOW() - INTERVAL '7 days'
GROUP BY 
    u.id, u.name, u.email
ORDER BY 
    total_interactions DESC, u.id ASC
LIMIT 10;


-- -----------------------------------------------------------------------------
-- Posts from Most Interacted Users for a Given Target User
-- Requirement: For a given user_id (e.g. :target_user_id),.
-- -----------------------------------------------------------------------------
WITH TopInteractedAuthors AS (
    SELECT 
        p.user_id AS author_id,
        COUNT(i.id) AS interaction_count
    FROM 
        interactions i
    JOIN 
        posts p ON i.post_id = p.id
    WHERE 
        i.user_id = :target_user_id  -- Parameterized user_id input
        AND i.user_id != p.user_id   -- Exclude self-interactions
    GROUP BY 
        p.user_id
    ORDER BY 
        interaction_count DESC
)
SELECT 
    p.id AS post_id,
    p.user_id AS author_id,
    u.name AS author_name,
    p.text AS post_text,
    p.image_url,
    p.authenticity_score,
    p.created_at,
    tia.interaction_count AS author_interaction_rank
FROM 
    posts p
JOIN 
    TopInteractedAuthors tia ON p.user_id = tia.author_id
JOIN 
    users u ON p.user_id = u.id
WHERE 
    p.created_at >= NOW() - INTERVAL '30 days'
ORDER BY 
    tia.interaction_count DESC, 
    p.created_at DESC;


-- -----------------------------------------------------------------------------
-- D3: Posts Viewed > 100 Times with Zero Reactions
--  Find any posts that have been viewed more than 100 times but have zero reactions. Return post_id, author_id, view_count, created_at.
-- -----------------------------------------------------------------------------
SELECT 
    p.id AS post_id,
    p.user_id AS author_id,
    p.view_count,
    p.created_at
FROM 
    posts p
LEFT JOIN 
    interactions i ON p.id = i.post_id AND i.type = 'reaction'
WHERE 
    p.view_count > 100
GROUP BY 
    p.id, p.user_id, p.view_count, p.created_at
HAVING 
    COUNT(i.id) = 0
ORDER BY 
    p.view_count DESC, p.created_at DESC;


-- -----------------------------------------------------------------------------
-- D4: Spam Detection Query (> 20 Posts in the Last 24 Hours)
-- Requirement: Write a query that would help detect potential spam — users who have created more than 20 posts in the last 24 hours.
-- -----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.email,
    u.name,
    COUNT(p.id) AS post_count
FROM 
    users u
JOIN 
    posts p ON u.id = p.user_id
WHERE 
    p.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY 
    u.id, u.email, u.name
HAVING 
    COUNT(p.id) > 20
ORDER BY 
    post_count DESC;
