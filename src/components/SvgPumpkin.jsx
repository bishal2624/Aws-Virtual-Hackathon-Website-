import React from 'react';

export default function SvgPumpkin({ size = 28, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Cyberpunk Pumpkin Icon"
    >
      {/* Stem with node joint */}
      <path d="M50 12 L50 24" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
      <circle cx="50" cy="12" r="4" fill="#A3FF12" />
      
      {/* Pumpkin Outer Segments */}
      <path 
        d="M50 24 C28 24 16 38 16 60 C16 82 30 92 50 92 C70 92 84 82 84 60 C84 38 72 24 50 24 Z" 
        stroke="#FF7518" 
        strokeWidth="4" 
        fill="#11111B" 
      />
      {/* Inner Ribs */}
      <path d="M50 24 C38 24 32 40 32 60 C32 80 40 92 50 92" stroke="#FF7518" strokeWidth="2.5" strokeDasharray="4 2" />
      <path d="M50 24 C62 24 68 40 68 60 C68 80 60 92 50 92" stroke="#FF7518" strokeWidth="2.5" strokeDasharray="4 2" />
      
      {/* Cyber Tri-Eyes */}
      <polygon points="34,48 44,52 38,58" fill="#FF7518" />
      <polygon points="66,48 56,52 62,58" fill="#FF7518" />
      
      {/* Digital Sawtooth Mouth */}
      <path d="M32 72 L38 68 L44 73 L50 67 L56 73 L62 68 L68 72" stroke="#FF7518" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
