const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("built-in translations cover controls and preserve names and unmatched sentences", () => {
  const select = { addEventListener() {} };
  const document = { querySelector(selector) { return selector === "#page-language" ? select : {}; } };
  const context = vm.createContext({ document, window: {}, fetch: () => new Promise(() => {}) });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/clubs-data.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/languages.js"), "utf8"), context);
  const translate = (language, text) => context.localTranslate(language, text);
  const mayorPage = fs.readFileSync(path.join(__dirname, "../public/mayor.html"), "utf8");
  const biographyParagraphs = [...mayorPage.matchAll(/<p>([^<]+)<\/p>/g)]
    .map((match) => match[1])
    .filter((text) => /^(Matt Santini began|Santini earned|The City profile says|His published community service)/.test(text));
  assert.equal(biographyParagraphs.length, 4);

  for (const language of ["es", "fr", "de"]) {
    for (const text of ["Translate page", "Accessibility settings", "Larger text", "High contrast", "Underline links", "Reduce motion", "Reset settings", "Selected date", "Bookmark"]) {
      assert.notEqual(translate(language, text), text, `${language}: ${text}`);
    }
    assert.match(translate(language, "Mayor Matt Santini"), /Matt Santini/);
    assert.match(translate(language, "Clubs and teams around Cartersville"), /Cartersville/);
    const hero = "Find a local program, discover what's happening downtown, or get connected to support in Cartersville.";
    const downtown = "Browse the City of Cartersville's current calendar for downtown gatherings and happenings.";
    assert.notEqual(translate(language, hero), hero);
    assert.match(translate(language, hero), /Cartersville/);
    assert.notEqual(translate(language, downtown), downtown);
    assert.match(translate(language, downtown), /City of Cartersville/);
    assert.notEqual(translate(language, "Downtown Community Events"), "Downtown Community Events");
    assert.ok(translate(language, "Published dates ↗").endsWith(" ↗"));
    for (const club of context.window.communityClubs) {
      for (const field of ["description", "status", "sourceLabel"]) {
        assert.notEqual(translate(language, club[field]), club[field], `${language}: ${club.id} ${field}`);
      }
    }
    for (const paragraph of biographyParagraphs) {
      assert.notEqual(translate(language, paragraph), paragraph, `${language}: mayor biography`);
    }
    assert.match(translate(language, biographyParagraphs[0]), /Matt Santini.*Cartersville/);
    const privacy = "Your message is stored on the site server. Only the authenticated coordinator can view and reply to it. Replies appear in your private thread; there are no email alerts.";
    assert.notEqual(translate(language, privacy), privacy);
    for (const text of [
      "Planning Commission Meeting",
      "5:30 PM Eastern · Cartersville, GA 30120; confirm venue on official page. Check the official page for attendance details.",
      "Nothing listed for this day yet.",
      "Rome · current opportunities ↗",
      "Emerson · nearby listings ↗",
      "Search near Emerson",
      "A community guide for Cartersville, Georgia 30120. City event dates are subject to change; confirm details with the event host.",
      "For verified local referrals, contact",
      "Wednesday, November 18, 2026",
      "Wed",
    ]) {
      assert.notEqual(translate(language, text), text, `${language}: ${text}`);
    }
    assert.match(translate(language, "5:30 PM Eastern · Cartersville, GA 30120; confirm venue on official page. Check the official page for attendance details."), /Cartersville, GA 30120/);
    assert.match(translate(language, "Rome · current opportunities ↗"), /Rome.*↗/);
    assert.match(translate(language, "Emerson · nearby listings ↗"), /Emerson.*↗/);
    assert.equal(
      translate(language, "November 2026"),
      new Intl.DateTimeFormat(language, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date("2026-11-01T00:00:00Z")),
    );
    assert.equal(translate(language, "All the details are here."), "All the details are here.");
  }
});

test("saved language translates new club content and switching to English restores it", async () => {
  const saved = new Map([["common-ground-page-language", "es"]]);
  const listeners = {};
  const select = {
    options: [{ value: "en", textContent: "English" }],
    value: "en",
    addEventListener(type, callback) { listeners[type] = callback; },
    append(option) { this.options.push(option); },
  };
  const status = { textContent: "", classList: { add() {}, remove() {}, toggle() {} } };
  const nodes = [];
  const document = {
    body: { querySelectorAll() { return []; } },
    documentElement: { lang: "en" },
    querySelector(selector) { return selector === "#page-language" ? select : status; },
    createElement() { return {}; },
    createTreeWalker() {
      let index = 0;
      return { nextNode() { return nodes[index++] || null; } };
    },
  };
  const context = vm.createContext({
    document,
    window: {},
    NodeFilter: { SHOW_TEXT: 4 },
    localStorage: {
      getItem(key) { return saved.get(key) ?? null; },
      setItem(key, value) { saved.set(key, value); },
    },
    fetch: async () => ({ json: async () => ({ configured: false }) }),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/clubs-data.js"), "utf8"), context);
  const club = context.window.communityClubs[0];
  const addNode = (text) => {
    const node = { nodeValue: text, parentElement: { closest() { return null; } } };
    nodes.push(node);
    return node;
  };
  const description = addNode(club.description);
  const link = { href: "https://www.idealist.org/en/volunteer?location=Rome%2C%20GA%2C%20USA" };
  const linkText = addNode("Rome · current opportunities ↗");
  linkText.parentElement = { closest() { return null; }, href: link.href };
  const date = addNode("Wednesday, November 18, 2026");
  const empty = addNode("Nothing listed for this day yet.");
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/languages.js"), "utf8"), context);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(document.documentElement.lang, "es");
  assert.notEqual(description.nodeValue, club.description);
  assert.equal(linkText.nodeValue, "Rome · oportunidades actuales ↗");
  assert.equal(linkText.parentElement.href, link.href);
  assert.equal(date.nodeValue, new Intl.DateTimeFormat("es", { dateStyle: "full", timeZone: "UTC" }).format(new Date("2026-11-18T00:00:00Z")));
  assert.equal(empty.nodeValue, "Aún no hay eventos para este día.");

  const newClub = context.window.communityClubs[1];
  const newDescription = addNode(newClub.description);
  context.window.applyCommunityLanguage();
  assert.notEqual(newDescription.nodeValue, newClub.description);

  select.value = "en";
  await listeners.change();
  assert.equal(description.nodeValue, club.description);
  assert.equal(newDescription.nodeValue, newClub.description);
  assert.equal(linkText.nodeValue, "Rome · current opportunities ↗");
  assert.equal(linkText.parentElement.href, link.href);
  assert.equal(date.nodeValue, "Wednesday, November 18, 2026");
  assert.equal(saved.get("common-ground-page-language"), "en");
});
