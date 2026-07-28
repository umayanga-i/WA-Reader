import type { CSSProperties } from 'react';

interface DateDividerProps {
  label: string;
}

export function DateDivider({ label }: DateDividerProps) {
  return (
    <div style={styles.container}>
      <span style={styles.badge}>{label}</span>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    margin: '12px 0',
    position: 'sticky',
    top: '8px',
    zIndex: 10,
    pointerEvents: 'none',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-system)',
    background: 'var(--bg-date-divider)',
    borderRadius: '6px',
    padding: '4px 10px',
    boxShadow: 'var(--shadow-sm)',
    pointerEvents: 'auto',
    backdropFilter: 'blur(4px)',
    border: '1px solid var(--border-subtle)',
  },
};
