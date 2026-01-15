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

    // Smoother easing for premium feel
    const followEase = 0.12;
    const targetPos = { x: 0, y: 0 };
    const currentPos = { x: 0, y: 0 };
    let scrollProgress = 0;
    const STOP_FOLLOW_AT = 0.2;
    let isHovering = false;

    function followLoop() {
      // Smoother interpolation
      currentPos.x += (targetPos.x - currentPos.x) * followEase;
      currentPos.y += (targetPos.y - currentPos.y) * followEase;

      // Smoother transition using GSAP
      gsap.set(heroVideo, {
        x: currentPos.x,
        y: currentPos.y,
        force3D: true,
      });
      rafId = requestAnimationFrame(followLoop);
    }
    followLoop();

    onMove = function (e) {
      if (scrollProgress >= STOP_FOLLOW_AT) return;

      const rect = videoZone.getBoundingClientRect();
      const videoW = heroVideo.offsetWidth || SMALL.width;
      const videoH = heroVideo.offsetHeight || SMALL.height;

      // Check if pointer is within the video zone container
      const isInContainer = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

      // Only follow cursor if inside the container
      if (!isInContainer) {
        if (isHovering) {
          isHovering = false;
          // Keep video at the edge it reached, don't fade or reset to center
        }
        return;
      }

      isHovering = true;
      let cx = e.clientX;
      let cy = e.clientY;

      // Add padding to keep video fully inside container
      const padding = 10;
      const minX = rect.left + videoW / 2 + padding;
      const maxX = rect.right - videoW / 2 - padding;
      const minY = rect.top + videoH / 2 + padding;
      const maxY = rect.bottom - videoH / 2 - padding;

      // Clamp cursor position within container bounds
      cx = Math.max(minX, Math.min(maxX, cx));
      cy = Math.max(minY, Math.min(maxY, cy));

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      targetPos.x = cx - centerX;
      targetPos.y = cy - centerY;

      gsap.to(heroVideo, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      // No longer fading out to 0, just mark as not hovering
      isHovering = false;
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
          end: "+=1200",
          scrub: 1.2, // Slightly increased for smoother scrolling
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          onUpdate: (self) => {
            scrollProgress = self.progress;
            if (scrollProgress >= STOP_FOLLOW_AT) {
              targetPos.x = 0;
              targetPos.y = 0;
              if (isHovering) {
                isHovering = false;
                gsap.to(heroVideo, { opacity: 1, duration: 0.3 });
              }
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
      opacity: 0, // Initially hidden
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
      opacity: 0, // Initially hidden
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

      // Dedicated trigger to show video on scroll for mobile
      const mobileVideoTrigger = ScrollTrigger.create({
        trigger: ".hero3d",
        start: "top top-=5", // Show as soon as scroll starts
        onToggle: (self) => {
          gsap.to([videoZone, heroVideo], {
            opacity: self.isActive ? 1 : 0,
            duration: self.isActive ? 0.6 : 0.4,
            ease: "power2.out",
          });
        },
        onRefresh: (self) => {
          // Sync state on refresh (e.g. resize)
          gsap.set([videoZone, heroVideo], {
            opacity: self.isActive ? 1 : 0,
          });
        },
      });

      return () => {
        killOnlyHeroTriggers();
        cancelRafLoop();
        mobileVideoTrigger.kill();
        resetHeroInlineStyles();
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
