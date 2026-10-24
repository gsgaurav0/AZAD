import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const LogoLeafIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Elegant Gold Stylized Leaf Silhouette */}
    <path
      d="M12 2C6.5 2 3 7.5 3 13.5C3 18.5 7 22 12 22C17 22 21 18.5 21 13.5C21 7.5 17.5 2 12 2Z"
      fill="#9A8029"
      fillOpacity="0.15"
      stroke="#9A8029"
      strokeWidth="1.2"
    />
    <path
      d="M12 2V22M12 8C14.5 10 16 12 16 14M12 11C9.5 13 8 15 8 17"
      stroke="#9A8029"
      strokeWidth="1"
      strokeLinecap="round"
      strokeOpacity="0.5"
    />
    {/* Letter K nestled inside the leaf */}
    <text
      x="12"
      y="15.5"
      textAnchor="middle"
      fill="#9A8029"
      fontSize="9"
      fontWeight="700"
      fontFamily="var(--font-playfair), Georgia, serif"
      letterSpacing="0.05em"
    >
      K
    </text>
  </svg>
);

export const GoldFlowerIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block align-middle ${className}`}
  >
    <circle cx="12" cy="12" r="3" fill="#9A8029" />
    <circle cx="12" cy="6" r="2.5" fill="#9A8029" fillOpacity="0.75" />
    <circle cx="12" cy="18" r="2.5" fill="#9A8029" fillOpacity="0.75" />
    <circle cx="6" cy="12" r="2.5" fill="#9A8029" fillOpacity="0.75" />
    <circle cx="18" cy="12" r="2.5" fill="#9A8029" fillOpacity="0.75" />
    <circle cx="7.7" cy="7.7" r="2" fill="#9A8029" fillOpacity="0.4" />
    <circle cx="16.3" cy="7.7" r="2" fill="#9A8029" fillOpacity="0.4" />
    <circle cx="7.7" cy="16.3" r="2" fill="#9A8029" fillOpacity="0.4" />
    <circle cx="16.3" cy="16.3" r="2" fill="#9A8029" fillOpacity="0.4" />
  </svg>
);

export default function Logo({ className = '', size = 'md', showSubtitle = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg tracking-[0.2em]',
    md: 'text-2xl tracking-[0.25em]',
    lg: 'text-3xl md:text-4xl tracking-[0.3em]',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  return (
    <Link href="/" className={`inline-flex flex-col items-center group select-none ${className}`}>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-serif font-semibold text-[#2B1A16] uppercase transition-colors duration-300 group-hover:text-[#9A8029] ${sizeClasses[size]}`}
        >
          MEWAK
        </span>
        <LogoLeafIcon size={iconSizes[size]} className="transform -rotate-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-0" />
      </div>
      {showSubtitle && (
        <span className="text-[10px] tracking-[0.35em] text-[#2B1A16]/60 uppercase font-sans mt-0.5">
          HAUTE COUTURE
        </span>
      )}
    </Link>
  );
}
