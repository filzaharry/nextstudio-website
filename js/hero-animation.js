/**
 * HERO ANIMATION
 * Handles GSAP scroll-driven animations for the hero section,
 * including the 3D element movement and video expansion.
 */
document.addEventListener("componentsLoaded", () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const videoZone = document.querySelector(".hero-video-zone");
  const heroVideo = document.querySelector(".hero-video");
  const hero3d = document.querySelector(".hero3d");

  if (!videoZone || !heroVideo || !hero3d) return;

  let heroTl = null;
  let onMove = null;
  let rafId = null;

  function cancelRafLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function setupDesktopHeroAnimation(largeHeight) {
    cancelRafLoop();

    const SMALL = { width: 180, height: 90 };

    gsap.set(heroVideo, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      width: SMALL.width,
      height: SMALL.height,
      borderRadius: 5,
    });

    const followEase = 0.18;
    const targetPos = { x: 0, y: 0 };
    const currentPos = { x: 0, y: 0 };
    let scrollProgress = 0;
    const STOP_FOLLOW_AT = 0.2;

    function followLoop() {
      currentPos.x += (targetPos.x - currentPos.x) * followEase;
      currentPos.y += (targetPos.y - currentPos.y) * followEase;
      gsap.set(heroVideo, { x: currentPos.x, y: currentPos.y });
      rafId = requestAnimationFrame(followLoop);
    }
    followLoop();

    onMove = function (e) {
      if (scrollProgress >= STOP_FOLLOW_AT) return;

      const rect = videoZone.getBoundingClientRect();
      const videoW = heroVideo.offsetWidth || SMALL.width;
      const videoH = heroVideo.offsetHeight || SMALL.height;

      let cx = e.clientX;
      let cy = e.clientY;

      const minX = rect.left + videoW / 2;
      const maxX = rect.right - videoW / 2;
      const minY = rect.top + videoH / 2;
      const maxY = rect.bottom - videoH / 2;

      if (cx < minX) cx = minX;
      if (cx > maxX) cx = maxX;
      if (cy < minY) cy = minY;
      if (cy > maxY) cy = maxY;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      targetPos.x = cx - centerX;
      targetPos.y = cy - centerY;

      heroVideo.style.opacity = "1";
    };

    const onLeave = () => {
      if (scrollProgress < STOP_FOLLOW_AT) {
        heroVideo.style.opacity = "0";
        targetPos.x = 0;
        targetPos.y = 0;
      }
    };

    hero3d.addEventListener("pointermove", onMove);
    hero3d.addEventListener("mousemove", onMove);
    hero3d.addEventListener("pointerleave", onLeave);
    hero3d.addEventListener("mouseleave", onLeave);

    heroTl = gsap
      .timeline({
        scrollTrigger: {
          trigger: ".hero3d",
          start: "top top",
          end: "+=1200", // Increased for a better "pause" phase
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            scrollProgress = self.progress;
            if (scrollProgress >= STOP_FOLLOW_AT) {
              targetPos.x = 0;
              targetPos.y = 0;
            }
          },
        },
      })
      // Step 1: Elements move up and video expands (0 to 0.8 progress)
      .to(".hero-video-zone", { height: largeHeight, ease: "none" }, 0)
      .to(heroVideo, { width: "100%", height: "100%", ease: "none" }, 0)
      .to(".hero-3d", { y: -800, ease: "none" }, 0) // No opacity change
      .to(".hero-content", { y: -800, opacity: 0, ease: "none" }, 0)
      // Step 2: Transition to black for the next sections and a "Jeda" (Pause)
      .to(".services-section", { backgroundColor: "#000", ease: "none" }, 0.8)
      .to({}, { duration: 0.25 });

    return () => {
      hero3d.removeEventListener("pointermove", onMove);
      hero3d.removeEventListener("mousemove", onMove);
      hero3d.removeEventListener("pointerleave", onLeave);
      hero3d.removeEventListener("mouseleave", onLeave);
      onMove = null;

      if (heroTl) {
        heroTl.kill();
        heroTl = null;
      }
      cancelRafLoop();
    };
  }

  function killOnlyHeroTriggers() {
    ScrollTrigger.getAll().forEach((t) => {
      const trig = t.vars && t.vars.trigger;
      if (trig === ".hero3d" || trig === hero3d) {
        t.kill();
      }
    });
  }

  function resetHeroInlineStyles() {
    gsap.killTweensOf(videoZone);
    gsap.killTweensOf(heroVideo);
    gsap.killTweensOf(".hero-3d");

    gsap.set(videoZone, {
      clearProps: "transform,left,top,right,bottom,width,height,x,y,xPercent,yPercent,opacity,display",
    });

    gsap.set(heroVideo, {
      clearProps: "transform,left,top,right,bottom,width,height,x,y,xPercent,yPercent,borderRadius,opacity,display",
    });

    gsap.set(".hero-3d", { clearProps: "transform,opacity" });
  }

  function applyMobileHeroState() {
    resetHeroInlineStyles();

    gsap.set(videoZone, {
      x: 0,
      y: 0,
      opacity: 1,
      display: "block",
    });

    gsap.set(heroVideo, {
      xPercent: 0,
      yPercent: 0,
      x: 0,
      y: 0,
      width: "100%",
      height: "100%",
      borderRadius: 15,
      opacity: 1,
      display: "block",
    });
  }

  ScrollTrigger.matchMedia({
    // DESKTOP > 1400px
    "(min-width: 1401px)": function () {
      return setupDesktopHeroAnimation(737);
    },

    // SMALL DESKTOP / TABLET LANDSCAPE (901px - 1400px)
    "(max-width: 1400px) and (min-width: 901px)": function () {
      return setupDesktopHeroAnimation("70vh");
    },

    // MOBILE + TABLET
    "(max-width: 900px)": function () {
      killOnlyHeroTriggers();
      cancelRafLoop();
      applyMobileHeroState();

      return () => {
        killOnlyHeroTriggers();
        cancelRafLoop();
        applyMobileHeroState();
      };
    },
  });

  // RESIZE
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resetHeroInlineStyles();
      gsap.set(".hero3d img:not(.fx-lines)", { clearProps: "width,height,transform" });
      ScrollTrigger.refresh(true);
      if (window.innerWidth <= 900) {
        applyMobileHeroState();
      }
    }, 140);
  });
});
