/**
 * CONTACT MODAL (Refactored)
 * Handles the multi-step form by loading individual components and
 * dynamic data from services.json.
 */
document.addEventListener("componentsLoaded", async () => {
  const modal = document.getElementById("nxContactModal");
  if (!modal) return;

  // Global references (some initialized after loading steps)
  let backBtns, nextBtns, submitBtns, closeElems, screens;
  let phonePrefix, phoneNumber, phoneHidden;
  let pills = [];

  const selected = new Set();
  let step = 1;
  let submitting = false;

  // Initialize Modal logic
  async function init() {
    await loadModalSteps();
    await renderServices();

    // Select dynamic elements
    screens = Array.from(modal.querySelectorAll(".nx-screen"));
    backBtns = modal.querySelectorAll("[data-contact-back]");
    nextBtns = modal.querySelectorAll("[data-contact-next]");
    submitBtns = modal.querySelectorAll("[data-contact-submit]");
    closeElems = modal.querySelectorAll("[data-contact-close]");

    phonePrefix = modal.querySelector("#nxPhonePrefix");
    phoneNumber = modal.querySelector("#nxPhoneNumber");
    phoneHidden = modal.querySelector("#nxPhone");

    // Initialize logic
    initNavigation();
    initPills();
    initPrefix();

    // Set initial state
    closeModal();
    setStep(1);
  }

  // Load individual step components
  async function loadModalSteps() {
    const stepWrappers = [
      { id: "nx-step-1-wrapper", url: "components/contact-step-1.html" },
      { id: "nx-step-2-wrapper", url: "components/contact-step-2.html" },
      { id: "nx-step-3-wrapper", url: "components/contact-step-3.html" },
      { id: "nx-step-4-wrapper", url: "components/contact-step-4.html" },
    ];

    const loadStep = async (sw) => {
      const container = document.getElementById(sw.id);
      if (!container) return;
      try {
        const res = await fetch(sw.url);
        if (res.ok) container.innerHTML = await res.text();
      } catch (e) {
        console.error(`Failed to load ${sw.url}`, e);
      }
    };

    await Promise.all(stepWrappers.map(loadStep));
  }

  // Helper to capitalize each word
  function capitalize(str) {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Render pills from categories.json
  async function renderServices() {
    const groupWrapper = document.getElementById("nx-services-groups");
    if (!groupWrapper) return;

    try {
      const res = await fetch("data/categories.json");
      if (!res.ok) throw new Error("Could not load categories data");
      const data = await res.json();

      let html = "";
      data.forEach((item) => {
        const categoryTitle = item.category;
        const services = item.services || [];

        html += `
          <div class="nx-group">
            <div class="nx-groupTitle">${categoryTitle}</div>
            <div class="nx-pillRow">
              ${services
                .map((tag) => {
                  const cleanTag = tag.replace(/[\[\]]/g, "");
                  const capitalizedTag = cleanTag;
                  return `
                    <button type="button" class="nx-pill" data-pill-value="${capitalizedTag}">
                      <span class="nx-pillCheck"></span>
                      <span class="nx-pillText">${capitalizedTag}</span>
                    </button>
                  `;
                })
                .join("")}
            </div>
            <div class="nx-groupLine"></div>
          </div>
        `;
      });
      groupWrapper.innerHTML = html;

      // Re-init pills logic no longer needed here thanks to event delegation
    } catch (e) {
      console.error("Service rendering failed:", e);
    }
  }

  function initNavigation() {
    // Open Btns (global)
    document.querySelectorAll("[data-contact-open]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Close Btns
    closeElems.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });
    });

    // Back
    backBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (step > 1) setStep(step - 1);
      });
    });

    // Next
    nextBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (step === 1) {
          if (validateStep1()) setStep(2);
        } else if (step === 2) {
          if (validateStep2()) setStep(3);
        }
      });
    });

    // Clear field errors on input
    modal.addEventListener("input", (e) => {
      if (e.target.classList.contains("nx-inputLine")) {
        const errorEl = e.target.closest(".nx-field")?.querySelector(".nx-fieldError");
        if (errorEl) errorEl.classList.remove("is-visible");
      }
    });

    // Submit
    submitBtns.forEach((btn) => btn.addEventListener("click", submit));

    // Inspiration (Step 4)
    modal.querySelectorAll("[data-contact-inspiration]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal());
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  function initPills() {
    // Use event delegation on the modal to handle dynamically injected pills
    modal.addEventListener("click", (e) => {
      const pill = e.target.closest(".nx-pill");
      if (!pill) return;

      const val = pill.getAttribute("data-pill-value");
      if (!val) return;

      if (selected.has(val)) {
        selected.delete(val);
        pill.classList.remove("is-selected");
      } else {
        selected.add(val);
        pill.classList.add("is-selected");
      }

      // Clear step 2 error if something is selected
      if (selected.size > 0) {
        const err2 = modal.querySelector("#nxStep2Error");
        if (err2) err2.classList.remove("is-visible");
      }

      console.log("Selected services:", Array.from(selected));
    });
  }

  function initPrefix() {
    if (!phonePrefix) return;
    const prefixItems = [
      { name: "Indonesia", dial: "+62", flag: "🇮🇩" },
      { name: "Czechia", dial: "+420", flag: "🇨🇿" },
      { name: "Slovakia", dial: "+421", flag: "🇸🇰" },
      { name: "Germany", dial: "+49", flag: "🇩🇪" },
      { name: "Austria", dial: "+43", flag: "🇦🇹" },
      { name: "Poland", dial: "+48", flag: "🇵🇱" },
      { name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
      { name: "United States", dial: "+1", flag: "🇺🇸" },
    ];
    phonePrefix.innerHTML = prefixItems.map((i) => `<option value="${i.dial}">${i.flag}</option>`).join("");
    phonePrefix.value = "+62";

    phoneNumber.addEventListener("input", syncPhone);
    phonePrefix.addEventListener("change", syncPhone);
  }

  function syncPhone() {
    if (!phoneHidden || !phoneNumber) return;
    const n = String(phoneNumber.value || "").replace(/\D+/g, "");
    phoneHidden.value = n;
  }

  function setStep(n) {
    step = n;
    screens.forEach((s) => {
      const active = Number(s.dataset.step) === n;
      s.classList.toggle("is-active", active);
    });

    // Update breadcrumbs
    modal.querySelectorAll(".nx-bc").forEach((bc) => bc.classList.remove("active"));
    const currentBc = modal.querySelector(`.bc-${Math.min(step, 3)}`);
    if (currentBc) currentBc.classList.add("active");

    // Global footer visibility
    const bcrumbWrap = modal.querySelector(".nx-breadcrumb");
    const successNote = modal.querySelector("[data-success-note]");
    if (bcrumbWrap) bcrumbWrap.style.display = step === 4 ? "none" : "inline-flex";
    if (successNote) successNote.style.display = step === 4 ? "inline-block" : "none";

    showError("");
    updateModalTheme();
  }

  function openModal() {
    modal.classList.add("is-open");
    document.documentElement.classList.add("nx-modal-lock");
    setStep(1);
    updateModalTheme();
    setTimeout(() => modal.querySelector("#nxFirstName")?.focus(), 50);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.documentElement.classList.remove("nx-modal-lock");
  }

  function showError(msg) {
    const errEl = modal.querySelector("[data-contact-error]");
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.classList.toggle("is-visible", !!msg);
  }

  function showToast(msg) {
    const toast = modal.querySelector("#nxToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3000);
  }

  function setFieldError(fieldId, msg) {
    const field = modal.querySelector(`#${fieldId}`);
    if (!field) return;
    const errorEl = field.closest(".nx-field")?.querySelector(".nx-fieldError");
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.classList.toggle("is-visible", !!msg);
  }

  function validateStep1() {
    syncPhone();
    const first = modal.querySelector("#nxFirstName")?.value?.trim();
    const last = modal.querySelector("#nxLastName")?.value?.trim();
    const email = modal.querySelector("#nxEmail")?.value?.trim();
    const phone = phoneHidden?.value?.trim();

    let isValid = true;

    // Reset all step 1 errors
    modal.querySelectorAll(".nx-screen-1 .nx-fieldError").forEach((el) => el.classList.remove("is-visible"));

    if (!first) {
      setFieldError("nxFirstName", "First name is required.");
      isValid = false;
    }
    if (!last) {
      setFieldError("nxLastName", "Last name is required.");
      isValid = false;
    }
    if (!phone || phone.length < 8) {
      setFieldError("nxPhoneNumber", "Valid phone number is required.");
      isValid = false;
    }

    if (!email) {
      setFieldError("nxEmail", "Email is required.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("nxEmail", "Please enter a valid email address.");
      isValid = false;
    }

    return isValid;
  }

  function validateStep2() {
    if (selected.size < 1) {
      const err2 = modal.querySelector("#nxStep2Error");
      if (err2) {
        err2.textContent = "Please select at least one service.";
        err2.classList.add("is-visible");
      }
      return false;
    }
    return true;
  }

  async function submit() {
    if (submitting) return;
    submitting = true;
    showError("");
    const currentSubmitBtn = modal.querySelector(".nx-screen.is-active .nx-ctaBtnSubmit");
    currentSubmitBtn?.classList.add("is-loading");

    try {
      // Build data for logging/sending
      const dataObj = {
        firstName: modal.querySelector("#nxFirstName")?.value,
        lastName: modal.querySelector("#nxLastName")?.value,
        email: modal.querySelector("#nxEmail")?.value,
        phone: (phonePrefix?.value || "") + (phoneNumber?.value || ""),
        company: modal.querySelector("#nxCompany")?.value,
        message: modal.querySelector("#nxMessage")?.value,
        services: Array.from(selected),
      };

      console.log("Submitting form data:", dataObj);

      const fd = new FormData();
      Object.keys(dataObj).forEach((key) => {
        if (key === "services") fd.append(key, dataObj[key].join(", "));
        else fd.append(key, dataObj[key]);
      });

      // We use contact.php if exists, otherwise simulate
      const res = await fetch("contact.php", { method: "POST", body: fd }).catch(() => ({ ok: true }));

      if (res.ok) {
        console.log("Submit successful");
        setStep(4);
      } else {
        throw new Error("Failed to send message.");
      }
    } catch (e) {
      console.log("Submit error caught:", e);
      showToast(e.message);
    } finally {
      currentSubmitBtn?.classList.remove("is-loading");
      submitting = false;
    }
  }

  // THEME ADAPTIVE HELPERS
  function rgbToArray(rgb) {
    const m = rgb.match(/\d+/g);
    return m ? m.map(Number) : [255, 255, 255];
  }
  function luminance([r, g, b]) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
  function getBgColorAt(x, y) {
    const prev = modal.style.pointerEvents;
    modal.style.pointerEvents = "none";
    const el = document.elementFromPoint(x, y);
    modal.style.pointerEvents = prev;
    if (!el) return "rgb(255,255,255)";
    let curr = el;
    while (curr && curr !== document.documentElement) {
      const bg = getComputedStyle(curr).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      curr = curr.parentElement;
    }
    return "rgb(255,255,255)";
  }
  function updateModalTheme() {
    if (!modal.classList.contains("is-open")) return;
    const rect = modal.getBoundingClientRect();
    const samples = [
      { x: rect.left + rect.width * 0.2, y: rect.top + rect.height * 0.2 },
      { x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 },
      { x: rect.left + rect.width * 0.8, y: rect.top + rect.height * 0.8 },
    ];
    let total = 0;
    samples.forEach((s) => (total += luminance(rgbToArray(getBgColorAt(s.x, s.y)))));
    const avg = total / samples.length;
    modal.classList.toggle("is-dark", avg < 140);
    modal.classList.toggle("is-light", avg >= 140);
  }

  // Start initialization
  init();
});
