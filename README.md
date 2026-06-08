# Indkøbsliste

Delt, selv-sorterende indkøbsliste til en husstand. Skriv en vare → den
kategoriseres automatisk og placeres i butikkens rækkefølge. Marker som købt
ved at swipe til højre eller tappe cirklen. Installérbar som PWA med tal-badge.

**Stack:** Next.js (App Router) · Supabase (Postgres + Realtime + Anonymous Auth) · Vercel · PWA

Designet er en 1:1-genskabelse af Claude Design-handoff'en (THEME_A "Rolig",
Schibsted Grotesk). `CATEGORIES`, `KEYWORDS`, `parseEntry` og `categorise` er
kopieret ordret fra prototypen og bor i `lib/categories.js`.

---

## Sådan deles listen (kode/link — ingen login)

Den første opretter en liste og får en **6-tegns kode** + et **delelink**
(`/join/KODE`). Den anden åbner linket (eller indtaster koden) og er med på
samme liste med det samme. Ændringer synkroniserer i realtid mellem telefonerne.

Der er ingen login-skærm. Under motorhjelmen logger appen enheden ind med
**Supabase Anonymous Auth**, så hver enhed får en rigtig `auth.uid()`. Det lader
RLS afgrænse, så man kun ser/ændrer varer i den husstand, man er medlem af —
koden er adgangsnøglen.

> Bemærk: rydder man browserdata mister enheden sin anonyme session og dermed
> sit medlemskab. Man kommer let på igen via koden/linket. Koden er den
> varige nøgle til listen, ikke enheden.

---

## Kom i gang

### 1. Supabase
1. Opret et projekt på [supabase.com](https://supabase.com).
2. **SQL Editor** → indsæt hele `supabase/schema.sql` → kør.
3. **Authentication → Sign In / Providers → Anonymous → Enable.** (Vigtigt — uden dette kan appen ikke logge enheden ind.)
4. **Settings → API**: kopiér *Project URL* og *anon public* nøglen.

### 2. Lokalt
```bash
npm install
cp .env.local.example .env.local   # indsæt dine to værdier
npm run dev                         # http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://dit-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-public-key
```

### 3. Deploy til Vercel
1. Push til GitHub.
2. Importér repo'et på [vercel.com](https://vercel.com).
3. Tilføj de **to** miljøvariabler (samme navne som ovenfor) under Project → Settings → Environment Variables.
4. Deploy. PWA (install, offline-skal, tal-badge) virker når appen serveres over https — det gør Vercel automatisk.

---

## Projektstruktur
```
app/
  layout.js            html + meta + manifest + Schibsted Grotesk + SW-registrering
  globals.css          reset + keyframes (il-enter, il-confirm, il-sheet) + reduced-motion
  page.js              onboarding: opret / deltag (ingen login)
  app/page.js          selve appen (capture ⇄ liste)
  join/[code]/page.js  delelink — deltager automatisk og sender videre til /app
components/
  ShoppingApp.jsx      state, Supabase-ops, realtime-abonnement
  CaptureScreen.jsx    hero-input, live kategori-gæt, stepper, bekræftelse, "sidst tilføjet"
  ListScreen.jsx       fremdrift, grupper i butiks-rækkefølge, del + ryd
  SwipeRow.jsx         aktiv (swipe→købt / tap→rediger), inline-redigering, købt
  BottomNav.jsx        Tilføj ⇄ Liste-toggle (glas)
  Sheets.jsx           ClearSheet (ryd) + ShareSheet (kode + kopiér link)
  primitives.jsx       CheckDisc, CatBadge, Avatar
lib/
  categories.js        CATEGORIES, KEYWORDS, parseEntry, categorise (ordret fra prototypen)
  theme.js             THEME_A tokens
  supabase.js          browser-klient, anonym session, household-helpers
supabase/
  schema.sql           tabeller + RLS + RPC'er + realtime
public/
  manifest.webmanifest, sw.js, icon-192/512, apple-touch-icon
```

## Datamodel
- `households (id, code, name, created_at)`
- `household_members (household_id, user_id, display_name, joined_at)`
- `items (id, household_id, name, cat, qty, bought, added_by, created_at, bought_at)`

"Sidst tilføjet" udledes af `items` sorteret efter `created_at` (ingen separat tabel).
Køb skjuler ikke varen — den grås ud og synker til bunden af sin kategori.

## Adfærd kopieret fra handoff
- Antals-parser: `3 øl` / `3 x øl` → 3; `mælk x2` → 2. Navn får stort forbogstav, qty klampes 1–99.
- Redigering re-kategoriserer **kun** hvis navnet faktisk ændres (ren antals-ændring beholder kategorien).
- Swipe-tærskel 88px; under tærsklen fjedrer rækken tilbage.
- Tal-badge + fanetitel opdateres på antal varer tilbage (`setAppBadge` hvor understøttet).

## Tilpasning
- Nøgleord/kategorier: `lib/categories.js`.
- Farver/typografi: `lib/theme.js`.
- Vil du have rigtige konti/flere lister senere, kan anonym-auth opgraderes til
  e-mail/OAuth uden at røre datamodellen (medlemmer er allerede `auth.uid()`).
