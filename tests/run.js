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
  assert.match(g.last(), /^Commands: /);
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
  assert.match(g.last(), /W1/);
  assert.equal(g.get("S.over"), true);
});

test("big-footprint B: the piano detour wins with all 3 secrets (W2)", () => {
  const g = bigfoot();
  g.type(...TOUR, ...ESCAPE, "e", "play cielito lindo", "w", "s", "d");
  assert.deepEqual(["ledger", "manifest", "photos"].map(i => g.get(`S.loc.${i}`)), ["player", "player", "player"]);
  assert.match(g.last(), /W2/);
});

test("big-footprint B: tour rules: the Don blocks other exits and the elevator; free commands cost nothing", () => {
  const g = bigfoot();
  g.type("d");
  assert.match(g.last(), /ELEVATOR during TOUR/);
  g.type("n", "n");
  assert.match(g.last(), /TOUR BLOCK/);
  assert.equal(g.get("S.room"), "foyer");
  const t = g.get("S.count.turns");
  g.type("look", "examine staircase", "inventory", "status", "hint", "help");
  assert.equal(g.get("S.count.turns"), t);
  g.type("xyzzy");
  assert.equal(g.get("S.count.turns"), t, "unrecognized commands cost nothing");
  g.type("w", "e", "e", "w", "n", "s");
  assert.match(g.last(), /Q1 PROMPT/, "the Don won't move on until Q1 is answered");
  assert.equal(g.get("S.room"), "dining");
});

test("big-footprint B: three strikes blow your cover (L1); examine is safe", () => {
  const g = bigfoot();
  g.type("n", "w", "examine rifle", "take gold rifle");
  assert.match(g.last(), /STRIKE 1/);
  g.type("touch rifle");
  assert.match(g.last(), /STRIKE 2/);
  g.type("e", "e", "w", "n", "say pozole");
  assert.match(g.last(), /L1 COVER BLOWN/);
});

test("big-footprint B: a wrong answer at a checkpoint gets you caught (L2)", () => {
  const g = bigfoot();
  g.type(...TOUR, "s", "s", "s", "status", "hint");
  assert.equal(g.get("S.over"), false, "free commands are safe at a checkpoint");
  g.type("say jaguar");
  assert.match(g.last(), /L2 CAUGHT/);
});

test("big-footprint B: second run is not allowed (L2); restart starts over", () => {
  const g = bigfoot();
  g.type(...TOUR, "open jaguar gate", "s", "s", "s", "run", "e", "d", "run");
  assert.match(g.last(), /L2 CAUGHT/);
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
  for (const n of [6, 3, 1]) assert.ok(g.lines().some(l => l.includes(`${n} TURN`)), `warning at ${n}`);
  assert.match(g.last(), /L3 BIG FOOTPRINT/);
});

test("big-footprint B: puzzles: wrong attempts keep the item; elevator needs 2 secrets", () => {
  const g = bigfoot();
  g.type(...TOUR, "s", "s", "open hippo", "use card on hippo");
  assert.match(g.last(), /P2 WRONG/);
  assert.equal(g.get("S.loc.card"), "player");
  g.type("s", "run", "e", "d", "say peacocks");
  assert.match(g.last(), /L2 CAUGHT/, "an unreleased animal is no alibi");
  const h = bigfoot();
  h.type(...TOUR, "s", "open aviary", "s", "use coin on hippo", "s", "run", "e", "d", "say peacocks", "s", "d");
  assert.match(h.last(), /ELEVATOR < 2 secrets/);
  assert.equal(h.get("S.over"), false);
});
