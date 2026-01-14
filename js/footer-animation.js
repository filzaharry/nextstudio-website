/**
 * FOOTER ANIMATION
 * Handles the fade-in effect of the footer with smooth GSAP animations.
 */
document.addEventListener("componentsLoaded", () => {
  const footer = document.querySelector(".nx-footer");
  if (!footer) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  // Use GSAP if available for smoother animations
  if (gsap && ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Footer bottom content animation
    const footerBottom = footer.querySelector(".nx-footer-bottom");
    const footerLeft = footer.querySelector(".nx-footer-left");
    const footerCenter = footer.querySelector(".nx-footer-center");
    const footerRight = footer.querySelector(".nx-footer-right");

    if (footerBottom) {
      // Set initial state
      gsap.set([footerLeft, footerCenter, footerRight], {
        opacity: 0,
        y: 30,
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: footer,
        start: "top 70%",
        onEnter: () => {
          footer.classList.add("is-visible");

          // Staggered reveal animation
          gsap.to([footerLeft, footerCenter, footerRight], {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.2,
          });
        },
        onLeaveBack: () => {
          footer.classList.remove("is-visible");
          gsap.set([footerLeft, footerCenter, footerRight], {
            opacity: 0,
            y: 30,
          });
        },
      });
    }
  } else {
    // Fallback to intersection observer
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
  }
});
