'use client';
import React from 'react';
import { THEME as t } from '@/lib/theme';
import { CAT_BY_ID, categorise } from '@/lib/categories';
import { CheckDisc } from './primitives';

// Vare-række: aktiv (swipe-til-købt + tap-for-rediger), inline-redigering, eller købt.
export default function SwipeRow({ item, onBuy, onUnbuy, onEdit, onDelete }) {
  const [dx, setDx] = React.useState(0);
  const drag = React.useRef({ active: false, x0: 0, moved: false });
  const TH = 88;

  const [editing, setEditing] = React.useState(false);
  const [eName, setEName] = React.useState(item.name);
  const [eQty, setEQty] = React.useState(item.qty);
  const editRef = React.useRef(null);
  React.useEffect(() => {
    if (editing && editRef.current) { editRef.current.focus(); editRef.current.select(); }
  }, [editing]);

  const openEdit = () => { setEName(item.name); setEQty(item.qty); setEditing(true); };
  const saveEdit = () => {
    const name = eName.trim();
    if (!name) { setEditing(false); return; }
    onEdit && onEdit(item.id, { name, qty: eQty });
    setEditing(false);
  };
  const cancelEdit = () => { setEName(item.name); setEQty(item.qty); setEditing(false); };

  // ── inline-redigering ──
  if (editing) {
    const preview = CAT_BY_ID[categorise(eName.trim() || item.name)];
    const stepBtn = {
      width: 32, height: 32, border: 'none', cursor: 'pointer', background: 'transparent',
      fontFamily: t.font, fontSize: 22, fontWeight: 600, color: t.muted, lineHeight: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    };
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{
          background: t.surface, borderRadius: t.cardRadius - 4, boxShadow: t.shadow,
          border: `1.5px solid ${t.accent}`, padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              ref={editRef} value={eName}
              onChange={(e) => setEName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
              autoComplete="off" autoCorrect="off" spellCheck="false"
              style={{
                flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: t.display, fontWeight: 600, fontSize: 19, color: t.text,
                letterSpacing: -0.3, padding: 0,
              }} />
            <div style={{ display: 'flex', alignItems: 'center', background: t.chipBg, borderRadius: 11, flexShrink: 0 }}>
              <button onClick={() => setEQty(q => Math.max(1, q - 1))} style={stepBtn} aria-label="Færre">−</button>
              <div style={{ minWidth: 22, textAlign: 'center', fontFamily: t.font, fontWeight: 700, fontSize: 15.5, color: t.text }}>{eQty}</div>
              <button onClick={() => setEQty(q => Math.min(99, q + 1))} style={stepBtn} aria-label="Flere">+</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <button onClick={() => onDelete && onDelete(item.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
              background: 'transparent', padding: '6px 2px',
              fontFamily: t.font, fontSize: 13.5, fontWeight: 600, color: 'oklch(0.58 0.13 25)',
            }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 4.5h10M6.5 4.5V3.5a1 1 0 011-1h1a1 1 0 011 1v1M5 4.5l.6 8a1 1 0 001 .9h2.8a1 1 0 001-.9l.6-8" stroke="oklch(0.58 0.13 25)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Slet
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: t.font, fontSize: 12.5, color: t.faint, marginRight: 2 }}>
                <span style={{ fontSize: 13 }}>{preview.emoji}</span>{preview.name}
              </span>
              <button onClick={cancelEdit} style={{
                border: 'none', cursor: 'pointer', background: t.chipBg, color: t.muted,
                borderRadius: 999, padding: '8px 14px', fontFamily: t.display, fontWeight: 700, fontSize: 14,
              }}>Annullér</button>
              <button onClick={saveEdit} style={{
                border: 'none', cursor: 'pointer', background: t.accent, color: t.accentText,
                borderRadius: 999, padding: '8px 16px', fontFamily: t.display, fontWeight: 700, fontSize: 14,
              }}>Gem</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── købt: bliver liggende synligt, grået ud, tap for at fortryde ──
  if (item.bought) {
    return (
      <button
        onClick={() => onUnbuy(item.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
          border: 'none', cursor: 'pointer',
          background: t.boughtBg, borderRadius: t.cardRadius - 4,
          padding: '13px 16px', marginBottom: 8,
        }}
        aria-label={`${item.name} — købt, tap for at fortryde`}>
        <CheckDisc size={26} filled />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.display, fontWeight: 500, fontSize: 19, color: t.muted,
            letterSpacing: -0.3, textDecoration: 'line-through', textDecorationColor: t.faint }}>
            {item.name}
          </div>
        </div>
        {item.qty > 1 && (
          <div style={{ fontFamily: t.font, fontSize: 13.5, fontWeight: 700, color: t.muted,
            whiteSpace: 'nowrap', flexShrink: 0 }}>× {item.qty}</div>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
          fontFamily: t.font, fontSize: 12.5, fontWeight: 600, color: t.muted }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6 3.5L2.5 7 6 10.5M2.5 7H10a3.5 3.5 0 010 7H7" stroke={t.muted} strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Fortryd
        </span>
      </button>
    );
  }

  // ── aktiv: swipe til højre for at markere som købt ──
  const start = (e) => { drag.current = { active: true, x0: e.clientX, moved: false }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    if (!drag.current.active) return;
    let d = e.clientX - drag.current.x0;
    if (Math.abs(d) > 4) drag.current.moved = true;
    setDx(Math.max(0, Math.min(d, 300)));
  };
  const end = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (!drag.current.moved) { setDx(0); openEdit(); return; }   // rent tap → rediger
    if (dx > TH) { setDx(0); onBuy(item.id); }
    else setDx(0);
  };
  const progress = Math.min(1, dx / TH);

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: t.cardRadius - 4, marginBottom: 8, touchAction: 'pan-y',
    }}>
      {/* grøn baggrund afsløres under swipe */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: t.cardRadius - 4,
        background: t.done, display: 'flex', alignItems: 'center', paddingLeft: 22,
        gap: 10, color: '#fff', fontFamily: t.font, fontWeight: 700, fontSize: 15,
        opacity: progress,
      }}>
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" style={{ transform: `scale(${0.6 + progress * 0.5})` }}>
          <path d="M3 8.5l3.2 3.2L13 5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Købt
      </div>

      {/* selve rækken */}
      <div
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
          background: t.surface, borderRadius: t.cardRadius - 4,
          padding: '13px 16px', boxShadow: t.shadow,
          transform: `translateX(${dx}px)`,
          transition: drag.current.active ? 'none' : 'transform 220ms cubic-bezier(.2,.8,.2,1)',
          cursor: 'grab',
        }}>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onBuy(item.id)}
          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
          aria-label="Marker som købt">
          <CheckDisc size={26} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: t.display, fontWeight: 600, fontSize: 19, color: t.text, letterSpacing: -0.3 }}>
            {item.name}
          </div>
        </div>
        {item.qty > 1 && (
          <div style={{
            fontFamily: t.font, fontSize: 14, fontWeight: 700, color: t.chipText,
            background: t.chipBg, borderRadius: 9, padding: '3px 10px', whiteSpace: 'nowrap', flexShrink: 0,
          }}>× {item.qty}</div>
        )}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
          <path d="M4 10h11M11 6l4 4-4 4" stroke={t.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
