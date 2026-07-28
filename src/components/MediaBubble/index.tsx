import type { CSSProperties } from 'react';
import type { ChatMessage } from '../../types/chat';

interface MediaBubbleProps {
  message: ChatMessage;
}

export function MediaBubble({ message }: MediaBubbleProps) {
  const { type, text } = message;

  // Determine icon and description based on media type
  let icon = '📎';
  let title = 'Attachment';
  let desc = text || 'Media file';

  switch (type) {
    case 'image':
      icon = '🖼️';
      title = 'Photo';
      break;
    case 'video':
      icon = '🎥';
      title = 'Video';
      break;
    case 'audio':
      icon = '🎵';
      title = 'Audio';
      break;
    case 'voice_note':
      icon = '🎙️';
      title = 'Voice Note';
      break;
    case 'sticker':
      icon = '✨';
      title = 'Sticker';
      break;
    case 'gif':
      icon = '👾';
      title = 'GIF';
      break;
    case 'document':
      icon = '📄';
      title = 'Document';
      // Attempt to extract filename from message text
      desc = text.replace(/\s*\(file attached\)/i, '').trim();
      break;
    case 'location':
      icon = '📍';
      title = 'Location';
      break;
    case 'contact':
      icon = '👤';
      title = 'Contact';
      break;
  }

  const isLocation = type === 'location';

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <div style={styles.textContainer}>
          <span style={styles.title}>{title}</span>
          <span style={styles.desc} title={desc}>
            {desc}
          </span>
        </div>
      </div>
      {isLocation && (
        <a
          href={text.replace(/^location:\s*/i, '')}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.actionBtn}
        >
          View Map
        </a>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    background: 'var(--bg-media-card)',
    border: '1px solid var(--border-subtle)',
    minWidth: '200px',
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    fontSize: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    background: 'var(--bg-tertiary)',
    flexShrink: 0,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  desc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: '2px',
  },
  actionBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '6px 12px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)',
  },
};
