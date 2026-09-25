// Game data reference: docs/AUTHORING.md
// THIS PLACE HAS A BIG FOOTPRINT (Week 01). GDD ids in comments: R1-R12 rooms, I1-I5 items, N1-N3 NPCs, P1-P3 puzzles.

// ---- All player-facing text, keyed by Script id. Logic lives in G below.
const T = {
  intro: "A Retroment Gaming production.\n\nYour client wants three secrets from Don Chava's penthouse. Your cover: Walter Pryce, bookstore investor, carrying a plaque proposal and a smile. The Don will give you the grand tour himself. Listen to everything. Touch nothing. Get out with at least two.\n\nType HELP for commands.",
  help: "Move: north, south, east, west, up, down (or n, s, e, w, u, d).\nLook around: look. Look at something: examine [\u200bthing] (or x).\nTake, drop, use [\u200bitem] on [\u200bthing], open, push, play, read.\nTalk: talk to [\u200bperson]. Answer: say [\u200bwords].\nIn a tight spot: run (works once).\nOther: inventory (i), status, hint, quit.\nOn the tour, free actions: look, examine, inventory, status, help, hint. Once the chaos starts, every other command costs time.",   // \u200b: shown as [thing], not read as an [id] tag
  huh: ["You try that. The universe gives you a look usually reserved for bad checks.",
    "That doesn't make sense, even for a guy pitching a bookstore to a kingpin.",
    "Nice try, detective. Say it plain."],
  over: "The story's over, detective. RESTART or QUIT.",
  room: {   // FIRST (first tour visit), REVISIT (later tour visits), ESCAPE (once the chaos starts)
    R1: { first: "The elevator doors open on a box of mirrored gold, and you see six versions of Walter Pryce, bookstore investor, all of them sweating a little. Don Chava's man hits the button and steps back out. The only way is north, into the foyer, where a voice is already saying your name like it's a deal.",
      revisit: "Mirrored gold, and your reflection trying hard to look like it belongs here. The foyer is north.",
      escape: "The gold box hums, waiting. One button, one way down. Behind you, the double staircase and every problem you left on it." },
    R2: { first: "White marble floors, gold banisters, and two [staircase] that curve up to the same landing like arms around a hug you didn't ask for. The left staircase is wide and carpeted; the right is narrower, polished to a shine. The trophy room glitters west, a piano waits in the salon east, a long table stretches north in the dining hall, the stairs lead up, and the elevator is south.",
      revisit: "The twin [staircase], left for family and right for business, still curling up toward the landing. West to the trophies, east to the piano, north to dinner, up the stairs, or south to the elevator.",
      escape: [{ if: { flag: "p3" }, text: "The foyer lights flicker. Somewhere above, glass breaks. The two [staircase] rise into the dark; a panel in the right one stands open at the thirteenth step, breathing cold air. The gold elevator waits behind you. The trophy cases glitter off to one side, the piano salon to the other, the long dinner table straight ahead." },
        "The foyer lights flicker. Somewhere above, glass breaks. The two [staircase] rise into the dark; the right one gleams, and its thirteenth step sits a hair higher than the rest, like it's waiting to be pressed. The gold elevator waits behind you. The trophy cases glitter off to one side, the piano salon to the other, the long dinner table straight ahead."] },
    R3: { first: "Glass cases line the walls, lit like jewelry counters. Inside: a [rifle] engraved with roses, a pistol studded with enough diamonds to buy a small town, and a framed newspaper headline someone has carefully cut the name out of. The foyer is back east.",
      revisit: "The glass cases, the [rifle], the diamonds, the headline with the missing name. East to the foyer.",
      escape: "The cases rattle each time something heavy hits a floor above. The [rifle] stares back at you, useless. The only way out is back toward the staircases." },
    R4: { first: "A white grand [piano] sits in the middle of the room like the only guest who got a chair. Its lid is a sheet of mirror, and it shows you the chandelier, the ceiling fresco, and your own nervous smile. The foyer is west.",
      revisit: "The mirrored [piano], reflecting the chandelier and your nerves. West to the foyer.",
      escape: [{ if: { flag: "p1" }, text: "The [piano]'s mirrored lid stands open, the hidden tray empty. Mama's piano kept her secret as long as she could. The way out is back toward the staircases." },
        "The [piano] waits in the half-light, its mirrored lid reflecting flashing alarm lights. Mama's piano. Mama's song. The way out is back toward the staircases."] },
    R5: { first: "A table long enough to seat a jury, set for twenty. Two portraits face each other across it: a stern woman in a rebozo and a sterner woman holding a wooden spoon. Chili, garlic, and slow-cooked tomato hang in the air. The foyer is south.",
      revisit: "The endless table, the two grandmothers watching each other like rival dons. South to the foyer.",
      escape: "Chairs knocked over, a lemur on the table eating grapes out of a silver bowl. It doesn't care about you. The way out is back toward the staircases." },
    R6: { first: "Both staircases meet here at a balcony that looks down on the foyer. A gallery of portraits stretches west, and a heavy office door stands open to the east, leaking cigar smoke. The stairs lead back down.",
      revisit: "The balcony where the two staircases meet. West to the portraits, east to the office, down to the foyer.",
      escape: "The balcony shakes under a distant thud. Cigar smoke still drifts from the office. The hall of portraits stretches one way; the staircases drop down to the foyer." },
    R7: { first: "A long hall of oil portraits, all of them the Don: the Don on a horse, the Don with a lion, the Don as a saint. The wallpaper is peacock feathers. A guard passes by and nods. The atrium is north, the landing east.",
      revisit: "A hundred painted Don Chavas watch you walk. North to the atrium, east to the landing.",
      escape: "The painted Dons glare down, and one portrait is hanging crooked, torn by claws. One end of the hall smells of chlorine; the other opens onto the balcony above the stairs." },
    R8: { first: "A glass roof, tropical plants, and in the center a bronze [hippo] fountain spouting water from its nostrils with great dignity. Its mouth is closed tight. The gallery is south and a chorus of shrieking birds comes from the north.",
      revisit: "The bronze [hippo] spouts water, mouth shut. South to the gallery, north to the birds.",
      escape: [{ if: { flag: "p2" }, text: "Water sloshes over the fountain's edge. Lemurs chatter in the palms, pelting the floor with fruit. The bronze [hippo] gapes, jaw hanging open, very pleased with itself. One way, the peacocks scream; the other, the hall of portraits." },
        "Water sloshes over the fountain's edge. Lemurs chatter in the palms, pelting the floor with fruit. The bronze [hippo] waits, mouth shut. One way, the peacocks scream; the other, the hall of portraits."] },
    R9: { first: "Leather, mahogany, a humidor the size of a coffin, and a window that looks down on a city he probably owns part of. A framed sign on the desk reads \"LEGITIMATE BUSINESS.\" The landing is west.",
      revisit: "The leather, the cigars, the sign that protests too much. West to the landing.",
      escape: "Papers everywhere, a chair knocked over, the humidor open and empty. Whatever mattered in here, the Don took it. The only way out is back to the balcony." },
    R10: { first: "A glass room full of peacocks that scream like car alarms with feelings. The [aviary] door has a keypad lock, glowing red. The atrium is south, and fresh night air blows in from the terrace north.",
      revisit: "The peacocks, the screaming, the red keypad on the [aviary] door. South to the atrium, north to the terrace.",
      escape: [{ if: { min: { peacocks: 1 } }, text: "The [aviary] door hangs open, the keypad smashed. Feathers everywhere, and the peacocks are screaming their way through the palace. One doorway breathes fresh night air; the other smells of chlorine." },
        "The [aviary] keypad is smashed, its door rattling. The peacocks are screaming louder than ever. One doorway breathes fresh night air; the other smells of chlorine."] },
    R11: { first: "A rooftop garden with a view of the whole city. Behind the [giraffegate] a giraffe chews thoughtfully; beside it, a black jaguar paces behind the [jaguargate]. Then the alarms start. Lemurs pour out of the dark, a roar shakes the glass, and the Don goes pale: \"The accountant. He opened the big one.\" He's gone south with his guards in three seconds flat. You are alone, holding a plaque proposal, with something enormous waking up to the east.",
      revisit: { opening: "Wind and alarms.",   // ED-02: built from parts by animal state
        giraffe: ["The giraffe peers over the [giraffegate].", "The [giraffegate] hangs open, the yard empty."],
        jaguar: ["The jaguar paces behind the [jaguargate].", "The [jaguargate] swings in the wind."],
        closing: "The broken enclosure gapes past the gates. The screaming aviary leads back inside." } },
    R12: { escape: "Steel bars bent outward like someone opened a bag of chips. A brass sign reads \"BIG TONY — DO NOT FEED.\" Footprints the size of snow shovels lead back past you. The only way out is the terrace." }
  },
  item: {
    card: { look: "Your cover, in your own handwriting. Name: Walter Pryce. Business: The Dog-Eared Page, a bookstore planned for the empty lot next door. Offer: a brass plaque reading \"The Bellandi-Reyes Reading Room.\" At the bottom: \"Smile. Don't touch anything.\"",
      take: "You already have it. It's the only thing keeping you from being a very short story.",
      use: "That won't help. The card is for reading, not for handing to anyone." },
    coin: { look: "A heavy gold coin with an eagle on one side and a winged figure on the other. The Don called it your \"first dividend.\"",
      take: "You pocket the coin. It's warm from his hand, which somehow makes it worse.",
      use: "You hold out the coin. Nothing here wants it. You put it back before you lose it." },
    ledger: { look: "A fat notebook held shut with rubber bands, full of initials, dates, and payments in neat columns. Two pages list nothing but rubber band purchases. Someone had a lot of cash to wrap.",
      take: "You tuck the ledger inside your jacket." },
    manifest: { look: "A waterproof tube holding a shipping schedule: dates, ports, and thousands of cans of \"premium chiles\" that clearly have never been near a chile.",
      take: "The manifest goes into your jacket." },
    photos: { look: "A stack of photos: the Don shaking hands on a yacht with men whose faces would end careers. Someone wrote a date on the back of each one.",
      take: "You slide the photos into your jacket." },
    have: "You already have that.",   // BR-02
    evidence: "Tempting, but this is evidence, not a tool. Keep it safe.",
    // scenery: the Script has no examine lines, so these reuse its room sentences
    rifle: "A GOLD RIFLE engraved with roses, in a glass case lit like a jewelry counter.",
    piano: [{ if: { flag: "escape" }, text: "Its mirrored lid reflects flashing alarm lights. Mama's piano. Mama's song." },
      "A white grand PIANO. Its lid is a sheet of mirror, and it shows you the chandelier, the ceiling fresco, and your own nervous smile."],
    staircase: [{ if: { flag: "p3" }, text: "The two staircases rise into the dark; a panel in the right one stands open at the thirteenth step, breathing cold air." },
      { if: { flag: "escape" }, text: "The two staircases rise into the dark; the right one gleams, and its thirteenth step sits a hair higher than the rest, like it's waiting to be pressed." },
      "The left staircase is wide and carpeted; the right is narrower, polished to a shine."],
    hippo: [{ if: { flag: "p2" }, text: "Pepita's jaw hangs open. Whatever she was guarding, you've got it." },
      "A bronze HIPPO fountain spouting water from its nostrils with great dignity. Its mouth is closed tight."],
    aviary: [{ if: { min: { peacocks: 1 } }, text: "The AVIARY door hangs open, the keypad smashed." },
      { if: { flag: "escape" }, text: "The AVIARY keypad is smashed, its door rattling." }, "The AVIARY door has a keypad lock, glowing red."],
    giraffegate: [{ if: { min: { giraffe: 1 } }, text: "The GIRAFFE GATE hangs open. The giraffe is somebody else's problem now." },
      "A tall iron gate. The giraffe leans over it, chewing, curious about you."],
    jaguargate: [{ if: { min: { jaguar: 1 } }, text: "The JAGUAR GATE hangs open. You're very glad you're not the one chasing it." },
      "A steel-barred gate. Behind it, the jaguar paces and watches you with yellow eyes."]
  },
  don: {
    look: "Salvatore Bellandi-Reyes, but friends call him Chava. He grips your hand like he's weighing it.",
    stop: {   // said on arriving at each tour stop; the last line names the next direction
      R2: "\"Mr. Pryce! Welcome. Salvatore Bellandi-Reyes, but friends call me Chava, and you're a friend until you're not.\" He grips your hand like he's weighing it.\n\n\"Two staircases, two families. My mother's people came from the mountains of the west coast, my father's from Palermo. In this house we never choose between family.\" He taps the left banister. \"Left stairs, twelve steps, for family. Right stairs, thirteen, for business. Never trust the thirteenth step, amigo.\" He winks. \"Come, the trophy room. West.\"",
      R3: "\"My collection. Every piece has a story, and I tell none of them.\" He nods at the [rifle]. \"Admire. Don't touch. Back east, then the salon.\"",
      R4: "\"My mother's piano. Only one song is ever played on her: my mother's song. Anything else is disrespect.\" He watches your hands. \"Now, dinner. Back west, then north.\"",
      R5: "\"Mama Rosa sang 'Cielito Lindo' every Sunday at this table. Every Sunday. My nonna banged her spoon on the table to keep time.\" Then he leans in.",
      R9: "He drops into a leather chair. \"A reading room. With my name on it. You know what that does for a man's reputation?\" He smiles.",
      R7: "\"Me, by the finest painters money can scare.\" A guard hurries past. \"My boys know the rule: the animals come first. Anything gets loose, they drop everything and chase it. North, to my girl.\"",
      R8: "\"Pepita.\" He flicks a gold coin into the [hippo]'s mouth, and the bronze jaw swings open, then snaps shut. \"She only opens up for gold. Like my accountants. North, the birds.\"",
      R10: "\"My peacocks. Loud, beautiful, and they don't know how to lie. North. Time you met the family.\""
    },
    after1: "\"Good answer. Now upstairs, to talk business. South, then up, then east.\"",
    after2: "He flips you a GOLD COIN. \"Your first dividend, partner. Now let me show you my real investments. West, west, then north.\"",
    talk: "Questions later, Walter. Keep up."
  },
  nando: { look: "Nando, the size of a vending machine, blocks the way.",
    talk: "Hey. Guests don't wander. Why are you up here?",
    greet: "A flashlight hits your face. Nando, the size of a vending machine, blocks the way. \"Hey. Guests don't wander. Why are you up here?\" Your legs vote to run. Your brain votes for a good story.",
    after: "Nando is gone, shouting somewhere far away." },
  q1: { prompt: "\"So tell me, Walter. Sunday dinner: my mother's pozole or my nonna's Sunday gravy?\"",
    right: "He laughs and slaps the table. \"Both! Now you sound like family.\"",
    wrong: ["\"You'd choose? In this house?\" His smile tightens. He asks again, slower. \"Sunday dinner. Pozole or gravy?\"",
      "The smile is gone. \"Twice now, Walter. I don't like three.\" He asks one more time. \"Sunday dinner. Pozole or gravy?\""] },
  q2: { prompt: "\"Remind me, what's your bookstore called again?\"",
    right: "\"The Dog-Eared Page. Cute. I like cute.\"",
    wrong: ["\"That's not what you told my people.\" His smile tightens. \"What's the bookstore called?\"",
      "The smile is gone. \"Twice now, Walter. I don't like three. The bookstore. Its name.\""] },
  strike1: "The Don's smile tightens. \"Hands to yourself, Walter. That's a collector's piece.\"",
  strike2: "The smile is gone. \"Twice now. I don't like three.\"",
  tourBlock: "The Don puts a hand on your shoulder. \"Private, amigo. This way.\"",
  downTour: "\"Leaving before dessert?\" The Don steers you back out.",
  downEmpty: "Your thumb hovers over the button. Two secrets minimum, or this was all for nothing. You're not leaving empty-handed.",
  gateTour: "The keypad blinks red. Locked tight, and the Don is watching.",
  p1: { solved: "You play the first bars of \"Cielito Lindo,\" badly but with feeling. Something clicks. The mirrored lid rises on its own, and a hidden tray slides out holding a LEDGER bound in rubber bands. Secrets: {secrets} of 3.",
    wrong: "You bang out a few notes. The piano does nothing, but you're pretty sure Mama Rosa is disappointed. Which song does this piano keep?",
    hint: "He told you whose song this piano keeps. He told you the title over dinner." },
  p2: { solved: "You flick the coin into Pepita's mouth. The bronze jaw swings open, and a waterproof tube tumbles out into the water. You fish out the SHIPPING MANIFEST. Secrets: {secrets} of 3.",
    wrong: "You pull at the bronze jaw. Pepita's got a grip like a bank vault. She only opens up for one thing.",
    hint: "The hippo has expensive taste. So did the Don's handshake." },
  p3: { solved: "You press the thirteenth step. It sinks with a click, and a panel in the staircase slides open, releasing cold air from a narrow passage. Just inside, a shoebox holds the DEAL PHOTOS. Secrets: {secrets} of 3.",
    wrong: "You press a step. It's just a step. The Don said which one you can't trust.",
    hint: "Business has one more step than family." },
  alibi: { peacocks: "You punch the smashed keypad. The door swings open and peacocks explode into the palace, screaming like the world is ending. Perfect alibi: PEACOCKS.",
    giraffe: "You lift the latch. The giraffe ducks out and ambles off toward the stairs, curious about everything. Perfect alibi: GIRAFFE.",
    jaguar: "You swing the gate open and flatten yourself against the wall. The jaguar pours past like smoke and disappears downstairs. Perfect alibi: JAGUAR.",
    already: "It's already open. That animal's somebody else's problem now." },
  guard: { run: "You bolt. Nando grabs for you, and a lemur lands on his head. By the time he pulls it off, you're long gone.",
    peacocks: "\"The Don wants the peacocks rounded up! Do you hear them?\" Nando does. He sprints toward the screaming.",
    giraffe: "\"The giraffe's loose on the staircase! Boss said animals first!\" Nando swears and runs.",
    jaguar: "\"The JAGUAR is out. It went that way.\" Nando goes very pale and very fast." },
  clock: { 6: "Somewhere behind you, a thud rattles the chandeliers.",
    3: "A roar, closer now. Something is sniffing its way through the palace.",
    1: "The floor shakes. You smell wet dog and bad decisions. Move." },
  hint: { tour: "Listen to the Don. Every brag is a clue.", escape: "Walk the tour backward. Grab what you can. The guards chase animals first." },
  statusTour: "Tour in progress. Strikes: {strikes}/3.",
  fallback: "I don't understand that. Type 'help'.",   // the engine's line; the messages add-on rotates T.huh in its place
  end: {
    W1: "CLEAN GETAWAY\n\nThe elevator doors slide shut on the roaring, screaming, honking chaos above. Floors tick by. You pat your jacket: two secrets, safe. One is still up there, but tonight, two was plenty. The doors open onto the street, the city, and the empty lot next door. It would make a great bookstore.\n\nTHE END. Secrets recovered: 2/3.",
    W2: "CLEAN SWEEP\n\nThe doors shut. Your jacket is so heavy with evidence it practically has a credit rating. Ledger, manifest, photos. Every secret the Don had, and he gave you the tour himself. Somewhere upstairs, a giraffe is eating the plaque proposal.\n\nTHE END. Secrets recovered: 3/3. Perfect run.",
    L1: "COVER BLOWN\n\nThe Don goes very still. \"Walter. If that's your name.\" He snaps his fingers, and two guards appear. \"Show our friend the wine cellar. He likes to touch things. Let him touch the door from the inside.\"\n\nGAME OVER.",
    L2: "CAUGHT\n\nNando doesn't buy it. A heavy hand, a plastic zip tie, and a long walk back to the Don. \"An investor,\" the Don says. \"I'm so disappointed.\"\n\nGAME OVER.",
    L3: "BIG FOOTPRINT\n\nA shadow the size of a vending machine fills the hall. A hand like a catcher's mitt lifts you off your feet, gently, the way you'd pick up a kitten, and carries you back to the broken enclosure to keep him company. Big Tony is lonely. Big Tony is also very, very strong.\n\nGAME OVER."
  },
  retry: "\n\nType RESTART to try again, or QUIT to walk away."
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
  return [...[].concat(t.escape).map(v => typeof v === "string" ? { if: ESC, text: v } : { if: { ...ESC, not: { not: v.if } }, text: v.text }),
    { if: { flag: `been_${id}` }, text: t.revisit }, t.first]; };
const R11 = T.room.R11.revisit, penned = (a, n) => n ? { min: { [a]: 1 } } : { max: { [a]: 0 } };
const terrace = [0, 1].flatMap(g => [0, 1].map(j => ({ if: { ...ESC, ...penned("giraffe", g), not: { not: penned("jaguar", j) } },
  text: [R11.opening, R11.giraffe[g], R11.jaguar[j], R11.closing].join(" ") })));

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
  title: "THIS PLACE HAS A BIG FOOTPRINT",
  intro: T.intro,
  start: "elevator",
  aliases: { quit: "menu", read: "examine", press: "push", feed: "use", put: "use", insert: "use", flick: "use",
    toss: "use", throw: "use", pet: "touch", release: "open", unlock: "open" },   // verbs add-on
  free: ["look", "examine", "inventory", "status", "hint"],
  fallback: T.fallback,
  messages: {   // messages add-on: the engine's own lines, reworded
    [T.fallback]: { rotate: T.huh },
    "The game is over. Type 'menu' to return to the start menu.": T.over,
    "Commands: *": T.help,
    "Exits: *": [{ if: ESC, text: "" }, "*"]   // ESCAPE: exits are named by landmark in the room text
  },

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
        { if: { not: { flag: "p1" } }, say: T.p1.wrong } ] }) },   // solved: the fallback lines
    dining: { name: "Dining Hall", desc: desc("dining"), exits: exits("dining", { south: "foyer" }),             // R5
      on: { Say: [
        { if: { not: { flag: "q1" }, said: "both" }, set: "q1", say: T.q1.right + " " + T.don.after1 },
        { if: { not: { flag: "q1" } }, ...STRIKE, say: [{ if: { min: { strikes: 3 } }, text: "" }, { if: { min: { strikes: 2 } }, text: T.q1.wrong[1] }, T.q1.wrong[0]] } ] } },
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
        { if: { not: { flag: "q2" } }, ...STRIKE, say: [{ if: { min: { strikes: 3 } }, text: "" }, { if: { min: { strikes: 2 } }, text: T.q2.wrong[1] }, T.q2.wrong[0]] } ] } },
    aviary: { name: "Aviary", desc: desc("aviary"), exits: exits("aviary", { south: "atrium", north: "terrace" }),   // R10
      on: { open: [{ if: { ...TOUR, said: "aviary|door|keypad|cage|peacock|peacocks" }, say: T.gateTour },
        ...release("peacocks", "aviary|door|keypad|cage|peacock|peacocks")] } },
    terrace: { name: "Zoo Terrace", exits: exits("terrace", { south: "aviary", east: "enclosure" }),              // R11
      desc: [...terrace, T.room.R11.first],
      on: { open: [...release("giraffe", "giraffe"), ...release("jaguar", "jaguar")] } },
    enclosure: { name: "Broken Enclosure", desc: T.room.R12.escape, exits: exits("enclosure", { west: "terrace" }) }   // R12
  },

  items: {
    card: { name: "BRIEFING CARD", at: "player", aliases: ["briefing"], desc: T.item.card.look },                  // I1
    coin: { name: "GOLD COIN", desc: T.item.coin.look },                                                          // I2
    ledger: { name: "LEDGER", desc: T.item.ledger.look },                                                         // I3
    manifest: { name: "SHIPPING MANIFEST", desc: T.item.manifest.look },                                         // I4
    photos: { name: "DEAL PHOTOS", aliases: ["photo"], desc: T.item.photos.look },                              // I5
    // scenery (not GDD items): examine is free and safe
    rifle: { name: "GOLD RIFLE", at: "trophy", fixed: true, desc: T.item.rifle },
    piano: { name: "PIANO", at: "salon", fixed: true, aliases: ["lid"], desc: T.item.piano },
    staircase: { name: "staircases", at: "foyer", fixed: true, aliases: ["stairs", "staircase", "step", "steps", "thirteenth step", "13th step"], desc: T.item.staircase },
    hippo: { name: "HIPPO", at: "atrium", fixed: true, aliases: ["pepita", "fountain"], desc: T.item.hippo },
    aviary: { name: "AVIARY", at: "aviary", fixed: true, aliases: ["door", "keypad"], desc: T.item.aviary },
    giraffegate: { name: "GIRAFFE GATE", at: "terrace", fixed: true, desc: T.item.giraffegate },
    jaguargate: { name: "JAGUAR GATE", at: "terrace", fixed: true, desc: T.item.jaguargate }
  },

  npcs: {
    don: { name: "Don Chava", at: "foyer", aliases: ["don", "chava", "salvatore"], desc: T.don.look,                // N1
      dialogue: { start: { text: T.don.talk } } },
    nando: { name: "Nando", aliases: ["guard"], desc: T.nando.look, dialogue: { start: { text: T.nando.talk } } }  // N2 (offstage until a checkpoint)
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
      { if: { said: "coin", here: "coin" }, move: { coin: "player" }, say: T.item.coin.take },
      ...["coin", "ledger", "manifest", "photos"].map(i => ({ if: { said: i === "photos" ? "photos|photo" : i, has: i }, add: { turns: -1 }, say: T.item.have })) ],
    talk: [{ if: { said: "nando|guard", min: { cleared: 1 }, not: { here: "nando" } }, say: T.nando.after }],
    run: [{ if: { flag: "checkpoint", max: { ran: 0 } }, ...CLEAR, add: { ran: 1, cleared: 1 }, say: T.guard.run }],
    Say: [alibi("peacocks"), alibi("giraffe"), alibi("jaguar")],
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
    { if: { min: { strikes: 3 } }, end: T.end.L1 + T.retry },
    { if: { flag: "won", min: { secrets: 3 } }, end: T.end.W2 },
    { if: { flag: "won" }, end: T.end.W1 },
    // tour: arriving at each stop moves the Don along and plays his line
    ...LEGS.map(([, , to], k) => ({ if: { in: to, min: { leg: k }, max: { leg: k } }, add: { leg: 1 }, move: { don: to },
      ...(T.don.stop[ROOM[to]] && LEGS.findIndex(l => l[2] === to) === k && { say: T.don.stop[ROOM[to]] + (QUIZ[to] ? " " + QUIZ[to][1] : "") }) })),
    // ESCAPE begins on entering R11: the Don flees, the Bigfoot clock starts at 18
    { if: { in: "terrace" }, set: "escape", move: { don: null }, add: { clock: 18 }, mark: "tick" },
    { repeat: true, if: { ...ESC, since: { tick: 1 } }, mark: "tick", add: { clock: -1 } },   // every turn-costing command
    { if: { flag: "checkpoint", since: { stop: 1 } }, end: T.end.L2 + T.retry },
    { if: { ...ESC, max: { clock: 0 } }, end: T.end.L3 + T.retry },
    { if: { ...ESC, max: { clock: 6 } }, say: T.clock[6] },
    { if: { ...ESC, max: { clock: 3 } }, say: T.clock[3] },
    { if: { ...ESC, max: { clock: 1 } }, say: T.clock[1] },
    // guard checkpoints: first ESCAPE entry into R7, then into R2
    ...["gallery", "foyer"].map(r => ({ if: { ...ESC, in: r }, set: "checkpoint", mark: "stop", move: { nando: r }, say: T.nando.greet })),
    // REVISIT text after the first look at each room
    ...Object.keys(ROOM).map(r => ({ if: { in: r }, set: `been_${r}` }))
  ]
};
