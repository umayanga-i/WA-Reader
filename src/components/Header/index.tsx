import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useChat } from '../../hooks/useChat';
import type { Theme } from '../../types/chat';

interface HeaderProps {
  onSearchOpen?: () => void;
  onUploadNew?: () => void;
}

export function Header({ onSearchOpen, onUploadNew }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { chat, clearChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewer = location.pathname === '/viewer';
  const isStats = location.pathname === '/statistics';

  const THEME_CYCLE: Theme[] = ['light', 'dark', 'amoled'];
  const THEME_ICONS: Record<Theme, string> = { light: '☀️', dark: '🌙', amoled: '⬛' };
  const THEME_LABELS: Record<Theme, string> = { light: 'Light', dark: 'Dark', amoled: 'AMOLED' };

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    setTheme(next);
  };

  const handleLogoClick = () => {
    if (chat) navigate('/viewer');
    else navigate('/');
  };

  const handleUploadNew = () => {
    clearChat();
    navigate('/');
    onUploadNew?.();
  };

  return (
    <header style={styles.header}>
      {/* Logo */}
      <button id="header-logo-btn" onClick={handleLogoClick} style={styles.logo}>
        <span style={styles.logoIcon}>💬</span>
        <span style={styles.logoText}>WA Reader</span>
      </button>

      {/* Center Nav (only when chat is loaded) */}
      {chat && (
        <nav style={styles.nav}>
          <NavBtn
            id="nav-viewer-btn"
            active={isViewer}
            onClick={() => navigate('/viewer')}
            icon="💬"
            label="Chat"
          />
          <NavBtn
            id="nav-stats-btn"
            active={isStats}
            onClick={() => navigate('/statistics')}
            icon="📊"
            label="Statistics"
          />
        </nav>
      )}

      {/* Right Controls */}
      <div style={styles.controls}>
        {chat && isViewer && onSearchOpen && (
          <button
            id="header-search-btn"
            onClick={onSearchOpen}
            style={styles.iconBtn}
            title="Search (Ctrl+F)"
          >
            🔍
          </button>
        )}

        {/* Theme Toggle */}
        <button
          id="header-theme-btn"
          onClick={cycleTheme}
          style={styles.themeBtn}
          title={`Switch theme (current: ${THEME_LABELS[theme]})`}
        >
          <span>{THEME_ICONS[theme]}</span>
          <span style={styles.themeBtnLabel}>{THEME_LABELS[theme]}</span>
        </button>

        {/* Upload New */}
        {chat && (
          <button
            id="header-upload-new-btn"
            onClick={handleUploadNew}
            style={styles.uploadBtn}
            title="Upload new chat"
          >
            📂 New Chat
          </button>
        )}
      </div>
    </header>
  );
}

function NavBtn({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        ...navBtnStyle,
        ...(active ? navBtnActive : {}),
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

const navBtnStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '7px 14px',
  borderRadius: '8px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  transition: 'background var(--transition-fast), color var(--transition-fast)',
  fontFamily: 'inherit',
};

const navBtnActive: CSSProperties = {
  background: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
};

const styles: Record<string, CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 'var(--header-height)',
    padding: '0 20px',
    background: 'var(--bg-header)',
    borderBottom: '1px solid var(--border-subtle)',
    boxShadow: 'var(--shadow-sm)',
    zIndex: 100,
    flexShrink: 0,
    gap: '16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: '22px',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  nav: {
    display: 'flex',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'background var(--transition-fast)',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '8px',
    background: 'var(--bg-tertiary)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    transition: 'background var(--transition-fast)',
    fontFamily: 'inherit',
  },
  themeBtnLabel: {
    fontSize: '13px',
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    background: 'var(--accent)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
    transition: 'background var(--transition-fast)',
    fontFamily: 'inherit',
  },
};
