// The scoreboard on the home page: data/tables.json, written by the bot once an hour.
(function () {
  const LEVEL_NAMES = ["רמה 1", "רמה 2", "רמה 3", "רמה 4", "רמה 5"];
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let data = null, level = "רמה 3", city = "all";

  function pills(el, items, current, cls, onPick) {
    el.innerHTML = items.map((it) =>
      `<button type="button" class="pill ${cls}" aria-pressed="${it.v === current}" data-v="${esc(it.v)}"` +
      (it.aria ? ` aria-label="${esc(it.aria)}"` : "") + `>${esc(it.label)}</button>`).join("");
    el.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => onPick(b.dataset.v)));
  }

  function soon() {
    const need = data.min || 8, have = data.ranked || 0;
    $("board-sub").textContent = data.players ? `כבר ${data.players} שחקנים רשומים` : "הרישום פתוח";
    $("board").innerHTML =
      `<div class="soon"><div class="big-num">${have}/${need}</div>` +
      `<h3>טבלת הדירוג נפתחת בקרוב</h3>` +
      `<p>הטבלה עולה כשיש ${need} שחקנים עם משחק מאושר. כל משחק שמדווחים לרוני מקרב אותה – ` +
      `אולי המשחק הבא שלך יפתח אותה 🎾</p>` +
      `<div class="meter" aria-hidden="true"><i style="inline-size:${Math.min(100, Math.round(100 * have / need))}%"></i></div>` +
      `<p><a class="btn ball" href="https://t.me/rally_up_bot">להתחיל בטלגרם</a></p></div>`;
  }

  function render() {
    const rows = (data.tables[level] || []).filter((r) => city === "all" || r.city === city);
    const cities = Array.from(new Set(Object.values(data.tables).flat().map((r) => r.city).filter(Boolean)));
    pills($("levels"), LEVEL_NAMES.map((n) => ({ v: n, label: n.split(" ")[1], aria: n })), level, "", (v) => { level = v; render(); });
    pills($("cities"), [{ v: "all", label: "כל הערים" }].concat(cities.map((c) => ({ v: c, label: c }))), city, "city",
      (v) => { city = v; render(); });
    $("board-sub").textContent = `${level} · ${city === "all" ? "כל הערים" : city} · עודכן ${data.updated || ""}`;
    if (!rows.length) {
      $("board").innerHTML = `<div class="board"><div class="empty">עוד אין שחקנים בטבלה הזו – אולי תהיו הראשונים 🎾</div></div>`;
      return;
    }
    const head = `<div class="r head"><div>מקום</div><div>שחקן/ית</div><div>עיר</div><div>מאזן</div><div>רצף ניצחונות</div><div>נקודות</div></div>`;
    const body = rows.map((r, i) => {
      const move = r.move > 0 ? `<span class="up" aria-label="עלה ${r.move}">▲${r.move}</span>` :
        r.move < 0 ? `<span class="down" aria-label="ירד ${-r.move}">▼${-r.move}</span>` : "";
      const av = r.anon ? esc(r.emoji) : esc(r.name.charAt(0));
      return `<div class="r in" style="animation-delay:${(i * 0.04).toFixed(2)}s">` +
        `<div class="rank"><b>${r.rank}</b>${move}</div>` +
        `<div class="who"><span class="av">${av}</span><span>${esc(r.name)}</span>${r.new ? '<span class="tag">חדש/ה</span>' : ""}</div>` +
        `<div class="city-c">${esc(r.city || "")}</div><div>${r.wins}–${r.losses}</div>` +
        `<div class="streak">${r.streak >= 2 ? r.streak + " ברצף" : "–"}</div><div class="pts">${r.points}</div></div>`;
    }).join("");
    $("board").innerHTML = `<div class="board"><div class="grid">${head}${body}</div></div>`;
  }

  function ticker() {
    const items = data.recent || [];
    if (!data.ready || !items.length) return;
    const html = items.concat(items).map((t) => `<span>${esc(t)}</span>`).join("");
    $("ticker-items").innerHTML = html;
    $("ticker").hidden = false;
  }

  fetch("data/tables.json", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) => {
      data = d;
      if (!d.ready) return soon();
      const withRows = LEVEL_NAMES.filter((n) => (d.tables[n] || []).length);
      level = withRows.includes("רמה 3") ? "רמה 3" : (withRows[0] || "רמה 3");
      $("filters").hidden = false;
      $("legend").hidden = false;
      render();
      ticker();
    })
    .catch(() => { $("board-sub").textContent = "הטבלה לא נטענה כרגע – נסו שוב בעוד רגע."; });
})();
