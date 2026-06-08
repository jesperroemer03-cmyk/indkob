'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { THEME as t } from '@/lib/theme';
import { ensureSession, joinHousehold, saveHousehold, saveName, loadName } from '@/lib/supabase';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = String(params.code || '').toUpperCase();

  const [name, setName] = React.useState('');
  const [needName, setNeedName] = React.useState(false);
  const [busy, setBusy] = React.useState(true);
  const [err, setErr] = React.useState('');

  const doJoin = React.useCallback(async (displayName) => {
    setBusy(true); setErr('');
    try {
      await ensureSession();
      const h = await joinHousehold(code, displayName);
      saveHousehold(h); saveName(displayName);
      router.replace('/app');
    } catch (e) {
      setBusy(false);
      setErr(e.code === 'INVALID_CODE' ? 'Den kode findes ikke. Tjek linket.' : 'Kunne ikke deltage. Prøv igen.');
    }
  }, [code, router]);

  React.useEffect(() => {
    const existing = loadName();
    if (existing) { setName(existing); doJoin(existing); }
    else { setBusy(false); setNeedName(true); }
  }, [doJoin]);

  const field = {
    width: '100%', border: `1.5px solid ${t.line}`, borderRadius: 14, outline: 'none',
    padding: '14px 16px', fontFamily: t.display, fontSize: 17, fontWeight: 600, color: t.text,
    background: t.surface, letterSpacing: -0.2,
  };

  return (
    <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '32px 22px', fontFamily: t.font }}>
      <div style={{ maxWidth: 420, width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: t.display, fontWeight: 800, fontSize: 24, color: t.text, letterSpacing: -0.6 }}>
          Deltag i indkøbslisten
        </div>
        <div style={{ display: 'inline-flex', margin: '14px auto 22px', padding: '10px 16px',
          background: t.accentSoft, borderRadius: 14, fontFamily: t.display, fontWeight: 800,
          fontSize: 24, letterSpacing: 5, color: t.accentDeep }}>{code}</div>

        {busy && <div style={{ color: t.faint, fontSize: 14 }}>Deltager…</div>}

        {needName && !busy && (
          <div style={{ background: t.surface, borderRadius: t.cardRadius, boxShadow: t.shadow, padding: 18, textAlign: 'left' }}>
            <label style={{ display: 'block', fontFamily: t.font, fontSize: 12.5, fontWeight: 600,
              letterSpacing: 0.6, textTransform: 'uppercase', color: t.faint, margin: '0 2px 8px' }}>Dit navn</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="fx Sofie" autoComplete="off" style={field} />
            <button onClick={() => name.trim() ? doJoin(name.trim()) : setErr('Skriv dit navn først.')}
              style={{ marginTop: 14, width: '100%', border: 'none', borderRadius: t.cardRadius - 6, padding: '15px',
                cursor: 'pointer', background: t.accent, color: t.accentText,
                fontFamily: t.display, fontWeight: 700, fontSize: 16.5 }}>Deltag i liste</button>
          </div>
        )}

        {err && <div style={{ color: t.destructive, fontSize: 13.5, fontWeight: 600, marginTop: 14 }}>{err}</div>}
      </div>
    </div>
  );
}
