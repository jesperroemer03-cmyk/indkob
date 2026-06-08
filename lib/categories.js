// categories.js
// Kerneforretningslogik — KOPIERET ORDRET fra design-prototypen (Indkøbsliste.html),
// jf. handoff: "Kopiér CATEGORIES, KEYWORDS, parseEntry/categorise ordret."
// Rør ikke ved nøgleord-ordbogen uden at teste kategoriseringen.

export const CATEGORIES = [
  { id: 'frugt',       name: 'Frugt & grønt',     emoji: '🥦', hue: 150 },
  { id: 'broed',       name: 'Brød & bageri',     emoji: '🥖', hue: 75  },
  { id: 'mejeri',      name: 'Mejeri & køl',      emoji: '🥛', hue: 235 },
  { id: 'koed',        name: 'Kød & fisk',        emoji: '🐟', hue: 10  },
  { id: 'paalaeg',     name: 'Pålæg',             emoji: '🧀', hue: 50  },
  { id: 'frost',       name: 'Frost',             emoji: '🧊', hue: 210 },
  { id: 'kolonial',    name: 'Kolonial',          emoji: '🥫', hue: 285 },
  { id: 'snacks',      name: 'Snacks & slik',     emoji: '🍫', hue: 320 },
  { id: 'drikke',      name: 'Drikkevarer',       emoji: '🧃', hue: 195 },
  { id: 'husholdning', name: 'Husholdning',       emoji: '🧻', hue: 170 },
  { id: 'pleje',       name: 'Personlig pleje',   emoji: '🧴', hue: 300 },
];

export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
export const CAT_ORDER = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, i]));

// ── Nøgleord → kategori. Først match vinder (kategori-rækkefølge). ─────────
export const KEYWORDS = {
  frugt: ['banan', 'æble', 'æbler', 'citron', 'lime', 'agurk', 'tomat', 'salat', 'løg', 'kartof',
          'gulerod', 'gulerødder', 'avocado', 'peber', 'broccoli', 'spinat', 'jordbær', 'blåbær',
          'vindrue', 'drue', 'appelsin', 'bær', 'champignon', 'svampe', 'hvidløg', 'porre', 'squash',
          'ingefær', 'mango', 'melon', 'grønt', 'frugt'],
  broed: ['rugbrød', 'brød', 'bolle', 'boller', 'baguette', 'croissant', 'knækbrød', 'toast',
          'wienerbrød', 'kage', 'flute', 'pita', 'kringle', 'rundstykke'],
  mejeri: ['mælk', 'skyr', 'yoghurt', 'ymer', 'smør', 'ost', 'fløde', 'æg', 'creme fraiche',
           'cremefraiche', 'hytteost', 'kærnemælk', 'a38', 'minimælk', 'letmælk', 'koldskål', 'margarine'],
  koed: ['oksekød', 'hakket', 'kylling', 'fisk', 'laks', 'torsk', 'svinekød', 'flæsk', 'frikadelle',
         'rejer', 'mørbrad', 'kotelet', 'bøf', 'fars', 'kødboller', 'fiskefilet', 'kalkun'],
  paalaeg: ['pålæg', 'leverpostej', 'spegepølse', 'skinke', 'salami', 'rullepølse', 'makrel',
            'bacon', 'frokost', 'hamburgerryg', 'kødpålæg'],
  frost: ['frost', 'frossen', 'frosne', 'is ', 'isvafler', 'fiskefingre', 'pizza', 'pommes',
          'wok', 'frosset'],
  kolonial: ['kaffe', 'te', 'ris', 'pasta', 'mel', 'sukker', 'salt', 'olie', 'dåse', 'ketchup',
             'mayo', 'mayonnaise', 'sennep', 'müsli', 'havregryn', 'havregrød', 'krydderi', 'bouillon',
             'tun', 'kakao', 'honning', 'marmelade', 'peanut', 'nutella', 'spaghetti', 'nudler',
             'cornflakes', 'gær', 'eddike', 'pesto', 'kokosmælk', 'linser', 'bønner'],
  snacks: ['chips', 'slik', 'chokolade', 'kiks', 'nødder', 'popcorn', 'lakrids', 'vingummi',
           'flødeboller', 'snack', 'tortilla', 'dip'],
  drikke: ['vand', 'danskvand', 'sodavand', 'juice', 'øl', 'vin', 'saft', 'cola', 'kildevand',
           'kakaomælk', 'energidrik', 'læskedrik', 'mokai'],
  husholdning: ['toiletpapir', 'toiletrulle', 'køkkenrulle', 'opvask', 'opvaske', 'vaskepulver',
                'skraldepose', 'affaldspose', 'alufolie', 'film', 'servietter', 'rengøring',
                'klude', 'tabs', 'sulfo', 'bleer', 'ble', 'tændstik', 'stearinlys', 'fryseposer'],
  pleje: ['tandpasta', 'tandbørste', 'shampoo', 'deodorant', 'barber', 'bind', 'tampon', 'creme',
          'balsam', 'vatpinde', 'hudcreme', 'sæbe', 'håndsæbe', 'body lotion', 'plaster', 'panodil'],
};

// Parser: trækker evt. antal ud ("3 øl", "mælk x2") + kategoriserer.
export function parseEntry(raw) {
  let text = raw.trim().replace(/\s+/g, ' ');
  let qty = 1;
  let m = text.match(/^(\d{1,2})\s*[x×]?\s+(.+)/i);          // "3 øl"
  if (m) { qty = parseInt(m[1], 10); text = m[2]; }
  else {
    m = text.match(/^(.+?)\s*[x×]\s*(\d{1,2})$/i);            // "mælk x2"
    if (m) { qty = parseInt(m[2], 10); text = m[1]; }
  }
  text = text.trim();
  const name = text.charAt(0).toUpperCase() + text.slice(1);
  return { name, qty: Math.max(1, Math.min(99, qty)), cat: categorise(text) };
}

export function categorise(text) {
  const t = ' ' + text.toLowerCase() + ' ';
  for (const cat of CATEGORIES) {
    const words = KEYWORDS[cat.id] || [];
    for (const w of words) {
      if (t.includes(w)) return cat.id;
    }
  }
  return 'kolonial'; // fornuftig fallback (tørvarer)
}

export function groupByCategory(items) {
  const groups = {};
  for (const it of items) (groups[it.cat] ||= []).push(it);
  return CATEGORIES.filter(c => groups[c.id]).map(c => ({ cat: c, items: groups[c.id] }));
}

// ── Forslag på capture-skærmen (system-tastatur, så ren tekstmatch) ──────────
const VOCAB = [
  ['Mælk','mejeri'],['Skyr','mejeri'],['Smør','mejeri'],['Æg','mejeri'],['Ost','mejeri'],['Yoghurt','mejeri'],['Fløde','mejeri'],
  ['Rugbrød','broed'],['Boller','broed'],['Baguette','broed'],['Knækbrød','broed'],
  ['Bananer','frugt'],['Æbler','frugt'],['Agurk','frugt'],['Tomater','frugt'],['Løg','frugt'],['Avocado','frugt'],['Gulerødder','frugt'],['Salat','frugt'],
  ['Hakket oksekød','koed'],['Kylling','koed'],['Laks','koed'],['Torsk','koed'],
  ['Spegepølse','paalaeg'],['Leverpostej','paalaeg'],['Skinke','paalaeg'],
  ['Kaffe','kolonial'],['Pasta','kolonial'],['Ris','kolonial'],['Havregryn','kolonial'],['Müsli','kolonial'],['Mel','kolonial'],['Olie','kolonial'],
  ['Chips','snacks'],['Chokolade','snacks'],['Kiks','snacks'],
  ['Danskvand','drikke'],['Sodavand','drikke'],['Øl','drikke'],['Juice','drikke'],
  ['Toiletpapir','husholdning'],['Køkkenrulle','husholdning'],['Opvasketabs','husholdning'],['Skraldeposer','husholdning'],
  ['Tandpasta','pleje'],['Shampoo','pleje'],['Deodorant','pleje'],
];

export function suggestFor(value) {
  const v = value.trim().toLowerCase();
  let picks;
  if (!v) {
    picks = [['Mælk','mejeri'], ['Rugbrød','broed'], ['Bananer','frugt']];
  } else {
    picks = VOCAB.filter(([n]) => n.toLowerCase().includes(v)).slice(0, 3);
    if (picks.length === 0) {
      const p = parseEntry(value);
      picks = [[p.name, p.cat]];
    }
  }
  return picks.map(([name, cat]) => ({ name, cat, emoji: CAT_BY_ID[cat].emoji }));
}
