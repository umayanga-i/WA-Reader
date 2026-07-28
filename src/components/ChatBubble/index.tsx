import type { CSSProperties } from 'react';
import { highlightText } from '../../utils/search';
import type { ChatMessage } from '../../types/chat';
import { MediaBubble } from '../MediaBubble';

interface ChatBubbleProps {
  message: ChatMessage;
  showSender: boolean;
  searchQuery?: string;
  isHighlighted?: boolean;
}

export function ChatBubble({ message, showSender, searchQuery = '', isHighlighted = false }: ChatBubbleProps) {
  const isMine = message.isMine;
  const isSystem = message.type === 'system';

  if (isSystem) return <SystemMessage text={message.text} />;

  const isMedia = [
    'image', 'video', 'audio', 'voice_note', 'sticker', 'gif', 'document', 'location', 'contact'
  ].includes(message.type);

  return (
    <div
      style={{
        ...styles.row,
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        paddingLeft: isMine ? '64px' : '16px',
        paddingRight: isMine ? '16px' : '64px',
      }}
    >
      <div
        style={{
          ...styles.bubble,
          ...(isMine ? styles.bubbleMine : styles.bubbleOther),
          ...(isHighlighted ? styles.bubbleHighlighted : {}),
        }}
        data-message-id={message.id}
      >
        {/* Sender name (only in group chats / when needed) */}
        {showSender && !isMine && (
          <span style={styles.senderName}>{message.sender}</span>
        )}

        {/* Content */}
        {isMedia ? (
          <MediaBubble message={message} />
        ) : message.type === 'deleted' ? (
          <span style={styles.deletedText}>🚫 {message.text}</span>
        ) : (
          <MessageText text={message.text} searchQuery={searchQuery} />
        )}

        {/* Timestamp */}
        <span style={{
          ...styles.timestamp,
          color: isMine ? 'rgba(17,27,33,0.55)' : 'var(--text-muted)',
        }}>
          {message.time}
        </span>
      </div>
    </div>
  );
}

// ─── Message Text with highlight ─────────────────────────────────────────────

function MessageText({ text, searchQuery }: { text: string; searchQuery: string }) {
  if (!searchQuery) {
    return <span style={styles.text}>{renderLinksAndText(text)}</span>;
  }
  const parts = highlightText(text, searchQuery);
  return (
    <span style={styles.text}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="search-highlight">{part.text}</mark>
        ) : (
          renderLinksAndText(part.text, i)
        )
      )}
    </span>
  );
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderLinksAndText(text: string, keyPrefix?: number): React.ReactNode {
  const parts = text.split(URL_REGEX);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (URL_REGEX.test(part)) {
      return (
        <a
          key={`${keyPrefix ?? ''}-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// ─── System Message ───────────────────────────────────────────────────────────

function SystemMessage({ text }: { text: string }) {
  return (
    <div style={styles.systemWrap}>
      <span style={styles.systemBubble}>{text}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, CSSProperties> = {
  row: {
    display: 'flex',
    marginBottom: '2px',
    padding: '2px 0',
  },
  bubble: {
    position: 'relative',
    maxWidth: 'var(--bubble-max-width)',
    padding: '8px 10px 22px',
    borderRadius: 'var(--border-radius-bubble)',
    boxShadow: 'var(--shadow-bubble)',
    wordBreak: 'break-word',
    minWidth: '80px',
  },
  bubbleMine: {
    background: 'var(--bg-bubble-mine)',
    borderBottomRightRadius: '2px',
    color: 'var(--text-bubble-mine)',
  },
  bubbleOther: {
    background: 'var(--bg-bubble-other)',
    borderBottomLeftRadius: '2px',
    color: 'var(--text-bubble-other)',
    border: '1px solid var(--border-subtle)',
  },
  bubbleHighlighted: {
    outline: '2px solid rgba(255,214,0,0.7)',
    outlineOffset: '2px',
  },
  senderName: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent)',
    marginBottom: '4px',
    lineHeight: 1.2,
  },
  text: {
    fontSize: '14.5px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  link: {
    color: 'var(--text-link)',
    textDecoration: 'underline',
    wordBreak: 'break-all',
  },
  deletedText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  timestamp: {
    position: 'absolute',
    bottom: '5px',
    right: '8px',
    fontSize: '11px',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  systemWrap: {
    display: 'flex',
    justifyContent: 'center',
    margin: '8px 0',
    width: '100%',
  },
  systemBubble: {
    fontSize: '12px',
    color: 'var(--text-system)',
    background: 'var(--bg-system)',
    borderRadius: '8px',
    padding: '5px 12px',
    maxWidth: '70%',
    textAlign: 'center',
    backdropFilter: 'blur(4px)',
    border: '1px solid var(--border-subtle)',
  },
};
