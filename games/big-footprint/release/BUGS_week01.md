# Bug list — Week 01: THIS PLACE HAS A BIG FOOTPRINT
Merged from the three QA passes (originals in `qa/`), plus one bug found during the P3 regression pass.
**Status: 34 of 34 fixed. Nothing open.** No duplicates were merged: the QA passes had already de-duplicated against each other.

| Bug ID | Sev | Summary | Status | Fix (one line) | Commit |
|---|---|---|---|---|---|
| BR-01 | P1 | Punctuation broke every match (`say giraffe!` = CAUGHT) | Fixed | Punctuation is dropped from typed words before any command runs | Fix P1s |
| QA-01 | P1 | `say peacock` (singular) at a checkpoint = CAUGHT | Fixed | The PEACOCKS alibi also accepts "peacock" | Fix QA-01 |
| BR-02 | P2 | `take` on a carried coin or secret reads like a new pickup and costs a turn | Fixed | "You already have that.", free | Fix P2s |
| ED-01 | P2 | Wrong quiz answers never warn about strikes | Fixed | Escalating lines by strike count (editor text) | Fix P2s |
| ED-02 | P2 | Gate, terrace and aviary text ignore released animals | Fixed | Text follows animal state; the terrace is built from parts | Fix P2s |
| ED-03 | P2 | Room text ignores solved puzzles | Fixed | Solved variants for R2, R4, R8 and the hippo examine | Fix P2s |
| ED-04 | P2 | R11 first visit didn't name the GIRAFFE GATE | Fixed | Editor's first sentence | Fix P2s |
| ED-05 | P2 | "Secret two" on the first secret found | Fixed | "Secrets: {secrets} of 3." | Fix P2s |
| ED-06 | P2 | "behind you / ahead" wrong when walking inward | Fixed | Direction-neutral landmark text for R7, R8, R10 | Fix P2s |
| ED-07 | P2 | Nothing tells the player `run` exists | Fixed | Line added to Nando's greeting and to help | Fix P2s |
| ED-08 | P2 | Nothing hints the step can be pressed | Fixed | "sits a hair higher than the rest" | Fix P2s |
| ED-09 | P3 | Help implies free actions are tour-only | Fixed | "Free anytime: …" | Fix P3s |
| ED-10 | P3 | Generic, inconsistent engine lines | Fixed | 8 lines reworded via the messages add-on | Fix P3s |
| ED-11 | P3 | "(Received/Lost: …)" spoils each reveal | Fixed | Hidden; the narration names every handoff | Fix P3s |
| ED-12 | P3 | Q1 reply: two quotes in a row | Fixed | One merged quote | Fix P3s |
| ED-13 | P3 | Two guards pass in R7 | Fixed | Room-text guard removed | Fix P3s |
| ED-14 | P3 | Examining the Don repeats the handshake | Fixed | New examine line | Fix P3s |
| ED-15 | P3 | Q2 prompt "again" | Fixed | Dropped | Fix P3s |
| ED-16 | P3 | W1 "honking" | Fixed | "chattering" | Fix P3s |
| ED-17 | P3 | W2 giraffe may still be penned | Fixed | Plaque line | Fix P3s |
| ED-18 | P3 | L3 reuses "vending machine" | Fixed | "delivery truck … doorway" | Fix P3s |
| ED-19 | P3 | Staircase examine (tour) is generic | Fixed | Twelve/thirteen steps line | Fix P3s |
| BR-03 | P3 | Empty `say` costs a strike | Fixed | Repeats the question, no strike | Fix P3s |
| BR-04 | P3 | "say definitely not both" passes | Fixed | Negations make it a wrong answer | Fix P3s |
| BR-05 | P3 | `look <thing>` shows the room | Fixed | Examines the thing | Fix P3s |
| BR-06 | P3 | `climb stairs` / `upstairs` not understood | Fixed | Stair words and per-room "ways" | Fix P3s |
| BR-07 | P3 | Scenery in room text can't be examined | Fixed | 17 examine lines reused from room text | Fix P3s |
| BR-08 | P3 | `run` with no guard: confused line, costs a turn | Fixed | "Nothing to run from yet.", free | Fix P3s |
| BR-09 | P3 | Talking to the Don mid-question contradicts him | Fixed | He repeats the question | Fix P3s |
| BR-10 | P3 | `give` not understood | Fixed | Alias of `use` | Fix P3s |
| BR-11 | P3 | Echo renders `[don]` as a name | Fixed | Echo stays literal | Fix P3s |
| CP-01 | P3 | Confused line printed before CAUGHT | Fixed | No line; straight to the ending | Fix P3s |
| CP-02 | P3 | `open gate` gives a confused line and costs a turn | Fixed | "Which gate: …", free | Fix P3s |
| CP-03 | P3 | Replaying the solved piano gives a confused line | Fixed | "You already found what she was hiding.", free | Fix P3s |

**Not a bug (GDD note from Critical Path QA):** entering R11 costs no turn, so the critical path ends with 7 turns to spare, not 6. GDD section 9 is corrected in revision 2.

**Editor note:** the ledger, manifest and photos take lines no longer show in play. BR-02 answers "You already have that.", and secrets can't be dropped. The lines are kept in the Script and build, as written.
