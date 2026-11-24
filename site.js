(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const toggle = document.getElementById("langToggle");
  const menuToggle = document.getElementById("menuToggle");
  const links = document.getElementById("siteLinks");
  function setMenu(open) {
    if (!menuToggle || !links) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
  }
  function setLanguage(language) {
    const lang = language === "fr" ? "fr" : "en";
    document.documentElement.lang = lang;
    document.body.dataset.lang = lang;
    if (toggle) {
      toggle.textContent = lang === "en" ? "FR" : "EN";
      toggle.setAttribute("aria-label", lang === "en" ? "Passer au français" : "Switch to English");
    }
    document.querySelectorAll("[data-label-en]").forEach(el => {
      el.setAttribute("aria-label", el.getAttribute("data-label-" + lang));
    });
    const title = document.body.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    document.dispatchEvent(new CustomEvent("site:languagechange", { detail: { language: lang } }));
    try { localStorage.setItem("cdylc-language", lang); } catch {}
  }
  let savedLanguage = "en";
  try { savedLanguage = localStorage.getItem("cdylc-language") || "en"; } catch {}
  setLanguage(savedLanguage);
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener("click", () => setLanguage(document.body.dataset.lang === "en" ? "fr" : "en"));
  }
  if (menuToggle && links) {
    menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
    links.addEventListener("click", event => { if (event.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
    });
    const wide = window.matchMedia("(min-width:1121px)");
    if (wide.addEventListener) wide.addEventListener("change", () => setMenu(false));
  }
  // Camp animations: reveal on scroll, settle after entrance, count-up
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(".reveal, .badge, .notes, .trail-map, .legacy");
  const entrance = ["riseIn", "stamp", "pinDrop", "popIn", "swingIn"];
  document.addEventListener("animationend", event => {
    if (entrance.includes(event.animationName)) event.target.classList.add("settled");
  });
  function countUp(el) {
    const end = parseInt(el.dataset.count, 10);
    if (!end || reduce) return;
    const start = performance.now(), dur = 1400;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  function show(el) {
    el.classList.add("in");
    el.querySelectorAll("[data-count]").forEach(countUp);
  }
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(el => io.observe(el));
  }

  // Day / night sky switch (homepage)
  const sky = document.getElementById("skyToggle");
  if (sky) {
    const root = document.documentElement;
    const sync = () => sky.setAttribute("aria-pressed", String(root.classList.contains("day")));
    sync();
    sky.addEventListener("click", () => {
      root.classList.toggle("day");
      try { localStorage.setItem("cdylc-sky", root.classList.contains("day") ? "day" : "night"); } catch {}
      sync();
    });
  }

  // Camp status sign + countdown (homepage), driven by camp-config.js
  const plank = document.getElementById("countdown");
  if (plank) {
    const cfg = Object.assign({}, window.CDYLC_CONFIG || {});
    const preview = new URLSearchParams(location.search).get("preview");
    const parse = v => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ""); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; };
    const now0 = new Date();
    if (preview === "countdown") { cfg.applicationsOpen = false; if (!parse(cfg.campStart)) { cfg.campStart = "2028-07-16"; cfg.campEnd = "2028-07-22"; } }
    if (preview === "open") { cfg.applicationsOpen = true; if (!cfg.applicationsClose) cfg.applicationsClose = "2028-03-31"; }
    if (preview === "live") { const a = new Date(now0); a.setDate(a.getDate() - 1); const b = new Date(now0); b.setDate(b.getDate() + 3); cfg.campStart = a.toISOString().slice(0, 10); cfg.campEnd = b.toISOString().slice(0, 10); }
    const start = parse(cfg.campStart), end = parse(cfg.campEnd) || start, close = parse(cfg.applicationsClose);
    const fmt = (lang, a, b) => {
      const f = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", { month: "long", day: "numeric", year: "numeric" });
      return b && b - a && f.formatRange ? f.formatRange(a, b) : f.format(a);
    };
    const setBilingual = (el, en, fr) => {
      if (!el) return;
      const e = document.createElement("span"); e.className = "en"; e.textContent = en;
      const f = document.createElement("span"); f.className = "fr"; f.textContent = fr;
      el.replaceChildren(e, f);
    };
    if (start) setBilingual(document.querySelector('[data-status="dates"]'), fmt("en", start, end), fmt("fr", start, end));
    if (cfg.locationEn) setBilingual(document.querySelector('[data-status="location"]'), cfg.locationEn, cfg.locationFr || cfg.locationEn);
    const closed = close && now0 > new Date(close.getTime() + 864e5);
    if (cfg.applicationsOpen && !closed) setBilingual(document.querySelector('[data-status="apps"]'), "Open now", "Ouvertes");
    else if (cfg.applicationsOpen && closed) setBilingual(document.querySelector('[data-status="apps"]'), "Closed", "Fermées");
    const show = name => plank.querySelectorAll(".plank-state").forEach(el => { el.hidden = el.dataset.state !== name; });
    const endPlus = end ? new Date(end.getTime() + 864e5) : null;
    let state = "waiting";
    if (start && now0 >= start && now0 < endPlus) state = "live";
    else if (start && now0 >= endPlus) state = "done";
    else if (cfg.applicationsOpen && !closed) state = "open";
    else if (start) state = "countdown";
    show(state);
    if (state === "open") {
      const apply = plank.querySelector("[data-apply]");
      if (cfg.applicationUrl) { apply.href = cfg.applicationUrl; apply.target = "_blank"; apply.rel = "noopener"; }
      if (close) {
        plank.querySelector("[data-close]").hidden = false;
        const ds = plank.querySelectorAll("[data-close-date]");
        ds[0].textContent = fmt("en", close); ds[1].textContent = fmt("fr", close);
      }
    }
    if (state === "countdown") {
      const units = { d: 864e5, h: 36e5, m: 6e4, s: 1e3 };
      const cells = {}; plank.querySelectorAll("[data-unit]").forEach(b => { cells[b.dataset.unit] = b; });
      const tick = () => {
        let left = Math.max(0, start - new Date());
        for (const u of ["d", "h", "m", "s"]) {
          const v = Math.floor(left / units[u]); left -= v * units[u];
          const txt = String(v).padStart(2, "0");
          if (cells[u].textContent !== txt) {
            cells[u].textContent = txt;
            if (!reduce) { cells[u].classList.remove("tick"); void cells[u].offsetWidth; cells[u].classList.add("tick"); }
          }
        }
      };
      tick(); setInterval(tick, 1000);
    }
  }

  // Packing checklist
  const packList = document.querySelector(".pack-list");
  if (packList) {
    const KEY = "cdylc-packing";
    const boxes = [...packList.querySelectorAll('input[type="checkbox"][data-item]')];
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    boxes.forEach(b => { b.checked = saved.includes(b.dataset.item); });
    const count = document.getElementById("packCount"), total = document.getElementById("packTotal");
    const bar = document.getElementById("packBar"), ready = document.getElementById("packReady");
    const update = () => {
      const done = boxes.filter(b => b.checked);
      if (count) count.textContent = done.length;
      if (total) total.textContent = boxes.length;
      if (bar) bar.style.width = (boxes.length ? done.length / boxes.length * 100 : 0) + "%";
      if (ready) ready.hidden = done.length !== boxes.length;
      packList.querySelectorAll(".pack-group").forEach(g => {
        const gb = [...g.querySelectorAll("input[data-item]")];
        g.classList.toggle("is-done", gb.length > 0 && gb.every(b => b.checked));
        const c = g.querySelector("[data-group-count]");
        if (c) c.textContent = gb.filter(b => b.checked).length + "/" + gb.length;
      });
      try { localStorage.setItem(KEY, JSON.stringify(done.map(b => b.dataset.item))); } catch {}
    };
    packList.addEventListener("change", update);
    const reset = document.getElementById("packReset");
    if (reset) reset.addEventListener("click", () => { boxes.forEach(b => { b.checked = false; }); update(); });
    const print = document.getElementById("packPrint");
    if (print) print.addEventListener("click", () => window.print());
    update();
  }
})();
