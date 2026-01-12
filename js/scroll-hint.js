/**
 * SCROLL HINT
 * Handles the "scroll down" indicator at the bottom right.
 */
document.addEventListener("componentsLoaded", () => {
  const hint = document.getElementById("scrollHint");
  let hintPlayed = false;
  let hintHidden = false;

  if (!hint) return;

  function handleScrollHint() {
    const isTop = window.scrollY < 10;

    if (isTop) {
      if (hintHidden) {
        hint.style.display = "flex";
        hint.classList.remove("ns-scroll--hidden");
        hint.classList.remove("ns-scroll--down");
        hintHidden = false;
        hintPlayed = false;
      }
    } else {
      if (!hintPlayed && !hintHidden) {
        hintPlayed = true;
        hint.classList.add("ns-scroll--down");
        hint.classList.add("ns-scroll--hidden");
        setTimeout(() => {
          hint.style.display = "none";
          hintHidden = true;
        }, 350);
      }
    }
  }

  window.addEventListener("scroll", handleScrollHint);
  handleScrollHint(); // Initial check
});
