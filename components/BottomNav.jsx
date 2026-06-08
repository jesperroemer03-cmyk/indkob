'use client';
import React from 'react';
import { THEME as t } from '@/lib/theme';

export default function BottomNav({ screen, setScreen, count, variant = 'float' }) {
  const seg = (id, label, badge) => {
    const on = screen === id;
    return (
      <button onClick={() => setScreen(id)} style={{
        flex: 1, border: 'none', cursor: 'pointer',
        background: on ? t.accent : 'transparent',
        color: on ? t.accentText : t.muted,
        borderRadius: 999, padding: '11px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: t.display, fontWeight: 700, fontSize: 15.5, letterSpacing: -0.2,
        transition: 'background 180ms ease, color 180ms ease',
      }}>
        {id === 'capture'
          ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3v12M3 9h12" stroke={on ? t.accentText : t.muted} strokeWidth="2.4" strokeLinecap="round" /></svg>
          : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 4.5h12M3 9h12M3 13.5h12" stroke={on ? t.accentText : t.muted} strokeWidth="2.2" strokeLinecap="round" /></svg>}
        {label}
        {badge != null && (
          <span style={{
            fontSize: 12, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
            background: on ? 'rgba(255,255,255,0.25)' : t.chipBg,
            color: on ? t.accentText : t.chipText,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{badge}</span>
        )}
      </button>
    );
  };
  const wrap = variant === 'float'
    ? { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, padding: '0 0 calc(env(safe-area-inset-bottom) + 22px)' }
    : { position: 'relative', padding: '8px 0 calc(env(safe-area-inset-bottom) + 14px)' };
  return (
    <div style={{ ...wrap, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        pointerEvents: 'auto',
        display: 'flex', gap: 4, width: 280, padding: 5,
        background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 999, boxShadow: '0 8px 30px -8px rgba(20,40,30,0.3), inset 0 0 0 1px rgba(0,0,0,0.05)',
      }}>
        {seg('capture', 'Tilføj')}
        {seg('list', 'Liste', count)}
      </div>
    </div>
  );
}
