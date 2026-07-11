# Supabase Migrations

## Cách chạy migration

Do môi trường code chỉ có anon key (không chạy được DDL `CREATE TABLE` / `ALTER TABLE` / `CREATE POLICY` qua REST), bạn cần chạy file SQL migration thủ công trong **Supabase Dashboard**.

### Bước chạy

1. Mở Supabase Dashboard → project `vncgqeaslscpliadivod`
2. Vào **SQL Editor** → **New query**
3. Copy toàn bộ nội dung file migration (bắt đầu từ `0001_...`) → paste vào editor
4. Bấm **Run** (Ctrl+Enter)
5. Kiểm tra output không có lỗi

### File migration

| File | Mô tả | Phase |
|---|---|---|
| `0001_phase1_p0_schema_rls.sql` | Thêm bảng `interviews`, kích hoạt trigger `handle_new_user`, siết RLS (applications UPDATE, notifications INSERT, storage ownership), bỏ `GRANT ALL TO anon` | Phase 1 / P0 |

### Verify sau khi chạy

Sau khi chạy migration `0001`, verify bằng REST API (anon key):

```bash
# interviews table phải trả 200 (trước đây 404)
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/interviews?select=id&limit=1"
```

Hoặc trong app: tạo user mới → kiểm tra có row `profiles` tự động (trigger `handle_new_user` hoạt động).
