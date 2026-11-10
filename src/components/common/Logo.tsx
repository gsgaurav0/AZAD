import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const MewakLeafKIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Golden leaf background pointing diagonally */}
    <g transform="rotate(8 50 50)">
      {/* Leaf stem */}
      <path
        d="M26 84 C30 80, 34 76, 38 72"
        stroke="#9A8029"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Golden leaf body */}
      <path
        d="M36 74 C26 56, 30 32, 54 18 C78 6, 88 16, 84 38 C80 62, 58 78, 36 74 Z"
        fill="#9A8029"
      />
      {/* Stylized script 'K' inside the leaf */}
      <path
        d="M48 30 C47 41, 45 52, 43 63"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M66 38 C60 38, 52 44, 46 48 C53 43, 61 39, 68 39"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M47 48 C53 53, 61 59, 68 64"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M63 36 L68 39 L65 43"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// Backward compatibility exports
export const LogoLeafIcon = MewakLeafKIcon;
export const LogoTechIcon = MewakLeafKIcon;
export const GoldFlowerIcon = MewakLeafKIcon;

export default function Logo({
  className = '',
  size = 'md',
  showSubtitle = false,
  inverted = false,
}: LogoProps) {
  // Dimensions calibrated to trimmed 677x238 (2.84:1) transparent PNGs
  const imageDims = {
    sm: { wrapper: 'h-7 w-[80px]' },
    md: { wrapper: 'h-9 sm:h-10 w-[102px] sm:w-[114px]' },
    lg: { wrapper: 'h-12 md:h-14 w-[136px] md:w-[160px]' },
  };

  const logoSrc = inverted
    ? '/images/mewak-logo-light.png'
    : '/images/mewak-logo-dark.png';

  return (
    <Link
      href="/"
      className={`inline-flex flex-col items-center group select-none ${className}`}
      aria-label="Mewak Electronics"
    >
      <div
        className={`relative ${imageDims[size].wrapper} transition-transform duration-300 group-hover:scale-105`}
      >
        <Image
          src={logoSrc}
          alt="Mewak"
          fill
          priority={size === 'md' || size === 'lg'}
          className="object-contain"
        />
      </div>
      {showSubtitle && (
        <span
          className={`text-[9px] tracking-[0.35em] uppercase font-sans font-semibold mt-1 transition-colors ${
            inverted ? 'text-[#EFE8DD]/70' : 'text-[#2B1A16]/70'
          }`}
        >
          ELECTRONICS & AUDIO
        </span>
      )}
    </Link>
  );
}
