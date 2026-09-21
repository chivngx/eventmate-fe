"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, AlertTriangle, Info } from "lucide-react";
import ToastSuccessApply from "@/components/ui/toast-success-apply";

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
  actionLink?: string;
  actionText?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const duration = toast.duration ?? 5000;

      setToasts((prev) => [...prev, { ...toast, id }]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-[420px] w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          // Render Figma Success Toast for success toasts
          if (toast.type === "success") {
            return (
              <div key={toast.id} className="pointer-events-auto">
                <ToastSuccessApply
                  title={toast.title}
                  message={toast.message}
                  actionText={
                    toast.actionText ||
                    (toast.actionLink ? "Go to Dashboard" : undefined)
                  }
                  actionLink={toast.actionLink}
                  onDismiss={() => dismissToast(toast.id)}
                />
              </div>
            );
          }

          const Icon = {
            warning: AlertTriangle,
            error: AlertTriangle,
            info: Info,
          }[toast.type || "info"];

          const iconColor = {
            warning: "text-amber-600 bg-amber-50 border border-amber-200",
            error: "text-red-600 bg-red-50 border border-red-200",
            info: "text-[#005DDC] bg-[#eff5ff] border border-blue-200",
          }[toast.type || "info"];

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md border border-[#ededed] shadow-lg rounded-[12px] animate-in slide-in-from-bottom-5 fade-in duration-300 transition-all"
            >
              <div className={`p-2 rounded-[8px] h-fit shrink-0 ${iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#222]">
                  {toast.title}
                </h4>
                <p className="text-xs text-[#515151] mt-1 leading-relaxed">
                  {toast.message}
                </p>
                {toast.actionLink && (
                  <a
                    href={toast.actionLink}
                    className="inline-block text-xs font-medium text-[#005DDC] mt-2 hover:underline"
                  >
                    {toast.actionText || "Xem ngay"} &rarr;
                  </a>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors h-fit p-1 cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastProvider;
