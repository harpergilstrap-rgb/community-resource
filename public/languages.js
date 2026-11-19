
function initializeLanguages() {
  providerTranslation = false;

  Object.entries(localLanguages).forEach(([code, name]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    languageSelect.append(option);
  });

  languageSelect.disabled = false;
  languageReady = true;
  languageStatus.textContent = "Some common phrases are translated locally.";
  languageStatus.classList.add("is-visible");
  restoreLanguage();
}
initializeLanguages();
