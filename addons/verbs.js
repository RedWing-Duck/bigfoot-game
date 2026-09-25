/* ---- ADD-ON: verbs (room and global replies for any verb; what was typed as a condition)
   Data:  rooms.X.on / on: { verb: REPLY }   REPLY = a string, or a list of { if:COND, ...EFFECT }
            (a string entry = { say }). The current room's reply is tried first, then the global
            one (G.on); the first entry whose "if" passes runs.
            A verb the engine doesn't know becomes a command; with no passing entry it prints
            G.fallback (default "You can't do that here.") and still costs a turn.
            For a core verb (take, use, go...), a passing entry runs instead of the core command.
            Capitalize a verb that is also an effect key (Take, Say, Give), or the engine's
            validator reads it as that effect; case doesn't matter otherwise.
          aliases: { word: "command" }   more words for a command ("quit": "menu"); a word that
            is also an effect key is capitalized too ("Give": "use")
          rooms.X.ways: { word: "direction" }   "go <word>" / "climb <word>" here means that
            direction ("stairs": "up"). Aliases that name a direction work after go too.
          free:    ["verb", ...]         commands that don't cost a turn
   Condition: said:"phrase"   the words typed after the verb contain the phrase, whole words only.
                "a|b" = either one; a list = every one of them; "" = nothing was typed. Hyphens count as spaces, and
                for go a direction is spelled out ("d" is "down").
              any:[COND, ...]  at least one of them passes
   "look <thing>" examines it ("look around" still looks). The echo of what the
   player typed never turns [id] into a name.
   Input: punctuation is dropped from typed words (letters, digits, hyphens and
          apostrophes stay), so "say giraffe!" and "north." work. List this add-on
          before any add-on that wraps act() (restart), so they see clean words too.
   Effect: line:[part, ...]   prints the parts joined together. A part is TEXT, or
             { list:[TEXT, ...], none:TEXT }: the non-empty ones joined with ", ", or none.
   ------------------------------------------------------------------------- */
{
  let said = "";
  const norm = s => ` ${s.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim()} `;
  const reply = r => { const e = [].concat(r || []).map(x => typeof x === "string" ? { say: x } : x).find(x => test(x.if));
    if (e) run(e); return !!e; };
  const on = o => Object.fromEntries(Object.entries(o.on || {}).map(([v, r]) => [v.toLowerCase(), r]));
  const ON = new Map([G, ...Object.values(G.rooms)].map(o => [o, on(o)]));
  const answer = (v, a) => { said = norm(v === "go" ? DIRS[a] || a : a);
    const ok = reply(ON.get(G.rooms[S.room])[v]) || reply(ON.get(G)[v]); said = ""; return ok; };
  const verbs = new Set([...ON.values()].flatMap(Object.keys));
  const commands = {};
  for (const v of verbs) if (!CMDS[v]) commands[v] = a => answer(v, a) || print(txt(G.fallback || "You can't do that here."));
  const act0 = act;   // clean the words; the echo line still shows what was typed
  act = w => act0(w.map(x => x.replace(/[^\p{L}\p{N}'-]+/gu, " ")).join(" ").split(" ").filter(x => x && !FILLER.includes(x)));
  const plain = print;   // the echo stays literal: "[coin]" must not print the item's name
  print = (t, c) => plain(c === "cmd" && t.startsWith("> ") ? t.replace(/\[/g, "[\u200b") : t, c);
  const ALIASES = Object.fromEntries(Object.entries(G.aliases || {}).map(([w, c]) => [w.toLowerCase(), c]));
  const isDir = d => d in DIRS || Object.values(DIRS).includes(d);
  const part = p => p?.list ? p.list.map(txt).filter(Boolean).join(", ") || txt(p.none || "") : txt(p);
  addon({
    name: "verbs",
    commands, aliases: ALIASES, free: G.free,
    conditions: {
      said: p => [].concat(p).every(q => q === "" ? !said.trim() : q.split("|").some(w => said.includes(norm(w)))),
      any: l => l.some(c => test(c))
    },
    effects: { line: v => print(v.map(part).join("")) },
    before(v, a) {
      if (v === "look" && a && !["around", "room", "here"].includes(a)) return exec("examine", a), true;
      const way = v === "go" && (G.rooms[S.room].ways?.[a] || ALIAS[a]);
      if (way && way !== a && isDir(way)) return exec("go", way), true;   // "go upstairs", "climb stairs"
      if (!commands[v] && verbs.has(v)) return answer(v, a);
    },
    validate(need) {
      for (const v of verbs) need(!(v in COND), `on.${v}`, "verb name is also a condition key");
      for (const w in ALIASES) need(w !== ALIASES[w], `aliases.${w}`, "alias points at itself");
      for (const r in G.rooms) for (const w in G.rooms[r].ways || {}) need(isDir(G.rooms[r].ways[w]), `rooms.${r}.ways.${w}`, "not a direction");
    }
  });
}
