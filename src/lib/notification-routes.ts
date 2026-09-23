/**
 * Helper to determine the target navigation URL and display label for a notification.
 */

export function getNotificationDestination(
  notif: any,
  isOrganizer: boolean = false
): string {
  if (!notif) return "/notifications"

  // 1. Explicit link or action_url
  if (notif.link && typeof notif.link === "string" && notif.link.trim()) {
    return notif.link.trim()
  }
  if (notif.action_url && typeof notif.action_url === "string" && notif.action_url.trim()) {
    return notif.action_url.trim()
  }
  if (notif.url && typeof notif.url === "string" && notif.url.trim()) {
    return notif.url.trim()
  }
  if (notif.data?.url) return notif.data.url
  if (notif.data?.link) return notif.data.link
  if (notif.metadata?.url) return notif.metadata.url
  if (notif.metadata?.link) return notif.metadata.link

  // 2. Event or Job ID
  const eventId = notif.event_id || notif.job_id || notif.data?.event_id || notif.metadata?.event_id
  if (eventId) {
    return isOrganizer ? `/manage-events` : `/events/${eventId}`
  }

  // 3. Extract path directly from message if written like "/events/..." or "/chat"
  const fullText = `${notif.title || ""} ${notif.message || ""}`
  const pathMatch = fullText.match(/\/(events|manage-events|my-events|chat|account)[^\s)"]*/)
  if (pathMatch) {
    return pathMatch[0]
  }

  // 4. Keyword & category deduction
  const text = fullText.toLowerCase()
  const type = (notif.type || "").toLowerCase()

  // Interview / Chat
  if (
    type.includes("chat") ||
    type.includes("message") ||
    type.includes("interview") ||
    text.includes("phỏng vấn") ||
    text.includes("tin nhắn") ||
    text.includes("chat") ||
    text.includes("trao đổi")
  ) {
    return "/chat"
  }

  // Applications / Candidates
  if (
    type.includes("apply") ||
    type.includes("application") ||
    type.includes("candidate") ||
    text.includes("ứng tuyển") ||
    text.includes("hồ sơ") ||
    text.includes("ứng viên") ||
    text.includes("tuyển dụng") ||
    text.includes("duyệt hồ sơ") ||
    text.includes("chấp nhận") ||
    text.includes("từ chối")
  ) {
    return isOrganizer ? "/manage-events" : "/my-events"
  }

  // Events / Schedule
  if (
    type.includes("event") ||
    type.includes("job") ||
    type.includes("schedule") ||
    text.includes("sự kiện") ||
    text.includes("ca làm") ||
    text.includes("lịch trình") ||
    text.includes("check-in") ||
    text.includes("bài đăng")
  ) {
    return isOrganizer ? "/manage-events" : "/events"
  }

  // Account / Settings
  if (
    text.includes("tài khoản") ||
    text.includes("thanh toán") ||
    text.includes("gói dịch vụ") ||
    text.includes("mật khẩu")
  ) {
    return "/account"
  }

  return "/notifications"
}

export function getDestinationLabel(destination: string): string {
  if (!destination) return "Xem chi tiết"
  if (destination === "/chat") return "Mở tin nhắn"
  if (destination.startsWith("/manage-events")) return "Quản lý tuyển dụng"
  if (destination.startsWith("/my-events")) return "Xem đơn ứng tuyển"
  if (destination.startsWith("/events")) return "Xem sự kiện"
  if (destination.startsWith("/account")) return "Cài đặt tài khoản"
  if (destination === "/notifications") return "Xem thông báo"
  return "Xem chi tiết"
}
