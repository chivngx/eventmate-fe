"use client"

import React from "react"
import { X, Award, Printer, ShieldCheck } from "lucide-react"
import { escapeHtml } from "@/lib/error"
import { Button } from "@/components/ui/button"

export interface CertificateModalProps {
    isOpen: boolean
    onClose: () => void
    studentName: string
    eventTitle: string
    position: string
    eventDate: string
    organizerName: string
}

export default function CertificateModal({
    isOpen,
    onClose,
    studentName,
    eventTitle,
    position,
    eventDate,
    organizerName,
}: CertificateModalProps) {
    if (!isOpen) return null

    // Deterministic credential ID
    const hash = Math.abs(
        (studentName + eventTitle + eventDate).split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    )
        .toString(36)
        .toUpperCase()
        .padStart(6, "0")
        .slice(-6)
    const certYear = new Date(eventDate).getFullYear() || 2026
    const credentialId = `EM-${certYear}-${hash}`

    // Format formal Vietnamese date
    const dateObj = new Date(eventDate)
    const formattedDate = !isNaN(dateObj.getTime())
        ? `ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`
        : eventDate || "Chưa xác định"

    const handlePrint = () => {
        const safeName = escapeHtml(studentName)
        const safeTitle = escapeHtml(eventTitle)
        const safePosition = escapeHtml(position)
        const safeOrganizer = escapeHtml(organizerName)
        const safeDate = escapeHtml(formattedDate)
        const safeId = escapeHtml(credentialId)

        const printWindow = window.open("", "_blank")
        if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>Chứng nhận vinh danh - ${safeName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            background-color: #ffffff;
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .cert-canvas {
            width: 297mm;
            height: 210mm;
            padding: 10mm;
            background: radial-gradient(circle at center, #ffffff 0%, #faf8f5 65%, #f4ede1 100%);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
        }
        .cert-outer-border {
            border: 2px solid #926315;
            height: 100%;
            position: relative;
            padding: 3.5mm;
            background: transparent;
        }
        .cert-inner-border {
            border: 1px solid #c5a059;
            height: 100%;
            position: relative;
            padding: 10mm 16mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.45);
        }
        .corner {
            position: absolute;
            width: 14mm;
            height: 14mm;
            pointer-events: none;
        }
        .corner-tl { top: 0; left: 0; }
        .corner-tr { top: 0; right: 0; transform: rotate(90deg); }
        .corner-br { bottom: 0; right: 0; transform: rotate(180deg); }
        .corner-bl { bottom: 0; left: 0; transform: rotate(270deg); }

        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.035;
            pointer-events: none;
        }

        .header {
            text-align: center;
            position: relative;
            z-index: 2;
        }
        .brand-row {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 2mm;
        }
        .brand-text {
            font-size: 8.5pt;
            font-weight: 700;
            letter-spacing: 0.22em;
            color: #85581A;
            text-transform: uppercase;
        }
        .title-vn {
            font-family: 'Lora', Georgia, serif;
            font-size: 26pt;
            font-weight: 700;
            color: #1a1612;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            line-height: 1.15;
        }
        .title-en {
            font-size: 8pt;
            font-weight: 600;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #7b5924;
            margin-top: 1.5mm;
        }

        .recipient-section {
            text-align: center;
            position: relative;
            z-index: 2;
            margin: auto 0;
            padding: 2mm 0;
        }
        .for-text {
            font-size: 11pt;
            font-style: italic;
            font-family: 'Lora', Georgia, serif;
            color: #64748b;
            letter-spacing: 0.05em;
            margin-bottom: 2mm;
        }
        .recipient-name {
            font-family: 'Lora', Georgia, serif;
            font-size: 32pt;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            line-height: 1.2;
            margin-bottom: 2.5mm;
        }
        .gold-divider {
            width: 52mm;
            height: 1.5px;
            background: linear-gradient(90deg, transparent, #c5a059, #85581A, #c5a059, transparent);
            margin: 0 auto 3.5mm auto;
        }
        .citation {
            font-size: 11.5pt;
            line-height: 1.7;
            color: #334155;
            max-width: 195mm;
            margin: 0 auto;
        }
        .citation strong {
            color: #0f172a;
            font-weight: 700;
        }

        .footer {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            position: relative;
            z-index: 2;
            padding: 0 4mm;
        }
        .sign-col {
            width: 66mm;
            text-align: center;
        }
        .sign-title-top {
            font-size: 8pt;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 1.5mm;
        }
        .handwritten-sig-wrap {
            height: 12mm;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1mm;
        }
        .sign-name {
            font-family: 'Lora', Georgia, serif;
            font-size: 10.5pt;
            font-weight: 700;
            color: #0f172a;
            border-top: 1px solid #cbd5e1;
            padding-top: 1.5mm;
            line-height: 1.3;
        }
        .sign-sub {
            font-size: 7.5pt;
            color: #64748b;
            margin-top: 0.8mm;
        }

        .seal-col {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .medallion {
            width: 20mm;
            height: 20mm;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 30%, #fff0b8 0%, #d4af37 45%, #a67c37 80%, #704b12 100%);
            box-shadow: 0 2mm 5mm rgba(146, 99, 21, 0.35);
            border: 0.8mm solid #fff5cc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .medallion-inner {
            width: 16mm;
            height: 16mm;
            border-radius: 50%;
            border: 0.3mm dashed rgba(255, 255, 255, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .medallion-text {
            font-size: 4.8pt;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #382003;
            margin-top: 0.5mm;
        }
        .cred-id {
            font-family: monospace;
            font-size: 7pt;
            font-weight: 700;
            color: #7b5924;
            margin-top: 2mm;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>
    <div class="cert-canvas">
        <svg class="watermark" width="130mm" height="120mm" viewBox="0 0 2000 1903" fill="#a67c37">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M527.187 1325.8L1334.14 859.901V656.135L1159.2 555.156L352.271 1021.03V677.651L587.75 541.698L824.562 404.958L1175.29 202.479L911.958 50.4688L824.562 0L737.213 50.4688L412.984 237.63L88.7759 424.828L0.0415039 476.068V1426.38L88.7759 1477.61L412.984 1664.8L737.213 1851.98L824.562 1902.42L911.958 1851.98L1560.37 1477.61L1649.11 1426.38V1021.43L1647.6 1022.32L1296.88 1224.76L1061.42 1360.74L824.562 1497.48L587.75 1360.74L527.187 1325.8Z"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1647.6 475.182V1022.32L1649.11 1021.43L1999.83 818.958V273.583L1911.1 222.354L1586.89 35.1458L1526.01 0L1175.29 202.479L1412.15 339.219L1472.67 374.167L1647.6 475.182Z"/>
        </svg>

        <div class="cert-outer-border">
            <div class="cert-inner-border">
                <svg class="corner corner-tl" viewBox="0 0 40 40" fill="none">
                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" stroke-width="2"/>
                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" stroke-width="0.8"/>
                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                    <path d="M2 2L10 10" stroke="#926315" stroke-width="1.5"/>
                </svg>
                <svg class="corner corner-tr" viewBox="0 0 40 40" fill="none">
                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" stroke-width="2"/>
                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" stroke-width="0.8"/>
                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                    <path d="M2 2L10 10" stroke="#926315" stroke-width="1.5"/>
                </svg>
                <svg class="corner corner-br" viewBox="0 0 40 40" fill="none">
                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" stroke-width="2"/>
                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" stroke-width="0.8"/>
                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                    <path d="M2 2L10 10" stroke="#926315" stroke-width="1.5"/>
                </svg>
                <svg class="corner corner-bl" viewBox="0 0 40 40" fill="none">
                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" stroke-width="2"/>
                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" stroke-width="0.8"/>
                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                    <path d="M2 2L10 10" stroke="#926315" stroke-width="1.5"/>
                </svg>

                <div class="header">
                    <div class="brand-row">
                        <svg width="22" height="21" viewBox="0 0 2000 1903" fill="none">
                            <defs>
                                <linearGradient id="em-gold-print" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#C5A059"/>
                                    <stop offset="100%" stop-color="#7B5618"/>
                                </linearGradient>
                            </defs>
                            <path fill-rule="evenodd" clipRule="evenodd" d="M527.187 1325.8L1334.14 859.901V656.135L1159.2 555.156L352.271 1021.03V677.651L587.75 541.698L824.562 404.958L1175.29 202.479L911.958 50.4688L824.562 0L737.213 50.4688L412.984 237.63L88.7759 424.828L0.0415039 476.068V1426.38L88.7759 1477.61L412.984 1664.8L737.213 1851.98L824.562 1902.42L911.958 1851.98L1560.37 1477.61L1649.11 1426.38V1021.43L1647.6 1022.32L1296.88 1224.76L1061.42 1360.74L824.562 1497.48L587.75 1360.74L527.187 1325.8Z" fill="url(#em-gold-print)"/>
                            <path fill-rule="evenodd" clipRule="evenodd" d="M1647.6 475.182V1022.32L1649.11 1021.43L1999.83 818.958V273.583L1911.1 222.354L1586.89 35.1458L1526.01 0L1175.29 202.479L1412.15 339.219L1472.67 374.167L1647.6 475.182Z" fill="#DDB76E"/>
                        </svg>
                        <span class="brand-text">HỆ THỐNG QUẢN LÝ SỰ KIỆN EVENTMATE</span>
                    </div>
                    <h1 class="title-vn">Giấy Chứng Nhận</h1>
                    <div class="title-en">CERTIFICATE OF PARTICIPATION</div>
                </div>

                <div class="recipient-section">
                    <div class="for-text">Chứng nhận này được trân trọng trao tặng cho</div>
                    <h2 class="recipient-name">${safeName}</h2>
                    <div class="gold-divider"></div>
                    <p class="citation">
                        Đã tham gia và hoàn thành xuất sắc nhiệm vụ với vị trí <strong>${safePosition}</strong><br/>
                        tại sự kiện <strong>${safeTitle}</strong>,<br/>
                        tổ chức vào <strong>${safeDate}</strong> tại thành phố Đà Nẵng.
                    </p>
                </div>

                <div class="footer">
                    <!-- Bên trái: Đại diện Ban tổ chức sự kiện -->
                    <div class="sign-col">
                        <div class="sign-title-top">ĐẠI DIỆN BAN TỔ CHỨC</div>
                        <div class="handwritten-sig-wrap">
                            <svg viewBox="0 0 160 52" style="width: 36mm; height: 11mm; transform: rotate(-2deg);" fill="none">
                                <path d="M12 36 C18 20, 24 8, 30 14 C36 20, 32 38, 38 35 C44 32, 48 18, 54 22 C60 26, 62 34, 70 32 C78 30, 85 15, 92 18 C98 22, 94 36, 102 34 C112 32, 126 12, 134 24 C138 30, 142 33, 152 30" stroke="#132b45" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M20 44 C48 42, 92 41, 150 38 C122 45, 82 46, 52 47" stroke="#132b45" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                                <circle cx="58" cy="14" r="1.4" fill="#132b45" />
                            </svg>
                        </div>
                        <div class="sign-name">${safeOrganizer}</div>
                        <div class="sign-sub">Đơn vị chủ trì sự kiện</div>
                    </div>

                    <!-- Ở giữa: Con dấu chứng nhận số -->
                    <div class="seal-col">
                        <div class="medallion">
                            <div class="medallion-inner">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#382003" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                                    <path d="m9 12 2 2 4-4"/>
                                </svg>
                                <span class="medallion-text">ĐÃ XÁC THỰC</span>
                            </div>
                        </div>
                        <div class="cred-id">MÃ SỐ: ${safeId}</div>
                    </div>

                    <!-- Bên phải: Đại diện Hệ thống EventMate -->
                    <div class="sign-col">
                        <div class="sign-title-top">HỆ THỐNG EVENTMATE</div>
                        <div class="handwritten-sig-wrap">
                            <svg viewBox="0 0 160 52" style="width: 36mm; height: 11mm; transform: rotate(1deg);" fill="none">
                                <path d="M14 34 C10 22, 20 10, 28 10 C38 10, 30 38, 22 42 C16 45, 14 38, 32 32 C48 26, 54 14, 60 18 C66 22, 62 36, 70 34 C78 32, 84 22, 92 24 C100 26, 98 35, 108 33 C120 31, 136 15, 144 22 C148 26, 142 36, 152 34" stroke="#132b45" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M26 44 C60 45, 110 44, 152 39" stroke="#132b45" stroke-width="1.8" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div class="sign-name">Ban Điều Hành EventMate</div>
                        <div class="sign-sub">Xác nhận trên hệ thống điện tử</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.onload = function() {
            if (document.fonts) {
                document.fonts.ready.then(function() {
                    window.print();
                    window.close();
                });
            } else {
                setTimeout(function() {
                    window.print();
                    window.close();
                }, 500);
            }
        }
    </script>
</body>
</html>`)
            printWindow.document.close()
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            {/* Scoped font link for Lora, strictly only loaded for this modal without changing app fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,400;1,600&display=swap"
                rel="stylesheet"
            />

            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/70 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-[14.5px] text-slate-100 leading-tight">
                                Chứng nhận vinh danh
                            </h3>
                            <p className="text-[11px] text-amber-400/80 font-mono">
                                MÃ SỐ: {credentialId}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Đóng"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Certificate Preview Canvas (Scalable A4 Landscape) */}
                <div className="p-2 sm:p-5 bg-slate-950/95 overflow-y-auto overflow-x-hidden flex items-center justify-center flex-1">
                    <div
                        id="certificate-print-area"
                        className="w-full max-w-[760px] aspect-[1.414/1] relative flex flex-col justify-between select-none p-3 sm:p-5 rounded-xs"
                        style={{
                            background: "radial-gradient(circle at center, #ffffff 0%, #faf8f5 65%, #f4ede1 100%)",
                            boxShadow: "0 20px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(166,124,55,0.35)",
                        }}
                    >
                        {/* Background Crest Watermark */}
                        <svg
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 h-44 sm:h-56 opacity-[0.035] pointer-events-none"
                            viewBox="0 0 2000 1903"
                            fill="#a67c37"
                        >
                            <path fillRule="evenodd" clipRule="evenodd" d="M527.187 1325.8L1334.14 859.901V656.135L1159.2 555.156L352.271 1021.03V677.651L587.75 541.698L824.562 404.958L1175.29 202.479L911.958 50.4688L824.562 0L737.213 50.4688L412.984 237.63L88.7759 424.828L0.0415039 476.068V1426.38L88.7759 1477.61L412.984 1664.8L737.213 1851.98L824.562 1902.42L911.958 1851.98L1560.37 1477.61L1649.11 1426.38V1021.43L1647.6 1022.32L1296.88 1224.76L1061.42 1360.74L824.562 1497.48L587.75 1360.74L527.187 1325.8Z"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M1647.6 475.182V1022.32L1649.11 1021.43L1999.83 818.958V273.583L1911.1 222.354L1586.89 35.1458L1526.01 0L1175.29 202.479L1412.15 339.219L1472.67 374.167L1647.6 475.182Z"/>
                        </svg>

                        {/* Outer & Inner Royal Gold Border */}
                        <div className="border-[2px] border-[#926315] h-full p-1 sm:p-1.5 relative">
                            <div className="border border-[#c5a059] h-full p-3 sm:p-5 relative flex flex-col justify-between bg-white/45">
                                {/* 4 Corner Filigrees */}
                                <svg className="absolute top-0 left-0 size-6 sm:size-8 pointer-events-none" viewBox="0 0 40 40" fill="none">
                                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" strokeWidth="2"/>
                                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" strokeWidth="0.8"/>
                                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                                    <path d="M2 2L10 10" stroke="#926315" strokeWidth="1.5"/>
                                </svg>
                                <svg className="absolute top-0 right-0 size-6 sm:size-8 pointer-events-none rotate-90" viewBox="0 0 40 40" fill="none">
                                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" strokeWidth="2"/>
                                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" strokeWidth="0.8"/>
                                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                                    <path d="M2 2L10 10" stroke="#926315" strokeWidth="1.5"/>
                                </svg>
                                <svg className="absolute bottom-0 right-0 size-6 sm:size-8 pointer-events-none rotate-180" viewBox="0 0 40 40" fill="none">
                                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" strokeWidth="2"/>
                                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" strokeWidth="0.8"/>
                                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                                    <path d="M2 2L10 10" stroke="#926315" strokeWidth="1.5"/>
                                </svg>
                                <svg className="absolute bottom-0 left-0 size-6 sm:size-8 pointer-events-none -rotate-90" viewBox="0 0 40 40" fill="none">
                                    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#926315" strokeWidth="2"/>
                                    <path d="M6 34V14C6 9.58172 9.58172 6 14 6H34" stroke="#c5a059" strokeWidth="0.8"/>
                                    <circle cx="12" cy="12" r="3" fill="#926315"/>
                                    <path d="M2 2L10 10" stroke="#926315" strokeWidth="1.5"/>
                                </svg>

                                {/* Certificate Header */}
                                <div className="text-center relative z-10 pt-0.5">
                                    <div className="inline-flex items-center gap-2 mb-1">
                                        <svg width="20" height="19" viewBox="0 0 2000 1903" fill="none">
                                            <defs>
                                                <linearGradient id="em-gold-modal" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#C5A059"/>
                                                    <stop offset="100%" stopColor="#7B5618"/>
                                                </linearGradient>
                                            </defs>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M527.187 1325.8L1334.14 859.901V656.135L1159.2 555.156L352.271 1021.03V677.651L587.75 541.698L824.562 404.958L1175.29 202.479L911.958 50.4688L824.562 0L737.213 50.4688L412.984 237.63L88.7759 424.828L0.0415039 476.068V1426.38L88.7759 1477.61L412.984 1664.8L737.213 1851.98L824.562 1902.42L911.958 1851.98L1560.37 1477.61L1649.11 1426.38V1021.43L1647.6 1022.32L1296.88 1224.76L1061.42 1360.74L824.562 1497.48L587.75 1360.74L527.187 1325.8Z" fill="url(#em-gold-modal)"/>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M1647.6 475.182V1022.32L1649.11 1021.43L1999.83 818.958V273.583L1911.1 222.354L1586.89 35.1458L1526.01 0L1175.29 202.479L1412.15 339.219L1472.67 374.167L1647.6 475.182Z" fill="#DDB76E"/>
                                        </svg>
                                        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#85581A] uppercase">
                                            HỆ THỐNG QUẢN LÝ SỰ KIỆN EVENTMATE
                                        </span>
                                    </div>
                                    <h1
                                        className="text-[22px] sm:text-[28px] font-bold text-[#1a1612] tracking-[0.08em] uppercase leading-tight"
                                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                                    >
                                        Giấy Chứng Nhận
                                    </h1>
                                    <p className="text-[8px] sm:text-[9.5px] font-semibold tracking-[0.25em] text-[#7b5924] uppercase mt-0.5">
                                        CERTIFICATE OF PARTICIPATION
                                    </p>
                                </div>

                                {/* Recipient details */}
                                <div className="text-center relative z-10 my-auto py-1">
                                    <p
                                        className="italic text-[11px] sm:text-[12.5px] text-slate-500 mb-0.5"
                                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                                    >
                                        Chứng nhận này được trân trọng trao tặng cho
                                    </p>
                                    <h2
                                        className="text-[24px] sm:text-[32px] font-bold text-slate-900 my-0.5 tracking-normal uppercase"
                                        style={{ fontFamily: "'Lora', Georgia, serif" }}
                                    >
                                        {studentName}
                                    </h2>
                                    <div className="w-28 sm:w-36 h-[1.5px] bg-gradient-to-r from-transparent via-[#85581A] to-transparent mx-auto my-1.5 sm:my-2" />
                                    <p className="text-[11.5px] sm:text-[13px] text-slate-700 leading-relaxed max-w-[560px] mx-auto px-2">
                                        Đã tham gia và hoàn thành xuất sắc nhiệm vụ với vị trí{" "}
                                        <strong className="text-slate-900 font-bold">{position}</strong> tại sự kiện{" "}
                                        <strong className="text-slate-900 font-bold">{eventTitle}</strong>,<br className="hidden sm:inline" />{" "}
                                        tổ chức vào <strong className="text-slate-900 font-bold">{formattedDate}</strong> tại thành phố Đà Nẵng.
                                    </p>
                                </div>

                                {/* Footer & Signatures */}
                                <div className="grid grid-cols-3 items-end pt-1 sm:pt-2 relative z-10 px-2 sm:px-4">
                                    {/* Sign 1: Organizer */}
                                    <div className="text-center">
                                        <div className="text-[8px] sm:text-[9.5px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">
                                            ĐẠI DIỆN BAN TỔ CHỨC
                                        </div>
                                        {/* Handwritten signature stroke */}
                                        <div className="h-7 sm:h-9 flex items-center justify-center">
                                            <svg viewBox="0 0 160 52" className="w-24 sm:w-32 h-6 sm:h-8 -rotate-2" fill="none">
                                                <path d="M12 36 C18 20, 24 8, 30 14 C36 20, 32 38, 38 35 C44 32, 48 18, 54 22 C60 26, 62 34, 70 32 C78 30, 85 15, 92 18 C98 22, 94 36, 102 34 C112 32, 126 12, 134 24 C138 30, 142 33, 152 30" stroke="#132b45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20 44 C48 42, 92 41, 150 38 C122 45, 82 46, 52 47" stroke="#132b45" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="58" cy="14" r="1.4" fill="#132b45" />
                                            </svg>
                                        </div>
                                        <div
                                            className="text-[11px] sm:text-[12.5px] font-bold text-slate-900 border-t border-slate-300 pt-1 truncate block"
                                            style={{ fontFamily: "'Lora', Georgia, serif" }}
                                        >
                                            {organizerName}
                                        </div>
                                        <span className="text-[7.5px] sm:text-[8.5px] text-slate-500 block mt-0.5">
                                            Đơn vị chủ trì sự kiện
                                        </span>
                                    </div>

                                    {/* Center: Gold Foil Medallion Seal */}
                                    <div className="flex flex-col items-center justify-center">
                                        <div
                                            className="size-11 sm:size-13 rounded-full flex flex-col items-center justify-center relative shadow-lg"
                                            style={{
                                                background: "radial-gradient(circle at 35% 30%, #fff0b8 0%, #d4af37 45%, #a67c37 80%, #704b12 100%)",
                                                border: "2px solid #fff5cc",
                                                boxShadow: "0 4px 12px rgba(146, 99, 21, 0.35)"
                                            }}
                                        >
                                            <div className="size-8.5 sm:size-10 rounded-full border border-dashed border-white/85 flex flex-col items-center justify-center">
                                                <ShieldCheck className="size-3.5 sm:size-4 text-[#382003] stroke-[2.5]" />
                                                <span className="text-[4.5px] sm:text-[5px] font-extrabold uppercase tracking-widest text-[#382003] mt-0.5">
                                                    ĐÃ XÁC THỰC
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-mono text-[7px] sm:text-[8px] font-bold text-[#7b5924] mt-1 tracking-tight">
                                            MÃ SỐ: {credentialId}
                                        </span>
                                    </div>

                                    {/* Sign 2: EventMate System */}
                                    <div className="text-center">
                                        <div className="text-[8px] sm:text-[9.5px] font-bold text-slate-900 uppercase tracking-wider mb-0.5">
                                            HỆ THỐNG EVENTMATE
                                        </div>
                                        {/* Handwritten signature stroke */}
                                        <div className="h-7 sm:h-9 flex items-center justify-center">
                                            <svg viewBox="0 0 160 52" className="w-24 sm:w-32 h-6 sm:h-8 rotate-1" fill="none">
                                                <path d="M14 34 C10 22, 20 10, 28 10 C38 10, 30 38, 22 42 C16 45, 14 38, 32 32 C48 26, 54 14, 60 18 C66 22, 62 36, 70 34 C78 32, 84 22, 92 24 C100 26, 98 35, 108 33 C120 31, 136 15, 144 22 C148 26, 142 36, 152 34" stroke="#132b45" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M26 44 C60 45, 110 44, 152 39" stroke="#132b45" strokeWidth="1.8" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div
                                            className="text-[11px] sm:text-[12.5px] font-bold text-slate-900 border-t border-slate-300 pt-1"
                                            style={{ fontFamily: "'Lora', Georgia, serif" }}
                                        >
                                            Ban Điều Hành EventMate
                                        </div>
                                        <span className="text-[7.5px] sm:text-[8.5px] text-slate-500 block mt-0.5">
                                            Xác nhận trên hệ thống điện tử
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
                    <span className="text-[12px] text-slate-400 font-mono hidden sm:inline">
                        Định dạng in: Chuẩn A4 Landscape (297 x 210mm)
                    </span>
                    <div className="flex items-center gap-2.5 ml-auto">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="rounded-xl border-slate-700 bg-transparent text-slate-300 hover:text-white hover:bg-slate-800 font-medium text-[13px] h-9.5 px-4 cursor-pointer"
                        >
                            Đóng
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-slate-950 font-bold text-[13px] flex items-center gap-2 h-9.5 px-5 shadow-md shadow-amber-950/40 cursor-pointer transition-all"
                        >
                            <Printer className="w-4 h-4 stroke-[2.5]" />
                            <span>In & Tải xuống PDF</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
