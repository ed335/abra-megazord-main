'use client';

interface CannabisLeafProps {
  className?: string;
  size?: number;
}

export default function CannabisLeaf({ className = '', size = 24 }: CannabisLeafProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C12 2 10.5 4.5 10.5 6C10.5 7.5 11.5 8.5 12 9C12.5 8.5 13.5 7.5 13.5 6C13.5 4.5 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 9C12 9 8 7 5.5 8C3 9 2 12 2 12C2 12 5 12.5 7 11.5C9 10.5 10 9.5 12 9Z"
        fill="currentColor"
      />
      <path
        d="M12 9C12 9 16 7 18.5 8C21 9 22 12 22 12C22 12 19 12.5 17 11.5C15 10.5 14 9.5 12 9Z"
        fill="currentColor"
      />
      <path
        d="M12 12C12 12 7 11 4 13C1 15 1 19 1 19C1 19 5 18 8 16C11 14 12 12 12 12Z"
        fill="currentColor"
      />
      <path
        d="M12 12C12 12 17 11 20 13C23 15 23 19 23 19C23 19 19 18 16 16C13 14 12 12 12 12Z"
        fill="currentColor"
      />
      <path
        d="M12 9V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
