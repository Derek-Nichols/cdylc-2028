(() => {
  "use strict";
  const form = document.getElementById("contactForm");
  if (!form) return;
  const language = document.getElementById("contactLanguage");
  const success = document.getElementById("contactSuccess");
  const progress = document.getElementById("contactProgress");
  const button = form.querySelector('button[type="submit"]');
  const attemptKey = "cdylc-contact-attempt";
  const contactUrl = new URL("contact.html", window.location.href);
  form.elements.namedItem("_url").value = contactUrl.href;
  contactUrl.search = "?submitted=1";
  form.elements.namedItem("_next").value = contactUrl.href;
  function syncLanguage() {
    language.value = document.body.dataset.lang === "fr" ? "Français" : "English";
  }
  syncLanguage();
  document.addEventListener("site:languagechange", syncLanguage);
  const query = new URLSearchParams(window.location.search);
  if (query.get("submitted") === "1") {
    let recentAttempt = false;
    try {
      const timestamp = Number(sessionStorage.getItem(attemptKey));
      recentAttempt = timestamp > 0 && Date.now() - timestamp < 30 * 60 * 1000;
      sessionStorage.removeItem(attemptKey);
    } catch {}
    if (recentAttempt) {
      success.hidden = false;
      success.focus();
    }
    query.delete("submitted");
    const suffix = query.toString();
    history.replaceState(null, "", window.location.pathname + (suffix ? "?" + suffix : "") + window.location.hash);
  }
  form.addEventListener("submit", event => {
    ["contactName", "contactEmail", "contactSubject", "contactMessage"].forEach(id => {
      const field = document.getElementById(id);
      field.value = field.value.trim();
    });
    if (!form.checkValidity() || document.getElementById("contactWebsite").value) {
      event.preventDefault();
      form.reportValidity();
      return;
    }
    syncLanguage();
    // Only a timestamp is stored to recognize the provider return, never form contents.
    try { sessionStorage.setItem(attemptKey, String(Date.now())); } catch {}
    progress.hidden = false;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    // Normal POST lets the provider validate the submission and perform its spam check.
  });
  window.addEventListener("pageshow", () => {
    button.disabled = false;
    progress.hidden = true;
    form.removeAttribute("aria-busy");
  });
})();
