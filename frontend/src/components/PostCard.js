import React, { useState } from 'react';

/**
 * PostCard Component
 * Displays post text, author info, image, authenticity score badge, and reaction button
 */
export default function PostCard({ post, onReact, onReply }) {
  const [reacted, setReacted] = useState(false);
  const [reactionCount, setReactionCount] = useState(post.reaction_count || 0);

  const handleReaction = () => {
    if (!reacted) {
      setReacted(true);
      setReactionCount(prev => prev + 1);
      onReact(post.id, 'reaction');
    } else {
      setReacted(false);
      setReactionCount(prev => Math.max(0, prev - 1));
      onReact(post.id, 'unreaction');
    }
  };

  const getAuthenticityBadge = (score) => {
    const s = score || 0.90;
    if (s >= 0.85) {
      return { text: `🌿 High Authenticity ${(s * 100).toFixed(0)}%`, bg: '#064E3B', color: '#34D399' };
    } else if (s >= 0.60) {
      return { text: `✨ Balanced ${(s * 100).toFixed(0)}%`, bg: '#365314', color: '#A3E635' };
    } else {
      return { text: `⚠️ Heavily Filtered ${(s * 100).toFixed(0)}%`, bg: '#451A03', color: '#FDBA74' };
    }
  };

  const badge = getAuthenticityBadge(post.authenticity_score);

  return (
    <div style={styles.card}>
      {/* Author Header */}
      <div style={styles.header}>
        <div style={styles.authorInfo}>
          <img
            src={post.author?.avatar_url || `https://i.pravatar.cc/150?u=${post.author?.id || post.id}`}
            alt={post.author?.name}
            style={styles.avatar}
          />
          <div>
            <div style={styles.authorName}>{post.author?.name || 'Anonymous User'}</div>
            <div style={styles.timeAgo}>{post.time_ago || 'Recently'}</div>
          </div>
        </div>

        <div style={{ ...styles.badge, backgroundColor: badge.bg, color: badge.color }}>
          {badge.text}
        </div>
      </div>

      {/* Post Content */}
      <div style={styles.bodyText}>
        {post.text}
      </div>

      {/* Optional Post Image */}
      {post.image_url ? (
        <div style={styles.imageContainer}>
          <img
            src={post.image_url}
            alt="Post content"
            style={styles.postImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800';
            }}
          />
        </div>
      ) : null}

      {/* Algorithm Score Rationale Pill */}
      {post.final_rank_score ? (
        <div style={styles.scoreRow}>
          <span>📊 Rank Score: <strong>{post.final_rank_score}</strong></span>
          {post.similarity_score !== undefined ? (
            <span> 🎯 Vector Sim: <strong>{(post.similarity_score * 100).toFixed(1)}%</strong></span>
          ) : (
            <span> 🤝 Relationship: <strong>{((post.relationship_score || 0) * 100).toFixed(0)}%</strong></span>
          )}
        </div>
      ) : null}

      {/* Card Actions Footer */}
      <div style={styles.footer}>
        <button
          onClick={handleReaction}
          style={{
            ...styles.actionBtn,
            backgroundColor: reacted ? '#312E81' : '#1E293B',
            color: reacted ? '#818CF8' : '#94A3B8',
            borderColor: reacted ? '#6366F1' : '#334155',
          }}
        >
          <span style={styles.btnIcon}>{reacted ? '❤️' : '🤍'}</span>
          <span>{reacted ? 'Reacted' : 'React'} ({reactionCount})</span>
        </button>

        <button
          onClick={() => onReply && onReply(post.id)}
          style={styles.secondaryBtn}
        >
          💬 Reply
        </button>

        <div style={styles.viewsCount}>
          👁️ {post.view_count || 0} views
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#0F172A',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    border: '1px solid #1E293B',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  authorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #334155',
  },
  authorName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: '2px',
  },
  timeAgo: {
    fontSize: '12px',
    color: '#64748B',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.2px',
  },
  bodyText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#E2E8F0',
    marginBottom: '14px',
    whiteSpace: 'pre-wrap',
  },
  imageContainer: {
    marginBottom: '14px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #1E293B',
    maxHeight: '340px',
  },
  postImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  scoreRow: {
    backgroundColor: '#1E293B',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#94A3B8',
    marginBottom: '14px',
    display: 'flex',
    gap: '12px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #1E293B',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    backgroundColor: '#1E293B',
    color: '#94A3B8',
    border: '1px solid #334155',
    padding: '8px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnIcon: {
    fontSize: '14px',
  },
  viewsCount: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#64748B',
  }
};
