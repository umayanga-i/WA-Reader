import type { CSSProperties } from 'react';
import type { ChatMessage } from '../../types/chat';

interface SearchBarProps {
  query: string;
  resultsCount: number;
  currentIndex: number;
  onSearch: (q: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  messages: ChatMessage[];
}

export function SearchBar({
  query,
  resultsCount,
  currentIndex,
  onSearch,
  onNext,
  onPrev,
  onClose,
}: SearchBarProps) {
  return (
    <div style={styles.container} className="animate-fade-in glass">
      <div style={styles.inputWrapper}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          id="search-input"
          type="text"
          placeholder="Search text, sender or date..."
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          style={styles.input}
          autoFocus
        />
        {query && (
          <button
            id="search-clear-btn"
            onClick={() => onSearch('')}
            style={styles.clearBtn}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {query && (
        <div style={styles.navigation}>
          <span style={styles.indicator}>
            {resultsCount > 0 ? `${currentIndex + 1} of ${resultsCount}` : 'No results'}
          </span>
          <button
            id="search-prev-btn"
            onClick={onPrev}
            disabled={resultsCount === 0}
            style={{
              ...styles.navBtn,
              opacity: resultsCount === 0 ? 0.4 : 1,
              cursor: resultsCount === 0 ? 'not-allowed' : 'pointer',
            }}
            title="Previous result (Up arrow)"
          >
            ▲
          </button>
          <button
            id="search-next-btn"
            onClick={onNext}
            disabled={resultsCount === 0}
            style={{
              ...styles.navBtn,
              opacity: resultsCount === 0 ? 0.4 : 1,
              cursor: resultsCount === 0 ? 'not-allowed' : 'pointer',
            }}
            title="Next result (Down arrow)"
          >
            ▼
          </button>
        </div>
      )}

      <button
        id="search-close-btn"
        onClick={onClose}
        style={styles.closeBtn}
        title="Close search (Esc)"
      >
        Close
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    background: 'var(--bg-header)',
    borderBottom: '1px solid var(--border-subtle)',
    height: 'var(--search-bar-height)',
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    fontSize: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '8px 36px 8px 36px',
    background: 'var(--bg-search)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
  },
  clearBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '4px',
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  indicator: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginRight: '8px',
    userSelect: 'none',
  },
  navBtn: {
    background: 'var(--bg-search)',
    border: 'none',
    color: 'var(--text-primary)',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    transition: 'background var(--transition-fast)',
  },
  closeBtn: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '6px',
    transition: 'background var(--transition-fast)',
  },
};
