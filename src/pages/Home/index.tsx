import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { UploadZone } from '../../components/UploadZone';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../components/Toast';
import { extractParticipants } from '../../parser/whatsappParser';
import type { WorkerResponse } from '../../parser/parserWorker';

type Stage = 'empty' | 'upload' | 'select-name' | 'parsing';

export function HomePage() {
  const { setChat } = useChat();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>('empty');
  const [progress, setProgress] = useState(0);
  const [participants, setParticipants] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const fileRef = useRef<File | null>(null);

  const handleFile = useCallback(async (file: File) => {
    fileRef.current = file;
    setStage('parsing');
    setProgress(10);

    const text = await file.text();
    setProgress(20);

    // Quick participant scan
    const detected = extractParticipants(text);
    setParticipants(detected);
    setSelectedName(detected[0] ?? '');

    setProgress(30);
    setStage('select-name');
  }, []);

  const handleStartParsing = useCallback(async () => {
    if (!fileRef.current) return;
    setStage('parsing');
    setProgress(30);

    const text = await fileRef.current.text();

    // Use web worker for large files
    const worker = new Worker(
      new URL('../../parser/parserWorker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      if (msg.type === 'progress' && msg.progress !== undefined) {
        setProgress(30 + msg.progress * 0.6);
      }
      if (msg.type === 'done' && msg.result) {
        worker.terminate();
        setProgress(100);
        // Re-apply isMine based on selectedName
        const chat = {
          ...msg.result,
          messages: msg.result.messages.map((m) => ({
            ...m,
            isMine: m.sender === selectedName,
          })),
        };
        setChat(chat, selectedName);
        showToast(`✅ Loaded ${chat.messages.length.toLocaleString()} messages`, 'success');
        navigate('/viewer');
      }
      if (msg.type === 'error') {
        worker.terminate();
        showToast(`Failed to parse: ${msg.error}`, 'error');
        setStage('upload');
      }
    };

    worker.postMessage({ rawText: text, options: { myName: selectedName } });
  }, [selectedName, setChat, showToast, navigate]);

  // Show loading screen while parsing
  if (stage === 'parsing') {
    return <LoadingScreen progress={progress} />;
  }

  // Name selection modal
  if (stage === 'select-name') {
    return <NameSelectionScreen
      participants={participants}
      selectedName={selectedName}
      onSelect={setSelectedName}
      onConfirm={handleStartParsing}
      onBack={() => setStage('upload')}
    />;
  }

  // Upload screen
  if (stage === 'upload') {
    return (
      <div style={styles.uploadPage}>
        <h1 style={styles.uploadTitle}>Upload Your Chat</h1>
        <p style={styles.uploadSub}>Export your WhatsApp chat as a .txt file and upload it below.</p>
        <UploadZone onFile={handleFile} />
      </div>
    );
  }

  // Empty state
  return <EmptyState onUploadClick={() => setStage('upload')} />;
}

// ─── Name Selection Screen ────────────────────────────────────────────────────

interface NameSelectionProps {
  participants: string[];
  selectedName: string;
  onSelect: (name: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

function NameSelectionScreen({ participants, selectedName, onSelect, onConfirm, onBack }: NameSelectionProps) {
  return (
    <div style={styles.namePage}>
      <div style={styles.nameCard} className="animate-slide-up">
        <div style={styles.nameHeader}>
          <span style={{ fontSize: 36 }}>👤</span>
          <h2 style={styles.nameTitle}>Who are you in this chat?</h2>
          <p style={styles.nameSub}>
            Select your name so your messages appear on the right (green bubbles).
          </p>
        </div>

        <div style={styles.nameList}>
          {participants.map((p) => (
            <button
              key={p}
              id={`name-select-${p.replace(/\s+/g, '-')}`}
              onClick={() => onSelect(p)}
              style={{
                ...styles.nameBtn,
                ...(selectedName === p ? styles.nameBtnActive : {}),
              }}
            >
              <span style={styles.nameAvatar}>{p.charAt(0).toUpperCase()}</span>
              <span style={styles.nameBtnLabel}>{p}</span>
              {selectedName === p && <span style={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>

        <div style={styles.nameActions}>
          <button id="name-back-btn" onClick={onBack} style={styles.backBtn}>← Back</button>
          <button
            id="name-confirm-btn"
            onClick={onConfirm}
            disabled={!selectedName}
            style={{
              ...styles.confirmBtn,
              opacity: selectedName ? 1 : 0.5,
              cursor: selectedName ? 'pointer' : 'not-allowed',
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  uploadPage: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '40px 24px',
    background: 'var(--bg-primary)',
  },
  uploadTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    textAlign: 'center',
  },
  uploadSub: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    margin: 0,
    textAlign: 'center',
    maxWidth: '440px',
  },
  namePage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '24px',
  },
  nameCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '20px',
    padding: '36px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  nameHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
  },
  nameTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  nameSub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.5,
  },
  nameList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  nameBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: 'var(--bg-primary)',
    border: '2px solid var(--border-subtle)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'border-color var(--transition-fast), background var(--transition-fast)',
    textAlign: 'left',
    fontFamily: 'inherit',
    width: '100%',
  },
  nameBtnActive: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-light)',
  },
  nameAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '16px',
    flexShrink: 0,
  },
  nameBtnLabel: {
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    flex: 1,
  },
  checkmark: {
    color: 'var(--accent)',
    fontWeight: 700,
    fontSize: '18px',
  },
  nameActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  backBtn: {
    padding: '12px 20px',
    background: 'var(--bg-tertiary)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  confirmBtn: {
    padding: '12px 24px',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flex: 1,
  },
};
