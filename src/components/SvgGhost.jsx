import React from 'react';

export default function SvgGhost({ size = 28, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Cyber Ghost Icon"
    >
      {/* Ghost Dome and Trailing Skirt */}
      <path 
        d="M20 50 C20 30 32 18 50 18 C68 18 80 30 80 50 V82 L70 74 L60 82 L50 74 L40 82 L30 74 L20 82 Z" 
        stroke="#8B5CF6" 
        strokeWidth="4" 
        fill="#11111B" 
      />
      {/* Circuit Nodes in Eyes */}
      <circle cx="38" cy="44" r="5" fill="#A3FF12" />
      <circle cx="62" cy="44" r="5" fill="#A3FF12" />
      {/* Digital Wave Form */}
      <path d="M42 60 Q50 66 58 60" stroke="#FF7518" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
