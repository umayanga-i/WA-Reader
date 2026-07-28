import { useCallback, useRef, useState } from 'react';
import type { CSSProperties, DragEvent } from 'react';

interface UploadZoneProps {
  onFile: (file: File) => void;
  loading?: boolean;
}

export function UploadZone({ onFile, loading = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.txt')) {
        setError('Please upload a .txt file exported from WhatsApp.');
        return;
      }
      setError(null);
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      id="upload-zone"
      role="button"
      tabIndex={0}
      aria-label="Upload WhatsApp chat file"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !loading && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      style={{
        ...styles.zone,
        ...(isDragging ? styles.zoneDragging : {}),
        ...(loading ? styles.zoneLoading : {}),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        style={{ display: 'none' }}
        onChange={onInputChange}
        aria-hidden
      />

      {loading ? (
        <div style={styles.loadingInner}>
          <div style={styles.spinner} className="animate-spin" />
          <p style={styles.loadingText}>Processing your file…</p>
        </div>
      ) : (
        <>
          <div style={styles.iconCircle}>
            <span style={styles.icon}>{isDragging ? '📂' : '📁'}</span>
          </div>

          <div style={styles.textBlock}>
            <p style={styles.headline}>
              {isDragging ? 'Drop it!' : 'Drop your WhatsApp chat here'}
            </p>
            <p style={styles.sub}>or click to browse — .txt files only</p>
          </div>

          <button
            id="upload-browse-btn"
            style={styles.browseBtn}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
            }}
          >
            Browse File
          </button>

          {error && <p style={styles.error}>{error}</p>}

          <p style={styles.privacy}>
            🔒 Your chat never leaves your browser. Everything is processed locally.
          </p>
        </>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  zone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '60px 40px',
    border: '2px dashed var(--border-medium)',
    borderRadius: '20px',
    background: 'var(--bg-secondary)',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
    textAlign: 'center',
    userSelect: 'none',
    outline: 'none',
    width: '100%',
    maxWidth: '520px',
    boxShadow: 'var(--shadow-md)',
  },
  zoneDragging: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-light)',
    transform: 'scale(1.02)',
  },
  zoneLoading: {
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  loadingInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid var(--border-subtle)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
  },
  loadingText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '36px',
  },
  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  headline: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  sub: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  browseBtn: {
    padding: '10px 24px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    fontFamily: 'inherit',
  },
  error: {
    fontSize: '13px',
    color: 'var(--text-danger)',
    margin: 0,
    padding: '8px 16px',
    background: 'rgba(234,0,56,0.08)',
    borderRadius: '8px',
  },
  privacy: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    margin: 0,
    maxWidth: '320px',
  },
};
