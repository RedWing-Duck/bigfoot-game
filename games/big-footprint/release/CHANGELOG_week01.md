# Changelog — Week 01: THIS PLACE HAS A BIG FOOTPRINT
Build: `dist/big-footprint.html` (single file, runs offline). Branch `claude/penthouse-heist-game-o7k6w5`.

## Release candidate (post-QA)
- **Fix QA-01 (P1):** `say peacock` works at a checkpoint.
- **Fix P3s:** ED-09 to ED-19, BR-03 to BR-11, CP-01 to CP-03. Editor text used as written. The parser now understands `look <thing>`, stair words and `give`, and the echo stays literal. Scenery named in room text can be examined. The nudges for run, gate and the solved piano cost nothing. There's no confused line before CAUGHT.
- **Fix P2s:** BR-02, ED-01 to ED-08. Room, gate and examine text follow the game state (animals out, puzzles solved). The secret count is correct in any order. Landmark exits read right both ways. `run` is signposted.
- **Fix P1s:** BR-01. Punctuation is ignored in typed input. Adds the verified walkthrough as an automated regression test.

## Milestones
- **C: Script drop-in.** All Script text, the rotating unknown-command lines, help, the game-over prompt, and no compass exits in ESCAPE.
- **B: Items, puzzles, NPCs, win/lose.** Tour with strikes and questions, the escape clock, alibis, checkpoints, 3 puzzles and 5 endings.
- **A: Skeleton.** 12 rooms and exits; movement, look, help, quit.

## Known issues
- **P1/P2:** none.
- **P3:** none open. All 23 QA P3s are fixed.
- **Release checklist:** credits from the chat bot are **not added yet** (GDD section 11). Uploading to the community database is outside this repo.

## Tech
- Engine unchanged. New add-ons, all reusable:
  - `verbs`: room and global replies for any verb, the `said` condition, input cleanup, `look <thing>`, stair "ways";
  - `restart`: RESTART works after an ending;
  - `messages`: rewords the engine's own lines.
- Tests: `node tests/run.js` runs 24 tests, including the walkthrough regression, one test per ending, and one for each fix batch.
