'use client';
import React from 'react';
import { THEME as t } from '@/lib/theme';
import { CAT_BY_ID, parseEntry } from '@/lib/categories';
import { CatBadge, CheckDisc, Avatar } from './primitives';

export default function CaptureScreen({
  value, setValue, qty, setQty, onSubmit, recents, confirm, justAdded, members, listName,
}) {
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    const id = setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    return () => clearTimeout(id);
  }, []);

  const preview = value.trim() ? CAT_BY_ID[parseEntry(value).cat] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: t.bg }}>
      {/* header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 22px) 24px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 19, color: t.text, letterSpacing: -0.3 }}>
          {listName || 'Vores indkøb'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {members.map((m, i) => <Avatar key={m} name={m} i={i} />)}
        </div>
      </div>

      {/* hero input */}
      <div style={{ padding: '10px 20px 0' }}>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div style={{
            background: t.surface, borderRadius: t.cardRadius,
            border: `1.5px solid ${value.trim() ? t.accent : t.line}`,
            boxShadow: t.shadow, padding: '20px 20px 18px',
            transition: 'border-color 160ms ease',
          }}>
            <div style={{ fontFamily: t.font, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.6,
              textTransform: 'uppercase', color: t.faint, marginBottom: 8 }}>
              Tilføj vare
            </div>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Hvad mangler vi?"
              enterKeyHint="done"
              autoComplete="off" autoCorrect="off" spellCheck="false"
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontFamily: t.display, fontWeight: 600, fontSize: 30,
                color: t.text, letterSpacing: -0.5, lineHeight: 1.1, padding: 0,
              }}
            />
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ height: 22, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0,
                opacity: preview ? 1 : 0, transition: 'opacity 140ms ease' }}>
                <span style={{ fontSize: 13, color: t.faint, fontFamily: t.font }}>kommer i</span>
                {preview && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 13.5, fontWeight: 600, fontFamily: t.font, color: t.chipText }}>
                    <span style={{ fontSize: 14 }}>{preview.emoji}</span>{preview.name}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: t.chipBg, borderRadius: 13, flexShrink: 0 }}>
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Færre"
                  style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: 'transparent',
                    fontFamily: t.font, fontSize: 24, fontWeight: 500, color: qty > 1 ? t.muted : t.faint,
                    lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <div style={{ minWidth: 28, textAlign: 'center', fontFamily: t.display, fontWeight: 700, fontSize: 19, color: t.text }}>{qty}</div>
                <button type="button" onClick={() => setQty(q => Math.min(99, q + 1))} aria-label="Flere"
                  style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: 'transparent',
                    fontFamily: t.font, fontSize: 24, fontWeight: 500, color: t.muted,
                    lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
            <button type="submit" disabled={!value.trim()}
              style={{
                marginTop: 16, width: '100%', border: 'none', borderRadius: t.cardRadius - 6,
                padding: '15px', cursor: value.trim() ? 'pointer' : 'default',
                background: value.trim() ? t.accent : t.chipBg,
                color: value.trim() ? t.accentText : t.faint,
                fontFamily: t.display, fontWeight: 700, fontSize: 16.5, letterSpacing: -0.2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                transition: 'background 160ms ease, color 160ms ease',
              }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3.5v11M3.5 9h11" stroke={value.trim() ? t.accentText : t.faint} strokeWidth="2.6" strokeLinecap="round" />
              </svg>
              Tilføj til liste
            </button>
          </div>
        </form>

        {/* bekræftelse (subtil, ingen popup) */}
        <div style={{ height: 26, marginTop: 12, display: 'flex', justifyContent: 'center' }}>
          {confirm && (
            <div key={confirm.nonce} className="il-confirm" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: t.font, fontSize: 14, fontWeight: 600, color: t.done,
            }}>
              <CheckDisc size={18} />
              <span style={{ color: t.text }}>{confirm.name}</span>
              <span style={{ color: t.muted, fontWeight: 500 }}>→ {confirm.emoji} {confirm.cat}</span>
            </div>
          )}
        </div>
      </div>

      {/* sidst tilføjet */}
      <div style={{ flex: 1, padding: '4px 20px 40px' }}>
        <div style={{ fontFamily: t.font, fontSize: 12.5, fontWeight: 600, letterSpacing: 0.6,
          textTransform: 'uppercase', color: t.faint, margin: '8px 4px 10px' }}>
          Sidst tilføjet
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recents.length === 0 && (
            <div style={{ fontFamily: t.font, fontSize: 14, color: t.faint, padding: '6px 4px' }}>
              Skriv en vare og tryk på <b style={{ color: t.muted }}>tilføj</b> — den ryger direkte i listen.
            </div>
          )}
          {recents.slice(0, 4).map((r) => {
            const cat = CAT_BY_ID[r.cat];
            return (
              <div key={r.id} className={r.id === justAdded ? 'il-enter' : ''} style={{
                display: 'flex', alignItems: 'center', gap: 13,
                background: t.surface, borderRadius: t.cardRadius - 4,
                padding: '11px 14px', boxShadow: t.shadow,
              }}>
                <CatBadge cat={cat} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 17, color: t.text, letterSpacing: -0.2 }}>
                    {r.name}{r.qty > 1 && <span style={{ color: t.muted, fontWeight: 500 }}>  × {r.qty}</span>}
                  </div>
                  <div style={{ fontFamily: t.font, fontSize: 12.5, color: t.faint }}>{cat.name}</div>
                </div>
                <CheckDisc size={20} faded />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
