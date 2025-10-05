import React from 'react';

const Logo = ({ width = 44, height = 44, className = '' }) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox="0 0 64 64"
    role="img"
    aria-label="EventHub logo"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="var(--gf-start,#8B5CF6)" />
        <stop offset="1" stopColor="var(--gf-end,#06B6D4)" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g filter="url(#glow)">
      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#lg1)" strokeWidth="4" opacity="0.95" />
    </g>

    <circle cx="32" cy="32" r="20" fill="var(--surface)" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

    <g>
      <defs>
        <linearGradient id="eGrad" x1="0" x2="1">
          <stop offset="0" stopColor="var(--gf-start,#8B5CF6)" />
          <stop offset="1" stopColor="var(--gf-end,#06B6D4)" />
        </linearGradient>
      </defs>
      <path d="M26 22 H38 V26 H30 V30 H36 V34 H30 V38 H38 V42 H26 Z" fill="url(#eGrad)" />
      <path d="M30 26 H36 V30 H32 V34 H36 V38 H30 Z" fill="rgba(255,255,255,0.06)" />
      <path d="M26 22 H38 V42 H26 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
    </g>

    <g fill="var(--gf-accent,#F472B6)" opacity="0.95">
      <circle cx="50" cy="16" r="1.6" />
      <circle cx="14" cy="18" r="1.2" />
      <circle cx="52" cy="46" r="1.3" />
    </g>
  </svg>
);

export default Logo;
