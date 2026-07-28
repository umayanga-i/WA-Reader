import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { CSSProperties } from 'react';
import { ChatBubble } from '../ChatBubble';
import { DateDivider } from '../DateDivider';
import { Sidebar } from '../Sidebar';
import { SearchBar } from '../SearchBar';
import { useChat } from '../../hooks/useChat';
import { useSearch } from '../../hooks/useSearch';
import { formatDateDivider } from '../../utils/date';
import { extractLinks } from '../../utils/search';
import type { ChatMessage } from '../../types/chat';

// ─── Filtered messages ────────────────────────────────────────────────────────

function applyFilters(
  messages: ChatMessage[],
  filters: ReturnType<typeof useChat>['filters']
): ChatMessage[] {
  return messages.filter((msg) => {
    if (filters.onlyMine && !msg.isMine) return false;
    if (filters.onlyOther && msg.isMine) return false;
    if (filters.mediaOnly) {
      const MEDIA_TYPES = ['image','video','audio','voice_note','sticker','gif','document','location','contact'];
      if (!MEDIA_TYPES.includes(msg.type)) return false;
    }
    if (filters.linksOnly && !extractLinks(msg.text).length) return false;
    if (filters.deletedOnly && msg.type !== 'deleted') return false;
    if (filters.systemOnly && msg.type !== 'system') return false;
    return true;
  });
}

// ─── Virtual row types ────────────────────────────────────────────────────────

type RowItem =
  | { kind: 'divider'; date: string; label: string }
  | { kind: 'message'; message: ChatMessage; msgIndex: number };

function buildRows(messages: ChatMessage[]): RowItem[] {
  const rows: RowItem[] = [];
  let lastDate = '';

  messages.forEach((msg, i) => {
    if (msg.date !== lastDate) {
      lastDate = msg.date;
      rows.push({ kind: 'divider', date: msg.date, label: formatDateDivider(msg.date) });
    }
    rows.push({ kind: 'message', message: msg, msgIndex: i });
  });

  return rows;
}

// ─── Main ChatList ─────────────────────────────────────────────────────────────

interface ChatListProps {
  sidebarOpen: boolean;
  searchBarOpen: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
}

export function ChatList({ sidebarOpen, searchBarOpen, onSearchClose }: ChatListProps) {
  const { chat, filters } = useChat();
  const { searchState, setQuery, goNext, goPrev, closeSearch, currentMatchIndex } = useSearch();
  // Use closeSearch from hook (onSearchClose prop is the same)
  const handleClose = () => { closeSearch(); onSearchClose(); };

  const parentRef = useRef<HTMLDivElement>(null);

  // Apply filters
  const messages = useMemo(
    () => (chat ? applyFilters(chat.messages, filters) : []),
    [chat, filters]
  );

  // Build rows (date dividers + messages)
  const rows = useMemo(() => buildRows(messages), [messages]);

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (rows[i].kind === 'divider' ? 40 : 80),
    overscan: 20,
  });

  // Jump to current search result
  useEffect(() => {
    if (currentMatchIndex !== null) {
      // Find the row corresponding to this message index
      const rowIdx = rows.findIndex(
        (r) => r.kind === 'message' && r.msgIndex === currentMatchIndex
      );
      if (rowIdx !== -1) {
        virtualizer.scrollToIndex(rowIdx, { behavior: 'smooth', align: 'center' });
      }
    }
  }, [currentMatchIndex, rows, virtualizer]);

  const handleJumpToIndex = useCallback((msgIndex: number) => {
    const rowIdx = rows.findIndex(
      (r) => r.kind === 'message' && r.msgIndex === msgIndex
    );
    if (rowIdx !== -1) {
      virtualizer.scrollToIndex(rowIdx, { behavior: 'smooth', align: 'start' });
    }
  }, [rows, virtualizer]);

  if (!chat) return null;

  const totalHeight = virtualizer.getTotalSize();

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          messages={messages}
          allMessages={chat.messages}
          onJumpToIndex={handleJumpToIndex}
        />
      )}

      {/* Main chat column */}
      <div style={styles.main}>
        {/* Search bar */}
        {searchBarOpen && (
          <SearchBar
            query={searchState.query}
            resultsCount={searchState.results.length}
            currentIndex={searchState.currentIndex}
            messages={messages}
            onSearch={(q) => setQuery(q, messages)}
            onNext={goNext}
            onPrev={goPrev}
            onClose={handleClose}
          />
        )}

        {/* Message count / filter indicator */}
        {Object.values(filters).some(Boolean) && (
          <div style={styles.filterBanner}>
            Showing {messages.length.toLocaleString()} filtered messages
          </div>
        )}

        {/* Virtual scroll area */}
        <div
          ref={parentRef}
          style={styles.scrollArea}
          id="chat-scroll-area"
        >
          {messages.length === 0 ? (
            <div style={styles.noResults}>
              <span style={{ fontSize: 40 }}>🔍</span>
              <p>No messages match the current filter.</p>
            </div>
          ) : (
            <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const row = rows[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {row.kind === 'divider' ? (
                      <DateDivider label={row.label} />
                    ) : (
                      <ChatBubble
                        message={row.message}
                        showSender={chat.participants.length > 2}
                        searchQuery={searchState.query}
                        isHighlighted={row.msgIndex === currentMatchIndex}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    background: 'var(--bg-chat)',
    backgroundImage: `
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0,0,0,0.012) 10px,
        rgba(0,0,0,0.012) 20px
      )
    `,
  },
  filterBanner: {
    padding: '6px 16px',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
    textAlign: 'center',
    flexShrink: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px 0',
    scrollBehavior: 'smooth',
  },
  noResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '16px',
    color: 'var(--text-muted)',
    fontSize: '16px',
  },
};
