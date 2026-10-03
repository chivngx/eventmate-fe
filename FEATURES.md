# 🌟 EventMate — Tài Liệu Đặc Tả Tính Năng & Chức Năng Hệ Thống

> **EventMate** là nền tảng kết nối nhân sự sự kiện & việc làm thời vụ thông minh hàng đầu tại TP. Đà Nẵng. Hệ thống đóng vai trò cầu nối hai chiều giữa **Ứng viên / Sinh viên** năng động và các **Ban tổ chức / Doanh nghiệp sự kiện** uy tín.

---

## 📌 Bảng Ma Trận Phân Quyền Tính Năng (Role-Permission Matrix)

| Nhóm Tính Năng | Khách vãng lai (Guest) | Ứng viên (Student) | Ban tổ chức (Organizer) | Quản trị viên (Admin) |
| :--- | :---: | :---: | :---: | :---: |
| **Khám phá sự kiện & Xem chi tiết** | ✅ | ✅ | ✅ | ✅ |
| **Tìm kiếm & Bộ lọc nâng cao** | ✅ | ✅ | ✅ | ✅ |
| **Đăng ký / Đăng nhập / Khôi phục mật khẩu** | ✅ | ✅ | ✅ | ✅ |
| **Hồ sơ năng lực sự kiện (Event Profile)** | ❌ | ✅ | ❌ | ❌ |
| **Đo lường độ hoàn thiện hồ sơ (Quality Gauge)** | ❌ | ✅ | ❌ | ❌ |
| **Nộp đơn ứng tuyển sự kiện** | ❌ | ✅ | ❌ | ❌ |
| **Lưu sự kiện yêu thích (Bookmark)** | ❌ | ✅ | ❌ | ❌ |
| **Quản lý đơn ứng tuyển (My Events)** | ❌ | ✅ | ❌ | ❌ |
| **Lịch ca làm đã được duyệt (Upcoming Shifts)** | ❌ | ✅ | ❌ | ❌ |
| **Điểm danh sự kiện (Check-in QR)** | ❌ | ✅ | ❌ | ❌ |
| **Nhận Giấy chứng nhận điện tử (E-Certificate)** | ❌ | ✅ | ❌ | ❌ |
| **Đăng tin tuyển dụng sự kiện mới** | ❌ | ❌ | ✅ | ❌ |
| **Quản lý sự kiện & Duyệt ứng viên** | ❌ | ❌ | ✅ | ❌ |
| **Tạo mã QR Check-in sự kiện** | ❌ | ❌ | ✅ | ❌ |
| **Mua gói Sự Kiện Nhanh / Gói Doanh Nghiệp** | ❌ | ❌ | ✅ | ❌ |
| **Chat thời gian thực (Real-time Chat)** | ❌ | ✅ | ✅ | ❌ |
| **Thông báo thông minh (Smart Notifications)** | ❌ | ✅ | ✅ | ✅ |
| **Xác thực Ban tổ chức (Verify Badge)** | ❌ | ❌ | ❌ | ✅ |
| **Kiểm duyệt sự kiện & Quản trị hệ thống** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 1. Nhóm Tính Năng Toàn Cục & Khám Phá (Public & Global)

### 1.1. Trang chủ (Home Landing)
- **Hero Banner:** Tiêu đề động, tìm kiếm nhanh theo từ khóa, vị trí công việc và quận huyện tại Đà Nẵng.
- **Biểu đồ thống kê thời gian thực (Realtime Metrics):** Hiển thị số lượng ứng viên đã kết nối thành công, số việc làm đang tuyển và tỷ lệ duyệt.
- **Sự kiện mới nhất (Newest Events):** Thẻ thông tin sự kiện với mức thù lao, hạn nộp hồ sơ, địa điểm và số lượng tuyển.
- **Đơn vị tổ chức hàng đầu (Top Organizers):** Giới thiệu các đơn vị uy tín có huy hiệu xác thực.
- **Quy trình hoạt động (How It Works):** Minh họa 3 bước ứng tuyển / tuyển dụng nhanh chóng.
- **Cẩm nang sự kiện (Event Blog):** Bài viết chia sẻ kinh nghiệm thực tế.

### 1.2. Tìm kiếm & Bộ lọc nâng cao (`/events`)
- **Tìm kiếm tức thì (Live Search):** Tìm theo tên sự kiện, công ty, kỹ năng hoặc địa điểm.
- **Bộ lọc đa chiều (Filter Sidebar Layout):**
  - **Quận / Huyện:** Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn, Cẩm Lệ, Liên Chiểu...
  - **Loại hình vị trí:** PG/PB, MC, Lễ tân, Hậu cần, Hỗ trợ kỹ thuật âm thanh/ánh sáng, Điều phối viên...
  - **Mức thù lao:** Dưới 200k/ca, 200k - 500k/ca, Trên 500k/ca, Lương theo giờ hoặc trọn gói.
  - **Thời gian diễn ra:** Hôm nay, Cuối tuần này, Tuần tới...
- **Gắn chip bộ lọc chủ động:** Dễ dàng bỏ chọn từng tiêu chí lọc chỉ với 1 click.
- **Phân trang dữ liệu (Pagination):** Chuyển trang mượt mà, tối ưu hiệu năng.

### 1.3. Chi tiết sự kiện (`/events/[id]`)
- **Thông tin toàn diện:** Tiêu đề, tên ban tổ chức kèm huy hiệu xác thực, thời gian, địa điểm, mức thù lao, hạn nộp hồ sơ.
- **Nút Ứng tuyển nhanh (Apply Button):** Kiểm tra trạng thái đơn nộp, thời hạn nhận hồ sơ và tình trạng hoàn thiện hồ sơ.
- **Nút Nhắn tin (Message Button):** Mở hộp thoại chat trực tiếp với người phụ trách sự kiện.
- **Lưu sự kiện (Bookmark):** Lưu lại sự kiện vào danh sách cá nhân để xem sau.
- **Widget đo lường hồ sơ ứng viên:** Vòng tròn tiến trình % hoàn thiện hồ sơ ngay tại trang sự kiện.
- **Gợi ý sự kiện tương tự (Similar Jobs):** Gợi ý các vị trí phù hợp dựa trên vai trò đang xem.

### 1.4. Đơn vị tổ chức & Doanh nghiệp (`/companies` & `/companies/[slug]`)
- **Danh bạ đơn vị tổ chức:** Danh sách các doanh nghiệp / BTC sự kiện tại Đà Nẵng kèm số lượng sự kiện đang tuyển.
- **Huy hiệu xác minh (Verified Badge) & Huy hiệu VIP:** Đảm bảo độ tin cậy của nhà tuyển dụng.
- **Trang hồ sơ đơn vị:** Xem bài giới thiệu công ty, địa chỉ văn phòng, các sự kiện đang mở và lịch sử sự kiện đã qua.

---

## 🎓 2. Nhóm Tính Năng Ứng Viên / Sinh Viên (Student / Jobseeker)

### 2.1. Hồ sơ năng lực sự kiện (Event Profile)
- **Điểm chất lượng hồ sơ (Profile Quality Score):** Thanh đo phần trăm hoàn thiện hồ sơ, khuyến khích ứng viên cập nhật đầy đủ thông tin để tăng cơ hội trúng tuyển.
- **Thông tin cá nhân & ngoại hình:** Họ tên, số điện thoại (Zalo), email, ngày sinh, trường đại học/cao đẳng, quận cư trú tại Đà Nẵng, chiều cao, cân nặng, ảnh chân dung / toàn thân cho công việc casting PG/PB.
- **Giới thiệu bản thân (About Me):** Mô tả định hướng cá nhân, tính cách và tác phong làm việc.
- **Kinh nghiệm sự kiện thực chiến (Event Experience):** Ghi nhận chi tiết các sự kiện từng tham gia, vai trò đảm nhận và đơn vị tổ chức.
- **Kỹ năng sự kiện (Skills):** Hệ thống gắn tag kỹ năng linh hoạt (hoạt náo, lễ tân tiệc cưới, kiểm soát vé, set up âm thanh...).
- **Điểm tin cậy & Đánh giá (Reliability Score):** Tích lũy điểm uy tín qua các ca làm thành công và điểm danh đúng giờ; ngăn ngừa tình trạng bùng ca.
- **Xem trước hồ sơ (Event Profile Preview Modal):** Xem nhanh bản hiển thị profile dưới góc nhìn của nhà tuyển dụng.

### 2.2. Bảng điều khiển Sinh viên (Student Dashboard)
- **Thống kê nhanh:** Số đơn đã nộp, số đơn đang duyệt, số đơn được nhận, số sự kiện đã hoàn thành.
- **Lịch ca làm đã được duyệt (StudentUpcomingShifts):** Lịch trình sự kiện thực tế, hiển thị ngày giờ, địa điểm tập trung, mức thù lao và thông tin ban tổ chức cho các ca làm đã trúng tuyển.
- **Biểu đồ Donut phân bổ kết quả (ApplicationStatusDonut):** Thống kê tỷ lệ thành công của các đơn ứng tuyển.
- **Widget sự kiện đã lưu (Saved Jobs Widget):** Quản lý và truy cập nhanh các việc làm yêu thích.
- **Widget tin nhắn mới nhất (Recent Messages Widget):** Đọc nhanh và điều hướng tức thì tới các cuộc trò chuyện.

### 2.3. Quản lý sự kiện của tôi (My Events)
- **Lọc theo trạng thái ứng tuyển:**
  - `pending`: Đang chờ nhà tuyển dụng xem xét.
  - `accepted`: Đã được duyệt trúng tuyển.
  - `rejected`: Đơn ứng tuyển bị từ chối kèm lý do.
  - `completed`: Đã hoàn thành sự kiện.
- **Rút đơn ứng tuyển:** Cho phép hủy đơn ứng tuyển khi sự kiện còn trong thời hạn nhận hồ sơ.
- **Sự kiện đã lưu (Saved Events):** Xem lại các sự kiện đã đánh dấu yêu thích.

### 2.4. Điểm danh sự kiện & Nhận chứng nhận (Check-in & Certificate)
- **Điểm danh tức thì qua mã QR (`/checkin`):** Quét mã QR tại cổng sự kiện bằng điện thoại để xác nhận có mặt.
- **Giấy chứng nhận điện tử (E-Certificate):**
  - Tự động cấp sau khi hoàn thành sự kiện và được BTC xác nhận điểm danh.
  - Mỗi chứng nhận sở hữu mã định danh chống giả mạo duy nhất (VD: `EM-2026-XXXXXX`).
  - Hỗ trợ in ấn và tải về định dạng A4 chuẩn trang trọng.

---

## 🏢 3. Nhóm Tính Năng Ban Tổ Chức (Organizer / Employer)

### 3.1. Đăng tin tuyển dụng sự kiện (Post Job)
- **Biểu mẫu đăng tin chuẩn hóa:**
  - Nhập tiêu đề sự kiện, loại hình vị trí, số lượng nhân sự cần tuyển.
  - Cấu hình mức thù lao (theo giờ, theo ca, hoặc trọn gói).
  - Cấu hình ngày giờ diễn ra, hạn chót nộp đơn (`deadline`).
  - Địa điểm tổ chức chi tiết (quận/huyện và địa chỉ cụ thể tại Đà Nẵng).
  - Mô tả công việc, yêu cầu ứng viên, quyền lợi & hỗ trợ (ăn uống, xe đưa đón, chứng chỉ...).
  - Tải lên ảnh banner sự kiện bắt mắt.

### 3.2. Bảng điều khiển Ban tổ chức (Organizer Dashboard)
- **Số liệu tổng quan:** Tổng tin đăng, tổng lượt hồ sơ nộp vào, số lượng ứng viên đã duyệt, tỷ lệ phản hồi.
- **Biểu đồ thống kê tuyển dụng (JobStatisticsChart):** Giám sát hiệu quả tiếp cận ứng viên theo tuần/tháng.
- **Tình trạng gói cước:** Theo dõi số lượt đăng tin Sự Kiện Nhanh còn lại và hạn dùng của gói dịch vụ.

### 3.3. Quản lý Sự kiện & Duyệt ứng viên (Manage Events & Candidate Review)
- **Danh sách sự kiện đang quản lý:** Chỉnh sửa bài đăng, gia hạn hoặc đóng đơn tuyển dụng sớm.
- **Cửa sổ duyệt ứng viên chuyên sâu (Candidate Review Modal):**
  - Xem danh sách toàn bộ hồ sơ nộp vào từng sự kiện.
  - Xem thông tin chi tiết ứng viên: Trường học, kinh nghiệm sự kiện, điểm tin cậy, thông tin Zalo liên hệ.
  - Thao tác **Duyệt (`Accept`)** hoặc **Từ chối (`Reject`)** kèm ghi chú phản hồi.
  - Mở chat trực tiếp với ứng viên ngay trong màn hình duyệt.

### 3.4. Quản lý điểm danh mã QR (QR Code Event Check-in)
- **Sinh mã QR và Code ngắn cho từng sự kiện:** Hiển thị mã QR trực tiếp trên màn hình hoặc in ra đặt tại cổng sự kiện.
- **Xác thực thông minh:** Chỉ những ứng viên đã được BTC duyệt (`accepted`) mới có thể điểm danh hợp lệ; ngăn ngừa điểm danh giả mạo.

---

## 💬 4. Hệ Thống Nhắn Tin Thời Gian Thực (Real-Time Chat)

- **Hạ tầng Supabase Realtime:** Truyền nhận tin nhắn tức thì với độ trễ cực thấp.
- **Giao diện 2 cột chuẩn trải nghiệm:** Danh sách cuộc trò chuyện bên trái, khung chat chính bên phải, tối ưu mượt mà trên di động.
- **Đính kèm hình ảnh:** Gửi hình ảnh thực tế sự kiện hoặc chụp trang phục trực tiếp qua chat.
- **Trích dẫn trả lời tin nhắn (Quote Reply):** Trích dẫn nội dung cụ thể kèm nút hủy linh hoạt.
- **Đánh dấu sao (Starred):** Ghim và đánh dấu sao các cuộc hội thoại quan trọng.
- **Chấm thông báo chưa đọc (Unread Indicator) & Trạng thái trực tuyến.**

---

## 🔔 5. Hệ Thống Thông Báo Thông Minh (Notifications)

- **Notification Dropdown trên Notch Navbar:** Hiển thị số thông báo mới chưa đọc kèm xem nhanh tiêu đề.
- **Trang trung tâm thông báo (`/notifications`):**
  - Phân loại rõ ràng: Thông báo trạng thái ứng tuyển, phân công ca làm, tin nhắn mới.
  - Đánh dấu đã đọc tất cả (`Mark all as read`) hoặc xóa thông báo.
  - Điều hướng thông minh: Bấm vào thông báo tự động chuyển đến đúng sự kiện hoặc cuộc hội thoại tương ứng.

---

## 💳 6. Bảng Giá & Thanh Toán (Pricing & Checkout)

### 6.1. Các gói cước tối ưu cho sự kiện (`/pricing`)
- **Gói Khởi Đầu (0đ - Miễn phí):** 
  - Hạn mức 1 sự kiện / tháng.
  - Hiển thị 7 ngày, nhận và duyệt hồ sơ miễn phí.
  - Phù hợp với cá nhân, CLB sinh viên hoặc quán nhỏ tuyển số lượng ít.
- **Gói Sự Kiện Nhanh (99.000đ / sự kiện):**
  - Hạn mức 1 sự kiện trọn gói.
  - Ghim tin HOT & Tuyển Gấp 7 ngày.
  - Công cụ Điểm danh & Chấm công QR.
  - Tự động cấp link nhóm Zalo khi duyệt đơn.
  - Bộ lọc ứng viên có Điểm uy tín cao & cấp Giấy chứng nhận E-Certificate.
- **Gói Doanh Nghiệp (499.000đ / tháng):**
  - Tối đa 5 sự kiện hoạt động cùng lúc trong tháng.
  - Ghim tin nổi bật, huy hiệu Doanh nghiệp VIP & Ưu tiên tìm kiếm.
  - Xuất file Excel danh sách nhân sự & chấm công.
  - Tin nhắn trực tiếp trao đổi với ứng viên, hỗ trợ riêng 24/7.
  - Thanh toán linh hoạt theo tháng, không ràng buộc hợp đồng năm cồng kềnh.

### 6.2. Thanh toán & Biên lai điện tử (`/checkout`)
- **Tóm tắt đơn hàng (Order Summary):** Hiển thị chi tiết gói, quyền lợi và mức phí.
- **Thanh toán chuyển khoản VietQR:** Tự động tạo mã QR quét ngân hàng qua cổng payOS kèm đúng số tiền và nội dung chuyển khoản.
- **Biên lai hóa đơn điện tử (E-Receipt Printer Animation):** Xem và in hiệu ứng biên lai thanh toán chuẩn format.

---

## 🛡️ 7. Cổng Quản Trị Hệ Thống (Admin Portal - `/admin`)

- **Bảng điều khiển vĩ mô:** Thống kê tổng doanh thu, số lượng sự kiện, số lượng ứng viên và ban tổ chức.
- **Xác thực Ban tổ chức (Organizer Verification):** Kiểm tra hồ sơ pháp lý, kích hoạt hoặc thu hồi huy hiệu xanh (`is_verified`).
- **Quản lý người dùng:** Tìm kiếm, kiểm tra hoạt động, cảnh báo hoặc khóa các tài khoản vi phạm.
- **Kiểm duyệt sự kiện:** Duyệt nội dung các sự kiện mới đăng, xóa các bài đăng giả mạo hoặc vi phạm chính sách.
- **Lịch sử giao dịch:** Đối soát các đơn hàng đăng ký gói VIP và thanh toán dịch vụ.

---

## 🎨 8. Thiết Kế UI/UX & Công Nghệ (Design System & Tech Stack)

- **Ngôn ngữ thiết kế:** Chuẩn hóa 100% theo phong cách **Option 3: Nordic Minimalist & High-Contrast Monochrome** (Màu đen Obsidian `#18181B`, Nền Canvas dịu mắt `#FAFAFA`, Điểm nhấn Ngọc Lục Bảo `#10B981`).
- **Thanh điều hướng Notch Navbar:** Dock nổi bo góc mềm, cố định phía trên, không giật layout (zero layout shift), tích hợp popover tìm kiếm nhanh và menu ngăn kéo trên di động.
- **Công nghệ nền tảng:**
  - **Frontend:** Next.js (App Router), React, TypeScript.
  - **Styling:** TailwindCSS, Lucide Icons, Radix UI Primitives.
  - **Backend & Database:** Supabase (PostgreSQL, Realtime Subscriptions, Supabase Storage, Auth).
- **Trang thông tin phụ trợ:**
  - [Về chúng tôi (`/about`)](file:///c:/Users/Admin/Desktop/eventmate-fe/src/app/about/page.tsx)
  - [Liên hệ (`/contact`)](file:///c:/Users/Admin/Desktop/eventmate-fe/src/app/contact/page.tsx)
  - [Trung tâm trợ giúp / FAQ (`/help`)](file:///c:/Users/Admin/Desktop/eventmate-fe/src/app/help/page.tsx)
  - [Chính sách bảo mật (`/privacy`)](file:///c:/Users/Admin/Desktop/eventmate-fe/src/app/privacy/page.tsx)
  - [Cẩm nang nghề sự kiện (`/blog`)](file:///c:/Users/Admin/Desktop/eventmate-fe/src/app/blog/page.tsx)
