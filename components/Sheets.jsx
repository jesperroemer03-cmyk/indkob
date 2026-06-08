'use client';
import React from 'react';
import { THEME as t } from '@/lib/theme';

const overlay = {
  position: 'fixed', inset: 0, zIndex: 120,
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
  background: 'rgba(18,28,24,0.4)', padding: '0 9px',
};

export function ClearSheet({ count, onConfirm, onClose }) {
  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} className="il-sheet" style={{ marginBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div style={{
          background: 'rgba(252,252,252,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 22, overflow: 'hidden', textAlign: 'center',
        }}>
          <div style={{ padding: '20px 22px 16px' }}>
            <div style={{ fontFamily: t.display, fontWeight: 700, fontSize: 16.5, color: t.text }}>Ryd hele listen?</div>
            <div style={{ fontFamily: t.font, fontSize: 13.5, color: t.muted, marginTop: 5, lineHeight: 1.4 }}>
              {count} {count === 1 ? 'vare' : 'varer'} fjernes — det kan ikke fortrydes.
            </div>
          </div>
          <button onClick={onConfirm} style={{
            width: '100%', border: 'none', borderTop: `1px solid ${t.line}`, cursor: 'pointer',
            background: 'transparent', padding: '15px',
            fontFamily: t.display, fontWeight: 700, fontSize: 17, color: t.destructive,
          }}>Ryd liste</button>
        </div>
        <button onClick={onClose} style={{
          width: '100%', marginTop: 8, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 22, padding: '15px',
          fontFamily: t.display, fontWeight: 700, fontSize: 17, color: t.text,
        }}>Annullér</button>
      </div>
    </div>
  );
}

export function ShareSheet({ code, onClose }) {
  const [copied, setCopied] = React.useState('');
  const link = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : '';

  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which); setTimeout(() => setCopied(''), 1500);
    } catch { /* clipboard ikke tilgængelig */ }
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Vores indkøbsliste', text: `Deltag i indkøbslisten med koden ${code}`, url: link }); } catch {}
    } else { copy(link, 'link'); }
  };

  const row = (label, value, onClick, ok) => (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      border: 'none', borderTop: `1px solid ${t.line}`, cursor: 'pointer', background: 'transparent',
      padding: '14px 18px', textAlign: 'left',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: t.font, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: t.faint }}>{label}</div>
        <div style={{ fontFamily: t.display, fontSize: 15.5, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
      <span style={{ fontFamily: t.display, fontSize: 13.5, fontWeight: 700, color: ok ? t.done : t.accent, flexShrink: 0 }}>
        {ok ? 'Kopieret ✓' : 'Kopiér'}
      </span>
    </button>
  );

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} className="il-sheet" style={{ marginBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
        <div style={{
          background: 'rgba(252,252,252,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 22, overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 22px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: t.display, fontWeight: 700, fontSize: 16.5, color: t.text }}>Del listen</div>
            <div style={{ fontFamily: t.font, fontSize: 13.5, color: t.muted, marginTop: 5, lineHeight: 1.4 }}>
              Send linket eller koden. Den anden åbner det og er med på samme liste.
            </div>
            <div style={{
              margin: '16px auto 6px', display: 'inline-flex', gap: 8, padding: '12px 18px',
              background: t.accentSoft, borderRadius: 14,
              fontFamily: t.display, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: t.accentDeep,
            }}>{code}</div>
          </div>
          <button onClick={share} style={{
            width: '100%', border: 'none', borderTop: `1px solid ${t.line}`, cursor: 'pointer',
            background: 'transparent', padding: '15px',
            fontFamily: t.display, fontWeight: 700, fontSize: 16, color: t.accent,
          }}>Del link…</button>
          {row('Link', link, () => copy(link, 'link'), copied === 'link')}
          {row('Kode', code, () => copy(code, 'code'), copied === 'code')}
        </div>
        <button onClick={onClose} style={{
          width: '100%', marginTop: 8, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 22, padding: '15px',
          fontFamily: t.display, fontWeight: 700, fontSize: 17, color: t.text,
        }}>Luk</button>
      </div>
    </div>
  );
}
