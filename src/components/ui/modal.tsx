"use client"

/**
 * Accessible modal wrapper.
 *
 * Provides:
 * - role="dialog" + aria-modal="true" + aria-labelledby
 * - Focus trap (Tab/Shift+Tab stays inside modal)
 * - Escape key closes
 * - Backdrop click closes
 * - Restore focus to trigger element on close
 * - Body scroll lock while open
 *
 * Usage:
 * <Modal isOpen={open} onClose={close} titleId="my-title">
 * <h2 id="my-title">Title</h2>
 * ...content...
 * </Modal>
 */

import { useEffect, useRef, useId, type ReactNode } from"react"
import { X } from"lucide-react"

interface ModalProps {
 isOpen: boolean
 onClose: () => void
 /** id of the element that labels the modal (heading). Falls back to aria-label. */
 titleId?: string
 /** Fallback accessible name if no titleId. */
 label?: string
 /** Max width class (Tailwind). Default"max-w-md". */
 maxWidthClassName?: string
 /** Whether to show the default close (X) button. Default true. */
 showCloseButton?: boolean
 /** Close button aria-label. */
 closeLabel?: string
 children: ReactNode
 /** Extra className for the dialog panel. */
 panelClassName?: string
}

const FOCUSABLE_SELECTOR =
 'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({
 isOpen,
 onClose,
 titleId,
 label,
 maxWidthClassName ="max-w-md",
 showCloseButton = true,
 closeLabel ="Đóng",
 children,
 panelClassName ="",
}: ModalProps) {
 const panelRef = useRef<HTMLDivElement>(null)
 const previouslyFocused = useRef<HTMLElement | null>(null)
 const generatedTitleId = useId()
 const effectiveTitleId = titleId ?? generatedTitleId

 // Body scroll lock + restore focus + Escape handler
 useEffect(() => {
 if (!isOpen) return

 previouslyFocused.current = document.activeElement as HTMLElement | null

 // Lock scroll
 const originalOverflow = document.body.style.overflow
 document.body.style.overflow ="hidden"

 // Focus first focusable in panel
 const focusFirst = () => {
 const panel = panelRef.current
 if (!panel) return
 const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
 first?.focus()
 }
 // Small delay so content renders
 const t = setTimeout(focusFirst, 0)

 const handleKeyDown = (e: KeyboardEvent) => {
 if (e.key ==="Escape") {
 e.preventDefault()
 onClose()
 return
 }
 if (e.key !=="Tab") return
 // Focus trap
 const panel = panelRef.current
 if (!panel) return
 const focusables = Array.from(
 panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
 )
 if (focusables.length === 0) return
 const first = focusables[0]
 const last = focusables[focusables.length - 1]
 if (e.shiftKey && document.activeElement === first) {
 e.preventDefault()
 last.focus()
 } else if (!e.shiftKey && document.activeElement === last) {
 e.preventDefault()
 first.focus()
 }
 }

 document.addEventListener("keydown", handleKeyDown)

 return () => {
 clearTimeout(t)
 document.removeEventListener("keydown", handleKeyDown)
 document.body.style.overflow = originalOverflow
 previouslyFocused.current?.focus()
 }
 }, [isOpen, onClose])

 if (!isOpen) return null

 return (
 <div
 className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
 onClick={onClose}
 >
 <div
 ref={panelRef}
 role="dialog"
 aria-modal="true"
 aria-labelledby={effectiveTitleId}
 aria-label={label}
 tabIndex={-1}
 className={`relative bg-white rounded-2xl border border-slate-200 shadow-md w-full ${maxWidthClassName} max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200 ${panelClassName}`}
 onClick={(e) => e.stopPropagation()}
 >
 {showCloseButton && (
 <button
 onClick={onClose}
 aria-label={closeLabel}
 className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 z-10"
 >
 <X className="w-5 h-5" />
 </button>
 )}
 {children}
 </div>
 </div>
 )
}
