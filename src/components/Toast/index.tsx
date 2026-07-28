import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType>({
  showToast: () => undefined,
});

export function useToast(): ToastContextType {
  return useContext(ToastContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) =>
        setToasts((prev) => prev.filter((t) => t.id !== id))
      } />
    </ToastContext.Provider>
  );
}

// ─── UI ───────────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const ICON: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const COLORS: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'linear-gradient(135deg, #00a884 0%, #00c49a 100%)',
    icon: '#ffffff',
    border: 'transparent',
  },
  error: {
    bg: 'linear-gradient(135deg, #ea0038 0%, #ff4d6a 100%)',
    icon: '#ffffff',
    border: 'transparent',
  },
  info: {
    bg: 'var(--bg-secondary)',
    icon: 'var(--accent)',
    border: 'var(--border-subtle)',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const c = COLORS[toast.type];
  const isColored = toast.type !== 'info';

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        animation: 'toastIn 0.25s ease',
        color: isColored ? '#fff' : 'var(--text-primary)',
      }}
    >
      <span
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: isColored ? 'rgba(255,255,255,0.25)' : 'var(--accent-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          flexShrink: 0,
          color: isColored ? '#fff' : 'var(--accent)',
        }}
      >
        {ICON[toast.type]}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.4 }}>
        {toast.message}
      </span>
    </div>
  );
}
