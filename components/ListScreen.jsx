'use client';
import React from 'react';
import { THEME as t } from '@/lib/theme';
import { groupByCategory } from '@/lib/categories';
import { CatBadge, CheckDisc, Avatar } from './primitives';
import SwipeRow from './SwipeRow';

export default function ListScreen({
  items, members, onBuy, onUnbuy, onEdit, onDelete, onClearRequest, onShare,
}) {
  const active = items.filter(i => !i.bought);
  const bought = items.filter(i => i.bought);
  const groups = groupByCategory(items).map(g => ({
    cat: g.cat,
    items: [...g.items].sort((a, b) => (a.bought ? 1 : 0) - (b.bought ? 1 : 0)),
    remaining: g.items.filter(i => !i.bought).length,
  }));
  const pct = items.length ? Math.round((bought.length / items.length) * 100) : 0;

  const others = members.slice(1);
  const sharedWith = others.length ? `delt med ${others.join(', ')}` : 'kun dig — del listen';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: t.bg }}>
      {/* header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 22px) 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: t.display, fontWeight: t.displayWeight, fontSize: 30, color: t.text, letterSpacing: -0.8 }}>
              Indkøbsliste
            </div>
            <div style={{ fontFamily: t.font, fontSize: 13.5, color: t.muted, marginTop: 2 }}>
              {active.length} {active.length === 1 ? 'vare' : 'varer'} tilbage · {sharedWith}
            </div>
          </div>
          <button onClick={onShare} aria-label="Del liste"
            style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
            {members.map((m, i) => <Avatar key={m} name={m} i={i} />)}
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ marginLeft: 6 }}>
              <circle cx="14" cy="4.5" r="2.2" stroke={t.muted} strokeWidth="1.6" />
              <circle cx="4" cy="9" r="2.2" stroke={t.muted} strokeWidth="1.6" />
              <circle cx="14" cy="13.5" r="2.2" stroke={t.muted} strokeWidth="1.6" />
              <path d="M6 8L12 5M6 10l6 3" stroke={t.muted} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div style={{ height: 5, borderRadius: 4, background: t.line, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: t.accent, borderRadius: 4, transition: 'width 320ms ease' }} />
        </div>
      </div>

      {/* indhold */}
      <div style={{ flex: 1, padding: '18px 18px 130px' }}>
        {items.length > 0 && active.length === 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22,
            background: t.accentSoft, borderRadius: t.cardRadius - 4, padding: '14px 18px', fontFamily: t.font,
          }}>
            <span style={{ fontSize: 26 }}>🎉</span>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: t.text, fontFamily: t.display }}>Alt er i kurven</div>
              <div style={{ fontSize: 13, color: t.muted, marginTop: 1 }}>God tur hjem.</div>
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: t.font }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🛒</div>
            <div style={{ fontFamily: t.display, fontWeight: 700, fontSize: 17, color: t.text }}>Listen er tom</div>
            <div style={{ fontSize: 13.5, color: t.muted, marginTop: 4 }}>Skift til <b style={{ color: t.muted }}>Tilføj</b> og skriv den første vare.</div>
          </div>
        )}

        {groups.map(({ cat, items: its, remaining }) => (
          <div key={cat.id} style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px 10px' }}>
              <CatBadge cat={cat} size={30} />
              <div style={{ fontFamily: t.display, fontWeight: 700, fontSize: 15.5, color: t.text, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
                {cat.name}
              </div>
              {remaining > 0
                ? <div style={{ fontFamily: t.font, fontSize: 13, fontWeight: 600, color: t.faint, flexShrink: 0 }}>{remaining}</div>
                : <CheckDisc size={17} filled />}
            </div>
            {its.map(it => <SwipeRow key={it.id} item={it} onBuy={onBuy} onUnbuy={onUnbuy} onEdit={onEdit} onDelete={onDelete} />)}
          </div>
        ))}

        {items.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
            <button onClick={onClearRequest} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', padding: '10px 18px', borderRadius: 999,
              fontFamily: t.display, fontWeight: 600, fontSize: 14.5, color: t.muted,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4.5h10M6.5 4.5V3.5a1 1 0 011-1h1a1 1 0 011 1v1M4.8 4.5l.6 8a1 1 0 001 .9h3.2a1 1 0 001-.9l.6-8" stroke={t.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ryd liste
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
