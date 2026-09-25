// Headless tests against the BUILT file, so bundling is tested too.
//   node tools/build.js damp-cell && node tests/run.js
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const { load } = require("../tools/headless"), { build } = require("../tools/build");

const DIST = path.join(__dirname, "../dist/damp-cell.html");
const html = fs.readFileSync(DIST, "utf8");
const newGame = (h = html) => { const g = load(h).boot(); g.click("bs"); return g; };
const TO_KEY = ["d", "u", "e", "take lantern", "w", "d", "take bread", "u", "e", "talk guard", "1", "use key"];

test("dist/damp-cell.html is up to date with the sources", () => {
  assert.equal(html, build("games/damp-cell"), "run: node tools/build.js damp-cell");
});

test("1. win: escape through the gate", t => {
  const g = newGame();
  g.type(...TO_KEY, "n");
  const m = g.last().match(/^You escaped in (\d+) turns! THE END\.$/);
  assert.ok(m, `last line was: ${g.last()}`);
  t.diagnostic(`escaped in ${m[1]} turns`);
  assert.equal(Number(m[1]), g.get("S.count.turns"));
});

test("2. darkness: the cellar is pitch dark without a light", () => {
  const g = newGame();
  g.type("d", "look");
  assert.equal(g.last(), "It's pitch dark. You can't see a thing.");
});

test("3. caught: wait after opening the gate", t => {
  const g = newGame();
  g.type(...TO_KEY);
  for (let i = 0; i < 10 && !g.get("S.over"); i++) g.type("z");
  assert.ok(g.lines().includes("Shouts echo from somewhere above. Someone heard the gate."));
  assert.match(g.last(), /^Guards flood the corridor\. You're caught after \d+ turns\. THE END\.$/);
  t.diagnostic(g.last());
  g.type("look");
  assert.equal(g.last(), "The game is over. Type 'menu' to return to the start menu.");
});

test("4. continue: menu and back keeps room, inventory and turns", () => {
  const g = newGame();
  g.type("e", "take lantern", "w", "d");
  const before = g.get("S");
  g.type("menu");
  assert.equal(g.playing(), false);
  assert.equal(g.$("bc").hidden, false, "Continue button is shown");
  g.click("bc");
  assert.equal(g.playing(), true);
  const after = g.get("S");
  assert.equal(after.room, "cellar");
  assert.deepEqual(after.loc, before.loc);
  assert.equal(after.loc.lantern, "player");
  assert.equal(after.count.turns, 4);
  assert.deepEqual(after, before);
  assert.equal(g.lines()[0], "Cellar", "continue shows the room again");
});

test("5. validator: sample is clean; a broken copy reports both problems", () => {
  assert.deepEqual(load(html).boot().problems(), []);
  const broken = html.replace('east: "corridor", down', 'east: "corridr", down')
    .replace('if: { in: "yard" }', 'if: { in: "yard", inside: "yard" }');
  assert.notEqual(broken, html);
  const g = load(broken).boot();
  assert.deepEqual(g.problems(), [
    'rooms.cell.exits.east: no room "corridr"',
    'events[4].if.inside: unknown condition "inside"'
  ]);
  assert.equal(g.errors.length, 1, "problems are also logged to the console");
});

test("6. template builds, validates clean, and can be finished", () => {
  const g = load(build("template")).boot();
  assert.deepEqual(g.problems(), []);
  g.click("bs");
  g.type("take coin", "talk keeper", "1");
  assert.equal(g.last(), "You're through in 2 turns. THE END.");
});

// ---- big-footprint (Week 01)
const BF = fs.readFileSync(path.join(__dirname, "../dist/big-footprint.html"), "utf8");
const bigfoot = () => { const g = load(BF).boot(); g.click("bs"); return g; };

test("big-footprint: dist is up to date and validates clean", () => {
  assert.equal(BF, build("games/big-footprint"), "run: node tools/build.js big-footprint");
  assert.deepEqual(load(BF).boot().problems(), []);
});

const TOUR = ["n", "w", "e", "e", "w", "n", "say both", "s", "u", "e", "say dog-eared page", "w", "w", "n", "n", "n"];
const ESCAPE = ["open giraffe gate", "s", "s", "use gold coin on hippo", "s", "run", "e", "d", "say giraffe", "push thirteenth step"];

test("big-footprint A: every room can be visited; help and quit work", () => {
  const g = bigfoot(), seen = new Set([g.get("S.room")]);
  for (const c of [...TOUR, "e"]) { g.type(c); seen.add(g.get("S.room")); }
  assert.equal(seen.size, 12, [...seen].join(","));
  g.type("help");
  assert.match(g.last(), /^Move: north/);
  g.type("quit");
  assert.equal(g.playing(), false, "quit returns to the start menu");
});

test("big-footprint B: critical path wins with 2 secrets and 6 turns to spare (W1)", () => {
  const g = bigfoot();
  g.type(...TOUR);
  assert.equal(g.get("S.count.clock"), 18, "the clock starts at 18 on entering R11");
  g.type(...ESCAPE, "s");
  assert.equal(g.get("S.count.clock"), 7);
  g.type("d");
  assert.match(g.last(), /^CLEAN GETAWAY[\s\S]*2\/3\.$/);
  assert.equal(g.get("S.over"), true);
});

test("big-footprint B: the piano detour wins with all 3 secrets (W2)", () => {
  const g = bigfoot();
  g.type(...TOUR, ...ESCAPE, "e", "play cielito lindo", "w", "s", "d");
  assert.deepEqual(["ledger", "manifest", "photos"].map(i => g.get(`S.loc.${i}`)), ["player", "player", "player"]);
  assert.match(g.last(), /^CLEAN SWEEP[\s\S]*Perfect run\.$/);
});

test("big-footprint B: tour rules: the Don blocks other exits and the elevator; free commands cost nothing", () => {
  const g = bigfoot();
  g.type("d");
  assert.match(g.last(), /Leaving before dessert/);
  g.type("n", "n");
  assert.match(g.last(), /Private, amigo/);
  assert.equal(g.get("S.room"), "foyer");
  const t = g.get("S.count.turns");
  g.type("look", "examine staircase", "inventory", "status", "hint", "help");
  assert.equal(g.get("S.count.turns"), t);
  g.type("xyzzy");
  assert.equal(g.get("S.count.turns"), t, "unrecognized commands cost nothing");
  g.type("w", "e", "e", "w", "n", "s");
  assert.match(g.last(), /Sunday gravy\?"$/, "the Don won't move on until Q1 is answered");
  assert.equal(g.get("S.room"), "dining");
});

test("big-footprint B: three strikes blow your cover (L1); examine is safe", () => {
  const g = bigfoot();
  g.type("n", "w", "examine rifle", "take gold rifle");
  assert.match(g.last(), /smile tightens/);
  g.type("touch rifle");
  assert.match(g.last(), /smile is gone/);
  g.type("e", "e", "w", "n", "say pozole");
  assert.match(g.last(), /^COVER BLOWN/);
});

test("big-footprint B: a wrong answer at a checkpoint gets you caught (L2)", () => {
  const g = bigfoot();
  g.type(...TOUR, "s", "s", "s", "status", "hint");
  assert.equal(g.get("S.over"), false, "free commands are safe at a checkpoint");
  g.type("say jaguar");
  assert.match(g.last(), /^CAUGHT/);
});

test("big-footprint B: second run is not allowed (L2); restart starts over", () => {
  const g = bigfoot();
  g.type(...TOUR, "open jaguar gate", "s", "s", "s", "run", "e", "d", "run");
  assert.match(g.last(), /^CAUGHT/);
  g.type("look");
  assert.equal(g.get("S.over"), true);
  g.type("restart");
  assert.equal(g.get("S.over"), false);
  assert.equal(g.get("S.room"), "elevator");
});

test("big-footprint B: the Bigfoot clock runs out (L3) with warnings at 6, 3 and 1", () => {
  const g = bigfoot();
  g.type(...TOUR);
  for (let i = 0; i < 18; i++) g.type("open giraffe gate");
  for (const w of ["a thud rattles the chandeliers", "A roar, closer now", "The floor shakes"]) assert.ok(g.lines().some(l => l.includes(w)), w);
  assert.match(g.last(), /^BIG FOOTPRINT[\s\S]*RESTART to try again/);
});

test("big-footprint B: puzzles: wrong attempts keep the item; elevator needs 2 secrets", () => {
  const g = bigfoot();
  g.type(...TOUR, "s", "s", "open hippo", "use card on hippo");
  assert.match(g.last(), /grip like a bank vault/);
  assert.equal(g.get("S.loc.card"), "player");
  g.type("s", "run", "e", "d", "say peacocks");
  assert.match(g.last(), /^CAUGHT/, "an unreleased animal is no alibi");
  const h = bigfoot();
  h.type(...TOUR, "s", "open aviary", "s", "use coin on hippo", "s", "run", "e", "d", "say peacocks", "s", "d");
  assert.match(h.last(), /empty-handed/);
  assert.equal(h.get("S.over"), false);
});

test("big-footprint C: Script text: intro, unknown-command rotation, game-over prompt, escape exits by landmark", () => {
  const g = bigfoot();
  assert.equal(g.lines()[0], "THIS PLACE HAS A BIG FOOTPRINT");
  assert.match(g.lines()[1], /^A Retroment Gaming production\./);
  g.type("xyzzy", "frobnicate", "blarg", "zork");
  assert.deepEqual(g.lines().filter(l => !l.startsWith("> ")).slice(-4).map(l => l.slice(0, 12)),
    ["You try that", "That doesn't", "Nice try, de", "You try that"]);
  assert.ok(g.lines().some(l => l.startsWith("Exits: ")), "the tour shows compass exits");
  g.type(...TOUR, "s");
  assert.match(g.lines().at(-1), /the other smells of chlorine\.$/);
  assert.ok(!g.lines().slice(-3).some(l => l.startsWith("Exits: ")), "the escape names exits by landmark only");
  g.type("s", "s", "look", "say peacocks");
  g.type("look");
  assert.equal(g.last(), "The story's over, detective. RESTART or QUIT.");
});

// ---- Regression: the verified walkthrough from Critical Path QA, step by step. Rerun every week.
// [command, expected Bigfoot clock after it (null = tour, clock off), text the step must print]
const WALKTHROUGH = [
  ["north", null], ["west", null], ["east", null], ["east", null], ["west", null],
  ["north", null, "Sunday gravy?"], ["say both", null, "Both!"], ["south", null], ["up", null],
  ["east", null, "bookstore called"], ["say dog-eared page", null, "He flips you a GOLD COIN."],
  ["west", null], ["west", null], ["north", null], ["north", null], ["north", 18],
  ["open giraffe gate", 17, "Perfect alibi: GIRAFFE."], ["south", 16], ["south", 15],
  ["use gold coin on hippo", 14, "You fish out the SHIPPING MANIFEST. Secrets: 1 of 3."], ["south", 13, "Why are you up here?"],
  ["run", 12, "You bolt."], ["east", 11], ["down", 10, "Why are you up here?"], ["say giraffe", 9, "Nando swears and runs."],
  ["push thirteenth step", 8, "holds the DEAL PHOTOS. Secrets: 2 of 3."], ["south", 7]
];
const walk = (g, steps) => steps.forEach(([cmd, clock, says], i) => {
  const n = g.lines().length; g.type(cmd);
  const out = g.lines().slice(n).join("\n");
  assert.equal(g.get("S.over"), false, `step ${i + 1} (${cmd}) ended the game:\n${out}`);
  if (clock !== null) assert.equal(g.get("S.count.clock"), clock, `step ${i + 1} (${cmd}): clock`);
  else assert.equal(g.get("S.flags.escape || false"), false, `step ${i + 1} (${cmd}): still on the tour`);
  if (says) assert.ok(out.includes(says), `step ${i + 1} (${cmd}) should print "${says}", got:\n${out}`);
  assert.equal(g.get("S.count.strikes || 0"), 0, `step ${i + 1} (${cmd}): no strikes`);
});

test("regression: verified walkthrough, steps 1-28, ends CLEAN GETAWAY 2/3", () => {
  const g = bigfoot();
  walk(g, WALKTHROUGH);
  g.type("down");
  assert.match(g.last(), /^CLEAN GETAWAY[\s\S]*Secrets recovered: 2\/3\.$/);
});

test("regression: W2 branch (26a-26c) ends CLEAN SWEEP 3/3", () => {
  const g = bigfoot();
  walk(g, [...WALKTHROUGH.slice(0, 26), ["east", 7], ["play cielito lindo", 6, "holding a LEDGER bound in rubber bands. Secrets: 3 of 3."], ["west", 5], ["south", 4]]);
  assert.ok(g.lines().includes("Somewhere behind you, a thud rattles the chandeliers."), "clock 6 warning");
  g.type("down");
  assert.match(g.last(), /^CLEAN SWEEP[\s\S]*3\/3\. Perfect run\.$/);
});

test("BR-01: punctuation in typed input is ignored", () => {
  const g = bigfoot();
  g.type("north.", "west!", "east", "east", "west", "north");
  assert.equal(g.get("S.room"), "dining");
  g.type('say "both."');
  assert.ok(g.get("S.flags.q1"), "Q1 accepts say \"both.\"");
  assert.equal(g.get("S.count.strikes || 0"), 0);
  const h = bigfoot();
  h.type(...TOUR);
  h.type("open giraffe gate", "s", "s", "s", "run", "e", "d", "say giraffe!");
  assert.equal(h.get("S.over"), false, "Nando accepts the alibi");
  h.type("push 13th step.");
  assert.equal(h.get("S.loc.photos"), "player");
  h.type("e", "play cielito lindo...");
  assert.equal(h.get("S.loc.ledger"), "player");
  h.type("w", "s", "restart!");
  assert.equal(h.get("S.room"), "elevator", "restart works with punctuation");
});

test("P2s: BR-02 free 'already have', ED-01 escalating quiz lines, ED-02/03 state text, ED-05 secret count", () => {
  const g = bigfoot();
  g.type("n", "w", "e", "e", "w", "n", "say pozole");
  assert.match(g.last(), /His smile tightens/);
  g.type("say gravy");
  assert.match(g.last(), /^The smile is gone\. "Twice now, Walter/);
  const h = bigfoot();
  h.type(...TOUR.slice(0, 11));
  const t = h.get("S.count.turns");
  h.type("take coin");
  assert.equal(h.last(), "You already have that.");
  assert.equal(h.get("S.count.turns"), t, "costs no turn");
  h.type(...TOUR.slice(11), "open jaguar gate", "look");
  assert.match(h.last(), /giraffe peers over[\s\S]*JAGUAR GATE swings in the wind/);
  h.type("s", "s", "use coin on hippo");
  assert.match(h.last(), /Secrets: 1 of 3\.$/);
  h.type("look");
  assert.match(h.last(), /gapes, jaw hanging open/);
  h.type("help");
  assert.match(h.last(), /In a tight spot: run \(works once\)\./);
});

test("P3s: parser (BR-03/05/06/09/10/11), nudges (BR-08, CP-02/03), no confused line before CAUGHT (CP-01)", () => {
  const g = bigfoot();
  g.type("[don]");
  assert.ok(g.lines().includes("> [​don]"), "BR-11: the echo stays literal");
  g.type("n", "look at staircase");
  assert.match(g.last(), /twelve steps up/, "BR-05, ED-19");
  g.type("w", "e", "e", "w", "n", "say");
  assert.equal(g.get("S.count.strikes || 0"), 0, "BR-03: an empty say is no strike");
  g.type("talk to don");
  assert.match(g.last(), /Sunday gravy\?"$/, "BR-09");
  g.type("say definitely not both");
  assert.equal(g.get("S.count.strikes"), 1, "BR-04");
  g.type("say both", "s", "go upstairs");
  assert.equal(g.get("S.room"), "landing", "BR-06");
  g.type("e", "say dog-eared page", "give coin to don");
  assert.match(g.last(), /Nothing here wants it/, "BR-10");
  g.type("w", "w", "n", "n", "n");
  const t = g.get("S.count.turns");
  g.type("run", "open gate", "x lemurs");
  assert.equal(g.get("S.count.turns"), t, "BR-08, CP-02: nudges are free");
  assert.equal(g.last(), "Lemurs pour out of the dark.", "BR-07");
  g.type("s", "s", "s", "say jaguar");
  assert.match(g.lines().at(-1), /^CAUGHT/);
  assert.ok(!g.lines().at(-2).startsWith("You try that"), "CP-01");
});

test("QA-01: 'say peacock' (singular) is accepted at a checkpoint", () => {
  const g = bigfoot();
  g.type(...TOUR, "s", "open aviary", "s", "s", "say peacock");
  assert.equal(g.get("S.over"), false);
  assert.match(g.last(), /sprints toward the screaming/);
});

// ---- Polish (Script rev 3). Milestone A: coverage, built from the game's own noun data.
const BAD = [/^I don't understand/, /^You try that\. The universe/, /^That doesn't make sense, even/, /^Nice try, detective/,
  /^Nothing like that around here\.$/, /^You don't see that/];
const TIER1 = ["take", "touch", "push", "pull", "open", "close", "knock", "sit on", "climb"];
const STATE = { P1: "S.flags.p1 = true", P2: "S.flags.p2 = true", P3: "S.flags.p3 = true", CP7_DONE: "S.flags.cp7_done = true" };
test("Polish A: coverage: every noun, every word, both phases, examine + Tier 1 verbs never get a confused line", t => {
  const g = bigfoot(), nouns = g.get("G.nouns"), rooms = Object.keys(g.get("G.rooms")), fails = [];
  let tried = 0;
  for (const phase of ["TOUR", "ESCAPE"]) for (const [id, n] of Object.entries(nouns)) {
    const keys = (n.examine || []).map(l => l[0]);
    if (!keys.some(k => !k || k === phase || k.startsWith(phase + "&") || k in STATE)) continue;
    const where = n.at === "any" ? rooms.filter(r => phase === "ESCAPE" || !["terrace", "enclosure"].includes(r)) : [n.at];
    if (phase === "TOUR" && ["terrace", "enclosure"].includes(n.at)) continue;
    const setup = keys.filter(k => k in STATE && !keys.some(x => !x || x === phase)).map(k => STATE[k]).join(";");
    for (const room of where) {
      g.run(`S.over = false; S.room = ${JSON.stringify(room)}; S.flags = {}; S.count = { turns: 5, strikes: 0, clock: 18, secrets: 0 };
        S.loc.don = ${phase === "TOUR" ? JSON.stringify(room) : "null"}; S.loc.nando = null;
        ${phase === "ESCAPE" ? "S.flags.escape = true; S.mark.tick = 5;" : ""} ${setup}; globalThis.__snap = JSON.stringify(S);`);
      for (const cmd of [...n.words.map(w => "examine " + w), ...TIER1.map(v => `${v} ${n.words[0]}`)]) {
        g.run("S = JSON.parse(__snap)");
        const k = g.lines().length; g.type(cmd); tried++;
        const out = g.lines().slice(k + 1);
        if (!out.length || out.some(l => BAD.some(b => b.test(l)))) fails.push(`${phase} ${room} ${id}: "${cmd}" -> ${out.join(" / ") || "(nothing)"}`);
      }
    }
  }
  t.diagnostic(`${tried} commands tried`);
  assert.deepEqual(fails, []);
});

test("Polish A: x lemur, smell humidor, look under table answer in voice; strike verbs only on strike objects", () => {
  const g = bigfoot();
  g.type("n", "w", "e", "e", "w", "n", "look under table");
  assert.match(g.last(), /Gum\? In this house\?/);
  g.type("say both", "s", "u", "e", "smell humidor");
  assert.equal(g.last(), "Cedar, tobacco, and a little bit of money.");
  const h = bigfoot();
  h.type(...TOUR, "s", "s", "s", "s", "s", "d", "say jaguar");   // nothing released: CAUGHT is fine, we only need ESCAPE text
  const e = bigfoot();
  e.type(...TOUR, "s", "s", "s", "run", "e", "d");
  e.run("S.flags.checkpoint = false"); e.type("n", "x lemur");
  assert.match(e.last(), /eats another grape, slowly, at you/);
  const s = bigfoot();
  s.type("n", "touch banister", "sit on piano bench", "w", "e", "e", "sit on bench", "pull keys");
  assert.equal(s.get("S.count.strikes"), 1, "banister and bench are no strike; the piano keys are");
  const t0 = s.get("S.count.turns");
  s.type("smell", "listen", "search bench", "dance");
  assert.equal(s.get("S.count.turns"), t0, "info verbs are free; new verbs on the tour cost no turn");
});

// ---- Polish B: state (one test per state key that changes text)
const toEscape = () => { const g = bigfoot(); g.type(...TOUR); return g; };
test("Polish B: OUT_GIRAFFE, P2, COIN_HELD, Q1: nouns follow state", () => {
  const g = toEscape();
  g.type("open giraffe gate", "s", "s", "x hippo");
  assert.match(g.last(), /The coin in your pocket suddenly feels heavy/, "COIN_HELD");
  g.type("use coin on hippo", "x hippo");
  assert.match(g.last(), /jaw hangs open/, "P2");
  g.type("s", "run", "e", "d", "say giraffe", "x banister");
  assert.match(g.last(), /giraffe's head rests on the upper banister/, "OUT_GIRAFFE");
  const q = bigfoot();
  q.type("n", "w", "e", "e", "w", "n", "x pots");
  assert.match(q.last(), /^On the sideboard, two pots/);
  q.type("say both", "x pots");
  assert.equal(q.last(), "Two pots, one family. You get it now.", "Q1");
});

test("Polish B: GDD 12.1 D3: talk, ask and examine Nando at a checkpoint are free and keep it open", () => {
  const g = toEscape();
  g.type("s", "s", "s");
  const clock = g.get("S.count.clock");
  g.type("talk to nando", "ask nando about peacocks", "x nando", "talk", "x guard");
  assert.equal(g.get("S.over"), false);
  assert.equal(g.get("S.flags.checkpoint"), true, "still stopped");
  assert.equal(g.get("S.count.clock"), clock, "no turn spent");
  assert.ok(g.lines().some(l => l === "\"Not a conversation, friend. Why are you here?\""), "repeat lines rotate");
  g.type("run");
  assert.equal(g.get("S.flags.checkpoint || false"), false, "run clears it");
});

test("Polish B: CAUGHT_BY openers (D4) and STRIKE3_BY is recorded", () => {
  const cases = [["say jaguar", /No animal\. No noise/], ["e", /hand the size of a skillet/], ["dance", /doesn't wait for you to finish/], ["give card to nando", /zip-ties you anyway/]];
  for (const [cmd, opener] of cases) {
    const g = toEscape(); g.type("s", "s", "s", cmd);
    assert.match(g.last(), /^CAUGHT\n\n/, cmd); assert.match(g.last(), opener, cmd);
    assert.equal(g.lines().at(-2), "> " + cmd, "nothing prints between the command and CAUGHT");
  }
  const u = toEscape(); u.type("open jaguar gate", "s", "s", "s", "say jaguar", "e", "d", "say jaguar");
  assert.match(u.last(), /I just put that thing back/, "USED");
  const r = toEscape(); r.type("s", "s", "s", "run", "e", "d", "run");
  assert.match(r.last(), /this time nothing lands on his head/, "RUN2");
  const s = bigfoot(); s.type("n", "w", "take rifle", "kick rifle", "pull rifle");
  assert.equal(s.get("S.nouns.notes.STRIKE3_BY"), "RIFLE");
  const q = bigfoot(); q.type("n", "w", "take rifle", "e", "e", "touch piano", "w", "n", "say neither");
  assert.equal(q.get("S.nouns.notes.STRIKE3_BY"), "Q1");
});

test("Polish B: STRIKES tiers: the Don's pass, talk, examine and topics cool off", () => {
  const g = bigfoot();
  g.type("n", "talk to don");
  assert.equal(g.last(), "\"Look around, Walter. Every stone in this floor, I earned.\"");
  g.type("w", "touch rifle", "talk to don");
  assert.match(g.last(), /We talk later, Walter/, "STRIKES=1");
  g.type("push rifle", "e");
  assert.equal(g.last(), "The Don doesn't slow down or look back. \"Keep up.\"", "PASS at STRIKES=2");
  g.type("x don");
  assert.match(g.last(), /He's looking at you\.$/);
  g.type("ask don about piano", "ask don about hippo");
  assert.deepEqual(g.lines().slice(-3).filter(l => !l.startsWith(">")), ["\"No more questions.\"", "He doesn't answer. He just keeps walking."]);
});

test("Polish B: ESC_REVISIT, tails, foreshadowing and Nando's traces", () => {
  const g = toEscape();
  g.type("s", "s");
  assert.ok(g.lines().includes("Past the fountain, a flashlight beam slides along the portraits in the gallery. Someone's waiting."));
  g.type("s", "run", "n");
  assert.ok(g.lines().some(l => l.startsWith("Pepita again, mouth shut")), "ESC_REVISIT");
  g.type("s");
  assert.ok(g.lines().some(l => l.startsWith("Nando's cap lies upside down")), "CP7_DONE trace");
  g.type("e");
  assert.ok(g.lines().includes("Below, a flashlight beam sweeps the foyer, back and forth, back and forth. Someone's down there."), "CP2 foreshadow");
});

test("Polish B: clock bands and turn feedback never repeat back to back; bands follow the clock", () => {
  const g = toEscape(), bands = [], fb = g.get("G.feedback");
  for (let i = 0; i < 6; i++) { g.type("look"); bands.push(g.last()); }
  for (let i = 1; i < bands.length; i++) assert.notEqual(bands[i], bands[i - 1]);
  const said = [];
  for (let i = 0; i < 6; i++) { g.type("dance"); said.push(g.last()); }
  assert.ok(said.every(l => fb.includes(l)), "feedback follows a reply that changed nothing");
  for (let i = 1; i < said.length; i++) assert.notEqual(said[i], said[i - 1]);
  g.run("S.count.clock = 3"); g.type("look");
  assert.ok(g.lines().slice(-4).some(l => ["Footsteps on the stairs below, and every step shakes the roof.", "A shadow on the terrace that isn't yours. It moves when you don't."].includes(l)), "BAND_C on the roof");
});
