/**
 * SERVICES ANIMATION & RENDERER
 * Handles the horizontal typing animation and vertical card scroll
 * in the services section.
 * ALSO handles fetching and rendering the cards from JSON.
 */

// Class to handle rendering (adapted from user request)
class ServiceRenderer {
  static async loadFile(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return await res.text();
  }

  static async loadData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return await res.json();
  }

  static async renderCards() {
    try {
      const parent = document.getElementById("cardsContainer");
      if (!parent) return;

      // Check if already rendered to avoid duplicates if called multiple times
      if (parent.children.length > 0) return;

      const [data, templateText] = await Promise.all([this.loadData("data/services.json"), this.loadFile("components/card.html")]);

      const template = document.createElement("div");
      template.innerHTML = templateText;

      data.forEach((cardData, index) => {
        // Clone the wrapper from the template
        // Note: templateText contains <div class="card-wrapper">...</div>
        // So template.firstElementChild is the wrapper.
        const clone = template.firstElementChild.cloneNode(true);

        // Fill Data
        const titleEl = clone.querySelector(".card-title");
        if (titleEl) titleEl.textContent = cardData.title.text;

        const subtitleEl = clone.querySelector(".card-desc");
        if (subtitleEl) subtitleEl.textContent = cardData.content.subtitle;

        const countEl = clone.querySelector(".card-number");
        if (countEl) countEl.textContent = String(index + 1).padStart(2, "0");

        const imgEl = clone.querySelector(".card-img-el");
        if (imgEl) {
          imgEl.src = cardData.image.url;
          imgEl.alt = cardData.title.text;
        }

        const tagsContainer = clone.querySelector(".card-tags");
        if (tagsContainer && cardData.content.tags) {
          cardData.content.tags.forEach((tag) => {
            const el = document.createElement("span");
            el.className = "tag";
            el.textContent = tag;
            tagsContainer.appendChild(el);
          });
        }

        // Handle Positioning
        // JS Logic matches User Request:
        // We have 3 moveable sections: Title-Part, Content-Part, Image-Part
        // They are currently in 'Source Elements' part of the clone.
        // We need to move them into .card-grid based on position.

        const cardGrid = clone.querySelector(".card-grid");
        const cardEl = clone.querySelector(".card"); // Add class card-left/center/right here?

        // User JSON has position for each part.
        // We map "left" -> index 0, "center" -> index 1, "right" -> index 2.
        // Existing CSS Grid is 3 columns.

        const sectionTitle = clone.querySelector(".section-title");
        const sectionContent = clone.querySelector(".section-content");
        const sectionImage = clone.querySelector(".section-image");

        // Remove them from their temp parent (which is the wrapper itself in my template structure)
        // Wait, in my template, they are siblings of .card.
        // so clone contains them.

        const sections = [
          { el: sectionTitle, pos: cardData.title.position },
          { el: sectionContent, pos: cardData.content.position },
          { el: sectionImage, pos: cardData.image.position },
        ];

        // Create an array representing the 3 grid slots
        const slots = [null, null, null];

        sections.forEach((sec) => {
          if (sec.pos === "left") slots[0] = sec.el;
          else if (sec.pos === "center") slots[1] = sec.el;
          else if (sec.pos === "right") slots[2] = sec.el;
        });

        // Append to grid in order
        slots.forEach((el) => {
          if (el) {
            cardGrid.appendChild(el);
          }
        });

        // Add card class for styling (e.g. card-left) based on Title Position?
        // Existing HTML had card-left, card-center, card-right.
        // It seems to correlate with the title/main focus or just visual rhythm.
        // User JSON has positions for all.
        // Let's infer the class from the Title position, or just rely on Grid.
        // Existing CSS: .card-left .card-left-col { ... }
        // Whatever, the Grid handles layout. The classes card-left/center/right might be unused or just for alternating animations.
        // Let's inspect CSS to see if card-left/center/right is used.
        // Step 4 output shows:
        // .services-section .card-right .card-number { left: auto; right: 24px; text-align: right; }
        // .services-section .card-right .order-title { order: 1; } etc.
        // It seems CSS has some overrides for "card-right".
        // If title is on right, we should probably add "card-right".

        if (cardData.title.position === "right") {
          cardEl.classList.add("card-right");
        } else if (cardData.title.position === "center") {
          cardEl.classList.add("card-center");
        } else {
          cardEl.classList.add("card-left");
        }

        // Remove the source containers if they are left behind?
        // In my template, the source containers are divs inside .card-wrapper.
        // I moved the elements themselves (referneced by variable).
        // Wait, sectionTitle IS the element. Moving it appends it to new parent, removing from old.
        // So the old 'Source Elements' (if any specific wrapper existed) might be empty.
        // In my template:
        // <div class="card-wrapper">
        //   <div class="card">...</div>
        //   <div class="section-title">...</div> <- distinct sibling
        // </div>
        // So after moving sectionTitle into .card .card-grid, the .card-wrapper still strictly contains nothing where sectionTitle was.
        // Actually clone.children will still contain the Empty wrapper? No, sectionTitle IS the wrapper.
        // So I moved the whole sectionTitle div into cardGrid.
        // The clone (card-wrapper) is now clean of those divs.

        parent.appendChild(clone);
      });
    } catch (e) {
      console.error("Error rendering services:", e);
    }
  }
}

document.addEventListener("componentsLoaded", async () => {
  // 1. Render Cards First
  await ServiceRenderer.renderCards();

  // 2. Initialize Animation Logic (Original Code)
  const section = document.querySelector(".services-section");
  if (!section) return;

  const sticky = section.querySelector(".services-sticky");
  const titleWrap = document.getElementById("titleWrap");
  const cardsViewport = document.getElementById("cardsViewport");
  const cardsContainer = document.getElementById("cardsContainer");
  const titleLetters = Array.from(document.querySelectorAll("#servicesTitle .letter"));

  // Re-check elements after rendering
  if (!sticky || !titleWrap || !cardsViewport || !cardsContainer || !titleLetters.length) return;

  // Cache dimensions to avoid layout thrashing in render()
  let vh = window.innerHeight;
  let vw = window.innerWidth;
  let maxScroll = 0;
  let isMobile = vw <= 767;

  function updateDimensions() {
    vh = window.innerHeight;
    vw = window.innerWidth;
    isMobile = vw <= 767;
    // Force read scrollHeight carefully
    maxScroll = Math.max(0, cardsContainer.scrollHeight - vh);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function render(progress) {
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

    // Cards Visibility: Hide cards until title is fully done (scroll > 0.3)
    const cardsOpacity = clamp((scroll - textEnd) / 0.05, 0, 1);
    cardsViewport.style.opacity = String(cardsOpacity);
    cardsViewport.style.visibility = cardsOpacity > 0 ? "visible" : "hidden";

    const entrance = (1 - p) * (isMobile ? 580 : 480);
    cardsContainer.style.transform = `translateY(${entrance - p * maxScroll}px)`;
  }

  // Initial calculation
  updateDimensions();

  if (window.gsap && window.ScrollTrigger) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const getEnd = () => {
      return vw <= 767 ? "+=3500" : "+=4500";
    };

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: getEnd,
      pin: sticky,
      pinSpacing: true,
      scrub: 0.8, // Reduced for tighter control and less lag/stutter
      anticipatePin: 1,
      fastScrollEnd: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => {
        updateDimensions();
        render(self.progress);
      },
    });

    render(0);

    let lastW = window.innerWidth;
    window.addEventListener(
      "resize",
      () => {
        const w = window.innerWidth;
        if (Math.abs(w - lastW) < 2) return;
        lastW = w;
        updateDimensions();
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
