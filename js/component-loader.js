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
}
