import { X } from "lucide-react"
import { formatSalary, cn } from "@/lib/utils"

interface ApplyPositionModalProps {
    isOpen: boolean
    onClose: () => void
    event: any
    selectedPositionId: string
    onSelectPosition: (id: string) => void
    onConfirm: () => void
    isApplying: boolean
    profile: any
    user: any
}

export default function ApplyPositionModal({
    isOpen,
    onClose,
    event,
    selectedPositionId,
    onSelectPosition,
    onConfirm,
    isApplying,
    profile,
    user,
}: ApplyPositionModalProps) {
    if (!isOpen || !event) return null

    const positions = event.event_positions || []
    const hasMultiplePositions = positions.length > 1

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-[560px] w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[18px] font-bold text-zinc-900 leading-tight">
                            Ứng tuyển sự kiện
                        </h3>
                        <p className="text-[13px] text-zinc-500 mt-1 line-clamp-1">
                            {event.title}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Chọn vị trí tuyển dụng (chỉ hiển thị khi có từ 2 vị trí trở lên) */}
                {hasMultiplePositions && (
                    <div>
                        <label className="block text-[13.5px] font-semibold text-zinc-900 mb-2">
                            Chọn vị trí bạn muốn ứng tuyển <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2.5">
                            {positions.map((pos: any) => {
                                const isSelected = selectedPositionId === pos.id
                                return (
                                    <div
                                        key={pos.id}
                                        onClick={() => onSelectPosition(pos.id)}
                                        className={cn(
                                            "p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 select-none",
                                            isSelected
                                                ? "border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900/10 shadow-xs"
                                                : "border-zinc-200 hover:border-zinc-300 bg-white"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    "size-4 rounded-full border flex items-center justify-center mt-1 shrink-0 transition",
                                                    isSelected ? "border-zinc-900 bg-zinc-900" : "border-zinc-300 bg-white"
                                                )}
                                            >
                                                {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                                            </div>
                                            <div>
                                                <h4 className="text-[14px] font-semibold text-zinc-900 leading-tight">
                                                    {pos.title}
                                                </h4>
                                                {pos.description && (
                                                    <p className="text-[12px] text-zinc-500 mt-1 line-clamp-1">
                                                        {pos.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-[12.5px] font-bold text-zinc-900 block">
                                                {formatSalary(pos.salary_amount, pos.salary_type)}
                                            </span>
                                            <span className="text-[11px] text-zinc-400">
                                                {pos.slots_needed} chỉ tiêu
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Thông tin ứng viên tóm tắt */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs text-zinc-600">
                    <div>
                        <span className="font-semibold text-zinc-800">
                            {profile?.full_name || user?.user_metadata?.full_name || "Ứng viên"}
                        </span>
                        {profile?.university && <span className="text-zinc-400"> • {profile.university}</span>}
                    </div>
                    <span className="text-emerald-700 font-medium">Hồ sơ đã sẵn sàng</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-[13.5px] font-medium transition cursor-pointer"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="button"
                        disabled={isApplying}
                        onClick={onConfirm}
                        className="h-10 px-6 rounded-xl bg-zinc-900 hover:bg-black text-white text-[13.5px] font-semibold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isApplying ? (
                            <>
                                <span className="size-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                <span>Đang gửi...</span>
                            </>
                        ) : (
                            "Xác nhận nộp đơn"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
