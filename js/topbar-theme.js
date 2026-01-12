/**
 * TOPBAR THEME
 * Automatically toggles between light and dark themes for the top bar
 * based on the background color behind it.
 */
document.addEventListener("componentsLoaded", () => {
  const topbar = document.querySelector(".nx-topbar");
  if (!topbar) return;

  function rgbToArray(rgb) {
    const m = rgb.match(/\d+/g);
    return m ? m.map(Number) : [255, 255, 255];
  }

  function luminance([r, g, b]) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  function getBgColorAt(x, y) {
    // Temporarily disable pointer events to sample colors below the bar
    const prev = topbar.style.pointerEvents;
    topbar.style.pointerEvents = "none";

    const el = document.elementFromPoint(x, y);

    topbar.style.pointerEvents = prev;
    if (!el) return "rgb(255,255,255)";

    let current = el;
    while (current && current !== document.documentElement) {
      const bg = getComputedStyle(current).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      current = current.parentElement;
    }

    return "rgb(255,255,255)";
  }

  function updateTopbarTheme() {
    const rect = topbar.getBoundingClientRect();
    const y = rect.bottom + 4; // Sample just below the topbar
    const samples = [rect.left + rect.width * 0.2, rect.left + rect.width * 0.5, rect.left + rect.width * 0.8];

    let total = 0;
    samples.forEach((x) => {
      total += luminance(rgbToArray(getBgColorAt(x, y)));
    });

    const avg = total / samples.length;

    // Toggle classes based on average brightness
    topbar.classList.toggle("is-dark", avg < 130);
    topbar.classList.toggle("is-light", avg >= 130);
  }

  function loop() {
    updateTopbarTheme();
    requestAnimationFrame(loop);
  }

  // Initial call and also on scroll for responsiveness
  window.addEventListener("scroll", updateTopbarTheme, { passive: true });
  updateTopbarTheme();
  loop();
});
