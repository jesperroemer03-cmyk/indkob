'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { THEME as t } from '@/lib/theme';
import {
  ensureSession, createHousehold, joinHousehold,
  saveHousehold, loadHousehold, saveName, loadName,
} from '@/lib/supabase';

export default function Onboarding() {
  const router = useRouter();
  const [tab, setTab] = React.useState('create');
  const [name, setName] = React.useState('');
  const [listName, setListName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      await ensureSession().catch(() => {});
      setName(loadName());
      if (loadHousehold()) { router.replace('/app'); return; }
      setChecking(false);
    })();
  }, [router]);

  const go = async () => {
    setErr('');
    if (!name.trim()) { setErr('Skriv dit navn først.'); return; }
    setBusy(true);
    try {
      saveName(name.trim());
      let h;
      if (tab === 'create') h = await createHousehold(listName.trim(), name.trim());
      else {
        if (!code.trim()) { setErr('Indtast koden.'); setBusy(false); return; }
        h = await joinHousehold(code.trim(), name.trim());
      }
      saveHousehold(h);
      router.replace('/app');
    } catch (e) {
      setErr(e.code === 'INVALID_CODE' ? 'Den kode findes ikke. Tjek den igen.' : 'Noget gik galt. Prøv igen.');
      setBusy(false);
    }
  };

  if (checking) {
    return <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: t.font, color: t.faint, fontSize: 14 }}>Et øjeblik…</div>;
  }

  const field = {
    width: '100%', border: `1.5px solid ${t.line}`, borderRadius: 14, outline: 'none',
    padding: '14px 16px', fontFamily: t.display, fontSize: 17, fontWeight: 600, color: t.text,
    background: t.surface, letterSpacing: -0.2,
  };
  const tabBtn = (id, label) => {
    const on = tab === id;
    return (
      <button onClick={() => { setTab(id); setErr(''); }} style={{
        flex: 1, border: 'none', cursor: 'pointer', borderRadius: 999, padding: '10px',
        background: on ? t.accent : 'transparent', color: on ? t.accentText : t.muted,
        fontFamily: t.display, fontWeight: 700, fontSize: 14.5, transition: 'background 160ms, color 160ms',
      }}>{label}</button>
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '32px 22px calc(env(safe-area-inset-bottom) + 32px)', fontFamily: t.font }}>
      <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto 16px',
            background: '#2E9E6E', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: t.shadow }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M5 7h14M5 12h14M5 17h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
              <path d="M4 7l1.4 1.4L8 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontFamily: t.display, fontWeight: 800, fontSize: 28, color: t.text, letterSpacing: -0.8 }}>Indkøbsliste</div>
          <div style={{ fontSize: 14, color: t.muted, marginTop: 4 }}>Delt liste der sorterer sig selv i butikkens rækkefølge.</div>
        </div>

        <div style={{ background: t.surface, borderRadius: t.cardRadius, boxShadow: t.shadow, padding: 18 }}>
          <div style={{ display: 'flex', gap: 4, background: t.chipBg, borderRadius: 999, padding: 4, marginBottom: 16 }}>
            {tabBtn('create', 'Opret ny liste')}
            {tabBtn('join', 'Deltag med kode')}
          </div>

          <label style={{ display: 'block', fontFamily: t.font, fontSize: 12.5, fontWeight: 600,
            letterSpacing: 0.6, textTransform: 'uppercase', color: t.faint, margin: '0 2px 8px' }}>Dit navn</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="fx Mads"
            autoComplete="off" style={{ ...field, marginBottom: 14 }} />

          {tab === 'create' ? (
            <>
              <label style={{ display: 'block', fontFamily: t.font, fontSize: 12.5, fontWeight: 600,
                letterSpacing: 0.6, textTransform: 'uppercase', color: t.faint, margin: '0 2px 8px' }}>Listens navn (valgfrit)</label>
              <input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="Vores indkøb"
                autoComplete="off" style={field} />
            </>
          ) : (
            <>
              <label style={{ display: 'block', fontFamily: t.font, fontSize: 12.5, fontWeight: 600,
                letterSpacing: 0.6, textTransform: 'uppercase', color: t.faint, margin: '0 2px 8px' }}>Kode</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="fx K7QM2X"
                autoComplete="off" autoCapitalize="characters"
                style={{ ...field, letterSpacing: 4, fontWeight: 800, textTransform: 'uppercase' }} />
            </>
          )}

          {err && <div style={{ color: t.destructive, fontSize: 13.5, fontWeight: 600, margin: '12px 2px 0' }}>{err}</div>}

          <button onClick={go} disabled={busy} style={{
            marginTop: 16, width: '100%', border: 'none', borderRadius: t.cardRadius - 6, padding: '15px',
            cursor: busy ? 'default' : 'pointer', background: t.accent, color: t.accentText,
            fontFamily: t.display, fontWeight: 700, fontSize: 16.5, letterSpacing: -0.2, opacity: busy ? 0.7 : 1,
          }}>
            {busy ? 'Et øjeblik…' : (tab === 'create' ? 'Opret liste' : 'Deltag i liste')}
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12.5, color: t.faint, marginTop: 16, lineHeight: 1.5 }}>
          Ingen login. Listen deles via koden — alle med koden ser og redigerer samme liste.
        </div>
      </div>
    </div>
  );
}
