"use client"

import React, { createContext, useContext, useState, useCallback } from"react"
import { X, CheckCircle2, AlertTriangle, Info } from"lucide-react"

export type ToastType ="info" |"success" |"warning" |"error"

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
 showToast: (toast: Omit<Toast,"id">) => void
 dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([])

 const dismissToast = useCallback((id: string) => {
 setToasts((prev) => prev.filter((toast) => toast.id !== id))
 }, [])

 const showToast = useCallback((toast: Omit<Toast,"id">) => {
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
 }[toast.type ||"info"]

 const iconColor = {
 success:"text-emerald-500 bg-accent",
 warning:"text-primary bg-accent",
 error:"text-destructive bg-destructive/10",
 info:"text-blue-500 bg-accent",
 }[toast.type ||"info"]

 return (
 <div
 key={toast.id}
 className="pointer-events-auto flex gap-3 p-4 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-md rounded-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 transition-all hover:scale-[1.01]"
 >
 <div className={`p-2 rounded-xl h-fit shrink-0 ${iconColor}`}>
 <Icon className="w-5 h-5" />
 </div>

 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-bold text-slate-900">
 {toast.title}
 </h4>
 <p className="text-xs text-slate-500 mt-1 leading-relaxed">
 {toast.message}
 </p>
 {toast.actionLink && (
 <a
 href={toast.actionLink}
 className="inline-block text-xs font-black text-primary mt-2 hover:underline"
 >
 {toast.actionText ||"Xem ngay"} &rarr;
 </a>
 )}
 </div>

 <button
 onClick={() => dismissToast(toast.id)}
 className="text-slate-400 hover:text-slate-600 transition-colors h-fit p-1"
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
