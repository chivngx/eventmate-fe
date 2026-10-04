-- 0012_standardize_event_job_positions.sql
-- Chuẩn hóa 10 vị trí nhân sự sự kiện EventMate

UPDATE public.events SET position_type = 'Điều phối sự kiện' WHERE position_type = 'Điều phối viên (Coordinator)';
UPDATE public.events SET position_type = 'Hậu cần & Sân khấu' WHERE position_type = 'Hậu cần & Setup';
UPDATE public.events SET position_type = 'MC & Hoạt náo' WHERE position_type = 'MC / Hoạt náo viên';
UPDATE public.events SET position_type = 'Lễ tân & Check-in' WHERE position_type = 'Hỗ trợ khách mời';
UPDATE public.events SET position_type = 'Quay phim & Chụp ảnh' WHERE position_type = 'CTV Truyền thông';

INSERT INTO public.job_positions (name, slug)
VALUES
    ('Tình nguyện viên', 'tinh-nguyen-vien'),
    ('Điều phối sự kiện', 'dieu-phoi-su-kien'),
    ('Quay phim & Chụp ảnh', 'quay-phim-chup-anh'),
    ('Hậu cần & Sân khấu', 'hau-can-san-khau'),
    ('MC & Hoạt náo', 'mc-hoat-nao'),
    ('Lễ tân & Check-in', 'le-tan-check-in'),
    ('PG & PB Sự kiện', 'pg-pb-su-kien'),
    ('Phục vụ tiệc (Banquet)', 'phuc-vu-tiec-banquet'),
    ('Pha chế sự kiện', 'pha-che-su-kien'),
    ('Mascot & Biểu diễn', 'mascot-bieu-dien')
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;
