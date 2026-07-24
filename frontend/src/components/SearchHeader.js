import React from 'react';

/**
 * SearchHeader Component
 * Provides natural language semantic search input with real-time feedback
 */
export default function SearchHeader({ searchQuery, setSearchQuery, onSearch, onClearSearch, isSearching }) {
  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <div style={styles.brandBadge}>
          <span style={styles.brandDot}></span>
          <span style={styles.brandName}>Guised Up</span>
        </div>
        <div style={styles.tagline}>Real Connections Feed</div>
      </div>

      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Semantic search (e.g. 'funny travel stories from last week')..."
          style={styles.searchInput}
        />
        {searchQuery ? (
          <button onClick={onClearSearch} style={styles.clearBtn}>
            ✕
          </button>
        ) : null}
        <button 
          onClick={onSearch} 
          disabled={isSearching || !searchQuery.trim()} 
          style={{
            ...styles.searchBtn,
            opacity: (!searchQuery.trim() || isSearching) ? 0.5 : 1
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div style={styles.hintText}>
        <span>✨ Powered by 384-d vector embeddings & cosine similarity</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 24px',
    backgroundColor: '#0F172A',
    borderBottom: '1px solid #1E293B',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(12px)',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
  },
  brandBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#10B981',
    boxShadow: '0 0 10px #10B981',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: '#F8FAFC',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  tagline: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '4px 8px 4px 14px',
    border: '1px solid #334155',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    fontSize: '14px',
    marginRight: '10px',
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#F8FAFC',
    fontSize: '14px',
    padding: '10px 0',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
    marginRight: '4px',
  },
  searchBtn: {
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  hintText: {
    marginTop: '8px',
    fontSize: '11px',
    color: '#64748B',
    textAlign: 'right',
  }
};
