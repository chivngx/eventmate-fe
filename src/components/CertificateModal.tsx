import { X, Award, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

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

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Chứng nhận tham gia sự kiện - ${studentName}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;650;600;700&display=swap" rel="stylesheet">
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: #fdfdfd;
                font-family: 'Inter', sans-serif;
              }
              .cert-container {
                width: 842px;
                height: 595px;
                padding: 40px;
                box-sizing: border-box;
                border: 20px solid #0f172a;
                background-color: #fff8ee;
                position: relative;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                text-align: center;
              }
              .cert-border {
                border: 2px solid #b45309;
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
                color: #b45309;
                letter-spacing: 2px;
                margin-top: 10px;
              }
              .cert-sub {
                font-family: 'Playfair Display', serif;
                font-size: 16px;
                color: #475569;
                font-style: italic;
                margin-top: 5px;
              }
              .cert-to {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: #64748b;
                margin-top: 15px;
              }
              .cert-name {
                font-family: 'Playfair Display', serif;
                font-size: 38px;
                font-weight: 700;
                color: #0f172a;
                border-bottom: 2px solid #b45309;
                padding-bottom: 5px;
                min-width: 300px;
                margin: 10px auto;
              }
              .cert-text {
                font-size: 14px;
                color: #475569;
                line-height: 1.6;
                max-width: 600px;
                margin: 10px auto;
              }
              .cert-text strong {
                color: #0f172a;
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
                border-top: 1.5px solid #94a3b8;
                margin-top: 35px;
                padding-top: 6px;
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
              }
              .signature-title {
                font-size: 10px;
                color: #94a3b8;
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
                  background: #fff;
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
                  <div class="cert-name">${studentName}</div>
                  <div class="cert-text">
                    Đã hoàn thành xuất sắc vai trò <strong>${position}</strong> tại sự kiện <strong>${eventTitle}</strong>,<br/>
                    diễn ra vào ngày <strong>${new Date(eventDate).toLocaleDateString('vi-VN')}</strong>.
                  </div>
                </div>

                <div class="cert-footer">
                  <div class="signature-block">
                    <div style="font-family: 'Playfair Display', serif; font-style: italic; color: #b45309; font-size: 14px; font-weight: bold;">EVENTMATE</div>
                    <div class="signature-line">BAN TỔ CHỨC EVENTMATE</div>
                    <div class="signature-title">Hệ thống Quản lý Sự kiện</div>
                  </div>
                  <div class="signature-block">
                    <div style="font-family: 'Playfair Display', serif; font-style: italic; color: #1e293b; font-size: 14px; font-weight: bold;">${organizerName}</div>
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
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            Chứng Nhận Sự Kiện
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Area */}
        <div className="p-8 flex justify-center items-center bg-slate-100 dark:bg-slate-950 overflow-x-auto">
          <div 
            id="certificate-print-area" 
            className="w-[842px] h-[595px] p-10 bg-[#fff8ee] border-[20px] border-[#0f172a] shadow-lg relative flex flex-col justify-between items-center text-center shrink-0"
          >
            <div className="border-2 border-[#b45309] w-full h-full p-8 flex flex-col justify-between items-center">
              {/* Header */}
              <div>
                <h1 className="font-serif text-3xl font-bold text-[#b45309] tracking-wider uppercase mt-2 select-none">
                  Giấy Chứng Nhận
                </h1>
                <p className="font-serif italic text-sm text-slate-500 mt-1 select-none">
                  Vinh danh sự đóng góp và cống hiến
                </p>
              </div>

              {/* Recipient */}
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 select-none">
                  Chứng nhận này được trân trọng trao cho
                </p>
                <h2 className="font-serif text-4xl font-extrabold text-slate-900 border-b-2 border-[#b45309] pb-1.5 px-6 inline-block my-3 select-all">
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
                  <span className="font-serif italic text-[#b45309] text-sm font-bold">EVENTMATE</span>
                  <div className="w-40 border-t border-slate-300 mt-8 pt-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    BAN TỔ CHỨC EVENTMATE
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">Hệ thống Quản lý Sự kiện</span>
                </div>

                <div className="flex flex-col items-center select-none">
                  <span className="font-serif italic text-slate-800 text-sm font-bold">{organizerName}</span>
                  <div className="w-40 border-t border-slate-300 mt-8 pt-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    ĐƠN VỊ TỔ CHỨC
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">Đại diện Đơn vị Đối tác</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="rounded-xl border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
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
