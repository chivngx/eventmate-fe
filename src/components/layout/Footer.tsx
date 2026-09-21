"use client";

import React from "react";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";
import { Button } from "@/components/base-ui/button";
import { cn } from "@/lib/utils";

export interface Footer3LinkGroup {
  title: string;
  links: { label: string; href: string }[];
}

export interface Footer3SocialLink {
  icon: React.ReactNode;
  href: string;
  label?: string;
}

export interface Footer3Props {
  logo?: React.ReactNode;
  brandName?: React.ReactNode;
  description?: string;
  socialLinks?: Footer3SocialLink[];
  linkGroups?: Footer3LinkGroup[];
  copyright?: string;
  legalLinks?: { label: string; href: string }[];
}

export function Footer3({
  logo,
  brandName,
  description,
  socialLinks = [],
  linkGroups = [],
  copyright,
  legalLinks = [],
}: Footer3Props) {
  return (
    <footer className="w-full px-4 py-12 md:px-6">
      <div className="border-border bg-muted mx-auto max-w-7xl overflow-hidden rounded-4xl border">
        <div className="p-1">
          <div className="bg-card rounded-3xl shadow-xs">
            <div className="px-8 py-12 md:px-12 md:py-16">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
                {/* Brand & Bio */}
                <div className="flex flex-col items-start lg:col-span-4">
                  <div className="mb-6 flex items-center gap-3">
                    {logo && <div className="shrink-0">{logo}</div>}
                    {brandName && (
                      typeof brandName === "string" ? (
                        <span className="text-xl font-bold tracking-tight">{brandName}</span>
                      ) : (
                        brandName
                      )
                    )}
                  </div>
                  {description && (
                    <p className="text-muted-foreground mb-8 max-w-sm text-sm leading-relaxed">
                      {description}
                    </p>
                  )}
                  {socialLinks.length > 0 && (
                    <div className="flex items-center gap-3">
                      {socialLinks.map((link, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="icon"
                          asChild
                          className="text-muted-foreground bg-muted hover:text-foreground h-10 w-10 rounded-xl shadow-[0_0_0_0.5px_rgba(0,0,0,0.03),0_2px_4px_0_rgba(0,0,0,0.05),inset_0_2px_0_0px_rgba(255,255,255,0.5)] transition-colors outline-none dark:shadow-[0_0_0_0.5px_rgba(0,0,0,0.03),0_2px_4px_0_rgba(0,0,0,0.05),inset_0_2px_0_0px_rgba(255,255,255,0.1)]"
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
                  <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
                    {linkGroups.map((group, index) => (
                      <div key={index} className="flex flex-col gap-4">
                        <h4 className="text-foreground mb-1 text-sm font-semibold">
                          {group.title}
                        </h4>
                        <ul className="flex flex-col gap-3">
                          {group.links.map((link, linkIndex) => {
                            const isInternal = link.href.startsWith("/");
                            return (
                              <li key={linkIndex}>
                                {isInternal ? (
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
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="bg-muted/50 px-8 py-6 md:px-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
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
      </div>
    </footer>
  );
}

// EventMate Brand Assets
export function EventMateLogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "size-8 rounded-xl bg-gradient-to-tr from-[#005DDC] to-[#2563EB] flex items-center justify-center text-white shadow-xs shrink-0",
        className
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="3" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    </div>
  );
}

const defaultSocialLinks: Footer3SocialLink[] = [
  { icon: <FaFacebookF className="w-4 h-4" />, href: "https://facebook.com", label: "Facebook" },
  { icon: <FaInstagram className="w-4 h-4" />, href: "https://instagram.com", label: "Instagram" }
];

const defaultLinkGroups: Footer3LinkGroup[] = [
  {
    title: "Dịch vụ",
    links: [
      { label: "Tìm việc làm sự kiện", href: "/events" },
      { label: "Hồ sơ ứng viên", href: "/profile" },
      { label: "Tìm Ban tổ chức", href: "/companies" },
      { label: "Bảng giá dịch vụ", href: "/pricing" },
    ],
  },
  {
    title: "Khám phá",
    links: [
      { label: "Cẩm nang sự kiện", href: "/blog" },
      { label: "Về chúng tôi", href: "/about" },
      { label: "Liên hệ hợp tác", href: "/contact" },
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

export function Footer3Demo(props?: Partial<Footer3Props>) {
  return (
    <div className="w-full">
      <Footer3
        logo={props?.logo ?? <EventMateLogoMark />}
        brandName={
          props?.brandName ?? (
            <span className="text-xl font-bold tracking-tight text-foreground">
              Event<span className="text-[#005DDC]">Mate</span>
            </span>
          )
        }
        description={
          props?.description ??
          "Nền tảng kết nối Ban tổ chức sự kiện chuyên nghiệp với lực lượng nhân sự trẻ, năng động hàng đầu tại Đà Nẵng."
        }
        socialLinks={props?.socialLinks ?? defaultSocialLinks}
        linkGroups={props?.linkGroups ?? defaultLinkGroups}
        copyright={props?.copyright ?? "© 2026 EventMate. Mọi quyền được bảo lưu."}
        legalLinks={props?.legalLinks ?? defaultLegalLinks}
      />
    </div>
  );
}

export default function Footer(props?: Partial<Footer3Props>) {
  return <Footer3Demo {...props} />;
}
