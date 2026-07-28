import type { CSSProperties } from 'react';

interface LoadingScreenProps {
  progress?: number;
  message?: string;
}

export function LoadingScreen({ progress = 0, message = 'Parsing your chat...' }: LoadingScreenProps) {
  return (
    <div style={styles.overlay}>
      <div style={styles.card} className="animate-fade-in">
        {/* Animated icon */}
        <div style={styles.iconWrap}>
          <div style={styles.iconRing} />
          <span style={styles.icon}>💬</span>
        </div>

        {/* Title */}
        <h2 style={styles.title}>WA Reader</h2>
        <p style={styles.subtitle}>{message}</p>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.min(100, Math.max(5, progress))}%`,
            }}
          />
        </div>
        <p style={styles.progressText}>{Math.round(progress)}%</p>

        {/* Privacy note */}
        <p style={styles.privacyNote}>
          🔒 Your chat never leaves your browser. Everything is processed locally.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '48px 56px',
    background: 'var(--bg-secondary)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-subtle)',
    maxWidth: '420px',
    width: '90%',
    textAlign: 'center',
  },
  iconWrap: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '3px solid transparent',
    borderTopColor: 'var(--accent)',
    animation: 'spin 0.8s linear infinite',
  },
  icon: {
    fontSize: '36px',
    lineHeight: 1,
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  progressTrack: {
    width: '100%',
    height: '6px',
    background: 'var(--bg-tertiary)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--accent), #00c49a)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  privacyNote: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
    padding: '10px 14px',
    margin: '8px 0 0',
    lineHeight: 1.5,
  },
};
