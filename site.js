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
})();
