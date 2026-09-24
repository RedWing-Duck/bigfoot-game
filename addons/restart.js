/* ---- ADD-ON: restart ("restart" starts a new game, even after an ending) ----
   No data. The engine only accepts "menu" once a game is over, so this wraps
   the engine's act() to catch "restart" first.
   ------------------------------------------------------------------------- */
{
  const act0 = act;
  act = w => w[0] === "restart" ? play(true) : act0(w);
  addon({ name: "restart" });
}
