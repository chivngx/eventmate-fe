"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EventMateLogoIcon } from "@/components/common/EventMateLogo";

export interface FooterLinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface FooterSocialLink {
  icon: React.ReactNode;
  href: string;
  label?: string;
}

export interface FooterProps {
  logo?: React.ReactNode;
  brandName?: React.ReactNode;
  description?: string;
  socialLinks?: FooterSocialLink[];
  linkGroups?: FooterLinkGroup[];
  copyright?: string;
  legalLinks?: { label: string; href: string }[];
  className?: string;
}

const defaultSocialLinks: FooterSocialLink[] = [
  { icon: <FaFacebookF className="w-4 h-4" />, href: "https://facebook.com", label: "Facebook" },
  { icon: <FaInstagram className="w-4 h-4" />, href: "https://instagram.com", label: "Instagram" }
];

const defaultLinkGroups: FooterLinkGroup[] = [
  {
    title: "Dịch vụ",
    links: [
      { label: "Tìm việc làm sự kiện", href: "/events" },
      { label: "Hồ sơ ứng viên", href: "/profile" },
      { label: "Bảng giá dịch vụ", href: "/pricing" },
    ],
  },
  {
    title: "Khám phá",
    links: [
      { label: "Cẩm nang sự kiện", href: "/blog" },
      { label: "Về chúng tôi", href: "/about" },
      { label: "Liên hệ hợp tác", href: "/contact" },
      { label: "Đóng góp ý kiến", href: "#feedback" },
      { label: "Trung tâm trợ giúp", href: "/help" },
    ],
  },
  {
    title: "Hỗ trợ & Pháp lý",
    links: [
      { label: "Điều khoản dịch vụ", href: "/terms" },
      { label: "Chính sách bảo mật", href: "/privacy" },
      { label: "Quy chế hoạt động", href: "/rules" },
      { label: "Câu hỏi thường gặp", href: "/help" },
    ],
  },
];

const defaultLegalLinks = [
  { label: "Chính sách bảo mật", href: "/privacy" },
  { label: "Điều khoản dịch vụ", href: "/terms" },
  { label: "Quy chế hoạt động", href: "/rules" },
];

export default function Footer({
  logo = <EventMateLogoIcon size={30} variant="orange" />,
  brandName = (
    <span className="font-extrabold text-xl tracking-tight text-gray-900">
      EventMate
    </span>
  ),
  description = "Nền tảng kết nối Ban tổ chức sự kiện chuyên nghiệp với lực lượng nhân sự trẻ, năng động hàng đầu tại Đà Nẵng.",
  socialLinks = defaultSocialLinks,
  linkGroups = defaultLinkGroups,
  copyright = "© 2026 EventMate. Mọi quyền được bảo lưu.",
  legalLinks = defaultLegalLinks,
  className,
}: FooterProps = {}) {
  return (
    <footer className={cn("w-full bg-white border-t border-gray-200/80 mt-8 md:mt-10", className)}>
      {/* Main Footer Content */}
      <div className="max-w-[1200px] mx-auto px-4 xl:px-0 py-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Bio */}
          <div className="flex flex-col items-start lg:col-span-4">
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 focus:outline-none transition-transform hover:opacity-90 active:scale-95"
              aria-label="EventMate Home"
            >
              {logo && <div className="shrink-0">{logo}</div>}
              {brandName && (
                typeof brandName === "string" ? (
                  <span className="font-extrabold text-xl tracking-tight text-gray-900">{brandName}</span>
                ) : (
                  brandName
                )
              )}
            </Link>
            {description && (
              <p className="text-muted-foreground mb-4 max-w-sm text-sm leading-relaxed">
                {description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2.5">
                {socialLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="icon"
                    asChild
                    className="text-muted-foreground bg-muted hover:text-foreground h-9 w-9 rounded-lg shadow-xs transition-colors outline-none"
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      aria-label={link.label || "Social link"}
                      rel="noopener noreferrer"
                    >
                      {link.icon}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Link Groups */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {linkGroups.map((group, index) => (
                <div key={index} className="flex flex-col gap-2.5">
                  <h4 className="text-foreground text-sm font-semibold">
                    {group.title}
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {group.links.map((link, linkIndex) => {
                      const isInternal = link.href.startsWith("/");
                      const isFeedback = link.href === "#feedback";
                      return (
                        <li key={linkIndex}>
                          {isFeedback ? (
                            <button
                              type="button"
                              onClick={() => window.dispatchEvent(new CustomEvent("open-feedback-modal"))}
                              className="text-muted-foreground hover:text-primary text-sm transition-colors cursor-pointer text-left"
                            >
                              {link.label}
                            </button>
                          ) : isInternal ? (
                            <Link
                              href={link.href}
                              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                              {link.label}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                            >
                              {link.label}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="w-full border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-[1200px] mx-auto px-4 xl:px-0 py-3.5 flex flex-col items-center justify-between gap-4 md:flex-row">
          {copyright && (
            <p className="text-muted-foreground text-sm">{copyright}</p>
          )}

          {legalLinks.length > 0 && (
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm">
              {legalLinks.map((link, index) => {
                const isInternal = link.href.startsWith("/");
                return (
                  <React.Fragment key={index}>
                    {isInternal ? (
                      <Link
                        href={link.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                    {index < legalLinks.length - 1 && (
                      <span className="bg-border h-4 w-px"></span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export { Footer };