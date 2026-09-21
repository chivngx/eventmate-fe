"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useUser } from "@/components/providers/AuthProvider"

// ============================================================================
// Joblin Figma Design SVG Icons (Figma Nodes 5875:25295 & 5875:28309)
// ============================================================================

export function JoblinMiniLogo({ className = "size-[48px]", color = "Blue" }: { className?: string; color?: "Blue" | "Black" }) {
  const isBlack = color === "Black"
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center rounded-[8px] overflow-hidden shadow-xs", isBlack ? "bg-[#222222]" : "bg-gradient-to-tr from-[#005DDC] to-[#2563EB]", className)}>
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="3" />
        <path d="M3 10h18" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    </div>
  )
}

export function IconGridSquare({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M18.5 10.75H15.5C14.091 10.75 13.25 9.909 13.25 8.5V5.5C13.25 4.091 14.091 3.25 15.5 3.25H18.5C19.909 3.25 20.75 4.091 20.75 5.5V8.5C20.75 9.909 19.909 10.75 18.5 10.75ZM15.5 4.75C14.911 4.75 14.75 4.911 14.75 5.5V8.5C14.75 9.089 14.911 9.25 15.5 9.25H18.5C19.089 9.25 19.25 9.089 19.25 8.5V5.5C19.25 4.911 19.089 4.75 18.5 4.75H15.5ZM8.5 10.75H5.5C4.091 10.75 3.25 9.909 3.25 8.5V5.5C3.25 4.091 4.091 3.25 5.5 3.25H8.5C9.909 3.25 10.75 4.091 10.75 5.5V8.5C10.75 9.909 9.909 10.75 8.5 10.75ZM5.5 4.75C4.911 4.75 4.75 4.911 4.75 5.5V8.5C4.75 9.089 4.911 9.25 5.5 9.25H8.5C9.089 9.25 9.25 9.089 9.25 8.5V5.5C9.25 4.911 9.089 4.75 8.5 4.75H5.5ZM18.5 20.75H15.5C14.091 20.75 13.25 19.909 13.25 18.5V15.5C13.25 14.091 14.091 13.25 15.5 13.25H18.5C19.909 13.25 20.75 14.091 20.75 15.5V18.5C20.75 19.909 19.909 20.75 18.5 20.75ZM15.5 14.75C14.911 14.75 14.75 14.911 14.75 15.5V18.5C14.75 19.089 14.911 19.25 15.5 19.25H18.5C19.089 19.25 19.25 19.089 19.25 18.5V15.5C19.25 14.911 19.089 14.75 18.5 14.75H15.5ZM8.5 20.75H5.5C4.091 20.75 3.25 19.909 3.25 18.5V15.5C3.25 14.091 4.091 13.25 5.5 13.25H8.5C9.909 13.25 10.75 14.091 10.75 15.5V18.5C10.75 19.909 9.909 20.75 8.5 20.75ZM5.5 14.75C4.911 14.75 4.75 14.911 4.75 15.5V18.5C4.75 19.089 4.911 19.25 5.5 19.25H8.5C9.089 19.25 9.25 19.089 9.25 18.5V15.5C9.25 14.911 9.089 14.75 8.5 14.75H5.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconUserAlt({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M12.009 10.75C9.66503 10.75 7.75903 8.843 7.75903 6.5C7.75903 4.157 9.66503 2.25 12.009 2.25C14.353 2.25 16.259 4.157 16.259 6.5C16.259 8.843 14.353 10.75 12.009 10.75ZM12.009 3.75C10.492 3.75 9.25903 4.983 9.25903 6.5C9.25903 8.017 10.492 9.25 12.009 9.25C13.526 9.25 14.759 8.017 14.759 6.5C14.759 4.983 13.525 3.75 12.009 3.75ZM19.75 21V18.019C19.75 15.358 18.244 12.25 14 12.25H10C5.756 12.25 4.25 15.357 4.25 18.019V21C4.25 21.414 4.586 21.75 5 21.75C5.414 21.75 5.75 21.414 5.75 21V18.019C5.75 17.018 6.057 13.75 10 13.75H14C17.943 13.75 18.25 17.017 18.25 18.019V21C18.25 21.414 18.586 21.75 19 21.75C19.414 21.75 19.75 21.414 19.75 21Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconPlusSquare({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M17.625 2.25H6.375C3.715 2.25 2.25 3.715 2.25 6.375V17.625C2.25 20.285 3.715 21.75 6.375 21.75H17.625C20.285 21.75 21.75 20.285 21.75 17.625V6.375C21.75 3.715 20.285 2.25 17.625 2.25ZM20.25 17.625C20.25 19.465 19.465 20.25 17.625 20.25H6.375C4.535 20.25 3.75 19.465 3.75 17.625V6.375C3.75 4.535 4.535 3.75 6.375 3.75H17.625C19.465 3.75 20.25 4.535 20.25 6.375V17.625ZM16.25 12C16.25 12.414 15.914 12.75 15.5 12.75H12.75V15.5C12.75 15.914 12.414 16.25 12 16.25C11.586 16.25 11.25 15.914 11.25 15.5V12.75H8.5C8.086 12.75 7.75 12.414 7.75 12C7.75 11.586 8.086 11.25 8.5 11.25H11.25V8.5C11.25 8.086 11.586 7.75 12 7.75C12.414 7.75 12.75 8.086 12.75 8.5V11.25H15.5C15.914 11.25 16.25 11.586 16.25 12Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconBell({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M12 21.75C11.012 21.75 10.124 21.237 9.62199 20.378C9.41399 20.02 9.534 19.561 9.892 19.352C10.248 19.144 10.708 19.264 10.918 19.622C11.377 20.409 12.623 20.409 13.082 19.622C13.291 19.264 13.751 19.144 14.108 19.352C14.466 19.56 14.587 20.02 14.378 20.378C13.876 21.237 12.988 21.75 12 21.75ZM20.675 18.325C20.8 18.065 20.765 17.757 20.586 17.532C20.567 17.509 18.745 15.189 18.745 12.5V8.995C18.745 5.276 15.719 2.25 12 2.25C8.281 2.25 5.25499 5.276 5.25499 8.995V12.5C5.25499 15.189 3.433 17.509 3.414 17.532C3.235 17.757 3.19999 18.066 3.32499 18.325C3.44999 18.584 3.712 18.75 4 18.75H20C20.288 18.75 20.55 18.584 20.675 18.325ZM6.75499 12.5V8.995C6.75499 6.103 9.108 3.75 12 3.75C14.892 3.75 17.245 6.103 17.245 8.995V12.5C17.245 14.436 17.995 16.158 18.613 17.25H5.386C6.005 16.158 6.75499 14.436 6.75499 12.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconMessageText({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M3 21.75C2.903 21.75 2.80589 21.731 2.71289 21.693C2.43289 21.577 2.25 21.303 2.25 21V6C2.25 3.582 3.582 2.25 6 2.25H18C20.418 2.25 21.75 3.582 21.75 6V15C21.75 17.418 20.418 18.75 18 18.75H6.31104L3.53101 21.53C3.38701 21.674 3.195 21.75 3 21.75ZM6 3.75C4.423 3.75 3.75 4.423 3.75 6V19.189L5.46997 17.469C5.61097 17.328 5.801 17.249 6 17.249H18C19.577 17.249 20.25 16.576 20.25 14.999V5.99902C20.25 4.42202 19.577 3.74902 18 3.74902H6V3.75ZM16.75 8.5C16.75 8.086 16.414 7.75 16 7.75H8C7.586 7.75 7.25 8.086 7.25 8.5C7.25 8.914 7.586 9.25 8 9.25H16C16.414 9.25 16.75 8.914 16.75 8.5ZM13.75 12.5C13.75 12.086 13.414 11.75 13 11.75H8C7.586 11.75 7.25 12.086 7.25 12.5C7.25 12.914 7.586 13.25 8 13.25H13C13.414 13.25 13.75 12.914 13.75 12.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconSettings({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M12 8.25C9.93202 8.25 8.25001 9.932 8.25001 12C8.25001 14.068 9.93202 15.75 12 15.75C14.068 15.75 15.75 14.068 15.75 12C15.75 9.932 14.068 8.25 12 8.25ZM12 14.25C10.759 14.25 9.75001 13.241 9.75001 12C9.75001 10.759 10.759 9.75 12 9.75C13.241 9.75 14.25 10.759 14.25 12C14.25 13.241 13.241 14.25 12 14.25ZM21.208 13.953C20.514 13.551 20.082 12.803 20.081 12C20.08 11.199 20.509 10.452 21.212 10.045C21.727 9.74601 21.903 9.08299 21.605 8.56699L19.933 5.681C19.635 5.166 18.972 4.98901 18.456 5.28601C17.757 5.68901 16.888 5.68901 16.187 5.28201C15.496 4.88101 15.066 4.13601 15.066 3.33701C15.066 2.73801 14.578 2.25101 13.979 2.25101H10.024C9.424 2.25101 8.93703 2.73801 8.93703 3.33701C8.93703 4.13601 8.50701 4.881 7.81401 5.284C7.11501 5.689 6.24702 5.68999 5.54802 5.28699C5.03102 4.98899 4.36903 5.16701 4.07103 5.68201L2.39702 8.57101C2.09902 9.08601 2.276 9.74799 2.796 10.05C3.489 10.451 3.92102 11.198 3.92302 11.999C3.92502 12.801 3.49501 13.55 2.79301 13.957C2.54301 14.102 2.36302 14.335 2.28902 14.615C2.21502 14.894 2.25303 15.185 2.39803 15.436L4.06902 18.32C4.36702 18.836 5.03002 19.015 5.54802 18.716C6.24702 18.313 7.11402 18.314 7.80302 18.713L7.80501 18.714C7.80801 18.716 7.81102 18.718 7.81502 18.72C8.50602 19.121 8.93501 19.866 8.93401 20.666C8.93401 21.265 9.421 21.752 10.02 21.752H13.979C14.578 21.752 15.065 21.265 15.065 20.667C15.065 19.867 15.495 19.122 16.189 18.719C16.887 18.314 17.755 18.312 18.455 18.716C18.971 19.014 19.633 18.837 19.932 18.322L21.606 15.433C21.903 14.916 21.726 14.253 21.208 13.953ZM18.831 17.227C17.741 16.752 16.476 16.817 15.434 17.42C14.401 18.019 13.719 19.078 13.587 20.25H10.41C10.28 19.078 9.596 18.017 8.563 17.419C7.523 16.816 6.25602 16.752 5.16902 17.227L3.89302 15.024C4.84802 14.321 5.42501 13.193 5.42101 11.993C5.41801 10.801 4.84201 9.681 3.89201 8.978L5.16902 6.77399C6.25702 7.24799 7.52402 7.18399 8.56602 6.57999C9.59802 5.98199 10.28 4.92201 10.412 3.75101H13.587C13.718 4.92301 14.401 5.982 15.436 6.582C16.475 7.185 17.742 7.24899 18.831 6.77499L20.108 8.978C19.155 9.68 18.579 10.806 18.581 12.004C18.582 13.198 19.158 14.32 20.109 15.025L18.831 17.227Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconSlidersHorizontalAlt({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M6 3.25C3.932 3.25 2.25 4.932 2.25 7C2.25 9.068 3.932 10.75 6 10.75C8.068 10.75 9.75 9.068 9.75 7C9.75 4.932 8.068 3.25 6 3.25ZM6 9.25C4.759 9.25 3.75 8.241 3.75 7C3.75 5.759 4.759 4.75 6 4.75C7.241 4.75 8.25 5.759 8.25 7C8.25 8.241 7.241 9.25 6 9.25ZM18 13.25C15.932 13.25 14.25 14.932 14.25 17C14.25 19.068 15.932 20.75 18 20.75C20.068 20.75 21.75 19.068 21.75 17C21.75 14.932 20.068 13.25 18 13.25ZM18 19.25C16.759 19.25 15.75 18.241 15.75 17C15.75 15.759 16.759 14.75 18 14.75C19.241 14.75 20.25 15.759 20.25 17C20.25 18.241 19.241 19.25 18 19.25ZM15 7.75H21C21.414 7.75 21.75 7.414 21.75 7C21.75 6.586 21.414 6.25 21 6.25H15C14.586 6.25 14.25 6.586 14.25 7C14.25 7.414 14.586 7.75 15 7.75ZM9 16.25H3C2.586 16.25 2.25 16.586 2.25 17C2.25 17.414 2.586 17.75 3 17.75H9C9.414 17.75 9.75 17.414 9.75 17C9.75 16.586 9.414 16.25 9 16.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconAngleLeftSmall({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M14 16.75C13.808 16.75 13.616 16.6771 13.47 16.5301L9.46999 12.5301C9.17699 12.2371 9.17699 11.762 9.46999 11.469L13.47 7.46902C13.763 7.17602 14.238 7.17602 14.531 7.46902C14.824 7.76202 14.824 8.23705 14.531 8.53005L11.0611 12L14.531 15.47C14.824 15.763 14.824 16.238 14.531 16.531C14.384 16.677 14.192 16.75 14 16.75Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconAngleRightSmall({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M10 16.75C9.808 16.75 9.616 16.6771 9.47 16.5301C9.177 16.2371 9.177 15.762 9.47 15.469L12.94 12L9.47 8.53005C9.177 8.23705 9.177 7.76202 9.47 7.46902C9.763 7.17602 10.238 7.17602 10.531 7.46902L14.531 11.469C14.824 11.762 14.824 12.237 14.531 12.53L10.531 16.5301C10.384 16.6771 10.192 16.75 10 16.75Z"
        fill="currentColor"
      />
    </svg>
  )
}


export function IconLogOut({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M15.75 17V18C15.75 20.418 14.418 21.75 12 21.75H6C3.582 21.75 2.25 20.418 2.25 18V6C2.25 3.582 3.582 2.25 6 2.25H12C14.418 2.25 15.75 3.582 15.75 6V7C15.75 7.414 15.414 7.75 15 7.75C14.586 7.75 14.25 7.414 14.25 7V6C14.25 4.423 13.577 3.75 12 3.75H6C4.423 3.75 3.75 4.423 3.75 6V18C3.75 19.577 4.423 20.25 6 20.25H12C13.577 20.25 14.25 19.577 14.25 18V17C14.25 16.586 14.586 16.25 15 16.25C15.414 16.25 15.75 16.586 15.75 17ZM21.692 12.287C21.768 12.104 21.768 11.897 21.692 11.714C21.654 11.622 21.599 11.539 21.53 11.47L18.53 8.47C18.237 8.177 17.762 8.177 17.469 8.47C17.176 8.763 17.176 9.23801 17.469 9.53101L19.189 11.251H8C7.586 11.251 7.25 11.587 7.25 12.001C7.25 12.415 7.586 12.751 8 12.751H19.189L17.469 14.471C17.176 14.764 17.176 15.239 17.469 15.532C17.615 15.678 17.807 15.752 17.999 15.752C18.191 15.752 18.383 15.679 18.529 15.532L21.529 12.532C21.599 12.461 21.654 12.378 21.692 12.287Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconQuestionCircle({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12C1.25 6.072 6.072 1.25 12 1.25C17.928 1.25 22.75 6.072 22.75 12C22.75 17.928 17.928 22.75 12 22.75ZM12 2.75C6.899 2.75 2.75 6.899 2.75 12C2.75 17.101 6.899 21.25 12 21.25C17.101 21.25 21.25 17.101 21.25 12C21.25 6.899 17.101 2.75 12 2.75ZM12.7109 13.364C12.7349 13.292 12.871 13.0191 13.603 12.5291C14.783 11.7381 15.311 10.6079 15.092 9.34595C14.87 8.07095 13.8309 7.02403 12.5649 6.80103C11.6399 6.63703 10.703 6.88593 9.99097 7.48193C9.27197 8.08493 8.86011 8.96989 8.86011 9.91089C8.86011 10.3249 9.19611 10.6609 9.61011 10.6609C10.0241 10.6609 10.3601 10.3249 10.3601 9.91089C10.3601 9.41489 10.5771 8.9481 10.9551 8.6311C11.3311 8.3161 11.811 8.1871 12.304 8.2771C12.95 8.3911 13.501 8.94805 13.615 9.60205C13.658 9.84905 13.7891 10.599 12.7681 11.282C11.9411 11.837 11.471 12.346 11.29 12.886C11.158 13.279 11.3699 13.7039 11.7629 13.8359C11.8419 13.8629 11.922 13.875 12.001 13.875C12.313 13.875 12.6049 13.677 12.7109 13.364ZM13.02 16.5C13.02 15.948 12.573 15.5 12.02 15.5H12.01C11.458 15.5 11.0149 15.948 11.0149 16.5C11.0149 17.052 11.468 17.5 12.02 17.5C12.572 17.5 13.02 17.052 13.02 16.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconLock({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("shrink-0", className)}>
      <path
        d="M17 9V7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7V9C5.34 9 4 10.34 4 12V19C4 20.66 5.34 22 7 22H17C18.66 22 20 20.66 20 19V12C20 10.34 18.66 9 17 9ZM9 7C9 5.34 10.34 4 12 4C13.66 4 15 5.34 15 7V9H9V7ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17Z"
        fill="currentColor"
      />
    </svg>
  )
}

// ============================================================================
// Props & Unified MenuDashboard Component
// ============================================================================

export interface NavItemConfig {
  id: string
  label: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | string | null
  isPremiumLocked?: boolean
}

export interface MenuDashboardProps {
  className?: string
  role?: "student" | "organizer"
  activeItem?: string
  activeTab?: string
  setActiveTab?: (tab: string) => void
  notificationCount?: number
  messageCount?: number
  isPremium?: boolean
  onToggleCollapse?: () => void
  isCollapsed?: boolean
  onLogout?: () => void
}

export default function MenuDashboard({
  className,
  role = "student",
  activeItem: customActiveItem,
  activeTab,
  setActiveTab,
  notificationCount: propNotificationCount,
  messageCount: propMessageCount,
  isPremium = false,
  onToggleCollapse,
  isCollapsed = false,
  onLogout: customLogout,
}: MenuDashboardProps) {
  const { user } = useUser()
  const [fetchedNotificationCount, setFetchedNotificationCount] = useState<number>(0)
  const [fetchedMessageCount, setFetchedMessageCount] = useState<number>(0)

  // Dynamically fetch notification and message unread counts if not provided via props
  useEffect(() => {
    if (!user) {
      setFetchedNotificationCount(0)
      setFetchedMessageCount(0)
      return
    }

    // 1. Fetch unread notifications count
    const fetchNotifsCount = async () => {
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false)

        if (!error && typeof count === "number") {
          setFetchedNotificationCount(count)
        }
      } catch (err) {
        console.error("Error fetching notifications count:", err)
      }
    }

    // 2. Fetch unread messages count
    const fetchMsgsCount = async () => {
      try {
        const { data: userChats, error: chatError } = await supabase
          .from("chats")
          .select("id")
          .or(`student_id.eq.${user.id},organizer_id.eq.${user.id}`)

        if (chatError || !userChats || userChats.length === 0) {
          setFetchedMessageCount(0)
          return
        }

        const chatIds = userChats.map((c: any) => c.id)
        const { count, error: msgError } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in("chat_id", chatIds)
          .neq("sender_id", user.id)
          .eq("is_read", false)

        if (!msgError && typeof count === "number") {
          setFetchedMessageCount(count)
        }
      } catch (err) {
        console.error("Error fetching messages count:", err)
      }
    }

    fetchNotifsCount()
    fetchMsgsCount()

    // Realtime subscriptions
    const channelSuffix = Math.random().toString(36).substring(7)
    const notifChannel = supabase
      .channel(`menu-notifs-${user.id}-${channelSuffix}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifsCount()
        }
      )
      .subscribe()

    const msgChannel = supabase
      .channel(`menu-msgs-${user.id}-${channelSuffix}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchMsgsCount()
        }
      )
      .subscribe()

    const handleNotifsRead = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.all) {
        setFetchedNotificationCount(0)
      } else {
        setFetchedNotificationCount((prev) => Math.max(0, prev - 1))
      }
      fetchNotifsCount()
    }

    const handleMsgsRead = (e?: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent?.detail?.all) {
        setFetchedMessageCount(0)
      }
      fetchMsgsCount()
    }

    window.addEventListener("notifications-read", handleNotifsRead)
    window.addEventListener("messages-read", handleMsgsRead)

    return () => {
      supabase.removeChannel(notifChannel)
      supabase.removeChannel(msgChannel)
      window.removeEventListener("notifications-read", handleNotifsRead)
      window.removeEventListener("messages-read", handleMsgsRead)
    }
  }, [user])

  const finalNotificationCount = propNotificationCount !== undefined ? propNotificationCount : fetchedNotificationCount
  const finalMessageCount = propMessageCount !== undefined ? propMessageCount : fetchedMessageCount

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const isOrganizer = role === "organizer"
  const tabParam = searchParams?.get("tab")

  // Determine active item
  const currentActive = customActiveItem || activeTab || (() => {
    if (!pathname) return isOrganizer ? "feed" : "dashboard"
    if (isOrganizer) {
      if (pathname.startsWith("/dashboard")) {
        if (tabParam === "account") return "account"
        if (tabParam === "events" || tabParam === "my-events") return "events"
        if (tabParam === "post-job") return "post-job"
        if (tabParam === "chat") return "chat"
        if (tabParam === "notifications" || tabParam === "notification") return "notifications"
        return "feed"
      }
      if (pathname.startsWith("/account") || pathname.startsWith("/settings") || pathname.startsWith("/companies") || pathname.startsWith("/candidates")) return "account"
      if (pathname.startsWith("/post-job") || pathname.startsWith("/events/create")) return "post-job"
      if (pathname.startsWith("/notifications")) return "notifications"
      if (pathname.startsWith("/chat")) return "chat"
      if (pathname.startsWith("/manage-events") || pathname.startsWith("/events") || pathname.startsWith("/organizer")) return "events"
      return "feed"
    } else {
      if (pathname.startsWith("/dashboard")) {
        if (tabParam === "account" || tabParam === "settings") return "settings"
        if (tabParam === "cv" || tabParam === "resume" || tabParam === "profile") return "resume"
        if (tabParam === "chat" || tabParam === "message") return "message"
        if (tabParam === "my-events" || tabParam === "activity") return "activity"
        if (tabParam === "notifications" || tabParam === "notification") return "notification"
        return "dashboard"
      }
      if (pathname.startsWith("/profile") || pathname.startsWith("/cv") || pathname.startsWith("/resume")) return "resume"
      if (pathname.startsWith("/notifications")) return "notification"
      if (pathname.startsWith("/chat")) return "message"
      if (pathname.startsWith("/account") || pathname.startsWith("/settings")) return "settings"
      if (pathname.startsWith("/my-events")) return "activity"
      return "dashboard"
    }
  })()

  const handleDefaultLogout = async () => {
    if (customLogout) {
      customLogout()
      return
    }
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  // Student navigation items (Clean 5-item layout)
  const studentNavItems: NavItemConfig[] = [
    {
      id: "dashboard",
      label: "Bảng điều khiển",
      href: "/dashboard",
      icon: IconGridSquare,
      badge: null,
    },
    {
      id: "resume",
      label: "Hồ sơ của tôi",
      href: "/profile",
      icon: IconUserAlt,
      badge: null,
    },
    {
      id: "notification",
      label: "Thông báo",
      href: "/notifications",
      icon: IconBell,
      badge: finalNotificationCount > 0 ? (finalNotificationCount > 99 ? "99+" : finalNotificationCount) : null,
    },
    {
      id: "message",
      label: "Tin nhắn",
      href: "/chat",
      icon: IconMessageText,
      badge: finalMessageCount > 0 ? (finalMessageCount > 99 ? "99+" : finalMessageCount) : null,
    },
    {
      id: "settings",
      label: "Cài đặt tài khoản",
      href: "/account",
      icon: IconSettings,
      badge: null,
    },
    {
      id: "activity",
      label: "Hoạt động",
      href: "/my-events",
      icon: IconSlidersHorizontalAlt,
      badge: null,
    },
  ]

  // Organizer navigation items (Clean 6-item layout)
  const organizerNavItems: NavItemConfig[] = [
    {
      id: "feed",
      label: "Bảng điều khiển",
      href: "/dashboard",
      icon: IconGridSquare,
      badge: null,
    },
    {
      id: "post-job",
      label: "Đăng tin tuyển dụng",
      href: "/post-job",
      icon: IconPlusSquare,
      badge: null,
    },
    {
      id: "events",
      label: "Quản lý tuyển dụng",
      href: "/manage-events",
      icon: IconSlidersHorizontalAlt,
      badge: null,
    },
    {
      id: "notifications",
      label: "Thông báo",
      href: "/notifications",
      icon: IconBell,
      badge: finalNotificationCount > 0 ? (finalNotificationCount > 99 ? "99+" : finalNotificationCount) : null,
    },
    {
      id: "chat",
      label: "Tin nhắn",
      href: "/chat",
      icon: IconMessageText,
      badge: finalMessageCount > 0 ? (finalMessageCount > 99 ? "99+" : finalMessageCount) : null,
    },
    {
      id: "account",
      label: "Cài đặt tài khoản",
      href: "/account",
      icon: IconSettings,
      badge: null,
    },
  ]

  const navItems = isOrganizer ? organizerNavItems : studentNavItems

  return (
    <aside
      className={cn(
        "bg-white rounded-[16px] border border-[#ededed] shadow-xs p-5 lg:sticky lg:top-6 self-start flex flex-col justify-between select-none transition-all duration-300 shrink-0 lg:h-[calc(100vh-3rem)] min-h-[580px] max-h-[960px]",
        isCollapsed ? "w-[88px]" : "w-full lg:w-[244px]",
        className
      )}
      data-node-id={isOrganizer ? "5875:28309" : "5875:25295"}
      data-name="menu dashboard"
    >
      <div>
        {/* Top Header: Brand MiniLogo & Joblin Title + Collapse/Expand Button */}
        <div className={cn(
          "relative flex items-center justify-between pb-4",
          isCollapsed && "flex-col items-center gap-2 pb-2"
        )}>
          <Link
            href={isOrganizer ? "/for-employers" : "/"}
            className={cn(
              "flex items-center gap-2.5 group cursor-pointer transition-opacity hover:opacity-90",
              isCollapsed && "justify-center w-full"
            )}
            title={isOrganizer ? "Bảng điều khiển Nhà tuyển dụng" : "Bảng điều khiển EventMate"}
          >
            <JoblinMiniLogo className="size-[48px]" color={isOrganizer ? "Black" : "Blue"} />
            {!isCollapsed && (
              <div className="flex flex-col justify-center">
                <span className="font-['Inter',sans-serif] font-bold text-[18px] leading-tight text-[#222222] tracking-tight">
                  EventMate
                </span>
                <span className="font-['Inter',sans-serif] font-light text-[12px] leading-tight text-[#757575]">
                  {isOrganizer ? "Nhà tuyển dụng" : "Bảng điều khiển"}
                </span>
              </div>
            )}
          </Link>

          {/* Collapse/Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
              title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
              className={cn(
                "rounded-full flex items-center justify-center text-[#757575] hover:bg-[#ededed] hover:text-[#222222] transition-colors cursor-pointer",
                isCollapsed
                  ? "size-[28px] bg-slate-100 hover:bg-[#ededed] border border-[#ededed] shadow-2xs"
                  : "size-[24px]"
              )}
            >
              {isCollapsed ? (
                <IconAngleRightSmall className="size-[16px]" />
              ) : (
                <IconAngleLeftSmall className="size-[16px]" />
              )}
            </button>
          )}
        </div>

        {/* Divider Line (Figma: #cbcbcb opacity 32%) */}
        <div className="w-full h-px bg-[#cbcbcb]/40 my-3 rounded-[8px]" />

        {/* Main Section Header */}
        {!isCollapsed && (
          <div className="pt-2 pb-3 px-1">
            <span className="font-['Inter',sans-serif] font-medium text-[14px] leading-[1.6] text-[#757575] block">
              Menu chính
            </span>
          </div>
        )}

        {/* Main Navigation Items */}
        <nav className="space-y-2.5 pt-1 overflow-y-auto max-h-[calc(100vh-280px)] no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentActive === item.id
            const Icon = item.icon

            const content = isCollapsed ? (
              <div
                className={cn(
                  "flex items-center justify-center size-[48px] mx-auto rounded-[8px] transition-colors group relative cursor-pointer",
                  isActive
                    ? "bg-[#ededed] text-[#222222] font-semibold"
                    : "text-[#353535] hover:bg-[#ededed]/60 font-medium"
                )}
                title={item.label}
              >
                <div className="size-[24px] shrink-0 flex items-center justify-center">
                  <Icon className="size-[24px]" />
                </div>
                {Boolean(item.badge) && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 bg-[#dc0000] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className={cn(
                "flex items-center h-[48px] px-[18px] py-[8px] rounded-[8px] transition-colors group relative cursor-pointer w-full text-left",
                isActive
                  ? "bg-[#ededed] text-[#353535] font-semibold"
                  : "text-[#353535] hover:bg-[#ededed]/60 font-medium"
              )}>
                <div className="flex items-center gap-[10px] min-w-0 flex-1">
                  <div className={cn("size-[24px] shrink-0 flex items-center justify-center", isActive ? "text-[#222222]" : "text-[#353535]")}>
                    <Icon className="size-[24px]" />
                  </div>
                  <span className="font-['Inter',sans-serif] text-[15px] leading-normal truncate">
                    {item.label}
                  </span>
                </div>

                {/* Premium lock or Badge count */}
                {item.isPremiumLocked && (
                  <div className="ml-auto shrink-0 text-[#8c8c8c]">
                    <IconLock className="size-4" />
                  </div>
                )}
                {item.badge !== null && item.badge !== undefined && (
                  <div className="ml-auto shrink-0 bg-[#dc0000] text-white font-['Inter',sans-serif] font-semibold text-[11px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </div>
                )}
              </div>
            )

            // If setActiveTab is provided (like in in-page dashboard), use button click
            if (setActiveTab) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className="w-full block cursor-pointer"
                  title={item.label}
                >
                  {content}
                </button>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href || "/dashboard"}
                className="w-full block"
                title={item.label}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    onToggleCollapse?.()
                  }
                }}
              >
                {content}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section Actions: Log out & Help */}
      <div className="pt-6 border-t border-[#ededed] space-y-2 mt-auto">
        {/* Log out item */}
        <button
          type="button"
          onClick={handleDefaultLogout}
          className={cn(
            "transition-colors group cursor-pointer text-left rounded-[8px] block",
            isCollapsed
              ? "size-[48px] mx-auto flex items-center justify-center text-[#dc0000] hover:bg-rose-50"
              : "w-full flex items-center h-[48px] px-[18px] py-[8px] text-[#dc0000] hover:bg-rose-50"
          )}
          title="Đăng xuất"
        >
          {isCollapsed ? (
            <div className="size-[24px] shrink-0 text-[#dc0000] flex items-center justify-center">
              <IconLogOut className="size-[24px]" />
            </div>
          ) : (
            <div className="flex items-center gap-[10px]">
              <div className="size-[24px] shrink-0 text-[#dc0000] flex items-center justify-center">
                <IconLogOut className="size-[24px]" />
              </div>
              <span className="font-['Inter',sans-serif] font-medium text-[15px] leading-normal">
                Đăng xuất
              </span>
            </div>
          )}
        </button>

        {/* Help item */}
        <Link
          href="/help"
          className={cn(
            "transition-colors group rounded-[8px] font-medium block",
            isCollapsed
              ? "size-[48px] mx-auto flex items-center justify-center text-[#353535] hover:bg-[#ededed]/60"
              : "flex items-center h-[48px] px-[18px] py-[8px] text-[#353535] hover:bg-[#ededed]/60"
          )}
          title="Trợ giúp"
        >
          {isCollapsed ? (
            <div className="size-[24px] shrink-0 text-[#353535] flex items-center justify-center">
              <IconQuestionCircle className="size-[24px]" />
            </div>
          ) : (
            <div className="flex items-center gap-[10px]">
              <div className="size-[24px] shrink-0 text-[#353535] flex items-center justify-center">
                <IconQuestionCircle className="size-[24px]" />
              </div>
              <span className="font-['Inter',sans-serif] font-medium text-[15px] leading-normal">
                Trợ giúp
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}
