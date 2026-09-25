/* ---- ADD-ON: nouns (scenery you can examine and handle; text that follows state)
   Data:  keys: { NAME: COND }   named states. A key string is NAME, !NAME, or several
            joined by "&" ("ESCAPE&!P1"); null always passes. Usable in any "if" as key:"...".
          LINES = [[key, text, obj?, "free"?], ...]   the LAST line whose key passes wins.
            obj: the line needs these words typed too ("coins", "a|b"). "free": costs no turn.
          Verb names are read in any case: write "Take" (an effect key) so the engine's
          validator doesn't read it as the take effect.
          nouns: { id: { at: room | "any", cat, words:[...], strike?:"NAME", puzzle?:"KEY",
                         examine: LINES, <verb>: LINES } }
            A noun can be seen only while one of its examine lines passes.
          items.X / npcs.X: cat, strike, puzzle (same meaning, for things the engine owns)
          categories: { CAT: { verb: LINES } }   "*" = any verb; key "SOLVED" = the noun's puzzle key
          anywhere: { verb: LINES }   any noun or none, when nothing more specific fits
          alone:    { verb: LINES }   the verb typed with no noun (after the room's own line)
          rooms.X.verbs: { verb: LINES }   the verb with no noun, in that room
          rooms.X.words: [...], rooms.X.again: LINES   "examine <room next door>" prints
            "Through the doorway: " + its REVISIT (TOUR) or again (ESCAPE) text
          groups: { verb: ["other", ...] }   more keys to try for a verb ("push": ["handle"])
          strike: EFFECT, strikeVerbs: [...], strikeWith: [...]   during keys.TOUR, a strike verb
            on a thing with "strike" runs the strike effect (strikeWith verbs: when a strike
            thing is named anywhere in the line, "use coin on hippo")
          tourFree: true   commands this add-on answers cost no turn while keys.TOUR passes
   Matching: the longest phrase typed wins. A room noun beats an "any" noun and an item
   of the same length; an NPC in the room beats a noun of the same length.
   Nothing matched: the engine answers for its own commands; a verb of this add-on
   says the engine's "You don't see that." (free).
   ------------------------------------------------------------------------- */
{
  const lc = o => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k.toLowerCase(), v]));   // "Take" in data = take
  const K = G.keys || {}, GR = G.groups || {};
  const N = Object.fromEntries(Object.entries(G.nouns || {}).map(([id, n]) => [id, lc(n)]));
  const CAT = Object.fromEntries(Object.entries(G.categories || {}).map(([c, t]) => [c, lc(t)]));
  const ANY = lc(G.anywhere), ALONE = lc(G.alone), RV = Object.fromEntries(Object.keys(G.rooms).map(r => [r, lc(G.rooms[r].verbs)]));
  const norm = s => ` ${s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim()} `;
  const has = (arg, phrase) => norm(arg).includes(norm(phrase));
  const key = k => !k || k.split("&").every(p => p[0] === "!" ? !test(K[p.slice(1)]) : test(K[p]));
  let noun = null;   // the noun being answered (for the SOLVED key)
  const pick = (L, arg = "") => [...(L || [])].reverse().find(([k, , obj]) =>
    key(k === "SOLVED" || k?.includes("SOLVED") ? k.replace("SOLVED", noun?.puzzle || "ESCAPE") : k) && (!obj || obj.split("|").some(o => has(arg, o))));
  const visible = id => { const n = N[id]; return (n.at === S.room || n.at === "any") && !!pick(n.examine); };
  const phrases = T => id => [T[id].name, ...(T[id].aliases || []), ...T[id].name.split(" ")];
  // every thing the line names: [{ id, kind, len, pos }]
  const scan = arg => {
    const a = norm(arg), hits = [];
    const add = (id, kind, ps, rank) => ps.forEach(p => { const i = a.indexOf(norm(p)); if (i >= 0) hits.push({ id, kind, len: p.split(" ").length, pos: i, rank }); });
    Object.keys(N).filter(visible).forEach(id => add(id, "noun", N[id].words, N[id].at === "any" ? 1 : 3));
    [...inv(), ...at(G.items)].forEach(id => add(id, "item", phrases(G.items)(id), 2));
    at(G.npcs).forEach(id => add(id, "npc", phrases(G.npcs)(id), 4));
    return hits;
  };
  const best = hits => hits.sort((x, y) => y.len - x.len || y.rank - x.rank)[0];
  const thing = h => h.kind === "noun" ? N[h.id] : h.kind === "item" ? G.items[h.id] : G.npcs[h.id];
  const CORE = ["take", "drop", "examine", "use", "talk", "go", "look", "wait"];   // the engine has its own "not here" for these
  let verb = "";
  const refund = () => { if (!FREE.includes(verb) && S.count.turns > 0) S.count.turns--; };
  const say = line => { if (!line) return false; print(txt(line[1])); if (line[3] === "free" || tourFree()) refund(); return true; };
  const tourFree = () => G.tourFree && key("TOUR");
  const verbKeys = v => [v, ...(GR[v] || []), "*"];
  const lines = (T, v, arg) => { for (const k of verbKeys(v)) { const l = pick(T?.[k], arg); if (l) return l; } };
  // "examine <room next door>"
  const nextDoor = a => {
    const ex = G.rooms[S.room].exits || {}, to = Object.values(ex).map(x => typeof x === "string" ? x : x.to);
    const r = to.find(r => (G.rooms[r].words || []).some(w => has(a, w)));
    if (!r) return false;
    const t = key("ESCAPE") ? pick(G.rooms[r].again)?.[1] : txt(G.rooms[r].revisit || "");
    return !!t && (print("Through the doorway: " + txt(t)), true);
  };
  const own = new Set([...Object.values(N).flatMap(n => Object.keys(n)), ...Object.values(CAT).flatMap(Object.keys),
    ...Object.keys(ANY), ...Object.keys(ALONE), ...Object.values(RV).flatMap(Object.keys),
    ...(G.strikeVerbs || [])].filter(v => !["at", "cat", "words", "strike", "puzzle", "examine", "*", "handle", "feed"].includes(v)));
  const commands = {};
  for (const v of own) if (!CMDS[v]) commands[v] = () => print("I don't understand that. Type 'help'.");
  const mine = v => own.has(v) || v === "examine" || v === "go" || v === "wait";
  function answer(v, a) {
    noun = null; verb = v;
    if (v === "wait") return key("ESCAPE") && say(pick(ANY.wait));
    if (!a) {   // the verb alone: this room's line, then the lone-verb line, then anywhere
      if (v === "examine" || v === "go") return;
      return say(pick(RV[S.room][v]) || pick(ALONE[v]) || pick(ANY[v]));
    }
    if (v === "go" && (DIRS[a] || Object.values(DIRS).includes(a) || (G.rooms[S.room].exits || {})[a])) return;
    const hits = scan(a), h = best([...hits]);
    if (!h) {
      if (v === "examine" && nextDoor(a)) return true;
      const r = pick(RV[S.room][v], a);
      if (r && r[2]) return say(r);                     // "swim in the fountain": a room line that names its own object
      if (CORE.includes(v)) return;   // the engine answers its own commands
      return print("You don't see that."), refund(), true;
    }
    const t = thing(h);
    // strikes: a strike verb on a strike thing while the Don is watching
    if (key("TOUR") && G.strike) {
      const target = (G.strikeWith || []).includes(v) ? hits.find(x => thing(x).strike) : t.strike && h;
      if (target && ((G.strikeVerbs || []).includes(v) || (G.strikeWith || []).includes(v))) {
        run(G.strike); if (tourFree()) refund(); return true; }
    }
    if (h.kind !== "noun" && (v === "examine" || (!own.has(v) && v !== "go"))) return;   // items and NPCs: the engine's own lines
    if (h.kind === "noun") noun = t;
    if (v === "examine") return say(pick(t.examine));
    const vv = v === "go" ? "enter" : v;
    const line = (h.kind === "noun" && (lines(t, vv, a) || (v === "go" && lines(t, "go", a))))
      || lines(CAT[t.cat], v === "go" ? "push" : vv, a) || lines(ANY, vv, a);
    if (line) return say(line);
    if (v === "go") return exec("push", a), true;
    return print("Nothing happens."), tourFree() && refund(), true;
  }
  addon({
    name: "nouns",
    commands,
    conditions: { key: v => key(v) },
    before(v, a) { if (mine(v)) return answer(v, a); },
    validate(need) {
      const check = (k, p) => k && k.split("&").forEach(x => { x = x.replace(/^!/, ""); need(x === "SOLVED" || x in K, p, `no key "${x}"`); });
      const walk = (L, p) => (L || []).forEach((l, i) => { check(l[0], `${p}[${i}]`); need(typeof l[1] === "string", `${p}[${i}]`, "needs text");
        [...l[1].matchAll(/\[(\w+)\]/g)].forEach(m => need(m[1] in G.items || m[1] in G.npcs, `${p}[${i}]`, `[${m[1]}] is not an item or NPC`)); });
      for (const id in N) { const n = N[id];
        need(n.at === "any" || n.at in G.rooms, `nouns.${id}.at`, `no room "${n.at}"`);
        need(n.cat in CAT, `nouns.${id}.cat`, `no category "${n.cat}"`);
        need((n.words || []).length, `nouns.${id}.words`, "needs words");
        for (const v in n) if (Array.isArray(n[v]) && v !== "words") walk(n[v], `nouns.${id}.${v}`); }
      for (const c in CAT) for (const v in CAT[c]) walk(CAT[c][v], `categories.${c}.${v}`);
      for (const T of ["anywhere", "alone"]) for (const v in G[T] || {}) walk(G[T][v], `${T}.${v}`);
      for (const r in G.rooms) { for (const v in G.rooms[r].verbs || {}) walk(G.rooms[r].verbs[v], `rooms.${r}.verbs.${v}`); walk(G.rooms[r].again, `rooms.${r}.again`); }
    }
  });
}
