// supabase.js
// Én browser-klient. Anonym auth kører i baggrunden (ingen login-skærm),
// men giver en rigtig auth.uid() så RLS kan afgrænse til din husstand.

'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client = null;
export function getSupabase() {
  if (_client) return _client;
  _client = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'indkob-auth' },
  });
  return _client;
}

// Sørg for en anonym session (idempotent). Returnerer user.
export async function ensureSession() {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) return session.user;
  const { data, error } = await sb.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

// ── Husstand: opret / deltag (kalder SECURITY DEFINER RPC'er) ───────────────
export async function createHousehold(listName, displayName) {
  const sb = getSupabase();
  await ensureSession();
  const { data, error } = await sb.rpc('create_household', {
    p_name: listName || 'Vores indkøb',
    p_display_name: displayName || 'Mig',
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row; // { id, code, name }
}

export async function joinHousehold(code, displayName) {
  const sb = getSupabase();
  await ensureSession();
  const { data, error } = await sb.rpc('join_household', {
    p_code: (code || '').trim().toUpperCase(),
    p_display_name: displayName || 'Mig',
  });
  if (error) {
    if (String(error.message || '').includes('INVALID_CODE')) {
      const e = new Error('INVALID_CODE'); e.code = 'INVALID_CODE'; throw e;
    }
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row; // { id, code, name }
}

// ── Lokal husstands-kontekst (kode/link-model, så vi husker hvilken liste) ──
const KEY = 'indkob-household';
export function saveHousehold(h) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify({ id: h.id, code: h.code, name: h.name }));
}
export function loadHousehold() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export function clearHousehold() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

const NAME_KEY = 'indkob-name';
export function saveName(n) { if (typeof window !== 'undefined') localStorage.setItem(NAME_KEY, n); }
export function loadName() { return typeof window !== 'undefined' ? localStorage.getItem(NAME_KEY) || '' : ''; }
