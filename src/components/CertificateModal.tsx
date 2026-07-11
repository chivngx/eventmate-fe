"use client"

import { X, Award, Printer } from"lucide-react"
import { escapeHtml } from"@/lib/error"
import { Button } from"@/components/ui/button"

interface CertificateModalProps {
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
 organizerName
}: CertificateModalProps) {
 if (!isOpen) return null

 const handlePrint = () => {
 const printContent = document.getElementById("certificate-print-area")
 if (!printContent) return

 // SECURITY: escape all user/organizer-supplied values before injecting
 // them into the print window's HTML to prevent DOM XSS.
 const safeName = escapeHtml(studentName)
 const safeTitle = escapeHtml(eventTitle)
 const safePosition = escapeHtml(position)
 const safeOrganizer = escapeHtml(organizerName)
 const safeDate = escapeHtml(new Date(eventDate).toLocaleDateString('vi-VN'))

 const printWindow = window.open("","_blank")
 if (printWindow) {
 printWindow.document.write(`
 <html>
 <head>
 <title>Chứng nhận tham gia sự kiện - ${safeName}</title>
 <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;650;600;700&display=swap" rel="stylesheet">
 <style>
 body {
 margin: 0;
 padding: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 min-height: 100vh;
 background: rgb(253 253 253);
 font-family: 'Inter', sans-serif;
 }
 .cert-container {
 width: 842px;
 height: 595px;
 padding: 40px;
 box-sizing: border-box;
 border: 20px solid rgb(15 23 42);
 background-color: rgb(255 248 238);
 position: relative;
 box-shadow: 0 0 20px rgba(0,0,0,0.1);
 display: flex;
 flex-direction: column;
 justify-content: space-between;
 align-items: center;
 text-align: center;
 }
 .cert-border {
 border: 2px solid rgb(180 83 9);
 width: 100%;
 height: 100%;
 padding: 30px;
 box-sizing: border-box;
 display: flex;
 flex-direction: column;
 justify-content: space-between;
 align-items: center;
 }
 .cert-header {
 font-family: 'Cinzel', serif;
 font-size: 32px;
 font-weight: 700;
 color: rgb(180 83 9);
 letter-spacing: 2px;
 margin-top: 10px;
 }
 .cert-sub {
 font-family: 'Playfair Display', serif;
 font-size: 16px;
 color: rgb(71 85 105);
 font-style: italic;
 margin-top: 5px;
 }
 .cert-to {
 font-size: 13px;
 text-transform: uppercase;
 letter-spacing: 1.5px;
 color: rgb(100 116 139);
 margin-top: 15px;
 }
 .cert-name {
 font-family: 'Playfair Display', serif;
 font-size: 38px;
 font-weight: 700;
 color: rgb(15 23 42);
 border-bottom: 2px solid rgb(180 83 9);
 padding-bottom: 5px;
 min-width: 300px;
 margin: 10px auto;
 }
 .cert-text {
 font-size: 14px;
 color: rgb(71 85 105);
 line-height: 1.6;
 max-width: 600px;
 margin: 10px auto;
 }
 .cert-text strong {
 color: rgb(15 23 42);
 }
 .cert-footer {
 display: flex;
 justify-content: space-between;
 width: 100%;
 margin-top: 30px;
 padding: 0 40px;
 box-sizing: border-box;
 }
 .signature-block {
 display: flex;
 flex-direction: column;
 align-items: center;
 }
 .signature-line {
 width: 160px;
 border-top: 1.5px solid rgb(148 163 184);
 margin-top: 35px;
 padding-top: 6px;
 font-size: 11px;
 font-weight: 700;
 color: rgb(100 116 139);
 }
 .signature-title {
 font-size: 10px;
 color: rgb(148 163 184);
 margin-top: 2px;
 }
 .seal {
 position: absolute;
 bottom: 40px;
 left: 50%;
 transform: translateX(-50%);
 opacity: 0.15;
 }
 @media print {
 body {
 background: rgb(255 255 255);
 -webkit-print-color-adjust: exact;
 }
 .cert-container {
 box-shadow: none;
 }
 }
 </style>
 </head>
 <body>
 <div class="cert-container">
 <div class="cert-border">
 <div>
 <div class="cert-header">GIẤY CHỨNG NHẬN</div>
 <div class="cert-sub">Vinh danh sự đóng góp và cống hiến</div>
 </div>

 <div>
 <div class="cert-to">Chứng nhận này được trân trọng trao cho</div>
 <div class="cert-name">${safeName}</div>
 <div class="cert-text">
 Đã hoàn thành xuất sắc vai trò <strong>${safePosition}</strong> tại sự kiện <strong>${safeTitle}</strong>,<br/>
 diễn ra vào ngày <strong>${safeDate}</strong>.
 </div>
 </div>

 <div class="cert-footer">
 <div class="signature-block">
 <div style="font-family: 'Playfair Display', serif; font-style: italic; color: rgb(180 83 9); font-size: 14px; font-weight: bold;">EVENTMATE</div>
 <div class="signature-line">BAN TỔ CHỨC EVENTMATE</div>
 <div class="signature-title">Hệ thống Quản lý Sự kiện</div>
 </div>
 <div class="signature-block">
 <div style="font-family: 'Playfair Display', serif; font-style: italic; color: rgb(30 41 59); font-size: 14px; font-weight: bold;">${safeOrganizer}</div>
 <div class="signature-line">ĐƠN VỊ TỔ CHỨC</div>
 <div class="signature-title">Đại diện Đơn vị Đối tác</div>
 </div>
 </div>
 </div>
 </div>
 <script>
 window.onload = function() {
 window.print();
 window.close();
 }
 </script>
 </body>
 </html>
 `)
 printWindow.document.close()
 }
 }

 return (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
 <div className="bg-white rounded-2xl border border-slate-200 shadow-md w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">

 {/* Header */}
 <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
 <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
 <Award className="w-5 h-5 text-emerald-500" />
 Chứng Nhận Sự Kiện
 </h3>
 <button
 onClick={onClose}
 aria-label="Đóng"
 className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Certificate Display Area */}
 <div className="p-8 flex justify-center items-center bg-slate-100 overflow-x-auto">
 <div
 id="certificate-print-area"
 className="w-[842px] h-[595px] p-10 bg-amber-50 border-[20px] border-foreground shadow-md relative flex flex-col justify-between items-center text-center shrink-0"
 >
 <div className="border border-amber-700 w-full h-full p-8 flex flex-col justify-between items-center">
 {/* Header */}
 <div>
 <h1 className="font-serif text-3xl font-bold text-amber-700 tracking-wider uppercase mt-2 select-none">
 Giấy Chứng Nhận
 </h1>
 <p className="font-serif italic text-sm text-slate-500 mt-1 select-none">
 Vinh danh sự đóng góp và cống hiến
 </p>
 </div>

 {/* Recipient */}
 <div>
 <p className="text-xs uppercase tracking-widest text-slate-500 select-none">
 Chứng nhận này được trân trọng trao cho
 </p>
 <h2 className="font-serif text-4xl font-extrabold text-slate-900 border-b border-amber-700 pb-1.5 px-6 inline-block my-3 select-all">
 {studentName}
 </h2>
 <p className="text-sm text-slate-600 leading-relaxed max-w-[620px] mx-auto select-none mt-2">
 Đã hoàn thành xuất sắc vai trò <strong className="text-slate-900 font-bold">{position}</strong> tại sự kiện <strong className="text-slate-900 font-bold">{eventTitle}</strong>,
 <br />
 diễn ra vào ngày <strong className="text-slate-900 font-bold">{new Date(eventDate).toLocaleDateString('vi-VN')}</strong>.
 </p>
 </div>

 {/* Signatures */}
 <div className="flex justify-between w-full px-10">
 <div className="flex flex-col items-center select-none">
 <span className="font-serif italic text-amber-700 text-sm font-bold">EVENTMATE</span>
 <div className="w-40 border-t border-slate-300 mt-8 pt-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
 BAN TỔ CHỨC EVENTMATE
 </div>
 <span className="text-[9px] text-slate-500 mt-0.5">Hệ thống Quản lý Sự kiện</span>
 </div>

 <div className="flex flex-col items-center select-none">
 <span className="font-serif italic text-slate-800 text-sm font-bold">{organizerName}</span>
 <div className="w-40 border-t border-slate-300 mt-8 pt-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
 ĐƠN VỊ TỔ CHỨC
 </div>
 <span className="text-[9px] text-slate-500 mt-0.5">Đại diện Đơn vị Đối tác</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Footer Actions */}
 <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
 <Button
 onClick={onClose}
 variant="outline"
 className="rounded-xl border-slate-200 font-bold text-slate-600"
 >
 Đóng
 </Button>
 <Button
 onClick={handlePrint}
 className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 px-6"
 >
 <Printer className="w-4 h-4" />
 In & Tải xuống PDF
 </Button>
 </div>

 </div>
 </div>
 )
}
