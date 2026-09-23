import React from "react"
import { EventMateLogo } from "@/components/common/EventMateLogo"

export function JoblinLogo({ className }: { className?: string }) {
  return <EventMateLogo className={className} />
}

export function NavSearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21.53 20.47L17.689 16.629C18.973 15.106 19.75 13.143 19.75 11C19.75 6.175 15.825 2.25 11 2.25C6.175 2.25 2.25 6.175 2.25 11C2.25 15.825 6.175 19.75 11 19.75C13.143 19.75 15.106 18.973 16.629 17.689L20.47 21.53C20.616 21.676 20.808 21.75 21 21.75C21.192 21.75 21.384 21.677 21.53 21.53C21.823 21.238 21.823 20.763 21.53 20.47ZM3.75 11C3.75 7.002 7.002 3.75 11 3.75C14.998 3.75 18.25 7.002 18.25 11C18.25 14.998 14.998 18.25 11 18.25C7.002 18.25 3.75 14.998 3.75 11Z"
        fill="currentColor"
      />
    </svg>
  )
}

import { BellIcon } from "@/components/icons"

export const NavBellIcon = BellIcon

export function NavLogInIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21 5.84615V18.1538C21 20.6338 19.7022 22 17.3462 22H11.5C9.144 22 7.84615 20.6338 7.84615 18.1538V17.1282C7.84615 16.7036 8.17354 16.359 8.57692 16.359C8.98031 16.359 9.30769 16.7036 9.30769 17.1282V18.1538C9.30769 19.7713 9.96344 20.4615 11.5 20.4615H17.3462C18.8827 20.4615 19.5385 19.7713 19.5385 18.1538V5.84615C19.5385 4.22872 18.8827 3.53846 17.3462 3.53846H11.5C9.96344 3.53846 9.30769 4.22872 9.30769 5.84615V6.8718C9.30769 7.29641 8.98031 7.64103 8.57692 7.64103C8.17354 7.64103 7.84615 7.29641 7.84615 6.8718V5.84615C7.84615 3.36615 9.144 2 11.5 2H17.3462C19.7022 2 21 3.36615 21 5.84615ZM11.9579 14.5333C11.6724 14.8338 11.6724 15.321 11.9579 15.6215C12.1002 15.7713 12.2873 15.8472 12.4744 15.8472C12.6614 15.8472 12.8485 15.7723 12.9908 15.6215L15.9139 12.5446C15.9811 12.4739 16.0347 12.3887 16.0717 12.2943C16.1458 12.1067 16.1458 11.8943 16.0717 11.7067C16.0347 11.6123 15.9811 11.5272 15.9139 11.4564L12.9908 8.37949C12.7053 8.07898 12.2425 8.07898 11.957 8.37949C11.6715 8.68 11.6715 9.16719 11.957 9.4677L13.6329 11.2318H2.73077C2.32738 11.2318 2 11.5764 2 12.001C2 12.4256 2.32738 12.7703 2.73077 12.7703H13.6329L11.9579 14.5333Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function NavAngleIcon({ className, isOpen = false }: { className?: string; isOpen?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 200ms ease, fill 200ms ease",
      }}
    >
      <path
        d="M8 9.25C8.192 9.25 8.384 9.3229 8.53 9.4699L12 12.9399L15.4699 9.4699C15.7629 9.1769 16.238 9.1769 16.531 9.4699C16.824 9.7629 16.824 10.238 16.531 10.531L12.531 14.531C12.238 14.824 11.7629 14.824 11.4699 14.531L7.46995 10.531C7.17695 10.238 7.17695 9.7629 7.46995 9.4699C7.61595 9.3229 7.808 9.25 8 9.25Z"
        fill={isOpen ? "#063B82" : "#222222"}
      />
    </svg>
  )
}

export function NavDropdownArrow({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="18"
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.71554 1.71027C8.68742 0.0970639 11.0269 0.097067 11.9987 1.71027L18.8513 13.0843C19.8549 14.7505 18.6548 16.8743 16.7097 16.8743H3.0046C1.05944 16.8743 -0.140655 14.7505 0.863001 13.0843L7.71554 1.71027Z"
        fill="white"
        stroke="#CBCBCB"
      />
    </svg>
  )
}
