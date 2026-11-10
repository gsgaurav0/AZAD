import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const LogoTechIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Geometric Tech Pulse / Circuit Diamond */}
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#9A8029" strokeWidth="1.5" />
    <path d="M7 12H9L11 8L13 16L15 12H17" stroke="#9A8029" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="1.5" fill="#9A8029" />
  </svg>
);

// Backward compatibility exports
export const LogoLeafIcon = LogoTechIcon;
export const GoldFlowerIcon = LogoTechIcon;

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
      <div className="flex items-center gap-2">
        <LogoTechIcon size={iconSizes[size]} className="transition-transform duration-300 group-hover:scale-110 text-[#9A8029]" />
        <span
          className={`font-sans font-bold text-[#2B1A16] uppercase transition-colors duration-300 group-hover:text-[#9A8029] ${sizeClasses[size]}`}
        >
          AZAD
        </span>
      </div>
      {showSubtitle && (
        <span className="text-[9px] tracking-[0.35em] text-[#2B1A16]/70 uppercase font-sans font-semibold mt-0.5">
          ELECTRONICS & AUDIO
        </span>
      )}
    </Link>
  );
}
