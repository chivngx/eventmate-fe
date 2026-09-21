<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI Testing & Verification Rules

Mọi tác vụ liên quan đến kiểm tra giao diện (UI), layout, responsive, CSS và tương tác người dùng **BẮT BUỘC** phải sử dụng công cụ **Chrome DevTools MCP** (`chrome-devtools-mcp`):
- **Xác thực code trước tiên**: Trước khi mở trình duyệt hay chụp screenshot, BẮT BUỘC phải đảm bảo code đúng: không lỗi cú pháp, không import sai, pass TypeScript (`pnpm tsc --noEmit`). Tránh việc code đang lỗi/crash mà đi test UI gây tốn token vô ích.
- **Không phỏng đoán kết quả UI**: Khi code đã sạch, phải kiểm tra trực tiếp trên tab trình duyệt (`http://localhost:3000`) qua `chrome-devtools-mcp`.
- **Minh chứng trực quan**: Phải dùng `take_screenshot` để xác nhận giao diện hiển thị đúng với thiết kế hoặc yêu cầu.
- **Kiểm tra tương tác & logic**: Dùng `take_snapshot`, `click`, `fill`, và `evaluate_script` để xác minh chức năng (nút bấm, dropdown, form, modal) hoạt động chính xác trước khi hoàn tất tác vụ.
- Chi tiết xem tại: [.agents/rules/ui-testing.md](file:///c:/Users/Admin/Desktop/eventmate-fe/.agents/rules/ui-testing.md).

# Directness & Token Efficiency Rules

- **Không tự ý bịa thêm UI/Component**: Khi người dùng yêu cầu bỏ/xóa thành phần, chỉ xóa đúng thành phần đó; tuyệt đối không tự chế thêm thẻ mẹo, banner, nút thừa ngoài thiết kế gốc.
- **Sửa trực diện, cấm làm phức tạp hóa**: Khi có phản hồi lỗi hiển thị/lệch CSS/vị trí, nhìn thẳng vào code CSS/Tailwind (`padding`, `margin`, `gap`, `sticky`, `position`) và sửa ngay lập tức. Cấm gọi tool lòng vòng hay đo đạc tọa độ JS không cần thiết.
- **Tiết kiệm token tối đa**: Trả lời ngắn gọn, thẳng vào vấn đề, không phân trần dài dòng.
- Chi tiết xem tại: [.agents/rules/simplicity-and-directness.md](file:///c:/Users/Admin/Desktop/eventmate-fe/.agents/rules/simplicity-and-directness.md).
