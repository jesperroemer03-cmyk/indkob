'use client';
import React from 'react';
import { THEME as t } from '@/lib/theme';

export function CheckDisc({ size = 22, faded = false, filled = false }) {
  const col = filled ? t.done : (faded ? t.faint : t.done);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: filled ? t.done : 'transparent',
      boxShadow: filled ? 'none' : `inset 0 0 0 2px ${faded ? t.line : t.done}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5l3.2 3.2L13 5" stroke={filled ? '#fff' : col} strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function CatBadge({ cat, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: t.chipBg, boxShadow: `inset 0 0 0 1px ${t.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, flexShrink: 0,
    }}>{cat.emoji}</div>
  );
}

// Farvet initial-cirkel. hue afledes deterministisk af navnet, så samme
// person altid får samme farve på begge telefoner.
function hueFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return [152, 285, 25, 210, 320][h % 5];
}
export function Avatar({ name, i = 0 }) {
  const hue = hueFor(name || '?');
  return (
    <div style={{
      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
      background: `oklch(0.7 0.12 ${hue})`, color: '#fff',
      border: '2px solid #fff', marginLeft: i ? -8 : 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, fontFamily: t.font,
    }}>{(name || '?')[0].toUpperCase()}</div>
  );
}
