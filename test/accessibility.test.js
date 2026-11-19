const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("accessibility controls work alongside the home page status function", () => {
  const keys = ["large-text", "high-contrast", "underline-links", "reduce-motion"];
  const classes = new Set();
  const values = new Map();
  const listeners = new Map();
  const controls = keys.map((key) => ({
    dataset: { accessibility: key },
    checked: false,
    addEventListener(type, callback) { listeners.set(`${key}:${type}`, callback); },
  }));
  const status = { textContent: "" };
  const menu = { open: false, addEventListener() {} };
  const reset = { addEventListener(type, callback) { listeners.set(`reset:${type}`, callback); } };
  const document = {
    documentElement: { classList: { toggle(key, enabled) { enabled ? classes.add(key) : classes.delete(key); } } },
    querySelectorAll() { return controls; },
    querySelector(selector) {
      return {
        "[data-accessibility-status]": status,
        ".accessibility-menu": menu,
        "[data-accessibility-reset]": reset,
      }[selector];
    },
  };
  const localStorage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
  const context = vm.createContext({ document, localStorage });
  vm.runInContext("function status(element, text) { element.textContent = text; }", context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../public/accessibility.js"), "utf8"), context);

  for (const control of controls) {
    control.checked = true;
    listeners.get(`${control.dataset.accessibility}:change`)();
    assert.ok(classes.has(control.dataset.accessibility));
    assert.equal(values.get(`common-ground-accessibility-${control.dataset.accessibility}`), "true");
  }
  listeners.get("reset:click")();
  assert.equal(classes.size, 0);
  assert.ok(controls.every((control) => !control.checked));
  assert.equal(status.textContent, "Accessibility preferences reset.");
});
