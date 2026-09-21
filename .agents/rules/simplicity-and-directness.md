# Nguyên Tắc Tinh Gọn, Trực Diện & Tiết Kiệm Token (Directness & Token Efficiency)

Tài liệu này quy định các nguyên tắc hành vi bắt buộc của AI assistant trong dự án nhằm tránh lãng phí token, tránh làm phức tạp hóa vấn đề và tôn trọng thời gian của người dùng.

---

## 1. Không tự ý bịa thêm UI / Component ngoài yêu cầu (No Unrequested / AI-Invented Components)
- **Làm đúng và đủ**: Khi người dùng yêu cầu bỏ/xóa một thành phần (ví dụ: *"bỏ 2 cái đó đi"*), chỉ thực hiện xóa đúng các thành phần đó.
- **Tuyệt đối không tự ý "sáng tạo"**: Không được tự chế thêm các thẻ mẹo (tips), banner, hộp thoại, hay các nút bấm tự nghĩ ra để "lấp khoảng trống". Mọi component mới phải bám sát thiết kế gốc hoặc yêu cầu tường minh của người dùng.
- **Không nhân bản chức năng**: Không tạo 2 nút cùng làm một việc trên cùng một màn hình (ví dụ: 2 nút xem hồ sơ).

---

## 2. Sửa lỗi trực diện, không phức tạp hóa (Fix Directly, Avoid Overengineering)
- **Nhìn thẳng vào code**: Khi người dùng chỉ ra lỗi hiển thị (lệch vị trí, sai lề, thụt dòng, màu sai, font lệch), kiểm tra ngay file code chứa component đó:
  - Xem các class Tailwind/CSS cơ bản: `margin`, `padding`, `gap`, `items-start`, `position`, `sticky`, `top-*`,...
  - Sửa trực tiếp vào class/thuộc tính gây lỗi và lưu lại ngay.
- **Cấm gọi tool lòng vòng**: Tuyệt đối không chạy hàng loạt tool đo đạc tọa độ JS phức tạp (`evaluate_script`), không quay lại gọi tool Figma hay tra cứu lịch sử không liên quan khi lỗi hiển thị đã rõ ràng trên màn hình.

---

## 3. Tiết kiệm Token & Phản hồi súc tích (Token Efficiency & Concise Communication)
- **Hành động dứt khoát**: Ưu tiên đọc file liên quan -> sửa trực tiếp -> báo kết quả.
- **Câu trả lời ngắn gọn**: Đi thẳng vào giải pháp hoặc kết quả đã làm, không giải thích lý thuyết dông dài, không viết văn mẫu biện hộ.
