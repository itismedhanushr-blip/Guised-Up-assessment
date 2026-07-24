import React, { useState, useEffect, useCallback, useRef } from 'react';
import SearchHeader from '../components/SearchHeader';
import PostCard from '../components/PostCard';
import { fetchFeed, searchPosts, createPost, logInteraction } from '../services/api';

/**
 * FeedScreen Component
 * Main React Native / Web Feed Screen handling personalized feed, infinite scroll,
 * inline natural language search, post creation, and loading/empty/error states.
 */
export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Post creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef(null);

  // Load Feed Data
  const loadFeedData = useCallback(async (pageNumber = 1, append = false) => {
    try {
      if (pageNumber === 1 && !append) setLoading(true);
      else setLoadingMore(true);

      setError(null);

      const response = await fetchFeed(pageNumber, 20);
      if (response && response.data) {
        setPosts(prev => append ? [...prev, ...response.data] : response.data);
        setHasMore(response.pagination?.has_more ?? false);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError('Unable to connect to Guised Up API server. Please check your backend status.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeedData(1);
  }, [loadFeedData]);

  // Infinite Scroll Handler
  const handleScroll = (e) => {
    if (searchResults || loadingMore || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadFeedData(nextPage, true);
    }
  };

  // Semantic Natural Language Search Handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      setError(null);
      const res = await searchPosts(searchQuery.trim());
      if (res && res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      setError('Vector search failed. Ensure API server is online.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Log Post Reaction / Unreaction
  const handleReaction = async (postId, type = 'reaction') => {
    try {
      await logInteraction(postId, type);
    } catch (err) {
      console.error('Interaction logging error:', err);
    }
  };

  // Submit New Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    try {
      setIsSubmitting(true);
      let img = newPostImage.trim();
      if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
        img = 'https://' + img;
      }

      const res = await createPost({
        text: newPostText.trim(),
        image_url: img || null,
        filter_applied: filterApplied,
      });

      if (res && res.data) {
        setNewPostText('');
        setNewPostImage('');
        setFilterApplied(false);
        setShowCreateModal(false);

        // Exit search view if active so user sees newly created post
        setSearchQuery('');
        setSearchResults(null);

        // Refresh Feed to incorporate new post
        loadFeedData(1);
      }
    } catch (err) {
      alert('Failed to publish post. Check backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePostList = searchResults !== null ? searchResults : posts;

  return (
    <div style={styles.outerWrapper}>
      <div style={styles.mobileContainer} ref={containerRef} onScroll={handleScroll}>
        
        {/* Sticky Search Header */}
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          isSearching={isSearching}
        />

        {/* Search Mode Banner */}
        {searchResults !== null && (
          <div style={styles.searchBanner}>
            <span>🔍 Natural Language Search Results for <strong>"{searchQuery}"</strong></span>
            <button onClick={handleClearSearch} style={styles.bannerClose}>Return to Main Feed</button>
          </div>
        )}

        {/* Create Post Action Floating Bar */}
        <div style={styles.createBar}>
          <button onClick={() => setShowCreateModal(true)} style={styles.createBtn}>
            ✏️ Share an Authentic Post...
          </button>
        </div>

        {/* Feed List Container */}
        <div style={styles.feedContent}>
          {/* Loading Skeleton State */}
          {loading && (
            <div style={styles.stateBox}>
              <div style={styles.spinner}></div>
              <p style={styles.stateText}>Ranking posts using authenticity, relationship, & vector embeddings...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={styles.errorBox}>
              <div style={styles.errorIcon}>⚠️</div>
              <h3 style={styles.errorTitle}>Connection Notice</h3>
              <p style={styles.errorText}>{error}</p>
              <button onClick={() => loadFeedData(1)} style={styles.retryBtn}>
                🔄 Retry Connection
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && activePostList.length === 0 && (
            <div style={styles.emptyBox}>
              <div style={styles.emptyIcon}>🍃</div>
              <h3 style={styles.emptyTitle}>No Posts Found</h3>
              <p style={styles.emptyText}>
                {searchResults !== null
                  ? `No semantically matching posts for "${searchQuery}". Try different keywords.`
                  : 'Your authentic feed is quiet right now. Be the first to share!'}
              </p>
            </div>
          )}

          {/* Post Card List */}
          {!loading && activePostList.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReact={handleReaction}
            />
          ))}

          {/* Infinite Scroll Footer */}
          {loadingMore && (
            <div style={styles.loadingMoreBox}>
              <div style={styles.miniSpinner}></div>
              <span>Loading more authentic stories...</span>
            </div>
          )}

          {!hasMore && !loading && searchResults === null && posts.length > 0 && (
            <div style={styles.endOfFeed}>
              🌱 You're all caught up with your authentic network!
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Authentic Post</h3>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What's really on your mind? (No filters, real thoughts rank higher)..."
                rows={4}
                style={styles.modalTextarea}
                required
              />

              <input
                type="url"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="Optional image URL (e.g. raw photo link)"
                style={styles.modalInput}
              />

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filterApplied}
                  onChange={(e) => setFilterApplied(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{ color: filterApplied ? '#FDBA74' : '#94A3B8' }}>
                  {filterApplied ? '⚠️ High filter / edited image applied' : '🌿 Unfiltered raw photo / text'}
                </span>
              </label>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPostText.trim()}
                  style={{
                    ...styles.submitBtn,
                    opacity: (!newPostText.trim() || isSubmitting) ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? 'Auto-Embedding Vector...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  outerWrapper: {
    minHeight: '100vh',
    backgroundColor: '#020617',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  mobileContainer: {
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#090D16',
    minHeight: '100vh',
    maxHeight: '100vh',
    overflowY: 'auto',
    borderLeft: '1px solid #1E293B',
    borderRight: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 50px rgba(0,0,0,0.8)',
  },
  searchBanner: {
    backgroundColor: '#1E1B4B',
    color: '#A5B4FC',
    padding: '10px 16px',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #312E81',
  },
  bannerClose: {
    background: 'none',
    border: '1px solid #4338CA',
    color: '#C7D2FE',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  createBar: {
    padding: '12px 16px',
    backgroundColor: '#0F172A',
    borderBottom: '1px solid #1E293B',
  },
  createBtn: {
    width: '100%',
    backgroundColor: '#1E293B',
    color: '#94A3B8',
    border: '1px dashed #334155',
    borderRadius: '12px',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  feedContent: {
    padding: '16px',
    flex: 1,
  },
  stateBox: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#94A3B8',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #1E293B',
    borderTop: '3px solid #6366F1',
    borderRadius: '50%',
    margin: '0 auto 16px auto',
    animation: 'spin 1s linear infinite',
  },
  miniSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #1E293B',
    borderTop: '2px solid #6366F1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  stateText: {
    fontSize: '13px',
  },
  errorBox: {
    backgroundColor: '#451A03',
    border: '1px solid #78350F',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    color: '#FDBA74',
    margin: '20px 0',
  },
  errorIcon: { fontSize: '28px', marginBottom: '8px' },
  errorTitle: { fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0', color: '#FFF' },
  errorText: { fontSize: '13px', margin: '0 0 16px 0' },
  retryBtn: {
    backgroundColor: '#78350F',
    color: '#FFF',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  emptyBox: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#64748B',
  },
  emptyIcon: { fontSize: '36px', marginBottom: '12px' },
  emptyTitle: { fontSize: '18px', fontWeight: '700', color: '#E2E8F0', margin: '0 0 8px 0' },
  emptyText: { fontSize: '14px', maxWidth: '300px', margin: '0 auto' },
  loadingMoreBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    color: '#94A3B8',
    fontSize: '13px',
  },
  endOfFeed: {
    textAlign: 'center',
    padding: '24px',
    color: '#64748B',
    fontSize: '13px',
    borderTop: '1px dashed #1E293B',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '480px',
    padding: '24px',
    border: '1px solid #1E293B',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#F8FAFC',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '18px',
    cursor: 'pointer',
  },
  modalTextarea: {
    width: '100%',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '12px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
    resize: 'vertical',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#F8FAFC',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '14px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#6366F1',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: '#94A3B8',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  }
};
