import React, { useMemo } from 'react';

/**
 * Procedural SVG Sinister Jack-o'-Lantern with realistic ribbed lobes,
 * carved glowing eyes, jagged fangs, and inner candle flicker.
 */
function SinisterPumpkinSvg({
  size = 140,
  expression = 'sinister',
  flickerId = 'flicker1',
  glowColor = '#FF7518',
  scale = 1,
  rotation = 0
}) {
  return (
    <svg
      width={size}
      height={size * 0.95}
      viewBox="0 0 200 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        filter: 'drop-shadow(0 6px 16px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 24px rgba(255, 117, 24, 0.28))',
        display: 'block'
      }}
    >
      <defs>
        {/* Pumpkin Body Shading Gradients */}
        <linearGradient id={`pumpkinBase_${flickerId}`} x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA040" />
          <stop offset="35%" stopColor="#FF7518" />
          <stop offset="75%" stopColor="#B84500" />
          <stop offset="100%" stopColor="#4A1600" />
        </linearGradient>

        <linearGradient id={`lobeDark_${flickerId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF6000" />
          <stop offset="60%" stopColor="#9E3500" />
          <stop offset="100%" stopColor="#300E00" />
        </linearGradient>

        {/* Inner Flame Glow Gradient */}
        <radialGradient id={`flameGlow_${flickerId}`} cx="50%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#FFF4B8" />
          <stop offset="30%" stopColor="#FFB800" />
          <stop offset="70%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#992600" />
        </radialGradient>

        {/* Ambient Ground Glow */}
        <radialGradient id={`ambientGlow_${flickerId}`} cx="50%" cy="65%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.45" />
          <stop offset="60%" stopColor={glowColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>

        {/* Stem Gradient */}
        <linearGradient id={`stemGrad_${flickerId}`} x1="90" y1="10" x2="115" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#253816" />
          <stop offset="50%" stopColor="#17240E" />
          <stop offset="100%" stopColor="#0B1207" />
        </linearGradient>

        {/* Candle Flame Flicker Filter */}
        <filter id={`candleFilter_${flickerId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient Orange Aura Behind Pumpkin */}
      <ellipse cx="100" cy="120" rx="90" ry="60" fill={`url(#ambientGlow_${flickerId})`} />

      {/* Twisted Gnarled Stem */}
      <path
        d="M93 42 C92 25, 96 14, 114 8 C116 16, 110 24, 107 42 Z"
        fill={`url(#stemGrad_${flickerId})`}
        stroke="#0D1608"
        strokeWidth="1.5"
      />

      {/* Pumpkin Outer Lobes (Left & Right Flanks) */}
      <path
        d="M48 62 C26 78, 18 112, 26 138 C34 162, 58 174, 80 176 C65 160, 52 135, 52 108 C52 88, 50 74, 48 62 Z"
        fill={`url(#lobeDark_${flickerId})`}
      />
      <path
        d="M152 62 C174 78, 182 112, 174 138 C166 162, 142 174, 120 176 C135 160, 148 135, 148 108 C148 88, 150 74, 152 62 Z"
        fill={`url(#lobeDark_${flickerId})`}
      />

      {/* Intermediate Lobes */}
      <path
        d="M62 52 C44 70, 42 105, 46 135 C50 162, 70 178, 92 180 C78 165, 72 135, 72 106 C72 82, 68 64, 62 52 Z"
        fill={`url(#pumpkinBase_${flickerId})`}
      />
      <path
        d="M138 52 C156 70, 158 105, 154 135 C150 162, 130 178, 108 180 C122 165, 128 135, 128 106 C128 82, 132 64, 138 52 Z"
        fill={`url(#pumpkinBase_${flickerId})`}
      />

      {/* Central Heart Lobes */}
      <path
        d="M100 48 C82 48, 70 75, 70 110 C70 148, 85 182, 100 184 C115 182, 130 148, 130 110 C130 75, 118 48, 100 48 Z"
        fill={`url(#pumpkinBase_${flickerId})`}
        stroke="#521B00"
        strokeWidth="1.2"
      />

      {/* Shadow Crevices Between Lobes */}
      <path d="M72 106 C72 135, 78 165, 92 180" stroke="#3D1200" strokeWidth="2" fill="none" opacity="0.65" />
      <path d="M128 106 C128 135, 122 165, 108 180" stroke="#3D1200" strokeWidth="2" fill="none" opacity="0.65" />

      {/* Glowing Carved Eyes */}
      {expression === 'sinister' ? (
        <g filter={`url(#candleFilter_${flickerId})`} className="halloween-candle-flicker">
          {/* Left Slanted Eyebrow / Eye */}
          <path
            d="M58 84 L84 94 L76 104 Z"
            fill={`url(#flameGlow_${flickerId})`}
            stroke="#260800"
            strokeWidth="1.5"
          />
          {/* Right Slanted Eyebrow / Eye */}
          <path
            d="M142 84 L116 94 L124 104 Z"
            fill={`url(#flameGlow_${flickerId})`}
            stroke="#260800"
            strokeWidth="1.5"
          />
          {/* Triangular Nose */}
          <path
            d="M100 102 L93 116 L107 116 Z"
            fill={`url(#flameGlow_${flickerId})`}
            stroke="#260800"
            strokeWidth="1"
          />
          {/* Sinister Jagged Grin with Sharp Fangs */}
          <path
            d="M56 132 Q78 140 100 142 Q122 140 144 132 Q138 144 126 154 Q100 162 74 154 Q62 144 56 132 Z"
            fill={`url(#flameGlow_${flickerId})`}
            stroke="#260800"
            strokeWidth="2"
          />
          {/* Upper Fangs */}
          <path d="M72 136 L76 146 L82 138 Z" fill="#260800" />
          <path d="M118 138 L124 146 L128 136 Z" fill="#260800" />
          <path d="M96 141 L100 150 L104 141 Z" fill="#260800" />
          {/* Lower Fangs */}
          <path d="M84 154 L88 144 L94 152 Z" fill="#260800" />
          <path d="M106 152 L112 144 L116 154 Z" fill="#260800" />
        </g>
      ) : (
        /* Wide Maniacal Carved Expression */
        <g filter={`url(#candleFilter_${flickerId})`} className="halloween-candle-flicker">
          {/* Angled Triangular Eyes */}
          <path d="M60 82 L86 98 L64 102 Z" fill={`url(#flameGlow_${flickerId})`} stroke="#260800" strokeWidth="1.5" />
          <path d="M140 82 L114 98 L136 102 Z" fill={`url(#flameGlow_${flickerId})`} stroke="#260800" strokeWidth="1.5" />
          {/* Diamond Nose */}
          <polygon points="100,104 106,114 100,120 94,114" fill={`url(#flameGlow_${flickerId})`} stroke="#260800" strokeWidth="1" />
          {/* Wide Crescent Jagged Grin */}
          <path
            d="M52 126 C75 160, 125 160, 148 126 C134 148, 115 156, 100 156 C85 156, 66 148, 52 126 Z"
            fill={`url(#flameGlow_${flickerId})`}
            stroke="#260800"
            strokeWidth="2"
          />
          {/* Staggered Wicked Teeth */}
          <polygon points="68,134 74,146 80,137" fill="#260800" />
          <polygon points="90,140 96,150 102,141" fill="#260800" />
          <polygon points="120,137 126,146 132,134" fill="#260800" />
          <polygon points="78,148 84,138 90,147" fill="#260800" />
          <polygon points="110,147 116,138 122,148" fill="#260800" />
        </g>
      )}
    </svg>
  );
}

/**
 * Continuous Gnarled Thorny Briar Vine Silhouette.
 * Hugs the outer screen boundary to eliminate large empty gaps.
 */
function BrambleVineBorder({ isLeft = true }) {
  const flip = isLeft ? 1 : -1;
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 160 1200"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none',
        opacity: 0.42,
        transform: isLeft ? 'none' : 'scaleX(-1)'
      }}
    >
      <defs>
        <linearGradient id={`vineGrad_${isLeft ? 'L' : 'R'}`} x1="0" y1="0" x2="160" y2="1200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#080C14" />
          <stop offset="40%" stopColor="#121822" />
          <stop offset="70%" stopColor="#0C1018" />
          <stop offset="100%" stopColor="#05070B" />
        </linearGradient>
      </defs>

      {/* Main Creeping Stem */}
      <path
        d="M10 0 C40 180, 5 320, 35 480 C60 620, 15 760, 40 920 C55 1040, 20 1140, 10 1200"
        stroke={`url(#vineGrad_${isLeft ? 'L' : 'R'})`}
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Secondary Intertwined Tendril */}
      <path
        d="M20 50 C5 190, 45 350, 18 520 C-5 680, 50 820, 22 980 C8 1080, 30 1160, 15 1200"
        stroke="#06090F"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Protruding Sharp Thorns */}
      <path d="M30 120 L58 108 L34 132 Z" fill="#0D131C" />
      <path d="M18 240 L-2 226 L12 250 Z" fill="#0D131C" />
      <path d="M26 380 L52 396 L32 400 Z" fill="#0D131C" />
      <path d="M38 560 L68 546 L42 575 Z" fill="#0D131C" />
      <path d="M12 700 L-14 690 L8 718 Z" fill="#0D131C" />
      <path d="M32 840 L60 858 L38 862 Z" fill="#0D131C" />
      <path d="M22 990 L48 978 L26 1008 Z" fill="#0D131C" />
      <path d="M16 1120 L-8 1106 L12 1136 Z" fill="#0D131C" />

      {/* Decayed Autumn Oak Leaves */}
      <path d="M38 210 C52 200, 68 208, 62 224 C56 240, 40 232, 38 210 Z" fill="#4A2608" opacity="0.75" />
      <path d="M46 640 C62 630, 78 640, 70 658 C62 674, 48 662, 46 640 Z" fill="#3D1E04" opacity="0.65" />
      <path d="M30 940 C44 932, 58 942, 52 958 C46 970, 34 960, 30 940 Z" fill="#542B0A" opacity="0.7" />
    </svg>
  );
}

/**
 * Floating Ethereal Ghost Silhouette with soft glowing border.
 */
function FloatingGhostSvg({ size = 56, opacity = 0.55 }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        opacity,
        filter: 'drop-shadow(0 0 14px rgba(200, 215, 230, 0.45))',
        display: 'block'
      }}
      className="halloween-ghost-float"
    >
      <defs>
        <linearGradient id="ghostShade" x1="30" y1="0" x2="30" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(230, 240, 255, 0.75)" />
          <stop offset="60%" stopColor="rgba(180, 205, 230, 0.45)" />
          <stop offset="100%" stopColor="rgba(120, 150, 180, 0)" />
        </linearGradient>
      </defs>

      {/* Ghost Flowing Body */}
      <path
        d="M30 6 C16 6, 8 18, 8 34 C8 52, 14 62, 12 76 C18 70, 22 74, 30 68 C36 74, 42 70, 48 76 C46 62, 52 52, 52 34 C52 18, 44 6, 30 6 Z"
        fill="url(#ghostShade)"
      />

      {/* Hollow Black Eyes */}
      <ellipse cx="22" cy="28" rx="3.5" ry="5.5" fill="#05070B" />
      <ellipse cx="38" cy="28" rx="3.5" ry="5.5" fill="#05070B" />
      {/* Wailing Mouth */}
      <ellipse cx="30" cy="42" rx="4" ry="6" fill="#05070B" />
    </svg>
  );
}

/**
 * Atmospheric Floating Particles (Orange embers and Acid Green fireflies).
 */
function ParticleMotes({ count = 8, isLeft = true }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${15 + (i * 21) % 70}%`,
      bottom: `${(i * 13) % 90}%`,
      size: 3 + (i % 3) * 2,
      color: i % 3 === 0 ? '#00FF66' : '#FF7518',
      delay: `${(i * 0.7).toFixed(1)}s`,
      duration: `${4 + (i % 4)}s`,
      glow: i % 3 === 0 ? 'rgba(0, 255, 102, 0.65)' : 'rgba(255, 117, 24, 0.7)'
    }));
  }, [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="halloween-ember-rise"
          style={{
            position: 'absolute',
            left: p.left,
            bottom: p.bottom,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2.5}px ${p.glow}`,
            animationDelay: p.delay,
            animationDuration: p.duration
          }}
        />
      ))}
    </div>
  );
}

/**
 * Main HalloweenSideDecorations Component.
 * Fixed in outer margins, reveals sinister Jack-o'-lanterns, twisted roots,
 * dead leaves, and floating wisps progressively as scrollProgress increases.
 */
export default function HalloweenSideDecorations({
  scrollProgress = 0,
  isReducedMotion = false
}) {
  // Smoothly compute stage visibility and progressive entrance based on scrollProgress
  const getStageTransform = (center, spread = 0.14, flip = false) => {
    if (isReducedMotion) {
      // Damped static visibility without aggressive scale/translation
      const dist = Math.abs(scrollProgress - center);
      const op = Math.max(0.15, Math.min(1, 1 - dist / (spread * 1.5)));
      return {
        opacity: op,
        transform: 'none',
        transition: 'opacity 0.4s ease'
      };
    }

    const dist = Math.abs(scrollProgress - center);
    // Smooth cosine-like bell curve for reveal
    const factor = Math.max(0, 1 - Math.pow(dist / spread, 1.6));
    const opacity = Math.min(1, Math.max(0, factor * 1.25));
    // Subtle upward emergence from shadow
    const translateY = (1 - factor) * (center > scrollProgress ? 36 : -36);
    const scale = 0.86 + 0.14 * factor;
    const rotate = (flip ? -1 : 1) * (1 - factor) * 6;

    return {
      opacity,
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(2)}) rotate(${rotate.toFixed(1)}deg)`,
      transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  // Helper for Hero stage decorations ensuring 100% full opacity at top of page
  const getHeroLeftTransform = () => {
    if (isReducedMotion) {
      const op = Math.max(0, 1 - scrollProgress / 0.22);
      return { opacity: op, transform: 'none' };
    }
    let opacity = 1;
    let translateY = 0;
    if (scrollProgress > 0.10) {
      const t = Math.min(1, (scrollProgress - 0.10) / 0.12);
      opacity = 1 - t;
      translateY = -35 * t;
    }
    return {
      opacity,
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
      transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  const getHeroRightTransform = () => {
    if (isReducedMotion) {
      const op = Math.max(0, 1 - scrollProgress / 0.22);
      return { opacity: op, transform: 'none' };
    }
    let opacity = 1;
    let translateY = 0;
    if (scrollProgress > 0.10) {
      const t = Math.min(1, (scrollProgress - 0.10) / 0.12);
      opacity = 1 - t;
      translateY = -35 * t;
    }
    return {
      opacity,
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
      transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {/* ========================================================
          LEFT MARGIN RAIL
          ======================================================== */}
      <aside
        className="halloween-side-rail halloween-side-rail--left"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'clamp(120px, 15vw, 240px)',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        {/* Continuous Bramble Background to avoid empty gaps */}
        <BrambleVineBorder isLeft={true} />

        {/* Floating Embers */}
        <ParticleMotes count={7} isLeft={true} />

        {/* STAGE 0 (Hero, 0.00 to 0.18): Upper sinister pumpkin nestled in top briars */}
        <div
          style={{
            position: 'absolute',
            top: '16%',
            left: '12px',
            ...getHeroLeftTransform()
          }}
        >
          <SinisterPumpkinSvg
            size={135}
            expression="sinister"
            flickerId="left_hero"
            glowColor="#FF7518"
            rotation={-6}
          />
        </div>

        {/* STAGE 1 (Gate & Graveyard, 0.18 to 0.38): Tilted toothy pumpkin on dark roots */}
        <div
          style={{
            position: 'absolute',
            top: '38%',
            left: '18px',
            ...getStageTransform(0.24, 0.13, false)
          }}
        >
          <SinisterPumpkinSvg
            size={145}
            expression="wide"
            flickerId="left_gate"
            glowColor="#FF7518"
            rotation={8}
          />
          <div style={{ position: 'absolute', top: '-40px', right: '-15px' }}>
            <FloatingGhostSvg size={48} opacity={0.65} />
          </div>
        </div>

        {/* STAGE 2 (Crypt & Chambers, 0.38 to 0.58): Bio-cyber glowing pumpkin */}
        <div
          style={{
            position: 'absolute',
            top: '56%',
            left: '10px',
            ...getStageTransform(0.46, 0.14, false)
          }}
        >
          <SinisterPumpkinSvg
            size={155}
            expression="sinister"
            flickerId="left_chambers"
            glowColor="#39FF14"
            rotation={-4}
          />
        </div>

        {/* STAGE 3 (Chronicles & Judges, 0.58 to 0.78): Ancient elder Jack-o'-lantern */}
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '22px',
            ...getStageTransform(0.68, 0.13, false)
          }}
        >
          <SinisterPumpkinSvg
            size={150}
            expression="wide"
            flickerId="left_judges"
            glowColor="#FF7518"
            rotation={5}
          />
        </div>

        {/* STAGE 4 (Vault, Alliance & Portal, 0.78 to 1.00): Giant sinister bottom sentinel */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '8px',
            ...getStageTransform(0.88, 0.16, false)
          }}
        >
          <SinisterPumpkinSvg
            size={175}
            expression="sinister"
            flickerId="left_portal"
            glowColor="#FF7518"
            rotation={-8}
          />
        </div>
      </aside>

      {/* ========================================================
          RIGHT MARGIN RAIL (Enhanced Spooky Hero Atmosphere)
          ======================================================== */}
      <aside
        className="halloween-side-rail halloween-side-rail--right"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: 'clamp(160px, 20vw, 300px)',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        {/* Continuous Bramble Background to avoid empty gaps */}
        <BrambleVineBorder isLeft={false} />

        {/* Floating Embers and Green Fireflies */}
        <ParticleMotes count={10} isLeft={false} />

        {/* STAGE 0 (Hero, 0.00 to 0.20): Complete Spooky Right-Side Halloween Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            ...getHeroRightTransform()
          }}
        >
          {/* Upper Right: Floating Ghost Wisp drifting near top corner */}
          <div style={{ position: 'absolute', top: '12%', right: '28px' }}>
            <FloatingGhostSvg size={68} opacity={0.78} />
          </div>

          {/* Mid-Upper Right: Large Sinister Jack-o'-Lantern with sharp fangs and glowing core */}
          <div style={{ position: 'absolute', top: '26%', right: '18px' }}>
            <SinisterPumpkinSvg
              size={168}
              expression="sinister"
              flickerId="right_hero_main"
              glowColor="#FF7518"
              rotation={-6}
            />
          </div>

          {/* Mid-Lower Right: Secondary Menacing Pumpkin with wide toothy grin */}
          <div style={{ position: 'absolute', top: '51%', right: '26px' }}>
            <SinisterPumpkinSvg
              size={136}
              expression="wide"
              flickerId="right_hero_sub"
              glowColor="#FF7518"
              rotation={8}
            />
            {/* Companion small floating wisp */}
            <div style={{ position: 'absolute', top: '-38px', left: '-18px' }}>
              <FloatingGhostSvg size={44} opacity={0.65} />
            </div>
          </div>

          {/* Lower Right: Eerie tertiary pumpkin with acid-green supernatural glow */}
          <div style={{ position: 'absolute', top: '74%', right: '16px' }}>
            <SinisterPumpkinSvg
              size={115}
              expression="sinister"
              flickerId="right_hero_low"
              glowColor="#39FF14"
              rotation={-5}
            />
          </div>
        </div>

        {/* STAGE 1 (Gate & Graveyard, 0.18 to 0.38): Perched menacing pumpkin pair */}
        <div
          style={{
            position: 'absolute',
            top: '46%',
            right: '16px',
            ...getStageTransform(0.28, 0.13, true)
          }}
        >
          <SinisterPumpkinSvg
            size={148}
            expression="sinister"
            flickerId="right_gate"
            glowColor="#FF7518"
            rotation={-7}
          />
        </div>

        {/* STAGE 2 (Crypt & Chambers, 0.38 to 0.58): Maniacal grin observing chambers */}
        <div
          style={{
            position: 'absolute',
            top: '32%',
            right: '20px',
            ...getStageTransform(0.50, 0.14, true)
          }}
        >
          <SinisterPumpkinSvg
            size={160}
            expression="wide"
            flickerId="right_chambers"
            glowColor="#FF7518"
            rotation={9}
          />
          <div style={{ position: 'absolute', bottom: '-45px', left: '-20px' }}>
            <FloatingGhostSvg size={52} opacity={0.6} />
          </div>
        </div>

        {/* STAGE 3 (Chronicles & Judges, 0.58 to 0.78): Watchful pumpkin on root pedestal */}
        <div
          style={{
            position: 'absolute',
            top: '64%',
            right: '14px',
            ...getStageTransform(0.70, 0.13, true)
          }}
        >
          <SinisterPumpkinSvg
            size={155}
            expression="sinister"
            flickerId="right_judges"
            glowColor="#39FF14"
            rotation={-5}
          />
        </div>

        {/* STAGE 4 (Vault, Alliance & Portal, 0.78 to 1.00): Giant sinister portal sentinel */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10px',
            ...getStageTransform(0.90, 0.16, true)
          }}
        >
          <SinisterPumpkinSvg
            size={180}
            expression="wide"
            flickerId="right_portal"
            glowColor="#FF7518"
            rotation={7}
          />
        </div>
      </aside>
    </div>
  );
}
