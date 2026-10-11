import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', title?: string, duration: number = 3800) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'success', title || 'Success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'error', title || 'Error', duration || 5000);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'info', title || 'Notice', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'warning', title || 'Warning', duration || 4500);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        info,
        warning,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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

// Global Toast Container Component
interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end space-y-2.5 max-w-sm w-full pointer-events-none select-none px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onRemove: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onRemove }) => {
  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      borderColor: 'border-emerald-200/90',
      accentBar: 'bg-emerald-500',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-200',
      borderColor: 'border-rose-200/90',
      accentBar: 'bg-rose-500',
    },
    info: {
      icon: Info,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border-sky-200',
      borderColor: 'border-sky-200/90',
      accentBar: 'bg-sky-500',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      borderColor: 'border-amber-200/90',
      accentBar: 'bg-amber-500',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start space-x-3 w-full bg-white/95 backdrop-blur-md border ${config.borderColor} p-3.5 rounded-2xl shadow-xl shadow-slate-900/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 relative overflow-hidden`}
    >
      <div className={`w-8 h-8 rounded-xl ${config.iconBg} border flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-tight">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Subtle indicator bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.accentBar} opacity-80`} />
    </div>
  );
};
