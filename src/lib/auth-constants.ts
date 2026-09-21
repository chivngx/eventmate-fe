/**
 * Shared Auth Constants & Configurations for EventMate Authentication
 */

export interface AuthTestimonial {
    id: number
    name: string
    role: string
    avatar: string
    quote: string
}

export const EMPLOYER_TESTIMONIALS: AuthTestimonial[] = [
    {
        id: 1,
        name: "Robert Fox",
        role: "Trưởng ban Tuyển dụng tại Danang Live Events",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        quote: "Nền tảng này giúp việc tìm kiếm và quản lý nhân sự sự kiện trở nên dễ dàng hơn bao giờ hết. Giao diện thân thiện, bộ lọc chính xác và chúng tôi nhanh chóng tìm được các bạn CTV nhiệt huyết, năng động.",
    },
    {
        id: 2,
        name: "Jane Cooper",
        role: "Giám Đốc Vận Hành Sự Kiện tại Sun World Wonders",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        quote: "Tìm kiếm nhân sự sự kiện từng là bài toán phức tạp, nhưng với EventMate mọi thứ đều nằm trong tầm kiểm soát. Cấu trúc bài bản và gợi ý ứng viên chính xác giúp chúng tôi tiết kiệm tối đa thời gian.",
    },
    {
        id: 3,
        name: "Bessie Cooper",
        role: "Hiring Manager at X",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
        quote: "After trying several job portals, this one stood out. The navigation was clean, the job quality impressive, and applying was fast and professional. I found great matches for my background.",
    },
]

export const JOBSEEKER_TESTIMONIALS: AuthTestimonial[] = [
    {
        id: 1,
        name: "Nguyễn Minh Anh",
        role: "Sinh viên ĐH Kinh tế Đà Nẵng • CTV Check-in Sự kiện",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        quote: "EventMate giúp mình tìm được các công việc sự kiện uy tín cuối tuần, vừa có thêm thu nhập vừa tích lũy kỹ năng thực tế. Lương nhận nhanh chóng và minh bạch!",
    },
    {
        id: 2,
        name: "Trần Đức Huy",
        role: "Trưởng nhóm Hậu cần Sự kiện FPT Danang",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        quote: "Từ khi dùng EventMate, việc ứng tuyển và nhận thông báo ca làm việc rất tiện lợi. Mình đã tham gia hơn 10 sự kiện lớn nhỏ tại Đà Nẵng.",
    },
    {
        id: 3,
        name: "Lê Phương Thảo",
        role: "MC & Lễ tân Sự kiện Đà Nẵng",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
        quote: "Hồ sơ online chuyên nghiệp giúp mình tạo ấn tượng tốt với các nhà tổ chức sự kiện. Rất khuyên dùng cho các bạn sinh viên năng động!",
    },
]

export const AUTH_HERO_IMAGES = {
    employer: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    jobseeker: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
} as const

export function isOrganizerRole(role: string | null | undefined): boolean {
    return role === "organizer" || role === "employer"
}
