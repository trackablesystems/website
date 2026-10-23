/* Display and accessibility panel: the same control as the Prolevity-built sites (corner button, dialog,
   saved on this device), with a theme choice added for the portal's dark mode. Settings are attributes on
   <html> that style.css reads: data-theme, data-text, data-contrast, data-font, data-links, data-motion.
   Loaded in <head> so the saved settings apply before the page draws. */
(function () {
  var root = document.documentElement, KEY = "trackable-display", KEYS = ["theme", "text", "contrast", "font", "links", "motion"];
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  var prefs = load();
  function attrs() { KEYS.forEach(function (k) { if (prefs[k]) root.setAttribute("data-" + k, prefs[k]); else root.removeAttribute("data-" + k); }); }
  attrs();

  var ICON_X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var ICON_A = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5"/><path d="M12 10v5"/><path d="M8.5 21l3.5-6 3.5 6"/></svg>';
  function seg(name, legend, opts) {
    return '<fieldset class="a11y-group"><legend>' + legend + '</legend><div class="seg">' + opts.map(function (o) {
      return '<label><input type="radio" name="a11y-' + name + '" value="' + o[0] + '"><span' + (o[2] ? ' class="' + o[2] + '"' : "") + '>' + o[1] + "</span></label>";
    }).join("") + "</div></fieldset>";
  }
  function sw(key, on, label, hint) {
    return '<li><span class="txt" id="a11y-l-' + key + '">' + label + (hint ? "<small>" + hint + "</small>" : "") + '</span><button class="switch" type="button" role="switch" aria-checked="false" aria-labelledby="a11y-l-' + key + '" data-key="' + key + '" data-on="' + on + '"></button></li>';
  }

  function build() {
    var box = document.createElement("div");
    box.className = "a11y";
    box.innerHTML =
      '<div class="a11y-panel" id="a11y-panel" role="dialog" aria-labelledby="a11y-title" hidden>' +
        '<div class="a11y-head"><h2 id="a11y-title">Display and accessibility</h2><button class="a11y-close" type="button" aria-label="Close settings">' + ICON_X + "</button></div>" +
        seg("theme", "Theme", [["", "Device"], ["light", "Light"], ["dark", "Dark"]]) +
        seg("text", "Text size", [["", "Default"], ["lg", "Large", "sz-lg"], ["xl", "Larger", "sz-xl"]]) +
        '<ul class="switches">' +
          sw("contrast", "high", "High contrast", "Stronger text and outlines") +
          sw("font", "readable", "Easier-to-read font", "Atkinson Hyperlegible, made for low vision") +
          sw("links", "underline", "Underline all links") +
          sw("motion", "reduce", "Reduce motion", "No smooth scrolling or animation") +
        "</ul>" +
        '<div class="a11y-foot"><span>Saved on this device</span><button type="button" id="a11y-reset">Reset to defaults</button></div>' +
      "</div>" +
      '<button class="a11y-btn" type="button" aria-expanded="false" aria-controls="a11y-panel" aria-label="Display and accessibility settings">' + ICON_A + "</button>";
    document.body.appendChild(box);
    var panel = box.querySelector(".a11y-panel"), btn = box.querySelector(".a11y-btn");

    function sync() {
      attrs();
      ["theme", "text"].forEach(function (k) {
        box.querySelectorAll('input[name="a11y-' + k + '"]').forEach(function (i) { i.checked = i.value === (prefs[k] || ""); });
      });
      box.querySelectorAll(".switch").forEach(function (b) { b.setAttribute("aria-checked", prefs[b.dataset.key] ? "true" : "false"); });
    }
    function set(k, v) {
      if (v) prefs[k] = v; else delete prefs[k];
      save(prefs); sync();
      if (k === "text" || k === "font") window.dispatchEvent(new Event("resize"));     // charts redraw at the new size
    }
    box.querySelectorAll('.a11y-panel input[type="radio"]').forEach(function (i) {
      i.addEventListener("change", function () { set(i.name.replace("a11y-", ""), i.value); });
    });
    box.querySelectorAll(".switch").forEach(function (b) {
      b.addEventListener("click", function () { set(b.dataset.key, b.getAttribute("aria-checked") === "true" ? "" : b.dataset.on); });
    });
    box.querySelector("#a11y-reset").addEventListener("click", function () { prefs = {}; save(prefs); sync(); window.dispatchEvent(new Event("resize")); });

    function open(o) {
      panel.hidden = !o; btn.setAttribute("aria-expanded", o ? "true" : "false");
      if (o) { var f = panel.querySelector("input:checked") || panel.querySelector("input,button"); if (f) f.focus(); }
    }
    btn.addEventListener("click", function () { open(panel.hidden); });
    panel.querySelector(".a11y-close").addEventListener("click", function () { open(false); btn.focus(); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { open(false); btn.focus(); } });
    document.addEventListener("click", function (e) { if (!panel.hidden && !e.target.closest(".a11y")) open(false); });
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();

/* The current year in each footer's copyright (the HTML says 2026 in case scripts are off). */
document.addEventListener("DOMContentLoaded", function () {
  var y = String(new Date().getFullYear());
  Array.prototype.forEach.call(document.querySelectorAll(".cy"), function (e) { e.textContent = y; });
});
