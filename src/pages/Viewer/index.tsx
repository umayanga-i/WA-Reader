import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { ChatList } from '../../components/ChatList';
import { Header } from '../../components/Header';
import { useChat } from '../../hooks/useChat';
import { useSearch } from '../../hooks/useSearch';

export function ViewerPage() {
  const { chat } = useChat();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { searchState, openSearch, closeSearch } = useSearch();

  // Redirect if no chat loaded
  if (!chat) {
    navigate('/');
    return null;
  }

  const handleSearchOpen = () => openSearch();
  const handleSearchClose = () => closeSearch();

  return (
    <div style={styles.root}>
      <Header
        onSearchOpen={handleSearchOpen}
        onUploadNew={() => navigate('/')}
      />
      <div style={styles.body}>
        {/* Mobile sidebar toggle */}
        <button
          id="sidebar-toggle-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          style={styles.sidebarToggle}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        <ChatList
          sidebarOpen={sidebarOpen}
          searchBarOpen={searchState.isOpen}
          onSearchOpen={handleSearchOpen}
          onSearchClose={handleSearchClose}
        />
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  sidebarToggle: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 50,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '0 8px 8px 0',
    padding: '10px 6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-md)',
    display: 'none', // Only shown on mobile via media query
  },
};
