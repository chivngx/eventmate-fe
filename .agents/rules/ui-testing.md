# UI Testing & Verification Rules (Chrome DevTools Required)

Mọi tác vụ liên quan đến kiểm tra giao diện (UI), layout, responsive, CSS và luồng tương tác người dùng **BẮT BUỘC** phải sử dụng công cụ **Chrome DevTools MCP** (`chrome-devtools-mcp`).

---

## 1. Nguyên Tắc Bắt Buộc (Mandatory Rule)
- **Kiểm tra đúng code TRƯỚC khi test UI**: Tuyệt đối không vội vàng mở trình duyệt hay chụp screenshot khi chưa xác nhận code có đúng hay không. Phải đảm bảo code không có lỗi cú pháp, broken import, hoặc lỗi TypeScript (`pnpm tsc --noEmit` hoặc build sạch). Code lỗi mà test UI sẽ chỉ gặp màn hình lỗi hoặc crash, làm tốn token vô ích.
- **Không phỏng đoán kết quả giao diện**: Sau khi code đã chuẩn cú pháp, bất kỳ khi nào tạo mới hoặc chỉnh sửa component, CSS, layout,... phải kiểm tra thực tế trên trình duyệt bằng `chrome-devtools-mcp`.
- **Minh chứng trực quan**: Mọi kết quả kiểm tra UI phải có screenshot (`take_screenshot`) hoặc snapshot kiểm tra cụ thể để xác nhận.

---

## 2. Quy Trình Kiểm Tra Chuẩn

### Bước 0: Xác thực code (Bắt buộc trước tiên)
1. Kiểm tra tính toàn vẹn của code vừa sửa: không import sai file, không thừa/thiếu tham số, không sai cú pháp JSX/TSX.
2. Xác minh Type/Build: Đảm bảo code pass TypeScript (`pnpm tsc --noEmit`) và không gây lỗi crash server.
3. Chỉ khi code chuẩn 100% mới tiến hành kiểm tra hiển thị trên trình duyệt.

### Bước 1: Kết nối & Điều hướng trang
1. Gọi `chrome-devtools-mcp:list_pages` để kiểm tra danh sách tab đang mở.
2. Chọn tab chạy môi trường dev (`http://localhost:3000`) qua `chrome-devtools-mcp:select_page`. Nếu chưa có, tạo hoặc điều hướng bằng `chrome-devtools-mcp:navigate_page`.

### Bước 2: Kiểm tra cấu trúc & Tương tác (Interactions)
- **Cấu trúc DOM & accessibility**: Dùng `chrome-devtools-mcp:take_snapshot` để lấy cấu trúc các phần tử kèm UID.
- **Tương tác**: Dùng `chrome-devtools-mcp:click`, `fill`, `hover`, `press_key` để test các thao tác click nút, gõ input, mở menu dropdown, đóng modal.
- **Kiểm tra logic & giá trị phần tử**: Dùng `chrome-devtools-mcp:evaluate_script` khi cần kiểm tra state, các option trong `<select>`, giá trị text hoặc thuộc tính CSS động.

### Bước 3: Chụp ảnh xác thực (Visual Proof)
- Gọi `chrome-devtools-mcp:take_screenshot` để chụp màn hình trực quan.
- Đối chiếu giao diện thực tế với thiết kế Figma hoặc yêu cầu người dùng (căn chỉnh, khoảng cách padding/margin, màu sắc, font chữ).

### Bước 4: Kiểm tra Console & Responsive
- **Console Errors**: Dùng `chrome-devtools-mcp:list_console_messages` để đảm bảo không có cảnh báo nghiêm trọng, lỗi Hydration, hoặc crash script.
- **Responsive Viewport**: Dùng `chrome-devtools-mcp:resize_page` hoặc `emulate` để kiểm tra độ tương thích trên các kích thước màn hình chính:
  - Mobile: `390x844`
  - Tablet: `768x1024`
  - Desktop: `1280x800` hoặc `1440x900`
