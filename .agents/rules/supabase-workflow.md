# Quy Tắc Sử Dụng Supabase MCP & Quản Lý Schema Database

Tài liệu này quy định các nguyên tắc bắt buộc khi làm việc với cơ sở dữ liệu Supabase trong dự án EventMate.

---

## 1. Luôn sử dụng Supabase MCP - Tuyệt đối không dùng Terminal / CLI

- **Bắt buộc dùng MCP**: Mọi thao tác truy vấn, kiểm tra cấu trúc schema, chạy DDL/DML, kiểm tra bảng, cột, RLS, functions, triggers, và sinh TypeScript types **BẮT BUỘC** phải gọi qua công cụ **Supabase MCP** (`execute_sql`, `list_tables`, `generate_typescript_types`, v.v.).
- **Cấm can thiệp qua Terminal**: Tuyệt đối **KHÔNG** dùng terminal để chạy các lệnh Supabase CLI như `npx supabase`, `supabase db push`, `supabase migration`, chạy script node ngoại vi hay lệnh curl tương tác database.

---

## 2. Đồng bộ hóa tức thì giữa Supabase và File SQL Migration

- Khi có bất kỳ thay đổi nào trên Supabase Database (thêm/sửa/xóa bảng, cột, trigger, function, policy, index, enum):
  1. **Cập nhật file SQL migration cục bộ**: Phải sửa ngay nội dung tương ứng trong thư mục `supabase/migrations/` để trạng thái code luôn phản ánh 100% database thực tế trên remote.
  2. **Đồng bộ TypeScript types**: Gọi tool MCP `generate_typescript_types` để cập nhật lại file `src/lib/database.types.ts`.
  3. **Kiểm tra biên dịch**: Chạy `pnpm tsc --noEmit` để đảm bảo code toàn bộ dự án tương thích hoàn toàn với schema mới.

---

## 3. Sửa trực tiếp vào 6 file SQL chuẩn - Tuyệt đối KHÔNG tạo thêm file mới

Dự án đã chuẩn hóa toàn bộ database schema thành **đúng 6 file phân hệ**:

1. `0001_tables_and_indexes.sql`: Bảng dữ liệu, cột, quan hệ khóa ngoại và chỉ mục (Indexes).
2. `0002_functions.sql`: Stored functions, procedures và các hàm RPC xử lý nghiệp vụ.
3. `0003_triggers.sql`: Các trình kích hoạt tự động (Triggers).
4. `0004_rls_policies.sql`: Toàn bộ chính sách bảo mật cấp hàng (Row Level Security & Policies).
5. `0005_grants.sql`: Phân quyền truy cập API (`GRANT` / `REVOKE` cho `anon`, `authenticated`, `service_role`).
6. `0006_storage.sql`: Cấu hình Storage buckets và Storage policies.

**Quy tắc bất di bất dịch**:
- Khi thay đổi schema, **sửa trực tiếp** vào đúng file phân hệ tương ứng trong 6 file trên.
- **TUYỆT ĐỐI KHÔNG** tạo thêm các file migration vá chắp (ví dụ: `0007_...`, `0008_...`, `0015_...`). Cơ sở dữ liệu của dự án phải luôn được giữ gọn gàng theo đúng 6 file phân hệ này.
