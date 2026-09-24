// Game data reference: docs/AUTHORING.md
// THIS PLACE HAS A BIG FOOTPRINT (Week 01). GDD ids in comments: R1-R12 rooms, I1-I5 items, N1-N3 NPCs, P1-P3 puzzles.

// ---- All player-facing text, keyed by Script id. Logic lives in G below.
const T = {
  intro: "<intro placeholder> Get the Don's secrets and get out. Type HELP for commands.",
  room: {   // FIRST (first tour visit), REVISIT (later tour visits), ESCAPE (once the chaos starts)
    R1: { first: "<R1 FIRST> A gold elevator. The foyer is north.", revisit: "<R1 REVISIT>", escape: "<R1 ESCAPE> One button, one way down." },
    R2: { first: "<R2 FIRST> Two staircases, left for family, right for business.", revisit: "<R2 REVISIT>", escape: "<R2 ESCAPE> The thirteenth step catches the light." },
    R3: { first: "<R3 FIRST> Glass cases and a [rifle].", revisit: "<R3 REVISIT>", escape: "<R3 ESCAPE>" },
    R4: { first: "<R4 FIRST> A mirrored [piano].", revisit: "<R4 REVISIT>", escape: "<R4 ESCAPE> Mama's piano. Mama's song." },
    R5: { first: "<R5 FIRST> A long table, two grandmothers' portraits.", revisit: "<R5 REVISIT>", escape: "<R5 ESCAPE>" },
    R6: { first: "<R6 FIRST> A balcony. Portraits west, office east.", revisit: "<R6 REVISIT>", escape: "<R6 ESCAPE>" },
    R7: { first: "<R7 FIRST> A hall of portraits of the Don.", revisit: "<R7 REVISIT>", escape: "<R7 ESCAPE>" },
    R8: { first: "<R8 FIRST> A bronze [hippo] fountain, mouth shut.", revisit: "<R8 REVISIT>", escape: "<R8 ESCAPE> The [hippo] waits, mouth shut." },
    R9: { first: "<R9 FIRST> Leather, cigars, LEGITIMATE BUSINESS.", revisit: "<R9 REVISIT>", escape: "<R9 ESCAPE>" },
    R10: { first: "<R10 FIRST> Peacocks, and the [aviary] door's red keypad.", revisit: "<R10 REVISIT>", escape: "<R10 ESCAPE> The [aviary] keypad is smashed." },
    R11: { first: "<R11 FIRST> Alarms! The Don runs. You're alone. The chaos begins.", revisit: "<R11 REVISIT> The [giraffegate] and the [jaguargate]." },
    R12: { escape: "<R12 ESCAPE> Bent bars. BIG TONY - DO NOT FEED." }
  },
  item: {
    card: { look: "<I1 LOOK> Walter Pryce. The Dog-Eared Page. A brass plaque.", take: "<I1 TAKE>", use: "<I1 USE wrong>" },
    coin: { look: "<I2 LOOK> Your first dividend.", take: "<I2 TAKE>", use: "<I2 USE wrong>" },
    ledger: { look: "<I3 LOOK>", take: "<I3 TAKE>" },
    manifest: { look: "<I4 LOOK>", take: "<I4 TAKE>" },
    photos: { look: "<I5 LOOK>", take: "<I5 TAKE>" },
    evidence: "<I3-I5 USE> It's evidence; keep it safe.",
    rifle: "<scenery: gold rifle>", piano: "<scenery: piano>", staircase: "<scenery: staircases>", hippo: "<scenery: hippo>",
    aviary: "<scenery: aviary door>", giraffegate: "<scenery: giraffe gate>", jaguargate: "<scenery: jaguar gate>"
  },
  don: {
    look: "<N1 examine>",
    stop: {   // said on arriving at each tour stop; the last line names the next direction
      R2: "<N1 GREETING + R2> Never trust the thirteenth step. In this house we never choose between family. West.",
      R3: "<N1 R3> Admire, don't touch. Back east, then the salon.",
      R4: "<N1 R4> Only one song is played on her: my mother's. Back west, then north.",
      R5: "<N1 R5> Mama Rosa sang 'Cielito Lindo' every Sunday.",
      R9: "<N1 R9> A reading room with my name on it.",
      R7: "<N1 R7> Anything gets loose, my boys chase it. North.",
      R8: "<N1 R8> He flicks a coin into the [hippo]: she only opens up for gold. North.",
      R10: "<N1 R10> My peacocks. North."
    },
    after1: "<N1 after Q1> Now upstairs. South, then up, then east.",
    after2: "<N1 after Q2> Your first dividend. West, west, then north.",
    talk: "<N1 TALK DURING TOUR> Questions later, Walter. Keep up."
  },
  nando: { look: "<N2 examine>", greet: "<N2 GREETING> Nando blocks the way. Why are you up here?", after: "<N2 AFTER TASK> Nando is gone." },
  q1: { prompt: "<Q1 PROMPT> Pozole or Sunday gravy?", right: "<Q1 CORRECT> Both!", wrong: "<Q1 WRONG> He asks again." },
  q2: { prompt: "<Q2 PROMPT> What's your bookstore called?", right: "<Q2 CORRECT> The Dog-Eared Page.", wrong: "<Q2 WRONG> He asks again." },
  strike1: "<STRIKE 1> The Don's smile tightens.", strike2: "<STRIKE 2> The smile is gone.",
  tourBlock: "<TOUR BLOCK> Private, amigo. This way.",
  downTour: "<ELEVATOR during TOUR> Leaving before dessert?",
  downEmpty: "<ELEVATOR < 2 secrets> You're not leaving empty-handed.",
  gateTour: "<GATES DURING TOUR> Locked tight, and the Don is watching.",
  p1: { solved: "<P1 SOLVED> A hidden tray: the LEDGER.", wrong: "<P1 WRONG> Which song does this piano keep?", hint: "<P1 HINT>" },
  p2: { solved: "<P2 SOLVED> The jaw opens: the SHIPPING MANIFEST.", wrong: "<P2 WRONG> She only opens up for one thing.", hint: "<P2 HINT>" },
  p3: { solved: "<P3 SOLVED> A hidden panel: the DEAL PHOTOS.", wrong: "<P3 WRONG> It's just a step.", hint: "<P3 HINT>" },
  alibi: { peacocks: "<open AVIARY> Alibi: PEACOCKS.", giraffe: "<open GIRAFFE GATE> Alibi: GIRAFFE.", jaguar: "<open JAGUAR GATE> Alibi: JAGUAR.",
    already: "<Already open>" },
  guard: { run: "<RUN> You bolt.", peacocks: "<say PEACOCKS> Nando runs.", giraffe: "<say GIRAFFE> Nando runs.", jaguar: "<say JAGUAR> Nando runs." },
  clock: { 6: "<6 TURNS LEFT> A thud.", 3: "<3 TURNS LEFT> A roar.", 1: "<1 TURN LEFT> The floor shakes." },
  hint: { tour: "<HINT TOUR> Listen to the Don.", escape: "<HINT ESCAPE> Walk the tour backward." },
  statusTour: "Tour in progress. Strikes: {strikes}/3.",
  fallback: "<placeholder> That doesn't do anything.",
  end: {
    W1: "<W1 CLEAN GETAWAY> THE END. Secrets recovered: 2/3.",
    W2: "<W2 CLEAN SWEEP> THE END. Secrets recovered: 3/3. Perfect run.",
    L1: "<L1 COVER BLOWN> GAME OVER.",
    L2: "<L2 CAUGHT> GAME OVER.",
    L3: "<L3 BIG FOOTPRINT> GAME OVER."
  }
};

// ---- Tour: the Don's route (GDD 5). During TOUR only the next leg's exit opens.
const ROOM = { elevator: "R1", foyer: "R2", trophy: "R3", salon: "R4", dining: "R5", landing: "R6", gallery: "R7",
  atrium: "R8", office: "R9", aviary: "R10", terrace: "R11", enclosure: "R12" };
const LEGS = [["elevator", "north", "foyer"], ["foyer", "west", "trophy"], ["trophy", "east", "foyer"], ["foyer", "east", "salon"],
  ["salon", "west", "foyer"], ["foyer", "north", "dining"], ["dining", "south", "foyer"], ["foyer", "up", "landing"],
  ["landing", "east", "office"], ["office", "west", "landing"], ["landing", "west", "gallery"], ["gallery", "north", "atrium"],
  ["atrium", "north", "aviary"], ["aviary", "north", "terrace"]];
const ESC = { flag: "escape" }, TOUR = { not: ESC };
const QUIZ = { dining: ["q1", T.q1.prompt], office: ["q2", T.q2.prompt] };   // the Don won't move on until you answer
const exit = (from, dir, to) => {
  const k = LEGS.findIndex(([f, d]) => f === from && d === dir), q = QUIZ[from];
  if (k < 0) return { to, if: ESC, fail: T.tourBlock };
  return { to, if: { any: [ESC, { min: { leg: k }, max: { leg: k }, ...(q && { flag: q[0] }) }] },
    fail: q ? [{ if: { not: { flag: q[0] } }, text: q[1] }, T.tourBlock] : T.tourBlock };
};
const exits = (from, o) => Object.fromEntries(Object.entries(o).map(([d, to]) => [d, exit(from, d, to)]));
const desc = id => { const t = T.room[ROOM[id]];
  return [{ if: ESC, text: t.escape }, { if: { flag: `been_${id}` }, text: t.revisit }, t.first]; };

// ---- Tour strikes (GDD 7): take, touch, open, push, play or use-on a strike object during TOUR
const STRIKE = { add: { strikes: 1 }, say: [{ if: { min: { strikes: 3 } }, text: "" }, { if: { min: { strikes: 2 } }, text: T.strike2 }, T.strike1] };
const strikes = (words, verbs = ["Take", "touch", "open", "push", "play", "use"]) =>
  Object.fromEntries(verbs.map(v => [v, [{ if: { ...TOUR, said: words }, ...STRIKE }]]));
const merge = (...os) => os.reduce((m, o) => { for (const v in o) m[v] = [...(m[v] || []), ...o[v]]; return m; }, {});
const secret = (flag, item, text) => ({ set: flag, add: { secrets: 1 }, give: item, say: text });

// ---- Guard checkpoints (GDD 7): the next turn-costing command must be "run" or "say <released animal>"
const CLEAR = { unset: "checkpoint", add: { cleared: 1 }, move: { nando: null } };
const alibi = a => ({ if: { flag: "checkpoint", said: a, min: { [a]: 1 }, max: { [a]: 1 } }, ...CLEAR, add: { [a]: 1, cleared: 1 }, say: T.guard[a] });
const release = (a, words) => [{ if: { said: words, max: { [a]: 0 } }, add: { [a]: 1 }, say: T.alibi[a] }, { if: { said: words }, say: T.alibi.already }];
const unused = (a, name) => [{ if: { min: { [a]: 1 }, max: { [a]: 1 } }, text: name }];

const STEP = "step|steps|stair|stairs|staircase|staircases|banister";
const HIPPO = "hippo|pepita|fountain|jaw|mouth";

const G = {
  title: "This Place Has a Big Footprint",
  intro: T.intro,
  start: "elevator",
  aliases: { quit: "menu", read: "examine", press: "push", feed: "use", put: "use", insert: "use", flick: "use",
    toss: "use", throw: "use", pet: "touch", release: "open", unlock: "open" },   // verbs add-on
  free: ["look", "examine", "inventory", "status", "hint"],
  fallback: T.fallback,

  rooms: {
    elevator: { name: "Private Elevator", desc: desc("elevator"), exits: exits("elevator", { north: "foyer" }),   // R1
      on: { go: [
        { if: { said: "down", ...TOUR }, say: T.downTour },
        { if: { said: "down", max: { secrets: 1 } }, say: T.downEmpty },
        { if: { said: "down" }, set: "won" } ] } },
    foyer: { name: "Grand Foyer", desc: desc("foyer"),                                                           // R2
      exits: exits("foyer", { south: "elevator", west: "trophy", east: "salon", north: "dining", up: "landing" }),
      on: merge(strikes(`thirteenth|13th|${STEP}`), { push: [
        { if: { ...ESC, said: ["thirteenth|13th|13", "step|stair"], not: { flag: "p3" } }, ...secret("p3", "photos", T.p3.solved) },
        { if: { ...ESC, said: `thirteenth|13th|${STEP}` }, say: T.p3.wrong } ] }) },
    trophy: { name: "Trophy Room", desc: desc("trophy"), exits: exits("trophy", { east: "foyer" }), on: strikes("rifle") },   // R3
    salon: { name: "Music Salon", desc: desc("salon"), exits: exits("salon", { west: "foyer" }),                // R4
      on: merge(strikes("piano|lid|keys", ["Take", "touch", "open", "push", "use"]), { play: [
        { if: TOUR, ...STRIKE },
        { if: { said: "cielito lindo", not: { flag: "p1" } }, ...secret("p1", "ledger", T.p1.solved) },
        { say: T.p1.wrong } ] }) },
    dining: { name: "Dining Hall", desc: desc("dining"), exits: exits("dining", { south: "foyer" }),             // R5
      on: { Say: [
        { if: { not: { flag: "q1" }, said: "both" }, set: "q1", say: T.q1.right + " " + T.don.after1 },
        { if: { not: { flag: "q1" } }, ...STRIKE, say: [{ if: { min: { strikes: 3 } }, text: "" }, T.q1.wrong + " " + T.q1.prompt] } ] } },
    landing: { name: "Upper Landing", desc: desc("landing"), exits: exits("landing", { down: "foyer", west: "gallery", east: "office" }) },   // R6
    gallery: { name: "Gallery Hall", desc: desc("gallery"), exits: exits("gallery", { east: "landing", north: "atrium" }) },                 // R7
    atrium: { name: "Atrium", desc: desc("atrium"), exits: exits("atrium", { south: "gallery", north: "aviary" }),   // R8
      on: merge(strikes(HIPPO), {
        use: [{ if: { ...ESC, said: "coin", has: "coin" }, take: "coin", ...secret("p2", "manifest", T.p2.solved) },
          { if: { ...ESC, said: HIPPO }, say: T.p2.wrong }],
        ...Object.fromEntries(["Take", "touch", "open", "push"].map(v => [v, [{ if: { ...ESC, said: HIPPO }, say: T.p2.wrong }]])) }) },
    office: { name: "The Don's Office", desc: desc("office"), exits: exits("office", { west: "landing" }),       // R9
      on: { Say: [
        { if: { not: { flag: "q2" }, said: "dog eared page|dog eared" }, set: "q2", give: "coin", say: T.q2.right + " " + T.don.after2 },
        { if: { not: { flag: "q2" } }, ...STRIKE, say: [{ if: { min: { strikes: 3 } }, text: "" }, T.q2.wrong + " " + T.q2.prompt] } ] } },
    aviary: { name: "Aviary", desc: desc("aviary"), exits: exits("aviary", { south: "atrium", north: "terrace" }),   // R10
      on: { open: [{ if: { ...TOUR, said: "aviary|door|keypad|cage|peacock|peacocks" }, say: T.gateTour },
        ...release("peacocks", "aviary|door|keypad|cage|peacock|peacocks")] } },
    terrace: { name: "Zoo Terrace", exits: exits("terrace", { south: "aviary", east: "enclosure" }),              // R11
      desc: [{ if: ESC, text: T.room.R11.revisit }, T.room.R11.first],
      on: { open: [...release("giraffe", "giraffe"), ...release("jaguar", "jaguar")] } },
    enclosure: { name: "Broken Enclosure", desc: T.room.R12.escape, exits: exits("enclosure", { west: "terrace" }) }   // R12
  },

  items: {
    card: { name: "briefing card", at: "player", aliases: ["briefing"], desc: T.item.card.look },                  // I1
    coin: { name: "gold coin", desc: T.item.coin.look },                                                          // I2
    ledger: { name: "ledger", desc: T.item.ledger.look },                                                         // I3
    manifest: { name: "shipping manifest", desc: T.item.manifest.look },                                         // I4
    photos: { name: "deal photos", aliases: ["photo"], desc: T.item.photos.look },                              // I5
    // scenery (not GDD items): examine is free and safe
    rifle: { name: "gold rifle", at: "trophy", fixed: true, desc: T.item.rifle },
    piano: { name: "piano", at: "salon", fixed: true, aliases: ["lid"], desc: T.item.piano },
    staircase: { name: "staircase", at: "foyer", fixed: true, aliases: ["stairs", "staircases", "step", "steps", "thirteenth step", "13th step"], desc: T.item.staircase },
    hippo: { name: "hippo", at: "atrium", fixed: true, aliases: ["pepita", "fountain"], desc: T.item.hippo },
    aviary: { name: "aviary", at: "aviary", fixed: true, aliases: ["door", "keypad"], desc: T.item.aviary },
    giraffegate: { name: "giraffe gate", at: "terrace", fixed: true, desc: T.item.giraffegate },
    jaguargate: { name: "jaguar gate", at: "terrace", fixed: true, desc: T.item.jaguargate }
  },

  npcs: {
    don: { name: "Don Chava", at: "foyer", aliases: ["don", "chava", "salvatore"], desc: T.don.look,                // N1
      dialogue: { start: { text: T.don.talk } } },
    nando: { name: "Nando", aliases: ["guard"], desc: T.nando.look, dialogue: { start: { text: T.nando.greet } } }  // N2 (offstage until a checkpoint)
    // N3 Big Tony is heard, never met: he is the clock below.
  },

  on: {   // global replies (verbs add-on), after the room's own
    use: [
      { if: { said: "coin", has: "coin" }, say: T.item.coin.use },
      { if: { said: "card|briefing", has: "card" }, say: T.item.card.use },
      { if: { said: "ledger|manifest|photos|photo" }, say: T.item.evidence } ],
    drop: [{ if: { said: "ledger|manifest|photos|photo" }, say: T.item.evidence }],
    Take: [
      { if: { said: "card|briefing", has: "card" }, say: T.item.card.take },
      { if: { said: "coin", here: "coin" }, move: { coin: "player" }, say: T.item.coin.take } ],
    talk: [{ if: { said: "nando|guard", min: { cleared: 1 }, not: { here: "nando" } }, say: T.nando.after }],
    run: [{ if: { flag: "checkpoint", max: { ran: 0 } }, ...CLEAR, add: { ran: 1, cleared: 1 }, say: T.guard.run }],
    say: [alibi("peacocks"), alibi("giraffe"), alibi("jaguar")],
    open: [{ if: { ...TOUR, said: "gate|giraffe|jaguar" }, say: T.gateTour }],
    hint: [
      { if: { ...ESC, in: "salon", not: { flag: "p1" } }, say: T.p1.hint },
      { if: { ...ESC, in: "atrium", not: { flag: "p2" } }, say: T.p2.hint },
      { if: { ...ESC, in: "foyer", not: { flag: "p3" } }, say: T.p3.hint },
      { if: ESC, say: T.hint.escape },
      { say: T.hint.tour } ],
    status: [
      { if: TOUR, say: T.statusTour },
      { line: ["Bigfoot clock: {clock} turns. Secrets: {secrets}/3. Run: ", [{ if: { min: { ran: 1 } }, text: "used" }, "ready"],
        ". Alibis: ", { list: [unused("peacocks", "PEACOCKS"), unused("giraffe", "GIRAFFE"), unused("jaguar", "JAGUAR")], none: "none" }, "."] } ]
  },

  events: [
    // endings first: once one fires, nothing after it runs
    { if: { min: { strikes: 3 } }, end: T.end.L1 },
    { if: { flag: "won", min: { secrets: 3 } }, end: T.end.W2 },
    { if: { flag: "won" }, end: T.end.W1 },
    // tour: arriving at each stop moves the Don along and plays his line
    ...LEGS.map(([, , to], k) => ({ if: { in: to, min: { leg: k }, max: { leg: k } }, add: { leg: 1 }, move: { don: to },
      ...(T.don.stop[ROOM[to]] && LEGS.findIndex(l => l[2] === to) === k && { say: T.don.stop[ROOM[to]] + (QUIZ[to] ? " " + QUIZ[to][1] : "") }) })),
    // ESCAPE begins on entering R11: the Don flees, the Bigfoot clock starts at 18
    { if: { in: "terrace" }, set: "escape", move: { don: null }, add: { clock: 18 }, mark: "tick" },
    { repeat: true, if: { ...ESC, since: { tick: 1 } }, mark: "tick", add: { clock: -1 } },   // every turn-costing command
    { if: { flag: "checkpoint", since: { stop: 1 } }, end: T.end.L2 },
    { if: { ...ESC, max: { clock: 0 } }, end: T.end.L3 },
    { if: { ...ESC, max: { clock: 6 } }, say: T.clock[6] },
    { if: { ...ESC, max: { clock: 3 } }, say: T.clock[3] },
    { if: { ...ESC, max: { clock: 1 } }, say: T.clock[1] },
    // guard checkpoints: first ESCAPE entry into R7, then into R2
    ...["gallery", "foyer"].map(r => ({ if: { ...ESC, in: r }, set: "checkpoint", mark: "stop", move: { nando: r }, say: T.nando.greet })),
    // REVISIT text after the first look at each room
    ...Object.keys(ROOM).map(r => ({ if: { in: r }, set: `been_${r}` }))
  ]
};
