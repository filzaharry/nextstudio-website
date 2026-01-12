/**
 * SERVICES ANIMATION
 * Handles the horizontal typing animation and vertical card scroll
 * in the services section.
 */
document.addEventListener("componentsLoaded", () => {
  const section = document.querySelector(".services-section");
  if (!section) return;

  const sticky = section.querySelector(".services-sticky");
  const titleWrap = document.getElementById("titleWrap");
  const titleLetters = Array.from(document.querySelectorAll("#servicesTitle .letter"));
  const cardsContainer = document.getElementById("cardsContainer");

  if (!sticky || !titleWrap || !cardsContainer || !titleLetters.length) return;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function render(progress) {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobile = vw <= 767;
    const scroll = clamp(progress, 0, 1);

    // TITLE TYPING 0.05..0.3
    const textStart = 0.05;
    const textEnd = 0.3;
    const textProgress = clamp((scroll - textStart) / (textEnd - textStart), 0, 1);
    const visible = Math.floor(textProgress * titleLetters.length);

    titleLetters.forEach((l, i) => {
      const on = i < visible;
      l.style.opacity = on ? "1" : "0";
      l.style.transform = on ? "translateY(0)" : "translateY(40px)";
      l.style.width = on ? "auto" : "0";
    });

    // CARDS PHASE
    const start = isMobile ? 0.4 : 0.38;
    const p = clamp((scroll - start) / (1 - start), 0, 1);

    // INGRESS & EGRESS FADE
    // Ingress: 0 -> 0.1
    const ingress = clamp(scroll / 0.1, 0, 1);
    // Egress: starting from cards phase
    const egress = 1 - clamp((p - (isMobile ? 0.02 : 0.05)) / (isMobile ? 0.14 : 0.25), 0, 1);

    titleWrap.style.opacity = String(ingress * egress);
    titleWrap.style.transform = `translateY(${p * (isMobile ? -580 : -520)}px)`;

    const maxScroll = Math.max(0, cardsContainer.scrollHeight - vh);
    const entrance = (1 - p) * (isMobile ? 580 : 480);
    cardsContainer.style.transform = `translateY(${entrance - p * maxScroll}px)`;
  }

  if (window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const getEnd = () => {
      const vw = window.innerWidth;
      return vw <= 767 ? "+=2200" : "+=2800";
    };

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: getEnd,
      pin: sticky,
      pinSpacing: true,
      scrub: 1.4,
      anticipatePin: 1,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });

    render(0);

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
  } else {
    // Fallback without GSAP
    let ticking = false;
    function computeFallback() {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, section.offsetHeight - vh);
      const scroll = clamp(-rect.top / total, 0, 1);
      render(scroll);
    }
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          computeFallback();
          ticking = false;
        });
      },
      { passive: true }
    );
    computeFallback();
  }
});
