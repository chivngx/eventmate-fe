import type { Metadata } from "next"
import PricingPlansView from "@/features/pricing/PricingPlansView"

export const metadata: Metadata = {
  title: "Bảng Giá Dịch Vụ Tuyển Dụng — EventMate Đà Nẵng",
  description:
    "Khám phá các gói dịch vụ tuyển dụng nhân sự sự kiện linh hoạt và tối ưu chi phí dành cho Ban tổ chức và Doanh nghiệp tại Đà Nẵng.",
}

export default function PricingPage() {
  return <PricingPlansView />
}
