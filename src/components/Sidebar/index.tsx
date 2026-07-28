import type { CSSProperties } from 'react';
import { useChat } from '../../hooks/useChat';
import { buildSidebarMonths } from '../../utils/date';
import type { ChatMessage } from '../../types/chat';

interface SidebarProps {
  onJumpToIndex: (index: number) => void;
  messages: ChatMessage[];
  allMessages: ChatMessage[];
}

export function Sidebar({ onJumpToIndex, messages, allMessages }: SidebarProps) {
  const { filters, setFilter, myName, chat } = useChat();

  const months = buildSidebarMonths(allMessages);

  // Find other participant name if 1-on-1 chat
  const otherParticipants = chat?.participants.filter((p) => p !== myName) ?? [];
  const otherName = otherParticipants[0] || 'Other Person';

  return (
    <aside style={styles.sidebar} className="glass">
      {/* Participant Select info */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.icon}>👤</span>
          <span style={styles.sectionTitle}>Chat Identity</span>
        </div>
        <div style={styles.identityCard}>
          <div style={styles.identityRow}>
            <span style={styles.dotMine} />
            <span style={styles.identityLabel}>Me: </span>
            <span style={styles.identityValue} title={myName || ''}>
              {myName || 'Not set'}
            </span>
          </div>
          {otherParticipants.length > 0 && (
            <div style={styles.identityRow}>
              <span style={styles.dotOther} />
              <span style={styles.identityLabel}>
                {otherParticipants.length === 1 ? 'Other:' : 'Others:'}{' '}
              </span>
              <span style={styles.identityValue} title={otherParticipants.join(', ')}>
                {otherParticipants.length === 1
                  ? otherParticipants[0]
                  : `${otherParticipants.length} people`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.icon}>⏳</span>
          <span style={styles.sectionTitle}>Filters</span>
        </div>
        <div style={styles.filterList}>
          <label style={styles.filterItem} id="filter-mine-label">
            <input
              id="filter-mine-checkbox"
              type="checkbox"
              checked={filters.onlyMine}
              onChange={(e) => setFilter('onlyMine', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.filterLabel}>Only my messages</span>
          </label>

          <label style={styles.filterItem} id="filter-other-label">
            <input
              id="filter-other-checkbox"
              type="checkbox"
              checked={filters.onlyOther}
              onChange={(e) => setFilter('onlyOther', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.filterLabel}>Only {otherName}</span>
          </label>

          <label style={styles.filterItem} id="filter-media-label">
            <input
              id="filter-media-checkbox"
              type="checkbox"
              checked={filters.mediaOnly}
              onChange={(e) => setFilter('mediaOnly', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.filterLabel}>Media only</span>
          </label>

          <label style={styles.filterItem} id="filter-links-label">
            <input
              id="filter-links-checkbox"
              type="checkbox"
              checked={filters.linksOnly}
              onChange={(e) => setFilter('linksOnly', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.filterLabel}>Links only</span>
          </label>

          <label style={styles.filterItem} id="filter-deleted-label">
            <input
              id="filter-deleted-checkbox"
              type="checkbox"
              checked={filters.deletedOnly}
              onChange={(e) => setFilter('deletedOnly', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.filterLabel}>Deleted only</span>
          </label>

          <label style={styles.filterItem} id="filter-system-label">
            <input
              id="filter-system-checkbox"
              type="checkbox"
              checked={filters.systemOnly}
              onChange={(e) => setFilter('systemOnly', e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.filterLabel}>System messages</span>
          </label>
        </div>
      </div>

      {/* Jump by Month section */}
      <div style={{ ...styles.section, flex: 1, overflowY: 'auto' }}>
        <div style={styles.sectionHeader}>
          <span style={styles.icon}>📅</span>
          <span style={styles.sectionTitle}>Timeline Jump</span>
        </div>
        {months.length === 0 ? (
          <p style={styles.emptyText}>No monthly logs found</p>
        ) : (
          <div style={styles.monthGrid}>
            {months.map((m) => {
              // Find matching index in filtered messages if possible, or fallback to original index
              const originalMsg = allMessages[m.firstMessageIndex];
              const targetIndex = messages.findIndex((msg) => msg.id === originalMsg.id);

              return (
                <button
                  key={m.key}
                  onClick={() => targetIndex !== -1 && onJumpToIndex(targetIndex)}
                  disabled={targetIndex === -1}
                  style={{
                    ...styles.monthBtn,
                    opacity: targetIndex === -1 ? 0.35 : 1,
                    cursor: targetIndex === -1 ? 'not-allowed' : 'pointer',
                  }}
                  title={targetIndex === -1 ? 'No matching messages in this month' : `Jump to ${m.label}`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

const styles: Record<string, CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100%',
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    zIndex: 20,
  },
  section: {
    padding: '20px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  icon: {
    fontSize: '16px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
  },
  identityCard: {
    background: 'var(--bg-primary)',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  identityRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    minWidth: 0,
  },
  dotMine: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#25D366',
    marginRight: '8px',
    flexShrink: 0,
  },
  dotOther: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--text-muted)',
    marginRight: '8px',
    flexShrink: 0,
  },
  identityLabel: {
    color: 'var(--text-secondary)',
    fontWeight: 500,
    marginRight: '4px',
    flexShrink: 0,
  },
  identityValue: {
    color: 'var(--text-primary)',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  filterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  filterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    accentColor: 'var(--accent)',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  filterLabel: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  emptyText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  monthBtn: {
    padding: '8px 12px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    textAlign: 'center',
    transition: 'background var(--transition-fast), border-color var(--transition-fast)',
    fontFamily: 'inherit',
  },
};
