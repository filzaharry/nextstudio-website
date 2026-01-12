/**
 * FOOTER ANIMATION
 * Handles the fade-in effect of the footer when it comes into view.
 */
document.addEventListener("componentsLoaded", () => {
  const footer = document.querySelector(".nx-footer");
  if (!footer) return;

  if (!("IntersectionObserver" in window)) {
    footer.classList.add("is-visible");
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add("is-visible");
          } else {
            footer.classList.remove("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);
  }
});
