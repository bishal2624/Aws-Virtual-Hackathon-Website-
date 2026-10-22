import React from 'react';

export default function SvgHauntedCloud({ className = "w-full h-auto" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 600 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Haunted Cloud Architecture Diagram"
    >
      <defs>
        {/* Subtle grid pattern for nodes */}
        <pattern id="cloudGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#71718A" fillOpacity="0.25" />
        </pattern>
        <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Starfield / Constellation dots */}
      <circle cx="80" cy="90" r="1.5" fill="#A1A1B5" fillOpacity="0.4" />
      <circle cx="150" cy="60" r="2" fill="#FF7518" fillOpacity="0.6" />
      <circle cx="480" cy="80" r="1.5" fill="#8B5CF6" fillOpacity="0.5" />
      <circle cx="530" cy="140" r="2" fill="#A1A1B5" fillOpacity="0.3" />
      <circle cx="100" cy="320" r="2" fill="#8B5CF6" fillOpacity="0.4" />
      <circle cx="520" cy="300" r="1.5" fill="#FF7518" fillOpacity="0.5" />

      {/* Cloud Architecture Outline */}
      <path 
        d="M200 280 H400 C444 280 480 244 480 200 C480 160 450 126 410 121 C398 75 354 40 300 40 C242 40 195 80 186 132 C146 142 118 178 118 220 C118 253 145 280 180 280" 
        stroke="#8B5CF6" 
        strokeWidth="2.5" 
        strokeDasharray="6 4"
        fill="#11111B" 
        fillOpacity="0.6" 
      />

      {/* Inner Cloud Structural Grid Fill */}
      <path 
        d="M200 270 H395 C435 270 470 236 470 196 C470 160 440 128 404 124 C392 82 350 50 300 50 C248 50 205 86 196 136 C158 146 130 180 130 220 C130 250 155 270 190 270" 
        fill="url(#cloudGrid)" 
      />

      {/* Circuit Nodes & Connectors */}
      <path d="M190 140 L230 170 L280 150 L340 190 L400 160" stroke="#FF7518" strokeWidth="2" strokeLinecap="round" />
      <circle cx="190" cy="140" r="4" fill="#FF7518" filter="url(#orangeGlow)" />
      <circle cx="230" cy="170" r="3.5" fill="#F8FAFC" />
      <circle cx="280" cy="150" r="5" fill="#FF7518" />
      <circle cx="340" cy="190" r="4" fill="#A3FF12" />
      <circle cx="400" cy="160" r="4" fill="#FF7518" filter="url(#orangeGlow)" />

      {/* Haunted Server Gateway Window */}
      <rect x="275" y="195" width="50" height="60" rx="4" fill="#09090F" stroke="#FF7518" strokeWidth="2" />
      {/* Lit Window Crossbars */}
      <line x1="300" y1="195" x2="300" y2="255" stroke="#FF7518" strokeWidth="1.5" />
      <line x1="275" y1="225" x2="325" y2="225" stroke="#FF7518" strokeWidth="1.5" />
      {/* Gateway Light Glow */}
      <rect x="280" y="200" width="16" height="21" fill="#FF7518" fillOpacity="0.8" />
      <rect x="304" y="200" width="17" height="21" fill="#FF7518" fillOpacity="0.8" />
      <rect x="280" y="229" width="16" height="22" fill="#FF7518" fillOpacity="0.4" />
      <rect x="304" y="229" width="17" height="22" fill="#FF7518" fillOpacity="0.4" />

      {/* Data Ingestion Rays / Pipelines dropping from Cloud */}
      <path d="M210 280 V340 L180 370" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="180" cy="370" r="4" fill="#8B5CF6" filter="url(#purpleGlow)" />

      <path d="M300 280 V370" stroke="#FF7518" strokeWidth="2" />
      <circle cx="300" cy="370" r="5" fill="#FF7518" filter="url(#orangeGlow)" />

      <path d="M390 280 V330 L420 370" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="420" cy="370" r="4" fill="#8B5CF6" filter="url(#purpleGlow)" />

      {/* Telemetry Labels */}
      <text x="180" y="390" fill="#A1A1B5" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">INGEST</text>
      <text x="300" y="390" fill="#FF7518" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">LAMBDA</text>
      <text x="420" y="390" fill="#A1A1B5" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">STORE</text>

      {/* Haunted Ghost Packet Node */}
      <g transform="translate(440, 100)">
        <path d="M0 16 C0 7 7 0 16 0 C25 0 32 7 32 16 V28 L27 24 L21 28 L16 24 L11 28 L5 24 L0 28 Z" fill="#171724" stroke="#8B5CF6" strokeWidth="1.5" />
        <circle cx="10" cy="12" r="2" fill="#A3FF12" />
        <circle cx="22" cy="12" r="2" fill="#A3FF12" />
      </g>
    </svg>
  );
}
