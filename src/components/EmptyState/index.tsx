import type { CSSProperties } from 'react';

interface EmptyStateProps {
  onUploadClick?: () => void;
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div style={styles.root}>
      {/* Background pattern */}
      <div style={styles.bgPattern} aria-hidden />

      <div style={styles.content} className="animate-slide-up">
        {/* Main illustration */}
        <div style={styles.illustration}>
          <div style={styles.bubbleLeft} className="animate-pulse">
            <span>Hey! 👋</span>
          </div>
          <div style={styles.bubbleRight}>
            <span>Hello there! 😊</span>
          </div>
          <div style={styles.bubbleLeft} style2={undefined}>
            <span>Upload your chat to read it →</span>
          </div>
        </div>

        {/* Logo & tagline */}
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>💬</span>
          <h1 style={styles.logoText}>WA Reader</h1>
        </div>

        <p style={styles.tagline}>
          Read your WhatsApp chats privately, beautifully.
        </p>

        <div style={styles.privacyBadge}>
          🔒 Your chat never leaves your browser. Everything is processed locally.
        </div>

        {/* Feature pills */}
        <div style={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.label} style={styles.featurePill}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureLabel}>{f.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          id="empty-state-upload-btn"
          onClick={onUploadClick}
          style={styles.cta}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,168,132,0.35)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,168,132,0.25)';
          }}
        >
          <span>Upload WhatsApp Chat</span>
          <span style={styles.ctaArrow}>→</span>
        </button>

        <p style={styles.hint}>Supports .txt exports from WhatsApp</p>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: '⚡', label: '100k+ messages' },
  { icon: '🔍', label: 'Smart search' },
  { icon: '📊', label: 'Statistics' },
  { icon: '🌙', label: 'Dark mode' },
  { icon: '📱', label: 'Responsive' },
  { icon: '💾', label: 'Export chat' },
];

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(0,168,132,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0,168,132,0.06) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    padding: '40px 24px',
    maxWidth: '540px',
    width: '100%',
    textAlign: 'center',
    zIndex: 1,
  },
  illustration: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    maxWidth: '340px',
    marginBottom: '8px',
  },
  bubbleLeft: {
    alignSelf: 'flex-start',
    background: 'var(--bg-bubble-other)',
    border: '1px solid var(--border-subtle)',
    padding: '10px 16px',
    borderRadius: '16px 16px 16px 4px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '80%',
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    background: 'var(--bg-bubble-mine)',
    padding: '10px 16px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: '14px',
    color: 'var(--text-bubble-mine)',
    boxShadow: 'var(--shadow-sm)',
    maxWidth: '80%',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    fontSize: '36px',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  tagline: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.5,
  },
  privacyBadge: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
    padding: '10px 16px',
    lineHeight: 1.5,
    border: '1px solid var(--border-subtle)',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '999px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-sm)',
  },
  featureIcon: {
    fontSize: '14px',
  },
  featureLabel: {
    fontWeight: 500,
  },
  cta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, var(--accent) 0%, #00c49a 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,168,132,0.25)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
    marginTop: '8px',
  },
  ctaArrow: {
    fontSize: '18px',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
  },
};
