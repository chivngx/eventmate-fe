# Giải pháp Redesign Toàn Diện — Từ Job Board → Event Platform

## Vấn đề cốt lõi
Toàn bộ UX vocabulary + layout philosophy vẫn là **job board (TopCV)**:
- Ngôn ngữ: "việc làm" (32), "ứng tuyển" (65), "tuyển dụng" (60), "hồ sơ CV" (23)
- Bố cục: sidebar+main 2-col (20), filter pill bars (5), dense stat cards
- Màu: emerald/primary dùng 335 lần (giống TopCV green everywhere)

## Giải pháp: 3 lớp thay đổi

### Lớp 1: THAY ĐỔI NGÔN NGỮ (job board → event platform)
| Hiện tại (TopCV) | Sửa thành (Event) |
|---|---|
| việc làm | sự kiện |
| Việc làm sự kiện | Sự kiện |
| ứng tuyển / Ứng tuyển | đăng ký / Đăng ký tham gia |
| ứng viên | người tham gia |
| tin tuyển dụng | sự kiện |
| Tuyển dụng | Tuyển nhân sự |
| hồ sơ CV | hồ sơ năng lực |
| mô tả công việc | chi tiết sự kiện |
| địa điểm làm việc | địa điểm tổ chức |
| hạn nộp hồ sơ | hạn đăng ký |
| việc làm đã lưu | sự kiện đã lưu |
| việc làm đã ứng tuyển | sự kiện đã đăng ký |
| việc làm theo vị trí | sự kiện theo vai trò |
| việc làm theo sự kiện | sự kiện theo loại |
| Lưu việc làm | Lưu sự kiện |
| Bảng điều khiển (organizer) | Quản lý sự kiện |
| Đề xuất CV | Đề xuất người tham gia |
| Báo cáo tuyển dụng | Thống kê sự kiện |
| Đơn ứng tuyển | Đơn đăng ký |
| Duyệt đơn | Duyệt đăng ký |

### Lớp 2: THAY ĐỔI BỐ CỤC (dense → spacious event platform)
1. **Navbar**: "Việc làm" dropdown → "Sự kiện" nav link + "Ban tổ chức" link. Bỏ mega menu dày đặc.
2. **Hero**: Bỏ RotatingText (TopCV pattern) → tiêu đề đơn giản "Sự kiện đang tuyển nhân sự tại Đà Nẵng"
3. **Filters**: Bỏ QuickFilters pill bar dày đặc → filter đơn giản (dropdown khu vực + dropdown loại sự kiện)
4. **Event grid**: Giữ EventCard (user OK) nhưng grid rộng hơn (gap-6 thay gap-4)
5. **Detail page**: "Ứng tuyển" → "Đăng ký tham gia", "Mô tả công việc" → "Chi tiết sự kiện"
6. **Dashboards**: "Tin tuyển dụng" → "Sự kiện", "Ứng viên" → "Người đăng ký"
7. **MyJobs/SavedJobs**: "Việc làm đã ứng tuyển" → "Sự kiện đã đăng ký", "Việc làm đã lưu" → "Sự kiện đã lưu"

### Lớp 3: GIẢM EMERALD (335 → ~100)
- Chỉ dùng primary cho: nút CTA chính, link active, logo accent
- Tất cả hover/active states → dùng slate (muted/accent) thay emerald
- Category badges → dùng slate thay emerald
- Date block EventCard → giữ primary (OK)
- Icons → slate-400 thay primary

## Thứ tự thực thi
1. Bulk thay ngôn ngữ (script sed toàn bộ src/)
2. Redesign Navbar (bỏ mega menu, đơn giản hóa)
3. Redesign StudentHero (bỏ RotatingText, đơn giản)
4. Redesign QuickFilters (bỏ pill bar, dùng dropdown)
5. Redesign EventDetail (đổi language + layout)
6. Redesign dashboards (đổi language)
7. Giảm emerald usage (bulk replace hover/active states)
8. Verify + push
