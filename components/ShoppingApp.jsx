'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { THEME as t } from '@/lib/theme';
import { parseEntry, categorise, CAT_BY_ID } from '@/lib/categories';
import {
  getSupabase, ensureSession, loadHousehold, loadName, clearHousehold,
  leaveHousehold, deleteHousehold,
} from '@/lib/supabase';
import CaptureScreen from './CaptureScreen';
import ListScreen from './ListScreen';
import BottomNav from './BottomNav';
import { ClearSheet, ShareSheet } from './Sheets';

// DB-række → lokal vare-form brugt af komponenterne.
const toItem = (r) => ({ id: r.id, name: r.name, cat: r.cat, qty: r.qty, bought: r.bought, addedBy: r.added_by });

export default function ShoppingApp() {
  const router = useRouter();
  const sb = React.useMemo(() => getSupabase(), []);
  const [household, setHousehold] = React.useState(null);
  const myName = React.useRef(loadName() || 'Mig');

  const [items, setItems] = React.useState([]);
  const [members, setMembers] = React.useState([myName.current]);
  const [ready, setReady] = React.useState(false);

  const [screen, setScreen] = React.useState('capture');
  const [value, setValue] = React.useState('');
  const [captureQty, setCaptureQty] = React.useState(1);
  const [confirm, setConfirm] = React.useState(null);
  const [justAdded, setJustAdded] = React.useState(null);
  const [showClear, setShowClear] = React.useState(false);
  const [showShare, setShowShare] = React.useState(false);
  const nonce = React.useRef(0);
  const confirmTimer = React.useRef(null);

  // ── indlæs husstand + data ──
  const hRef = React.useRef(null);
  const load = React.useCallback(async (hid) => {
    const id = hid || hRef.current;
    if (!id) return;
    const [{ data: rows }, { data: mem }] = await Promise.all([
      sb.from('items').select('*').eq('household_id', id).order('created_at', { ascending: false }),
      sb.from('household_members').select('display_name, user_id').eq('household_id', id),
    ]);
    if (rows) setItems(rows.map(toItem));
    if (mem) {
      const { data: { user } } = await sb.auth.getUser();
      const mine = mem.find(m => m.user_id === user?.id)?.display_name || myName.current;
      const others = mem.filter(m => m.user_id !== user?.id).map(m => m.display_name);
      myName.current = mine;
      setMembers([mine, ...others]);
    }
  }, [sb]);

  React.useEffect(() => {
    let channel;
    (async () => {
      await ensureSession();
      const h = loadHousehold();
      if (!h) { router.replace('/'); return; }
      hRef.current = h.id;
      setHousehold(h);
      await load(h.id);
      setReady(true);
      // realtime: enhver ændring i denne husstands varer → genindlæs
      channel = sb.channel(`items-${h.id}`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'items', filter: `household_id=eq.${h.id}` },
          () => load(h.id))
        .subscribe();
    })();
    return () => { if (channel) sb.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── afledt ──
  const activeCount = items.filter(i => !i.bought).length;
  const recents = items.slice(0, 4).map(i => ({ id: i.id, name: i.name, cat: i.cat, qty: i.qty }));

  // fanetitel + app-badge
  React.useEffect(() => {
    document.title = activeCount > 0 ? `(${activeCount}) Indkøbsliste` : 'Indkøbsliste';
    if ('setAppBadge' in navigator) {
      if (activeCount > 0) navigator.setAppBadge(activeCount).catch(() => {});
      else if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
    }
  }, [activeCount]);

  // ── operationer (optimistisk lokalt + skriv til DB) ──
  const addByNameCat = async (name, cat, qty = 1) => {
    const tmp = `tmp-${Date.now()}`;
    const optimistic = { id: tmp, name, cat, qty, bought: false, addedBy: myName.current };
    setItems(prev => [optimistic, ...prev]);
    setJustAdded(tmp);
    nonce.current += 1;
    setConfirm({ name, emoji: CAT_BY_ID[cat].emoji, cat: CAT_BY_ID[cat].name, nonce: nonce.current });
    clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirm(null), 2000);
    const { error } = await sb.from('items').insert({
      household_id: hRef.current, name, cat, qty, added_by: myName.current,
    });
    if (!error) load();
  };

  const submit = () => {
    if (!value.trim()) return;
    const p = parseEntry(value);
    const qty = p.qty > 1 ? p.qty : captureQty;   // skrevet tal vinder, ellers stepperen
    addByNameCat(p.name, p.cat, qty);
    setValue(''); setCaptureQty(1);
  };

  const buy = async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, bought: true } : i));
    await sb.from('items').update({ bought: true, bought_at: new Date().toISOString() }).eq('id', id);
    load();
  };
  const unbuy = async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, bought: false } : i));
    await sb.from('items').update({ bought: false, bought_at: null }).eq('id', id);
    load();
  };
  const editItem = async (id, { name, qty }) => {
    let patch = {};
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const cat = name && name !== i.name ? categorise(name) : i.cat;  // re-kategorisér kun ved navneændring
      patch = { name: name ?? i.name, qty: qty ?? i.qty, cat };
      return { ...i, ...patch };
    }));
    if (Object.keys(patch).length) { await sb.from('items').update(patch).eq('id', id); load(); }
  };
  const removeItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await sb.from('items').delete().eq('id', id);
    load();
  };
  const clearAll = async () => {
    setItems([]); setShowClear(false);
    await sb.from('items').delete().eq('household_id', hRef.current);
    load();
  };

  const leaveList = async () => {
    await leaveHousehold(hRef.current);
    clearHousehold();
    router.replace('/');
  };
  const deleteList = async () => {
    await deleteHousehold(hRef.current);
    clearHousehold();
    router.replace('/');
  };

  if (!ready) {
    return (
      <div style={{ minHeight: '100dvh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: t.font, color: t.faint, fontSize: 14 }}>
        Henter listen…
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: t.bg, fontFamily: t.font }}>
      {screen === 'capture'
        ? <CaptureScreen
            value={value} setValue={setValue} qty={captureQty} setQty={setCaptureQty} onSubmit={submit}
            recents={recents} confirm={confirm} justAdded={justAdded} members={members} listName={household?.name} />
        : <ListScreen
            items={items} members={members}
            onBuy={buy} onUnbuy={unbuy} onEdit={editItem} onDelete={removeItem}
            onClearRequest={() => setShowClear(true)} onShare={() => setShowShare(true)} />}

      <BottomNav screen={screen} setScreen={setScreen} count={activeCount} variant="float" />

      {showClear && <ClearSheet count={items.length} onConfirm={clearAll} onClose={() => setShowClear(false)} />}
      {showShare && household && <ShareSheet code={household.code} onClose={() => setShowShare(false)} onLeave={leaveList} onDelete={deleteList} />}
    </div>
  );
}
