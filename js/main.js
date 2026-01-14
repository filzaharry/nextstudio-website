/**
 * MAIN JS - Core Website Enhancement
 * Handles smooth scrolling, reveal animations, and global configurations
 * Additional animations handled in: scroll-hint.js, topbar-theme.js, bottom-bar.js,
 * hero-animation.js, projects-animation.js, services-animation.js, contact-modal.js, footer-animation.js
 */

document.addEventListener("componentsLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const ScrollToPlugin = window.ScrollToPlugin;

  gsap.registerPlugin(ScrollTrigger);
  if (ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  // Configure GSAP defaults for smoother animations
  gsap.config({
    force3D: true,
  });

  gsap.defaults({
    ease: "power2.out",
    duration: 0.6,
  });

  // Subtle reveal animation for sections
  const revealSections = document.querySelectorAll("#scroll-showcase, .services-section, .nx-footer");

  revealSections.forEach((section) => {
    // Create subtle fade effect on section enter
    gsap.fromTo(
      section,
      {
        opacity: 0.95,
      },
      {
        opacity: 1,
        duration: 0.8,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "top 50%",
          scrub: 0.5,
          once: true,
        },
      }
    );
  });

  // Add smooth anchor scroll behavior for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        gsap.to(window, {
          duration: 1,
          scrollTo: {
            y: target,
            offsetY: 100,
          },
          ease: "power3.inOut",
        });
      }
    });
  });

  // Smooth scroll to top when clicking logo (if applicable)
  const logoBtn = document.querySelector(".ns-icon-btn");
  if (logoBtn) {
    logoBtn.addEventListener("click", () => {
      gsap.to(window, {
        duration: 1.2,
        scrollTo: 0,
        ease: "power3.inOut",
      });
    });
  }
});
