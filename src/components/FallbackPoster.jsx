import React from 'react';

/**
 * Hand-built layered SVG silhouette of the haunted mansion, moon, and graveyard.
 * Displayed immediately on initial paint before 3D canvas loads and as a permanent
 * fallback if WebGL is unsupported or disabled.
 */
export default function FallbackPoster({ opacity = 1, isVisible = true }) {
  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: '#050505',
        opacity,
        transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}
    >
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Deep night gradient background */}
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#080D1A" />
            <stop offset="50%" stopColor="#05070E" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>

          {/* Luminous moon halo */}
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200, 205, 216, 0.28)" />
            <stop offset="45%" stopColor="rgba(200, 205, 216, 0.08)" />
            <stop offset="100%" stopColor="rgba(200, 205, 216, 0)" />
          </radialGradient>

          {/* Ground fog gradient */}
          <linearGradient id="fogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(8, 13, 26, 0)" />
            <stop offset="40%" stopColor="rgba(20, 24, 35, 0.5)" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>

          {/* Window warm orange glow */}
          <radialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB000" />
            <stop offset="70%" stopColor="#FF7518" />
            <stop offset="100%" stopColor="#B34A00" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="900" fill="url(#skyGrad)" />

        {/* Distant Moon Halo & Orb */}
        <circle cx="720" cy="340" r="280" fill="url(#moonHalo)" />
        <circle cx="720" cy="340" r="110" fill="#E2E6EF" />
        {/* Subtle procedural crater shapes */}
        <ellipse cx="690" cy="310" rx="18" ry="12" fill="#C8CDD8" opacity="0.6" />
        <ellipse cx="750" cy="360" rx="24" ry="16" fill="#C8CDD8" opacity="0.5" />
        <ellipse cx="670" cy="370" rx="14" ry="9" fill="#C8CDD8" opacity="0.4" />
        <ellipse cx="730" cy="290" rx="12" ry="8" fill="#C8CDD8" opacity="0.5" />

        {/* Distant Mountainous Silhouette */}
        <path
          d="M0 640 L180 580 L380 620 L580 560 L780 600 L980 540 L1180 610 L1340 570 L1440 610 L1440 900 L0 900 Z"
          fill="#0C101C"
          opacity="0.8"
        />

        {/* Victorian Mansion Center Silhouette */}
        <g id="mansion-silhouette">
          {/* Main foundation and central stone hall */}
          <rect x="580" y="440" width="280" height="260" fill="#12151E" />
          <polygon points="560,440 720,330 880,440" fill="#0E121B" />

          {/* Left Wing & Gables */}
          <rect x="470" y="490" width="120" height="210" fill="#12151E" />
          <polygon points="460,490 530,410 600,490" fill="#0E121B" />

          {/* Right Tower & Spire */}
          <rect x="850" y="410" width="100" height="290" fill="#10131C" />
          <polygon points="840,410 900,280 960,410" fill="#0A0D15" />
          {/* Iron weather vane on right tower */}
          <line x1="900" y1="280" x2="900" y2="250" stroke="#FF7518" strokeWidth="2" opacity="0.7" />
          <line x1="890" y1="260" x2="910" y2="260" stroke="#FF7518" strokeWidth="2" opacity="0.7" />

          {/* Chimneys */}
          <rect x="510" y="380" width="22" height="60" fill="#0A0D15" />
          <rect x="760" y="310" width="26" height="70" fill="#0A0D15" />

          {/* Arched Entryway Porch */}
          <rect x="680" y="600" width="80" height="100" fill="#0A0D15" />
          <path d="M690 700 L690 640 Q720 615 750 640 L750 700 Z" fill="#FF7518" opacity="0.85" />

          {/* Glowing Windows with Warm Pumpkin Light */}
          <rect x="620" y="470" width="30" height="48" rx="4" fill="url(#windowGlow)" />
          <rect x="680" y="470" width="30" height="48" rx="4" fill="url(#windowGlow)" />
          <rect x="740" y="470" width="30" height="48" rx="4" fill="url(#windowGlow)" />
          <rect x="800" y="470" width="30" height="48" rx="4" fill="url(#windowGlow)" />

          <rect x="630" y="540" width="26" height="40" rx="3" fill="url(#windowGlow)" />
          <rect x="790" y="540" width="26" height="40" rx="3" fill="url(#windowGlow)" />

          <rect x="500" y="520" width="28" height="44" rx="4" fill="url(#windowGlow)" />
          <rect x="880" y="450" width="24" height="42" rx="4" fill="url(#windowGlow)" />
          <circle cx="720" cy="380" r="16" fill="url(#windowGlow)" />

          {/* Acid Green Serverless Energy Line */}
          <path
            d="M510 620 Q560 600 620 625 T720 610 T840 630"
            fill="none"
            stroke="#A3FF12"
            strokeWidth="3"
            opacity="0.8"
            strokeDasharray="6 4"
          />
        </g>

        {/* Foreground Graveyard & Wrought-Iron Gates */}
        <g id="graveyard-silhouette">
          {/* Ground Silhouette */}
          <path d="M0 680 Q360 650 720 670 T1440 680 L1440 900 L0 900 Z" fill="#080B12" />

          {/* Tombs & Crosses */}
          <rect x="180" y="650" width="28" height="40" rx="8" fill="#141824" transform="rotate(-4 194 670)" />
          <rect x="320" y="660" width="32" height="44" rx="6" fill="#141824" transform="rotate(3 336 682)" />
          <polygon points="260,650 270,630 280,650 275,690 265,690" fill="#101420" />
          <rect x="1120" y="655" width="30" height="42" rx="6" fill="#141824" transform="rotate(5 1135 676)" />
          <rect x="1240" y="645" width="26" height="46" rx="8" fill="#141824" transform="rotate(-6 1253 668)" />

          {/* Glowing Jack-o'-Lanterns */}
          <ellipse cx="420" cy="690" rx="16" ry="14" fill="#FF7518" />
          <polygon points="415,688 418,684 421,688" fill="#050505" />
          <polygon points="423,688 426,684 429,688" fill="#050505" />
          <path d="M414 694 Q422 698 428 694 Z" fill="#050505" />

          <ellipse cx="1040" cy="695" rx="18" ry="15" fill="#FF7518" />
          <polygon points="1034,693 1038,689 1042,693" fill="#050505" />
          <polygon points="1044,693 1048,689 1052,693" fill="#050505" />
          <path d="M1035 700 Q1043 705 1051 700 Z" fill="#050505" />

          {/* Gnarled Framing Trees Left and Right */}
          <path
            d="M0 450 Q70 520 60 620 Q50 720 0 800 Z"
            fill="#05070D"
          />
          <path
            d="M40 560 Q90 540 130 500 Q100 520 70 550"
            stroke="#05070D"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M1440 460 Q1370 530 1380 630 Q1390 730 1440 820 Z"
            fill="#05070D"
          />
          <path
            d="M1400 570 Q1350 540 1310 510 Q1340 530 1370 560"
            stroke="#05070D"
            strokeWidth="12"
            fill="none"
          />
        </g>

        {/* Low Multi-planar Atmospheric Fog */}
        <rect x="0" y="660" width="1440" height="240" fill="url(#fogGrad)" />
      </svg>
    </div>
  );
}
