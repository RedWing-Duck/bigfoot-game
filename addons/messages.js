/* ---- ADD-ON: messages (reword the engine's own lines) ----------------------
   Data:  messages: { "engine line": TEXT | { rotate:[TEXT, ...] } }
            Whenever the engine prints that exact line, the game's TEXT is shown instead.
            A key ending in "*" matches every line that starts with the rest, and a "*"
            in the TEXT stands for the original line. An empty TEXT hides the line.
            rotate: the lines are shown in turn, then repeat.
          e.g. "I don't understand that. Type 'help'.": { rotate: ["Huh?", "Say again?"] }
               "Exits: *": [{ if: { flag: "blind" }, text: "" }, "*"]
   ------------------------------------------------------------------------- */
{
  const M = G.messages || {}, keys = Object.keys(M);
  const plain = print;
  print = (t, c) => {
    const k = keys.find(k => k.endsWith("*") ? t.startsWith(k.slice(0, -1)) : t === k);
    if (!k) return plain(t, c);
    const v = M[k], n = v.rotate ? (S.messages[k] || 0) : 0;
    if (v.rotate) S.messages[k] = n + 1;
    const out = txt(v.rotate ? v.rotate[n % v.rotate.length] : v).replace("*", () => t);
    if (out) plain(out, c);
  };
  addon({
    name: "messages",
    state: {},
    validate(need) { for (const k of keys) need(!M[k].rotate || M[k].rotate.length, `messages.${k}`, "rotate needs a list of lines"); }
  });
}
