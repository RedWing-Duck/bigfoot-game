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
  assert.ok(g.lines().some(l => l.startsWith("Pepita the HIPPO again, mouth shut")), "ESC_REVISIT");
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
  assert.ok(!g.lines().slice(-3).some(l => /Footsteps on the stairs|A shadow on the terrace/.test(l)), "PT-05: no band line on a warning turn");
  g.type("look");
  assert.ok(g.lines().slice(-4).some(l => ["Footsteps on the stairs below, and every step shakes the roof.", "A shadow on the terrace that isn't yours. It moves when you don't."].includes(l)), "BAND_C on the roof");
});

// ---- Polish C: feel (one test per ending variant, plus the run report)
const play = (...cmds) => { const g = bigfoot(); g.type(...cmds); return g; };
const report = g => Object.fromEntries(g.last().split("RUN REPORT\n")[1].split("\n").filter(l => l.includes(": ")).map(l => l.split(/: (.*)/s).slice(0, 2)));
const BASE = ["open giraffe gate", "s", "s", "use gold coin on hippo", "s", "run", "e", "d", "say giraffe", "push thirteenth step"];

test("Polish C: W1 names the secret left behind; the run report matches the run", () => {
  const noLedger = play(...TOUR, ...BASE, "s", "d");
  assert.match(noLedger.last(), /a notebook full of rubber bands keeps its secrets[\s\S]*THE END\. Secrets recovered: 2\/3\.\n\nRUN REPORT/);
  const r = report(noLedger);
  assert.equal(r.Secrets, "2 of 3 (manifest, photos)");
  assert.equal(r["Turns to spare"], String(noLedger.get("S.count.clock")));
  assert.equal(r.Strikes, "0 of 3");
  assert.equal(r["Alibis used"], "giraffe. Run: used.");
  assert.match(noLedger.last(), /One secret stayed home\. Mama would know where\.$/);
  const noManifest = play(...TOUR, "open giraffe gate", "s", "s", "s", "run", "e", "d", "say giraffe", "push thirteenth step", "e", "play cielito lindo", "w", "s", "d");
  assert.match(noManifest.last(), /Pepita is still sitting on a shipping schedule/);
  assert.match(noManifest.last(), /Pepita has expensive taste\.$/);
  const noPhotos = play(...TOUR, "s", "open aviary", "s", "use coin on hippo", "s", "say peacock", "e", "d", "run", "e", "play cielito lindo", "w", "s", "d");
  assert.match(noPhotos.last(), /the thirteenth step is still keeping the Don's best pictures/);
  assert.match(noPhotos.last(), /Count the steps\.$/);
});

test("Polish C: W2 with and without the run; things examined counts first looks", () => {
  const ran = play(...TOUR, ...BASE, "e", "play cielito lindo", "w", "s", "d");
  assert.match(ran.last(), /One sprint, one good story, three secrets/);
  const talker = play(...TOUR, "open giraffe gate", "s", "open aviary", "s", "use coin on hippo", "x manifest", "x hippo", "x hippo", "s", "say peacocks",
    "e", "d", "say giraffe", "push thirteenth step", "e", "play cielito lindo", "w", "s", "d");
  assert.match(talker.last(), /You never ran once/);
  const r = report(talker), [x, y] = r["Things examined"].split(" of ").map(Number);
  assert.equal(x, 2, "manifest and hippo, each counted once");
  assert.equal(y, Object.keys(talker.get("G.nouns")).length + 7 - 6, "BG-01: the six escape-only nouns are bonus finds");
  assert.equal(r["Bonus finds"], "0 of 6");
  assert.match(talker.last(), /Every secret\. Not every corner\./);
});

test("Polish C: L1 opens with what caused the third strike (STRIKE3_BY)", () => {
  const cases = {
    RIFLE: [["n", "w", "take rifle", "touch rifle", "pull rifle"], /The rifle, Walter\? In my house\?/],
    PIANO: [["n", "w", "e", "e", "touch piano", "push piano", "play piano"], /Nobody touches Mama's piano/],
    STEP: [["n", "touch thirteenth step", "push thirteenth step", "pull thirteenth step"], /You were listening\. Too well\./],
    HIPPO: [[...TOUR.slice(0, 14), "touch hippo", "push hippo", "pull hippo"], /You put your hands on my Pepita\?/],
    Q1: [["n", "w", "e", "e", "w", "n", "say pozole", "say gravy", "say neither"], /Choose between my mother and my nonna/],
    Q2: [[...TOUR.slice(0, 10), "say books", "say more books", "say the book place"], /You don't know the name of your own bookstore/] };
  for (const [k, [cmds, opener]] of Object.entries(cases)) {
    const g = play(...cmds);
    assert.match(g.last(), /^COVER BLOWN\n\n/, k); assert.match(g.last(), opener, k);
    assert.match(g.last(), /Strikes: 3 of 3/, k);
    assert.match(g.last(), /RESTART to try again, or QUIT to walk away\.$/, k);
  }
});

test("Polish C: L3's first line follows the room type; the tail needs a secret", () => {
  const open = play(...TOUR, ...Array(18).fill("dance"));
  assert.match(open.last(), /^BIG FOOTPRINT\n\nThe rain stops hitting you\./);
  assert.doesNotMatch(open.last(), /Big Tony keeps things/);
  const glass = play(...TOUR, "s", "s", "use coin on hippo", ...Array(15).fill("dance"));
  assert.match(glass.last(), /^BIG FOOTPRINT\n\nEvery pane in the room goes dark at once\./);
  assert.match(glass.last(), /Big Tony keeps things\.\n\nGAME OVER\./);
  assert.match(glass.last(), /Secrets: 1 of 3 \(manifest\)/);
  const marble = play(...TOUR, "s", "s", "s", "run", ...Array(14).fill("dance"));
  assert.match(marble.last(), /^BIG FOOTPRINT\n\nA shadow the size of a delivery truck fills the doorway\./);
  assert.doesNotMatch(marble.last(), /Turns to spare/, "only W1, W2 and L2 report turns to spare");
});

test("Polish C: hint ladders keep their own places; close-ups show once; after the ending lines rotate", () => {
  const g = play(...TOUR, "hint", "hint", "s", "s", "hint", "n", "hint");
  const h = g.lines().filter((l, i, a) => a[i - 1] === "> hint");
  assert.deepEqual(h, ["Walk the tour backward. Grab what you can.", "The guards chase animals first.", "Pepita has a price.",
    "The gates are on the roof and the aviary is right below it. Open one before you meet a guard. Two secrets gets you out."]);
  g.type("s", "use coin on hippo", "x manifest");
  assert.match(g.last(), /^Dates, ports, container numbers/);
  g.type("x manifest");
  assert.match(g.last(), /^A waterproof tube/);
  const e = play(...TOUR, ...Array(18).fill("dance"), "look", "look", "look", "look");
  assert.deepEqual(e.lines().slice(-8).filter(l => !l.startsWith(">")), ["The story's over, detective. RESTART or QUIT.",
    "The Don's house is quiet now. RESTART or QUIT.", "Case closed. RESTART to reopen it, or QUIT.", "The story's over, detective. RESTART or QUIT."]);
});

test("Polish C: graded wrong attempts (E2) and alibi lines by checkpoint (E4)", () => {
  const g = play(...TOUR, "open giraffe gate", "s", "s", "s", "run", "e", "d", "say giraffe");
  assert.match(g.last(), /You just point up\. The giraffe's head hangs over the banister/, "R2 alibi line");
  g.type("push fifth step");
  assert.ok(g.lines().includes("That's step 5. It's just a step. Keep counting."));
  g.type("push 13th step", "push 13th step");
  assert.equal(g.last(), "It's already down. The panel is already open.");
  g.type("e", "play mama's song");
  assert.ok(g.lines().includes("Right song. Wrong words. What was it called? She sang it every Sunday."));
  const p = play(...TOUR, "s", "open aviary", "s", "s", "say peacocks");
  assert.match(p.last(), /As if on cue, a scream echoes down the hall/, "R7 alibi line");
});

// ---- Playtest QA (PT-xx): the wider coverage the playtest asked for
test("Playtest: extended coverage: bare verbs, social verbs, prepositions, nouns from other rooms", t => {
  const g = bigfoot(), nouns = g.get("G.nouns"), rooms = g.get("G.rooms"), fails = [];
  const place = (room, phase, extra = "") => g.run(`S.over = false; S.room = ${JSON.stringify(room)}; S.flags = {}; S.count = { turns: 5, strikes: 0, clock: 18, secrets: 0 };
    S.loc.don = ${phase === "TOUR" ? JSON.stringify(room) : "null"}; S.loc.nando = null; S.loc.coin = "player"; S.count.leg = 14;
    G.events.forEach((e, i) => { if (!e.repeat) S.fired[i] = true; });   // arrivals, greetings and endings already done: we test the reply only
    ${phase === "ESCAPE" ? "S.flags.escape = true; S.mark.tick = 5; S.loc.don = null;" : "S.flags.q1 = true; S.flags.q2 = true;"} ${extra}; globalThis.__snap = JSON.stringify(S);`);
  const tryIt = (label, cmd, ok = out => !out.some(l => BAD.some(b => b.test(l)))) => {
    g.run("S = JSON.parse(__snap)"); const k = g.lines().length, t0 = g.get("S.count.turns"); g.type(cmd);
    const out = g.lines().slice(k + 1);
    if (!out.length || !ok(out, g.get("S.count.turns") - t0)) fails.push(`${label}: "${cmd}" -> ${out.join(" / ") || "(nothing)"}`);
  };
  const phases = room => ["terrace", "enclosure"].includes(room) ? ["ESCAPE"] : ["TOUR", "ESCAPE"];
  for (const room of Object.keys(rooms)) for (const phase of phases(room)) {
    place(room, phase);
    // 1. every info and Tier 1 verb with no noun
    for (const v of ["search", "smell", "listen", "take", "touch", "push", "pull", "open", "close", "knock", "sit", "climb"]) tryIt(`${phase} ${room}`, v);
    // 2. Tier 2 verbs on the NPC who's here
    if (phase === "TOUR") for (const c of ["show don", "show card to don", "give card to don", "give don", "show plaque to don", "ask don", "ask don about piano", "tell don about family", "talk to don"])
      tryIt(`${phase} ${room}`, c);
    // 4. nouns from other rooms: the free not-here line
    const here = Object.entries(nouns).filter(([, n]) => n.at === room || n.at === "any").flatMap(([, n]) => n.words);
    const next = Object.values(rooms[room].exits || {}).map(x => typeof x === "string" ? x : x.to).flatMap(r => rooms[r].words || []);
    for (const [id, n] of Object.entries(nouns)) {
      if (n.at === room || n.at === "any") continue;
      const w = [...n.words].sort((a, b) => b.length - a.length)[0];
      if ([...here, ...next, "stairs", "staircase", "staircases", "step", "steps", "door", "fountain", "coins", "coin", "card", "photos", "gate"].some(x => ` ${w} `.includes(` ${x} `) || ` ${x} `.includes(` ${w} `))) continue;
      for (const v of ["examine", "open"]) tryIt(`${phase} ${room} (${id} is elsewhere)`, `${v} ${w}`, (out, cost) => out.length === 1 && out[0] === "Nothing like that around here." && cost === 0);
    }
  }
  // 2. Nando at a checkpoint: talk, ask, tell, examine are free and never confused
  for (const room of ["gallery", "foyer"]) {
    place(room, "ESCAPE", `S.flags.checkpoint = true; S.mark.stop = 5; S.loc.nando = ${JSON.stringify(room)};`);
    for (const c of ["talk to nando", "ask nando", "tell nando", "x nando", "talk", "say"]) tryIt(`checkpoint ${room}`, c, (out, cost) => cost === 0 && !out.some(l => BAD.some(b => b.test(l)) || l.startsWith("CAUGHT")));
  }
  // 3. prepositional forms
  for (const [room, cmds] of [["atrium", ["drop coin in fountain", "put coin in hippo"]], ["dining", ["put card in bowl", "look under table", "look behind portraits"]],
    ["gallery", ["look behind portraits"]], ["office", ["look in humidor", "look under desk"]]])
    for (const phase of ["TOUR", "ESCAPE"]) { place(room, phase); for (const c of cmds) tryIt(`${phase} ${room}`, c); }
  // 5. every WORDS entry as "look at <words>"
  for (const [id, n] of Object.entries(nouns)) {
    const phase = (n.examine || []).some(l => !l[0] || l[0] === "TOUR" || l[0].startsWith("TOUR&")) && !["terrace", "enclosure"].includes(n.at) ? "TOUR" : "ESCAPE";
    if (!(n.examine || []).some(l => !l[0] || l[0] === phase || l[0].startsWith(phase + "&"))) continue;
    place(n.at === "any" ? "foyer" : n.at, phase);
    for (const w of n.words) tryIt(`${phase} ${id}`, `look at ${w}`);
  }
  assert.deepEqual(fails, []);
});

test("Playtest P2s: PT-01 to PT-06", () => {
  const g = bigfoot();
  g.type("listen");
  assert.equal(g.last(), "Violins, very softly. The music of people who have never once had to hurry.", "PT-01");
  g.type(...TOUR.slice(0, 11), "show coin to don");
  assert.equal(g.last(), "He folds your fingers back over it. \"A dividend is not a loan.\"", "PT-02");
  g.type("w", "x stairs");
  assert.match(g.last(), /^Twelve steps on the family side/, "PT-06");
  g.type("w", "n", "drop coin in fountain");
  assert.equal(g.get("S.count.strikes"), 1, "PT-03: a strike on the tour");
  const e = toEscape(); e.type("e");
  const t0 = e.get("S.count.turns"); e.type("open jaguar gate");
  assert.equal(e.last(), "Nothing like that around here.", "PT-04"); assert.equal(e.get("S.count.turns"), t0, "PT-04: free");
  const r = toEscape(); r.type("open giraffe gate", "s", "s");
  const extras = r.lines().slice(r.lines().lastIndexOf("Atrium") + 2);
  assert.equal(extras.length, 2, "PT-05: at most two extra lines: " + extras.join(" / "));
  const w = toEscape(); for (let i = 0; i < 12; i++) w.type("dance");
  assert.equal(w.last(), "Somewhere behind you, a thud rattles the chandeliers.", "PT-05: no feedback or band on a warning turn");
});

test("Playtest P3s: PT-07 to PT-15", () => {
  const g = bigfoot();
  g.type("smell");
  assert.equal(g.last(), "Cologne, brass polish, and your own nerves.", "PT-07");
  g.type("n", "x family photos");
  assert.match(g.last(), /^Christenings, weddings/, "PT-09");
  g.type("w", "e", "e", "w", "n", "x cards");
  assert.ok(g.lines().some(l => l.startsWith("Every name in the same looping hand")), "PT-08");
  g.type("say both", "s", "u", "e", "say dog-eared page", "x card");
  assert.match(g.last(), /At the bottom: "Smile\. Don't touch anything\." You smiled\. He liked the name\. So far, so good\.$/, "PT-10");
  g.type("w", "w", "n", "take coins");
  assert.equal(g.last(), "The Don's smile tightens. \"Those are Pepita's, Walter. Hands to yourself.\"", "PT-11");
  g.type("n", "n", "x coin");
  assert.match(g.last(), /^The eagle, the winged figure/, "PT-10: COIN_HELD in ESCAPE");
  g.type("open jaguar gate", "x garden");
  assert.match(g.last(), /^Clipped hedges[\s\S]*A single paw print/, "PT-15: base line, then the mark");
  g.type("x jaguar");
  assert.match(g.last(), /^Gone\./, "PT-15: a state change still replaces");
  g.type("e", "eat banana peels");
  assert.ok(g.lines().includes("You're hungry, not desperate."), "PT-12");
  const w = toEscape(); w.type("open giraffe gate", "s", "s", "use coin on hippo", "s", "run", "e", "d", "say giraffe", "s", "d");
  assert.equal(w.last(), "Your thumb hovers over the button. One secret isn't a case. It's a rumor. Go get another.", "PT-14");
  w.type("n", "push 13th step", "e", "w");
  assert.ok(!w.lines().slice(-6).some(l => l.startsWith("You see:")), "PT-13: no engine item list under the revisit");
});

test("Playtest round 2 P2s: NB-01 to NB-04", () => {
  const cp = toEscape(); cp.type("s", "s", "s");
  const t0 = cp.get("S.count.turns");
  cp.type("say", "tell nando", "where am i", "exits", "map", "what now", "help me", "undo");
  assert.equal(cp.get("S.over"), false, "NB-01, NB-04: free at a checkpoint");
  assert.equal(cp.get("S.count.turns"), t0);
  cp.type("go back");
  assert.match(cp.last(), /^CAUGHT/, "NB-04: going back at a checkpoint is still a move");
  const q = play("n", "w", "e", "e", "w", "n", "say this smells amazing");
  assert.equal(q.last(), "The Don smiles. \"Compliments later, Walter. Pozole or gravy?\"", "NB-02");
  assert.equal(q.get("S.count.strikes || 0"), 0);
  q.type("say gravy");
  assert.equal(q.get("S.count.strikes"), 1, "NB-02: an answer still counts");
  const a = toEscape(); a.type("open giraffe gate", "s", "s", "s", "tell nando the giraffe is loose");
  assert.equal(a.get("S.flags.checkpoint || false"), false, "NB-03: tell = say");
  const b = toEscape(); b.type("open jaguar gate", "s", "s", "s", "shout jaguar!");
  assert.equal(b.get("S.flags.checkpoint || false"), false, "NB-03: shout = say");
  const m = play("n", "where am i", "exits");
  assert.match(m.lines().at(-3), /^Grand Foyer\nThe twin staircases/, "NB-04 where");
  assert.equal(m.last(), "Exits: south, west, east, north, up", "NB-04 exits (tour)");
  const e = toEscape(); e.type("back");
  assert.equal(e.last(), "Back which way? Name a direction, or a landmark.", "NB-04 back (escape)");
});

test("Playtest round 2 P3s: NB-05 to NB-09", () => {
  const g = play("n", "say hello, don chava");
  assert.equal(g.last(), "\"Look around, Walter. Every stone in this floor, I earned.\"", "NB-05: say = talk with the Don here");
  g.type("tell don i love the marble");
  assert.equal(g.last(), "\"Tell me something I don't know.\" He's delighted.", "NB-09");
  g.type("ask don about the palace");
  assert.equal(g.last(), "\"Every stone, I picked. Every stone, I paid for. Mostly.\"", "NB-09 topic");
  const n = toEscape(); n.type("say hello?");
  assert.equal(n.last(), "You say it out loud. The house doesn't answer.", "NB-05: nobody here");
  const h = play("n", "w", "e", "e", "w", "n", "hint", "hint", "hint", "say both", "s", "u", "e", "hint");
  assert.equal(h.last(), "He's asking you something. Answer with \"say\".", "NB-06: Q2's ladder starts at step 1");
  const p = toEscape(); p.type("open giraffe gate", "s", "s", "use coin on hippo", "s", "run", "e", "d", "say giraffe", "push 13");
  assert.equal(p.get("S.loc.photos"), "player", "NB-07");
  const a = toEscape(); a.type("open giraffe gate and jaguar gate");
  assert.equal(a.last(), "One thing at a time, detective.", "NB-08");
  assert.deepEqual([a.get("S.count.giraffe"), a.get("S.count.jaguar || 0")], [1, 0]);
  const q = play("n", "w", "e", "e", "w", "n", "say pozole and gravy");
  assert.equal(q.get("S.flags.q1"), true, "NB-08 doesn't split what's said out loud");
});

test("Playtest round 3 P2s: BG-01 to BG-06", () => {
  const x = play("x violins", "x speaker");
  assert.ok(!/Nothing like that/.test(x.lines().slice(-2).join("\n")), "BG-02");
  const a = play(...TOUR.slice(0, 14), "talk to pepita");
  assert.match(a.last(), /dignified bronze silence[\s\S]*She likes you\. Maybe\./, "BG-03");
  const z = toEscape(); z.type("talk to giraffe");
  assert.equal(z.last(), "She lowers her head, listens politely, and eats a hedge.", "BG-03");
  const l = toEscape(); l.type("s", "s", "s", "tell nando about the lemurs");
  assert.match(l.last(), /^CAUGHT[\s\S]*"The lemurs\?" Nando snorts\./, "BG-04");
  const k = play("n", "threaten don");
  assert.equal(k.last(), "He laughs, but his eyes don't. \"Walter. We were getting along so well.\"", "BG-05");
  assert.equal(k.get("S.count.strikes || 0"), 0, "BG-05: provoke is no strike");
  k.type("kill don");
  assert.ok(!/penthouse is unimpressed|don't know how/.test(k.last()), "BG-05: kill = hit");
  const p = toEscape(); p.type("open giraffe gate", "s", "s", "use coin on hippo");
  const t0 = p.get("S.count.turns"); p.type("use coin on hippo");
  assert.equal(p.last(), "Pepita's already open, and already empty.", "BG-06");
  assert.equal(p.get("S.count.turns"), t0, "BG-06: free");
});

test("Playtest round 3 P3s: BG-07 to BG-13", () => {
  const r = toEscape(); r.type("s", "s", "n", "s");
  assert.ok(r.lines().slice(-4).some(l => l.startsWith("Pepita the HIPPO again")) && !r.lines().some(l => /^You see: (HIPPO|AVIARY)/.test(l)), "BG-07");
  const s = toEscape(); s.type("open giraffe gate", "s", "s", "use gold coin on hippo", "s", "run", "e", "d", "say giraffe", "x step");
  assert.match(s.last(), /^A hair taller than its neighbors/, "BG-08");
  assert.match(play("n", "kick step").last(), /Those stairs are older than you/, "BG-09");
  assert.equal(play("n", "w", "e", "e", "kick piano").last(), "The Don's smile tightens. \"Hands off Mama's piano, Walter.\"", "BG-09");
  assert.equal(play("n", "ask don about dinner").last(), "\"Patience. Business first, then the table.\"", "BG-10");
  assert.equal(play("n", "ask don about his wife").last(), "\"Family is not for strangers, Walter. Not yet.\"", "BG-10");
  assert.match(play("n", "ask don about reina").last(), /Reina is the loudest/, "BG-10 alias");
  const l = play("listen to the xyzzy", "swim");
  assert.equal(l.lines().at(-3), "Violins, very softly. The music of people who have never once had to hurry.", "BG-11");
  assert.equal(l.last(), "No pool. Not even for you.", "BG-11");
  const t = toEscape(), t0 = t.get("S.count.turns"); t.type("take all", "drop all");
  assert.equal(t.last(), "One thing at a time, detective.", "BG-12");
  assert.equal(t.get("S.count.turns"), t0, "BG-12: free");
  assert.equal(play("x don").last(), "You'll meet him in a second. You can already hear him.", "BG-13");
});
