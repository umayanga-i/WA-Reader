import type { CSSProperties, ReactNode } from 'react';

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  children?: ReactNode;
}

export function StatsCard({ icon, title, value, sub, accent = false, children }: StatsCardProps) {
  return (
    <div style={{ ...styles.card, ...(accent ? styles.cardAccent : {}) }}>
      <div style={styles.topRow}>
        <span style={styles.icon}>{icon}</span>
        <span style={styles.title}>{title}</span>
      </div>
      <div style={styles.value}>{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
      {children && <div style={styles.children}>{children}</div>}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cardAccent: {
    borderColor: 'var(--accent)',
    boxShadow: '0 0 0 1px var(--accent), var(--shadow-sm)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  icon: {
    fontSize: '20px',
  },
  title: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-muted)',
  },
  value: {
    fontSize: '26px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  sub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  children: {
    marginTop: '10px',
  },
};
