/**
 * Component Loader
 * Fetches HTML fragments and injects them into the DOM
 */

export async function loadComponents() {
  const components = [
    { id: "nx-loader-wrapper", url: "components/loader.html" },
    { id: "nx-header-wrapper", url: "components/header.html" },
    { id: "nx-hero-wrapper", url: "components/hero.html" },
    { id: "nx-bottom-bar-wrapper", url: "components/bottom-bar.html" },
    { id: "nx-projects-wrapper", url: "components/projects.html" },
    { id: "nx-services-wrapper", url: "components/services.html" },
    { id: "nx-footer-wrapper", url: "components/footer.html" },
    { id: "nx-contact-modal-wrapper", url: "components/contact-modal.html" },
  ];

  const loadPromises = components.map(async (comp) => {
    const container = document.getElementById(comp.id);
    if (!container) return;

    try {
      const response = await fetch(comp.url);
      if (!response.ok) throw new Error(`Failed to load ${comp.url}`);
      const html = await response.text();
      container.innerHTML = html;

      // If the component has a specific top-level element we want to "unwrap"
      // we can do that here, but for now we'll just keep the wrapper.
    } catch (err) {
      console.error(err);
    }
  });

  await Promise.all(loadPromises);

  // Initialize specific component logic after loading
  await renderServiceCards();
}

/**
 * Service Cards Renderer
 * Logic adapted from dev-test-filza/js/components/ComponentRenderer.js
 */
async function renderServiceCards() {
  const wrapper = document.querySelector(".cards-container");
  if (!wrapper) return;

  try {
    // Load Data
    const dataRes = await fetch("data/services.json");
    if (!dataRes.ok) throw new Error("Failed to load services data");
    const data = await dataRes.json();

    // Load Template
    const templateRes = await fetch("components/card.html");
    if (!templateRes.ok) throw new Error("Failed to load card template");
    const templateHtml = await templateRes.text();

    const template = document.createElement("template");
    template.innerHTML = templateHtml;

    data.forEach((cardData, index) => {
      // Clone the template's content (document-fragment)
      // Note: The template content might be just the elements.
      const clone = template.content.cloneNode(true);

      // Populate Data
      const titleEl = clone.querySelector(".card-title");
      if (titleEl) titleEl.textContent = cardData.title.text;

      const subtitleEl = clone.querySelector(".card-subtitle");
      if (subtitleEl) subtitleEl.textContent = cardData.content.subtitle;

      const countEl = clone.querySelector(".card-count");
      if (countEl) countEl.textContent = String(index + 1).padStart(2, "0");

      const imageEl = clone.querySelector(".card-image");
      if (imageEl) imageEl.style.backgroundImage = `url(${cardData.image.url})`;

      const tagsContainer = clone.querySelector(".card-tags");
      if (tagsContainer && cardData.content.tags) {
        cardData.content.tags.forEach((tag) => {
          const el = document.createElement("span");
          el.className = "tag";
          el.textContent = tag;
          tagsContainer.appendChild(el);
        });
      }

      // Reorder based on position logic
      // We need to find the specific elements within the clone.
      // Since clone is a DocumentFragment, we can querySelector inside it.
      const article = clone.querySelector(".service-card");
      if (article) {
        const sectionImage = clone.querySelector(".section-image");
        const sectionTitle = clone.querySelector(".section-title");
        const sectionContent = clone.querySelector(".section-content");

        const sections = [
          { el: sectionTitle, pos: cardData.title.position },
          { el: sectionContent, pos: cardData.content.position },
          { el: sectionImage, pos: cardData.image.position },
        ];

        const sortedSections = [];
        sections.forEach((sec) => {
          if (sec.pos === "left") sortedSections[0] = sec.el;
          else if (sec.pos === "center") sortedSections[1] = sec.el;
          else if (sec.pos === "right") sortedSections[2] = sec.el;
        });

        // Append in order (this moves them from their current place in fragment to end of article)
        sortedSections.forEach((el) => {
          if (el) article.appendChild(el);
        });
      }

      wrapper.appendChild(clone);
    });
  } catch (err) {
    console.error("Error rendering service cards:", err);
  }
}
