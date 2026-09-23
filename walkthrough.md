# Hoàn thành triển khai các tính năng theo gói định giá (Pricing Features)

## 1. Tóm tắt các công việc đã thực hiện

### A. Loại bỏ "Showroom ảnh sự kiện riêng"
- Đã loại bỏ hoàn toàn tính năng showroom ảnh sự kiện khỏi tất cả các trang:
  - [PricingCardsGrid.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/pricing/components/PricingCardsGrid.tsx): Đã thay thế thành *"Bản đồ chỉ đường Google Maps & Chỉ dẫn"*.
  - [PaymentOrderSummary.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/pricing/components/PaymentOrderSummary.tsx): Đã cập nhật dòng tính năng.
  - [PricingFaqAccordion.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/pricing/components/PricingFaqAccordion.tsx): Đã cập nhật câu hỏi & giải đáp.

---

### B. Ghim tin Tuyển Gấp (`is_urgent`) & Nổi Bật (`is_featured`)
- **Database**: Đã bổ sung các trường `is_urgent`, `is_featured`, `bumped_at`, `qr_checkin_code`, `plan_tier` vào bảng `events` ([0007_pricing_features.sql](file:///c:/Users/Admin/Desktop/eventmate-fe/supabase/migrations/0007_pricing_features.sql)) và types ([database.types.ts](file:///c:/Users/Admin/Desktop/eventmate-fe/src/lib/database.types.ts)).
- **Đăng tin ([PostJobForm.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/components/post-job/PostJobForm.tsx))**: Bổ sung Khối 4 *"Gói dịch vụ & Tùy chọn hiển thị ưu tiên"* với 2 toggle kích hoạt Tuyển Gấp / Nổi Bật.
- **Thẻ sự kiện ([EventCard.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/event/components/EventCard.tsx))**: Hiển thị huy hiệu `🔥 Tuyển gấp` (Rose badge) và `★ Nổi bật` (Amber badge), kèm viền kim loại VIP amber.
- **Tìm kiếm & Trang chủ ([EventSearchListView.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/event/EventSearchListView.tsx))**: Sắp xếp ưu tiên: `is_featured` -> `is_urgent` -> `bumped_at` -> `created_at`.

---

### C. Quản lý Hạn Mức (Quota) & Tự Động Ẩn Tin Free sau 7 ngày
- **Kiểm tra Hạn mức ([PostJobView.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/PostJobView.tsx))**:
  - Gói Khởi Đầu (Free): Tối đa 1 tin/tháng.
  - Gói Doanh Nghiệp: Tối đa 5 tin/tháng.
  - Gói Sự Kiện Nhanh: 1 tin/lần mua.
  - Cảnh báo banner và khóa nút Đăng tin khi đã chạm hạn mức trong tháng.
- **Tự động hết hạn tin miễn phí ([EventSearchListView.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/event/EventSearchListView.tsx))**: Tự động lọc ẩn các tin đăng thuộc gói `free` đã tạo quá 7 ngày khỏi kết quả tìm kiếm.

---

### D. Đẩy tin lên đầu (Bump Event)
- **Giao diện ([OrgEventsTab.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/components/manage-events/OrgEventsTab.tsx))**: Bổ sung nút bấm tên lửa `Đẩy tin` cạnh mỗi chiến dịch.
- **Xử lý ([ManageEventsView.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/ManageEventsView.tsx))**: Cập nhật `bumped_at = NOW()` và đưa tin lên ngay đầu danh sách tìm kiếm. Yêu cầu gói VIP, nếu gói thường sẽ hiển thị thông báo hướng dẫn nâng cấp.

---

### E. Chấm công & Điểm danh bằng mã QR
- **Modal QR cho BTC ([EventCheckinQRModal.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/components/manage-events/EventCheckinQRModal.tsx))**:
  - Tự động sinh mã QR bằng `qrcode.react`.
  - Hiển thị mã PIN 6 số để nhập tay khi camera không quét được.
  - Nút sao chép liên kết điểm danh, in mã QR và mở trang check-in trực tiếp.
  - Tích hợp vào thanh công cụ của [OrgEventApplicationsDetail.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/components/manage-events/OrgEventApplicationsDetail.tsx).
- **Trang điểm danh sinh viên ([/checkin](file:///c:/Users/Admin/Desktop/eventmate-fe/src/app/checkin/page.tsx))**:
  - Hỗ trợ quét tự động qua URL `?event={id}&code={code}` hoặc nhập mã PIN 6 ký tự.
  - Tự động kiểm tra trạng thái trúng tuyển của sinh viên và cập nhật `attendance_status = 'present'`.

---

### F. Xuất File Excel / CSV Danh Sách Nhân Sự & Bảng Chấm Công
- **Tính năng ([OrgEventApplicationsDetail.tsx](file:///c:/Users/Admin/Desktop/eventmate-fe/src/features/organizer/components/manage-events/OrgEventApplicationsDetail.tsx))**:
  - Nút *"Xuất Excel / CSV"* ngay cạnh tab duyệt hồ sơ và điểm danh.
  - Xuất dữ liệu chuẩn UTF-8 BOM `\uFEFF` mở trực tiếp trên Microsoft Excel tiếng Việt không bị lỗi font: STT, Họ và tên, SĐT/Zalo, Email, Trường học, Vị trí, Trạng thái hồ sơ, Điểm danh, Điểm uy tín.

---

## 2. Kết quả kiểm thử
- `pnpm tsc --noEmit`: **Pass 100% (0 errors)**.
- Trình duyệt qua Chrome DevTools MCP:
  - `/pricing`: Đã bỏ showroom ảnh, hiển thị chuẩn các tính năng của 3 gói.
  - `/checkin`: Đã hiển thị form điểm danh QR/PIN.
  - `/manage-events`: Đã tích hợp nút đẩy tin, xuất Excel, mã QR.
  - `/post-job`: Đã tích hợp Quota banner và các toggle ghim tin ưu tiên.
