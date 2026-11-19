import React from 'react';
import { findInstitution } from '../utils/indonesianBanks';

/**
 * Crisp inline SVG emblem for Indonesian Banks & E-Wallets.
 * Zero external CDN dependencies — loads instantly offline & on Vercel.
 */
export const BankLogo = ({ institutionId, name = '', color, size = 34, className = '' }) => {
  const inst = findInstitution({ name: institutionId || name });
  const bg = inst?.color || color || '#3b82f6';
  const accent = inst?.accent || '#60a5fa';
  const textColor = inst?.textColor || '#ffffff';
  const motif = inst?.motif || 'circle';
  const label = inst?.short || (name ? name.replace(/^Bank\s+/i, '').slice(0, 4).toUpperCase() : 'BANK');
  const fontSize = label.length >= 4 ? 10 : label.length === 3 ? 11.5 : 13;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 rounded-lg shadow-sm ${className}`}
      aria-label={inst?.name || name || 'Bank'}
    >
      <defs>
        <linearGradient id={`grad-${label}-${bg.replace('#', '')}`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="10" fill={`url(#grad-${label}-${bg.replace('#', '')})`} />

      {/* Subtle Brand Geometric Motif */}
      {motif === 'wave' && (
        <path d="M-2 29 C10 21, 24 35, 42 25 L42 42 L-2 42 Z" fill="#FFFFFF" fillOpacity="0.16" />
      )}
      {motif === 'ribbon' && (
        <path d="M0 7 L40 0 L40 11 L0 18 Z" fill="#FFFFFF" fillOpacity="0.2" />
      )}
      {motif === 'chevron' && (
        <path d="M24 0 L40 0 L40 18 L24 40 L14 40 Z" fill="#FFFFFF" fillOpacity="0.15" />
      )}
      {motif === 'diamond' && (
        <polygon points="20,2 38,20 20,38 2,20" fill="#FFFFFF" fillOpacity="0.12" />
      )}
      {motif === 'hexagon' && (
        <polygon points="20,3 35,11 35,29 20,37 5,29 5,11" fill="#FFFFFF" fillOpacity="0.12" />
      )}
      {motif === 'grid' && (
        <g fill="#FFFFFF" fillOpacity="0.14">
          <rect x="4" y="4" width="14" height="14" rx="3" />
          <rect x="22" y="22" width="14" height="14" rx="3" />
        </g>
      )}
      {motif === 'circle' && (
        <circle cx="32" cy="8" r="12" fill="#FFFFFF" fillOpacity="0.16" />
      )}

      {/* Brand Monogram */}
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill={textColor}
        fontSize={fontSize}
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="-0.4"
      >
        {label}
      </text>
    </svg>
  );
};
