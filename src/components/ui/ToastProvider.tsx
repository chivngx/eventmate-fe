import React, { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react"

export type ToastType = "info" | "success" | "warning" | "error"

export interface Toast {
    id: string
    title: string
    message: string
    type?: ToastType
    duration?: number
    actionLink?: string
    actionText?: string
}

interface ToastContextType {
    toasts: Toast[]
    showToast: (toast: Omit<Toast, "id">) => void
    dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substring(7)
        const duration = toast.duration ?? 4000

        setToasts((prev) => [...prev, { ...toast, id }])

        if (duration > 0) {
            setTimeout(() => {
                dismissToast(id)
            }, duration)
        }
    }, [dismissToast])

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((toast) => {
                    const Icon = {
                        success: CheckCircle2,
                        warning: AlertTriangle,
                        error: AlertTriangle,
                        info: Info,
                    }[toast.type || "info"]

                    const iconColor = {
                        success: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                        warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
                        error: "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
                        info: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
                    }[toast.type || "info"]

                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto flex gap-3 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 shadow-lg rounded-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 transition-all hover:scale-[1.01]"
                        >
                            <div className={`p-2 rounded-xl h-fit shrink-0 ${iconColor}`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {toast.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {toast.message}
                                </p>
                                {toast.actionLink && (
                                    <a
                                        href={toast.actionLink}
                                        className="inline-block text-xs font-black text-emerald-600 dark:text-emerald-400 mt-2 hover:underline"
                                    >
                                        {toast.actionText || "Xem ngay"} &rarr;
                                    </a>
                                )}
                            </div>

                            <button
                                onClick={() => dismissToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors h-fit p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}
