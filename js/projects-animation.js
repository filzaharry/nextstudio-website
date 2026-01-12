/**
 * PROJECTS ANIMATION
 * Handles the scroll showcase animation where text fades in/out
 * and project cards move vertically.
 */
document.addEventListener("componentsLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.getElementById("scroll-showcase");
  if (!section) return;

  const pinEl = document.getElementById("srPin");
  const textWrap = document.getElementById("srTextWrap");
  const labelEl = document.getElementById("srLabel");
  const headFirst = document.getElementById("srHeadlineFirst");
  const headRest = document.getElementById("srHeadlineRest");
  const grid = document.getElementById("srGrid");

  if (!pinEl || !textWrap || !labelEl || !headFirst || !headRest || !grid) return;

  const mm = window.matchMedia("(max-width: 900px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function splitToUnits(el, text, mode) {
    const key = "srSplit:" + mode;
    if (el.dataset && el.dataset[key] === "1") return Array.from(el.querySelectorAll(".ch"));

    const t = typeof text === "string" ? text : el.getAttribute("data-text") || el.textContent || "";
    el.textContent = "";

    const frag = document.createDocumentFragment();

    if (mode === "words") {
      const parts = t.trim().split(/\s+/);
      parts.forEach((w, idx) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = idx === parts.length - 1 ? w : w + "\u00A0";
        frag.appendChild(s);
      });
    } else {
      for (let i = 0; i < t.length; i++) {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = t[i] === " " ? "\u00A0" : t[i];
        frag.appendChild(s);
      }
    }

    el.appendChild(frag);
    if (el.dataset) el.dataset[key] = "1";
    return Array.from(el.querySelectorAll(".ch"));
  }

  function buildChars() {
    const mode = mm.matches || reduceMotion ? "words" : "chars";
    const labelChars = splitToUnits(labelEl, labelEl.textContent.trim(), mode);
    const lineFirst = headFirst.querySelector(".sr-line");
    if (!lineFirst) return null;

    const firstChars = splitToUnits(lineFirst, lineFirst.getAttribute("data-text") || "", mode);
    const restLines = Array.from(headRest.querySelectorAll(".sr-line"));
    let restChars = [];
    restLines.forEach((line) => {
      restChars = restChars.concat(splitToUnits(line, line.getAttribute("data-text") || "", mode));
    });

    return { labelChars, headChars: firstChars.concat(restChars) };
  }

  let startY = 0;
  let endY = 0;

  function computePositions() {
    const vh = window.innerHeight;
    const gridH = grid.scrollHeight || grid.offsetHeight || 1;
    startY = vh + 24;
    const bottomAlign = -(gridH - vh) - 24;
    const centered = Math.max((vh - gridH) / 2, 24);
    endY = gridH > vh ? bottomAlign : centered;
  }

  const built = buildChars();
  if (!built) return;

  const { labelChars, headChars } = built;
  computePositions();

  gsap.set(grid, { y: startY, force3D: true });
  gsap.set(labelChars, { opacity: 0, x: -14, y: 10, rotate: -6, force3D: true });
  gsap.set(headChars, { opacity: 0, y: 18, force3D: true });
  gsap.set(textWrap, { opacity: 1 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      pin: pinEl,
      pinSpacing: true,
      scrub: 0.75,
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      end: () => {
        computePositions();
        const travel = Math.abs(startY - endY);
        const base = mm.matches ? 560 : 880;
        const extra = Math.min(420, Math.round(travel * (mm.matches ? 0.22 : 0.28)));
        return "+=" + (base + extra);
      },
      onEnter: () => section.classList.add("sr-is-animating"),
      onEnterBack: () => section.classList.add("sr-is-animating"),
      onLeave: () => section.classList.remove("sr-is-animating"),
      onLeaveBack: () => section.classList.remove("sr-is-animating"),
      onRefresh: () => {
        computePositions();
        gsap.set(grid, { y: startY });
        gsap.set(textWrap, { opacity: 1 });
      },
    },
  });

  tl.to(
    labelChars,
    {
      opacity: 1,
      x: 0,
      y: 0,
      rotate: 0,
      duration: 0.85,
      ease: "power3.out",
      stagger: reduceMotion ? 0 : { each: 0.02, from: "center" },
    },
    0
  );

  tl.to(
    headChars,
    {
      opacity: 1,
      y: 0,
      duration: 1.05,
      ease: "power3.out",
      stagger: reduceMotion ? 0 : 0.01,
    },
    0.08
  );

  tl.to({}, { duration: 0.16 }, 1.1);
  tl.to(grid, { y: endY, duration: 1.35, ease: "none" }, 1.28);
  tl.to(textWrap, { opacity: 0, duration: 0.55, ease: "power1.out" }, 1.55);

  let lastW = window.innerWidth;
  window.addEventListener(
    "resize",
    () => {
      const w = window.innerWidth;
      if (Math.abs(w - lastW) < 2) return;
      lastW = w;
      ScrollTrigger.refresh(true);
    },
    { passive: true }
  );
});
