/**
 * CONTACT MODAL
 * Handles the multi-step contact form, including validation,
 * service selection, and submission via fetch.
 */
document.addEventListener("componentsLoaded", () => {
  const modal = document.getElementById("nxContactModal");
  if (!modal) return;

  const openBtns = document.querySelectorAll("[data-contact-open]");
  const closeBtns = modal.querySelectorAll("[data-contact-close]");
  const backBtn = modal.querySelector("[data-contact-back]");
  const nextBtn = modal.querySelector("[data-contact-next]");
  const submitBtn = modal.querySelector("[data-contact-submit]");
  const inspirationBtn = modal.querySelector("[data-contact-inspiration]");
  const exitBtn = modal.querySelector(".nx-exitOnly");
  const errorEl = modal.querySelector("[data-contact-error]");
  const breadcrumbWrap = modal.querySelector(".nx-breadcrumb");
  const successNote = modal.querySelector("[data-success-note]");
  const screens = Array.from(modal.querySelectorAll(".nx-screen"));
  const pills = Array.from(modal.querySelectorAll(".nx-pill"));

  const bc1 = modal.querySelector(".bc-1");
  const bc2 = modal.querySelector(".bc-2");
  const bc3 = modal.querySelector(".bc-3");

  const phonePrefix = modal.querySelector("#nxPhonePrefix");
  const phoneNumber = modal.querySelector("#nxPhoneNumber");
  const phoneHidden = modal.querySelector("#nxPhone");

  const fields = {
    firstName: modal.querySelector("#nxFirstName"),
    lastName: modal.querySelector("#nxLastName"),
    phone: phoneHidden,
    email: modal.querySelector("#nxEmail"),
    company: modal.querySelector("#nxCompany"),
    message: modal.querySelector("#nxMessage"),
  };

  let step = 1;
  let submitting = false;
  const selected = new Set();

  function digitsOnly(v) {
    return String(v || "").replace(/\D+/g, "");
  }

  function showError(msg) {
    if (!errorEl) return;
    const m = String(msg || "").trim();
    errorEl.textContent = m;
    errorEl.classList.toggle("is-visible", !!m);
  }

  function syncPhone() {
    if (!phoneHidden) return;
    const n = String(phoneNumber?.value || "").trim();
    phoneHidden.value = digitsOnly(n);
  }

  phonePrefix?.addEventListener("change", syncPhone);
  phoneNumber?.addEventListener("input", syncPhone);

  function setControls() {
    bc1?.classList.toggle("active", step === 1);
    bc2?.classList.toggle("active", step === 2);
    bc3?.classList.toggle("active", step === 3);

    if (exitBtn) exitBtn.style.display = step === 1 || step === 4 ? "inline-flex" : "none";
    if (backBtn) backBtn.style.display = step === 2 || step === 3 ? "inline-flex" : "none";
    if (nextBtn) nextBtn.style.display = step === 1 || step === 2 ? "inline-flex" : "none";
    if (submitBtn) submitBtn.style.display = step === 3 ? "inline-flex" : "none";
    if (inspirationBtn) inspirationBtn.style.display = step === 4 ? "inline-flex" : "none";

    if (breadcrumbWrap) breadcrumbWrap.style.display = step === 4 ? "none" : "inline-flex";
    if (successNote) successNote.style.display = step === 4 ? "inline-block" : "none";
  }

  function setStep(n) {
    step = n;
    screens.forEach((s) => {
      const isActive = Number(s.dataset.step) === n;
      s.classList.toggle("is-active", isActive);
    });
    showError("");
    setControls();
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("nx-modal-lock");
    setStep(1);
    setTimeout(() => fields.firstName?.focus(), 30);
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("nx-modal-lock");
    showError("");
  }

  function validateStep1() {
    syncPhone();
    const first = String(fields.firstName?.value || "").trim();
    const last = String(fields.lastName?.value || "").trim();
    const email = String(fields.email?.value || "").trim();
    const phoneDigits = String(fields.phone?.value || "").trim();

    if (!first || !last || !email || !phoneDigits) return "Please fill all required fields.";
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!okEmail) return "Please enter a valid email.";
    if (phoneDigits.length !== 9) return "Phone number must have 9 digits.";
    return "";
  }

  function validateStep2() {
    if (selected.size < 1) return "Select at least one service.";
    return "";
  }

  function buildFormData() {
    syncPhone();
    const fd = new FormData();
    fd.append("firstName", String(fields.firstName?.value || "").trim());
    fd.append("lastName", String(fields.lastName?.value || "").trim());
    fd.append("email", String(fields.email?.value || "").trim());
    fd.append("company", String(fields.company?.value || "").trim());
    fd.append("message", String(fields.message?.value || "").trim());
    fd.append("phone", String(fields.phone?.value || "").trim());
    fd.append("phonePrefix", String(phonePrefix?.value || "").trim());
    fd.append("phoneNumberRaw", String(phoneNumber?.value || "").trim());
    Array.from(selected).forEach((v) => fd.append("services[]", v));
    return fd;
  }

  async function submit() {
    if (submitting) return;
    submitting = true;
    showError("");
    submitBtn?.classList.add("is-loading");

    try {
      const res = await fetch("contact.php", {
        method: "POST",
        body: buildFormData(),
      });

      const ct = res.headers.get("content-type") || "";
      let payload = null;

      if (ct.includes("application/json")) {
        payload = await res.json().catch(() => null);
      } else {
        const t = await res.text().catch(() => "");
        payload = t ? { ok: false, message: t } : null;
      }

      if (!res.ok) {
        const msg = payload?.message || payload?.error || "Send failed";
        throw new Error(msg);
      }

      if (payload && payload.ok === false) {
        throw new Error(payload.message || "Send failed");
      }

      setStep(4);
    } catch (e) {
      const msg = String(e?.message || "").trim();
      showError(msg || "Something went wrong. Please try again.");
    } finally {
      submitBtn?.classList.remove("is-loading");
      submitting = false;
    }
  }

  // EVENT LISTENERS
  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  nextBtn?.addEventListener("click", () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) return showError(err);
      return setStep(2);
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) return showError(err);
      return setStep(3);
    }
  });

  backBtn?.addEventListener("click", () => {
    if (step === 2) return setStep(1);
    if (step === 3) return setStep(2);
  });

  submitBtn?.addEventListener("click", submit);
  inspirationBtn?.addEventListener("click", () => closeModal());

  // Prefix population
  if (phonePrefix) {
    const prefixItems = [
      { name: "Czechia", dial: "+420" },
      { name: "Slovakia", dial: "+421" },
      { name: "Germany", dial: "+49" },
      { name: "Austria", dial: "+43" },
      { name: "Poland", dial: "+48" },
      { name: "United Kingdom", dial: "+44" },
      { name: "United States", dial: "+1" },
    ];
    const hasRealOptions = phonePrefix.querySelectorAll("option").length > 1;
    if (!hasRealOptions) {
      phonePrefix.innerHTML = prefixItems.map((i) => `<option value="${i.dial}">${i.dial} ${i.name}</option>`).join("");
    }
    if (!phonePrefix.value) phonePrefix.value = "+420";
  }

  // Pills interaction
  pills.forEach((p) => {
    p.addEventListener("click", () => {
      const val = p.getAttribute("data-pill-value") || p.getAttribute("data-service");
      if (!val) return;
      if (selected.has(val)) {
        selected.delete(val);
        p.classList.remove("is-selected");
      } else {
        selected.add(val);
        p.classList.add("is-selected");
      }
    });
  });

  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const tag = e.target?.tagName.toLowerCase();
    if (tag === "textarea") return;
    if (step === 1 || step === 2) {
      e.preventDefault();
      nextBtn?.click();
    } else if (step === 3) {
      e.preventDefault();
      submitBtn?.click();
    }
  });

  // Init
  closeModal();
  setStep(1);
});
