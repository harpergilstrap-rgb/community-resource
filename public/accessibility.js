(() => {
  const preferences = {
    "large-text": "common-ground-accessibility-large-text",
    "high-contrast": "common-ground-accessibility-high-contrast",
    "underline-links": "common-ground-accessibility-underline-links",
    "reduce-motion": "common-ground-accessibility-reduce-motion",
  };
  const controls = [...document.querySelectorAll("[data-accessibility]")];
  const status = document.querySelector("[data-accessibility-status]");
  const menu = document.querySelector(".accessibility-menu");

  function isEnabled(key) {
    try {
      return localStorage.getItem(preferences[key]) === "true";
    } catch {
      return false;
    }
  }

  function setPreference(key, enabled, announce = false) {
    document.documentElement.classList.toggle(key, enabled);
    const control = controls.find((item) => item.dataset.accessibility === key);
    if (control) control.checked = enabled;
    try {
      localStorage.setItem(preferences[key], String(enabled));
      if (announce && status) status.textContent = "Accessibility preference updated.";
    } catch {
      if (announce && status) status.textContent = "Preference applied for this visit, but could not be saved.";
    }
  }

  controls.forEach((control) => {
    const key = control.dataset.accessibility;
    setPreference(key, isEnabled(key));
    control.addEventListener("change", () => setPreference(key, control.checked, true));
  });

  document.querySelector("[data-accessibility-reset]")?.addEventListener("click", () => {
    controls.forEach((control) => setPreference(control.dataset.accessibility, false));
    if (status) status.textContent = "Accessibility preferences reset.";
  });

  menu?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
})();
