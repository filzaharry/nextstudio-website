/**
 * BOTTOM BAR
 * Handles interactions for the bottom pill slider, active states,
 * and auto-theme adaptation.
 */
document.addEventListener("componentsLoaded", () => {
  const bar = document.querySelector(".ns-hero-bottom");
  if (!bar) return;

  const pill = bar.querySelector(".ns-bottom-pill");
  const slider = bar.querySelector(".ns-pill-slider");
  const modeBtn = bar.querySelector(".ns-mode-btn");

  if (!pill || !slider) return;

  const targets = Array.from(bar.querySelectorAll("[data-pill-target], [data-pill], [data-pill-btn]"));
  if (targets.length === 0) return;

  // UTIL
  function getTargetName(el) {
    return el.dataset.pillTarget || el.dataset.pill || el.dataset.pillBtn || "";
  }

  function getScale(el) {
    const t = window.getComputedStyle(el).transform;
    if (!t || t === "none") return 1;

    const m = t.match(/matrix\(([^)]+)\)/);
    if (!m) return 1;

    const parts = m[1].split(",").map((v) => parseFloat(v.trim()));
    return Math.max(parts[0] || 1, parts[3] || 1);
  }

  // SLIDER
  function moveSliderTo(el, animate = true) {
    const pillRect = pill.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const scale = getScale(bar);

    const x = (elRect.left - pillRect.left) / scale;
    const w = elRect.width / scale;

    if (!animate) slider.style.transition = "none";

    slider.style.width = `${w}px`;
    slider.style.transform = `translate3d(${x}px, -50%, 0)`;

    if (!animate) {
      slider.offsetHeight; // force reflow
      slider.style.transition = "";
    }
  }

  // STATES
  function setHoverState(name) {
    bar.classList.remove("hover-logo", "hover-contact", "hover-menu");
    if (name) bar.classList.add(`hover-${name}`);
  }

  function clearActive() {
    targets.forEach((t) => {
      if (t.tagName === "BUTTON") t.classList.remove("is-active");
    });
  }

  function setActiveByName(name) {
    clearActive();
    const activeEl = targets.find((t) => getTargetName(t) === name) || targets[0];

    if (activeEl.tagName === "BUTTON") {
      activeEl.classList.add("is-active");
    }

    bar.dataset.activeTarget = getTargetName(activeEl);
    moveSliderTo(activeEl, true);
    setHoverState(null);
  }

  // PREVIEW
  function preview(el) {
    moveSliderTo(el, true);
    setHoverState(getTargetName(el));
    clearActive();
    if (el.tagName === "BUTTON") el.classList.add("is-active");
  }

  const initialEl = bar.querySelector(".ns-bottom-btn--primary") || targets[0];
  setActiveByName(getTargetName(initialEl));

  targets.forEach((el) => {
    el.addEventListener("mouseenter", () => preview(el));
    el.addEventListener("pointerenter", () => preview(el));
    el.addEventListener("touchstart", () => preview(el), { passive: true });

    el.addEventListener("click", () => {
      setActiveByName(getTargetName(el));
    });
  });

  function backToActive(animate = true) {
    const name = bar.dataset.activeTarget || getTargetName(initialEl);
    setActiveByName(name);
    if (!animate) {
      const el = targets.find((t) => getTargetName(t) === name);
      if (el) moveSliderTo(el, false);
    }
  }

  pill.addEventListener("mouseleave", () => backToActive(true));
  pill.addEventListener("pointerleave", () => backToActive(true));

  document.addEventListener(
    "touchstart",
    (e) => {
      if (!pill.contains(e.target) && !modeBtn?.contains(e.target)) {
        backToActive(true);
      }
    },
    { passive: true }
  );

  // RESIZE
  let raf = null;
  function scheduleRecalc() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      backToActive(false);
      raf = null;
    });
  }

  window.addEventListener("resize", scheduleRecalc);
  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleRecalc).observe(pill);
  }

  // BRIGHTNESS / THEME
  if (modeBtn) {
    const on = () => modeBtn.classList.add("is-hover");
    const off = () => modeBtn.classList.remove("is-hover");
    modeBtn.addEventListener("mouseenter", on);
    modeBtn.addEventListener("mouseleave", off);
    modeBtn.addEventListener("pointerenter", on);
    modeBtn.addEventListener("pointerleave", off);
    modeBtn.addEventListener("touchstart", on, { passive: true });
    modeBtn.addEventListener("touchend", off, { passive: true });
  }

  function rgbToArray(rgb) {
    const m = rgb.match(/\d+/g);
    return m ? m.map(Number) : [255, 255, 255];
  }

  function luminance([r, g, b]) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  function getBgColorAt(x, y) {
    const prev = bar.style.pointerEvents;
    bar.style.pointerEvents = "none";
    const el = document.elementFromPoint(x, y);
    bar.style.pointerEvents = prev;

    if (!el) return "rgb(255,255,255)";
    let current = el;
    while (current && current !== document.documentElement) {
      const bg = getComputedStyle(current).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      current = current.parentElement;
    }
    return "rgb(255,255,255)";
  }

  function updateTheme() {
    const rect = bar.getBoundingClientRect();
    if (window.innerWidth <= 900) {
      const y = rect.top - 6;
      const x = rect.left + rect.width / 2;
      const bg = getBgColorAt(x, y);
      const lum = luminance(rgbToArray(bg));
      bar.classList.toggle("is-dark", lum < 130);
      return;
    }

    const y = rect.top + rect.height / 2;
    const samples = [rect.left + rect.width * 0.25, rect.left + rect.width * 0.5, rect.left + rect.width * 0.75];
    let total = 0;
    samples.forEach((x) => {
      total += luminance(rgbToArray(getBgColorAt(x, y)));
    });
    const avg = total / samples.length;
    bar.classList.toggle("is-dark", avg < 130);
  }

  function loop() {
    updateTheme();
    requestAnimationFrame(loop);
  }

  loop();
});
