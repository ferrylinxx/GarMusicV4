"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const colors = {
  success: "bg-[#1db954] text-black",
  error: "bg-red-500 text-white",
  info: "bg-[#2a2a2a] text-white border border-white/10",
  warning: "bg-amber-500 text-black",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const success = useCallback((m: string) => toast(m, "success"), [toast]);
  const error   = useCallback((m: string) => toast(m, "error"), [toast]);
  const info    = useCallback((m: string) => toast(m, "info"), [toast]);
  const warning = useCallback((m: string) => toast(m, "warning"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-24 md:bottom-28 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto
                animate-slide-in max-w-xs ${colors[t.type]}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 ml-1">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
