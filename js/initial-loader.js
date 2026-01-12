/**
 * Initial Loader Logic
 * Handles the [00/100] progress animation
 */

export function initInitialLoader() {
  const loader = document.getElementById("nxLoader");
  const textEl = document.getElementById("nxLoaderText");
  const redLine = document.getElementById("nxLoaderRed");
  const barWrap = document.querySelector(".nx-loader-lines");

  if (!loader || !textEl || !redLine || !barWrap) return;

  requestAnimationFrame(() => {
    const maxWidth = barWrap.offsetWidth;

    let value = 0;
    const STEP_MS = 25;
    const FREEZE_MS = 1200;
    const REMOVE_DELAY = 1500;

    function tick() {
      value++;

      if (value <= 100) {
        const padded = String(value).padStart(2, "0");
        textEl.textContent = `[${padded}/100]`;

        const ratio = value / 100;
        redLine.style.width = maxWidth * ratio + "px";

        setTimeout(tick, STEP_MS);
      } else {
        setTimeout(() => {
          loader.classList.add("nx-loader-hide");
          setTimeout(() => {
            loader.remove();
          }, REMOVE_DELAY);
        }, FREEZE_MS);
      }
    }

    tick();
  });
}
