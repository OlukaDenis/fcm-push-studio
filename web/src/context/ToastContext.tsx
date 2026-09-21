import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastCardProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative pointer-events-auto w-full rounded-2xl shadow-xl border p-4 backdrop-blur-xl animate-toast-in overflow-hidden transition-all select-none ${
        toast.type === 'success'
          ? 'bg-white/95 dark:bg-slate-900/95 border-emerald-500/30 text-slate-900 dark:text-white shadow-emerald-500/10'
          : toast.type === 'error'
          ? 'bg-white/95 dark:bg-slate-900/95 border-rose-500/30 text-slate-900 dark:text-white shadow-rose-500/10'
          : 'bg-white/95 dark:bg-slate-900/95 border-orange-500/30 text-slate-900 dark:text-white shadow-orange-500/10'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {toast.type === 'success' && (
            <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="p-1 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400">
              <Info className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-2">
          <h5
            className={`font-bold text-xs uppercase tracking-wider ${
              toast.type === 'success'
                ? 'text-emerald-600 dark:text-emerald-400'
                : toast.type === 'error'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-orange-600 dark:text-orange-400'
            }`}
          >
            {toast.title || (toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Notice')}
          </h5>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Shrinking Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
        <div
          className={`h-full transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500'
              : toast.type === 'error'
              ? 'bg-rose-500'
              : 'bg-orange-500'
          }`}
          style={{
            animation: `shrinkWidth ${duration}ms linear forwards`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 visible

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('success', message, title, duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('error', message, title, duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast('info', message, title, duration);
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, removeToast }}>
      {children}

      {/* Floating Toasts Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
