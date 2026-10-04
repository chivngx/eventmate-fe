export interface BlogPostItem {
  id: string
  title: string
  description: string
  excerpt: string
  content: string
  author: string
  date: string
  category: "all" | "jobseeker" | "industry" | "employer"
  tags: string[]
  imageSrc: string
  imageUrl: string
}

export const BLOG_POSTS: BlogPostItem[] = [
  {
    id: "bi-quyet-viet-cv-su-kien",
    title: "Bí quyết viết CV xin việc sự kiện gây ấn tượng mạnh với nhà tuyển dụng",
    description: "Cách làm nổi bật kinh nghiệm thực chiến, điểm tín nhiệm và kỹ năng xử lý tình huống để tăng 80% cơ hội trúng tuyển sự kiện lớn.",
    excerpt: "Một bộ hồ sơ chuẩn chỉnh và làm nổi bật kinh nghiệm thực chiến giúp bạn tăng 80% cơ hội trúng tuyển vào các vị trí điều phối, lễ tân hay hậu cần sự kiện lớn tại Đà Nẵng.",
    author: "Ban Biên Tập EventMate",
    date: "15 Th03, 2026",
    category: "jobseeker",
    tags: ["Mẹo viết CV", "Cẩm nang tìm việc"],
    imageSrc: "/images/advice/blog-1.png",
    imageUrl: "/images/advice/blog-1.png",
    content: `Ngành sự kiện luôn đòi hỏi tốc độ, sự thích ứng và tinh thần trách nhiệm cao. Khi ứng tuyển vào các vị trí nhân sự sự kiện (Event Crew, Check-in Coordinator, MC hay Stage Support), hồ sơ của bạn cần thể hiện rõ tính cách năng động và khả năng làm việc nhóm.

1. Làm nổi bật các sự kiện từng tham gia: Đừng chỉ liệt kê chức danh chung chung, hãy ghi rõ quy mô sự kiện (ví dụ: Hội nghị 500 khách tại Furama, Lễ hội âm nhạc 5.000 khán giả) và nhiệm vụ cụ thể bạn đảm nhận.
2. Nêu bật các kỹ năng mềm quan trọng: Giao tiếp linh hoạt, phản xạ xử lý sự cố, chịu được áp lực thời gian và sự tỉ mỉ.
3. Điểm tín nhiệm và cam kết: Ban tổ chức đặc biệt trân trọng những ứng viên đúng giờ, tuân thủ ca làm và không bỏ ca sát giờ. Điểm tín nhiệm trên EventMate chính là minh chứng rõ nhất cho độ tin cậy của bạn!`,
  },
  {
    id: "5-ky-nang-event-coordinator",
    title: "5 Kỹ năng cốt lõi của một Event Coordinator chuyên nghiệp",
    description: "Khám phá cách quản lý rủi ro, phân bổ timeline và điều phối các bộ phận ăn khớp khi vận hành sự kiện với hàng ngàn khách tham dự.",
    excerpt: "Khám phá cách quản lý rủi ro, phân bổ timeline và điều phối các bộ phận ăn khớp khi vận hành sự kiện trực tiếp với hàng ngàn khách tham dự tại các trung tâm hội nghị Đà Nẵng.",
    author: "Minh Trí (Lead Coordinator)",
    date: "28 Th02, 2026",
    category: "industry",
    tags: ["Kỹ năng mềm", "Điều phối"],
    imageSrc: "/images/advice/blog-2.png",
    imageUrl: "/images/advice/blog-2.png",
    content: `Để một sự kiện diễn ra suôn sẻ, vai trò của người điều phối (Event Coordinator) là mắt xích không thể thiếu kết nối ban tổ chức và nhân sự hiện trường.

1. Khả năng bao quát và chú ý tiểu tiết: Từ khâu sắp xếp bàn đón khách, hệ thống âm thanh micro cho đến biển chỉ dẫn check-in.
2. Quản lý thời gian theo Timeline chặt chẽ: Mỗi tiết mục, bài phát biểu đều có khung giờ vàng cần tuân thủ nghiêm ngặt.
3. Kỹ năng giao tiếp qua bộ đàm: Ngắn gọn, rõ ràng, tập trung vào giải pháp thay vì phàn nàn sự cố.
4. Tinh thần bình tĩnh trước khủng hoảng: Luôn có phương án dự phòng (Plan B) cho thời tiết, sự cố kỹ thuật và phát sinh ngoài ý muốn.
5. Thái độ phục vụ và chăm sóc khách hàng: Nụ cười và sự niềm nở luôn tạo ấn tượng đẹp nhất cho người tham dự.`,
  },
  {
    id: "quy-tac-khong-bo-ca-diem-tin-nhiem",
    title: "Điểm tín nhiệm EventMate: Chìa khóa vàng nhận việc nhanh trong 1-2 ngày",
    description: "Tìm hiểu cơ chế chấm điểm độ tin cậy, nguyên tắc nhận ca và cách xây dựng uy tín cá nhân để được các đơn vị tổ chức ưu tiên.",
    excerpt: "Hệ thống điểm tín nhiệm minh bạch giúp nhân sự sự kiện uy tín nhận được lời mời làm việc trực tiếp từ các ban tổ chức lớn mà không cần chờ duyệt lâu.",
    author: "Đức Huy (Community Lead)",
    date: "02 Th03, 2026",
    category: "jobseeker",
    tags: ["Điểm tín nhiệm", "Cẩm nang tìm việc"],
    imageSrc: "/images/advice/blog-3.png",
    imageUrl: "/images/advice/blog-3.png",
    content: `Tại EventMate, độ tin cậy là tiêu chí quan trọng nhất để kết nối người tìm việc với nhà tổ chức sự kiện.

1. Điểm tín nhiệm được tính thế nào: Khởi đầu từ 100 điểm, bạn sẽ được cộng điểm khi hoàn thành ca đúng giờ, được nhà tổ chức đánh giá 5 sao và tích lũy số giờ làm việc uy tín.
2. Hậu quả của việc bỏ ca phút chót: Hủy ca sát giờ hoặc vắng mặt không lý do sẽ bị trừ điểm nặng và hạn chế quyền ứng tuyển vào các sự kiện trả lương cao.
3. Đặc quyền của nhân sự điểm cao: Được gán huy hiệu Xác thực, ưu tiên hiển thị hồ sơ hàng đầu cho các nhà tuyển dụng và nhận việc trong vòng 1-2 ngày.`,
  },
  {
    id: "chuan-bi-hanh-trang-event-crew",
    title: "Hành trang cần chuẩn bị khi đi làm Event Crew lần đầu tại Đà Nẵng",
    description: "Trang phục dresscode, tác phong sử dụng bộ đàm, mang gì trong túi và cách phối hợp nhịp nhàng với ban tổ chức tại hiện trường.",
    excerpt: "Chuẩn bị chu đáo từ trang phục, phụ kiện cá nhân đến tâm thế làm việc sẽ giúp bạn tự tin tỏa sáng ngay từ ca trực đầu tiên.",
    author: "Hoàng Yến (Event Supervisor)",
    date: "24 Th02, 2026",
    category: "jobseeker",
    tags: ["Kinh nghiệm", "Event Crew"],
    imageSrc: "/images/advice/blog-4.png",
    imageUrl: "/images/advice/blog-4.png",
    content: `Lần đầu bước chân vào ngành chạy sự kiện có thể khiến bạn bỡ ngỡ trước nhịp độ hối hả. Dưới đây là những điều bạn nhất định phải chuẩn bị:

1. Trang phục và giày dép: Một đôi giày thể thao đen êm ái là vật bất ly thân vì bạn sẽ phải đứng hoặc di chuyển liên tục 6-8 tiếng. Luôn tuân thủ dresscode quần tây/kaki đen áo polo hoặc đồng phục BTC.
2. Vật dụng cá nhân tiện ích: Sạc dự phòng, khăn giấy, bút dạ viết bảng, chai nước cá nhân và tai nghe kết nối bộ đàm.
3. Tác phong đúng giờ: Luôn có mặt trước giờ Briefing ít nhất 15-20 phút để nhận nhiệm vụ, thẻ BTC và kiểm tra khu vực được phân công.`,
  },
  {
    id: "ky-nang-nha-tuyen-dung-tim-kiem",
    title: "Những tiêu chí hàng đầu nhà tuyển dụng sự kiện tìm kiếm ở ứng viên",
    description: "Ban tổ chức lễ hội lớn như DIFF, MICE Furama hay Ariyana luôn ưu tiên ứng viên có phản xạ nhanh, trách nhiệm và kỷ luật.",
    excerpt: "Ban tổ chức luôn đánh giá cao sự kết hợp giữa kỹ năng chuyên môn, tinh thần trách nhiệm, phản xạ giải quyết vấn đề linh hoạt và tác phong chuyên nghiệp.",
    author: "Thảo Nhi (DIFF Organizer)",
    date: "12 Th01, 2026",
    category: "employer",
    tags: ["Tuyển dụng", "Tiêu chí ứng viên"],
    imageSrc: "/images/advice/blog-5.png",
    imageUrl: "/images/advice/blog-5.png",
    content: `Các nhà tổ chức sự kiện chuyên nghiệp tại Đà Nẵng luôn tìm kiếm những nhân sự có thái độ tích cực và kỷ luật làm việc cao:

1. Tinh thần chủ động (Proactive): Biết tự quan sát và hỗ trợ đồng đội khi khu vực của mình đã ổn định thay vì đứng nhìn thụ động.
2. Khả năng giao tiếp ngoại ngữ: Tiếng Anh hoặc tiếng Hàn giao tiếp cơ bản là lợi thế rất lớn tại các sự kiện đón khách quốc tế.
3. Kỹ năng sử dụng công nghệ sự kiện: Thao tác nhanh với ứng dụng quét vé QR, hệ thống POS thanh toán và phối hợp kênh đàm nội bộ.
4. Trách nhiệm tới cùng: Đảm bảo ca làm việc trọn vẹn, bàn giao đầy đủ thiết bị và tài sản cho ca tiếp theo trước khi ra về.`,
  },
  {
    id: "giai-phap-tuyen-gap-nhan-su-su-kien",
    title: "Chiến lược tuyển gấp 50-100 nhân sự sự kiện trong vòng 24 giờ",
    description: "Cách tối ưu hóa tin tuyển dụng, sàng lọc hồ sơ tự động và quản lý check-in điểm danh QR để loại bỏ rủi ro bỏ ca phút chót.",
    excerpt: "Khắc phục bài toán thiếu hụt nhân sự phút chót cho các hội thảo quy mô lớn và lễ hội âm nhạc bằng quy trình tự động hóa của EventMate.",
    author: "Nguyễn Hải (Operations Manager)",
    date: "05 Th01, 2026",
    category: "employer",
    tags: ["Tuyển dụng gấp", "Quản trị nhân sự"],
    imageSrc: "/images/advice/blog-6.png",
    imageUrl: "/images/advice/blog-6.png",
    content: `Khi quy mô sự kiện mở rộng đột xuất hoặc nhà thầu phụ gặp sự cố, ban tổ chức cần phương án tuyển quân thần tốc nhưng vẫn đảm bảo chất lượng:

1. Đăng tin tuyển gấp với mức thù lao rõ ràng: Các tin gắn tag Tuyển Gấp trên EventMate nhận được lượng ứng tuyển nhanh gấp 3 lần nhờ thông báo đẩy tới mạng lưới cộng tác viên tích cực.
2. Sàng lọc ứng viên qua điểm tín nhiệm: Lọc ngay danh sách ứng viên có điểm tin cậy > 90 và lịch sử không bỏ ca để gửi thư mời trực tiếp.
3. Điểm danh QR tự động tại hiện trường: Tạo mã QR Check-in riêng cho từng ca giúp nắm bắt chính xác số lượng nhân sự đã có mặt trước giờ G.`,
  },
  {
    id: "quy-trinh-van-hanh-giai-chay-marathon",
    title: "Hậu trường vận hành giải chạy marathon biển Đà Nẵng: Thử thách và bài học",
    description: "Góc nhìn thực tế về khâu tiếp nước, điều phối check-in, an ninh đường chạy và xử lý y tế khẩn cấp dọc cung đường biển Hoàng Sa.",
    excerpt: "Để 10.000 vận động viên về đích an toàn, đội ngũ hậu cần và điều phối viên sự kiện phải trải qua hơn 48 giờ làm việc liên tục không nghỉ.",
    author: "Tuấn Anh (Race Director)",
    date: "18 Th01, 2026",
    category: "industry",
    tags: ["Giải chạy", "Vận hành sự kiện"],
    imageSrc: "/images/advice/blog-7.png",
    imageUrl: "/images/advice/blog-7.png",
    content: `Các giải chạy marathon biển tại Đà Nẵng là một trong những loại hình sự kiện có quy mô nhân sự hiện trường lớn nhất:

1. Chuỗi trạm tiếp nước và dinh dưỡng: Mỗi trạm cần từ 15-20 tình nguyện viên phối hợp rót nước, phát chuối và dọn dẹp ly giấy tốc độ cao.
2. Phân luồng giao thông và an ninh: Cần sự phối hợp ăn khớp giữa đội điều phối đường chạy và lực lượng chức năng tại các ngã tư trọng điểm.
3. Khâu trao huy chương và hoàn thành (Finisher): Quản lý dòng vận động viên cán đích để không bị ùn tắc, phát huy chương và hỗ trợ phục hồi cơ bắp.`,
  },
  {
    id: "kinh-nghiem-lam-pg-pb-su-kien",
    title: "Kinh nghiệm làm PG/PB sự kiện hội nghị, triển lãm và roadshow Đà Nẵng",
    description: "Bí quyết giữ năng lượng suốt ca làm việc dài, giao tiếp chuyên nghiệp với khách VIP và cách ứng phó các tình huống phát sinh.",
    excerpt: "Những bí quyết thực tế giúp bạn duy trì hình ảnh rạng rỡ, thu nhập hấp dẫn và được các nhãn hàng chọn mặt gửi vàng trong các chiến dịch lớn.",
    author: "Phương Vy (Senior PG)",
    date: "10 Th02, 2026",
    category: "jobseeker",
    tags: ["PG / PB", "Giao tiếp"],
    imageSrc: "/images/advice/blog-8.png",
    imageUrl: "/images/advice/blog-8.png",
    content: `Vị trí PG/PB luôn là bộ mặt đại diện trực tiếp của nhãn hàng và sự kiện trong mắt khách mời:

1. Nắm vững thông tin sản phẩm và chương trình: Dành 15 phút trước giờ mở cửa đọc kỹ key-message để trả lời tự tin mọi câu hỏi của khách hàng.
2. Tác phong đứng và nụ cười chuyên nghiệp: Duy trì tư thế đứng thẳng, ánh mắt thân thiện và sẵn sàng hướng dẫn khách vào khu vực trải nghiệm.
3. Kỹ năng xử lý khi gặp khách hàng khó tính: Luôn giữ thái độ hòa nhã, lịch sự và nhanh chóng nhờ sự hỗ trợ của Event Lead khi cần thiết.`,
  },
]
