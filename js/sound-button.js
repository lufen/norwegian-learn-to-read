/**
 * SoundButton — the one "play this sound" control used everywhere in the app.
 *
 * Every module used to hand-roll its own 🔊 button plus a click listener that
 * called NorwegianAudio directly. That meant the same control could look,
 * label and behave slightly differently per page (different icons, different
 * aria-labels, some playing a letter *name* instead of its sound).
 *
 * Now a module just asks for markup:
 *
 *   SoundButton.html({ kind: "letter", value: "M" })
 *   SoundButton.html({ kind: "word", value: "sol", label: "Play word" })
 *   SoundButton.html({ kind: "sound-out", value: "sol", variant: "secondary" })
 *
 * ...or an element via SoundButton.create(same options). Clicks are handled by
 * a single delegated listener on the document, so markup rendered at any time
 * (innerHTML, re-render, overlay) works with no per-module wiring, and no
 * listener can be attached twice and play a sound twice.
 *
 * `kind` decides how the value is spoken:
 *   letter     — reviewed recording or approximate device letter cue
 *   sound-unit — contextual word/index token from NorwegianAudio.soundUnits()
 *   word       — the text as a whole word/sentence
 *   sound-out  — reviewed units then word; otherwise the whole word slowly
 */

const SoundButton = (() => {
  const DEFAULT_ICONS = {
    letter: "🔊",
    "sound-unit": "🔊",
    word: "🔊",
    "sound-out": "🧩"
  };

  const VARIANT_CLASSES = {
    primary: "btn",
    secondary: "btn btn-secondary",
    outline: "btn btn-outline",
    icon: "btn btn-icon",
    bare: ""
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(options = {}) {
    const kind = Object.prototype.hasOwnProperty.call(DEFAULT_ICONS, options.kind) ? options.kind : "word";
    const value = String(options.value == null ? "" : options.value);
    // "bare" maps to an empty class string, so test for the key, not the value.
    const variant = Object.prototype.hasOwnProperty.call(VARIANT_CLASSES, options.variant)
      ? options.variant
      : "primary";
    const icon = options.icon === null ? "" : options.icon || DEFAULT_ICONS[kind];
    const label = options.label == null ? "" : String(options.label);
    const text = [icon, label].filter(Boolean).join(" ");
    const className = [VARIANT_CLASSES[variant], options.className].filter(Boolean).join(" ");
    return { kind, value, icon, label, text, className, options };
  }

  /** Spoken description of the control, so a non-reader's grown-up/screen reader gets the same wording everywhere. */
  function ariaLabelFor(config) {
    if (config.options.ariaLabel) return config.options.ariaLabel;
    if (config.kind === "letter") return `Play the sound of ${config.value}`;
    if (config.kind === "sound-unit") {
      const separator = config.value.lastIndexOf(":");
      const word = config.value.slice(0, separator);
      const index = Number(config.value.slice(separator + 1));
      const unit = window.NorwegianAudio && window.NorwegianAudio.soundUnits(word)[index];
      return unit ? `Hear ${unit.text} in ${unit.word}` : "Hear word sound";
    }
    if (config.kind === "sound-out") {
      return window.NorwegianAudio && window.NorwegianAudio.canSoundOut(config.value)
        ? `Hør lydene og så hele ordet: ${config.value}`
        : `Hør hele ordet sakte: ${config.value}`;
    }
    return config.label ? `${config.label}: ${config.value}` : `Play ${config.value}`;
  }

  /** HTML for a sound button. Insert anywhere; no wiring needed. */
  function html(options = {}) {
    const config = normalize(options);
    const attributes = [
      'type="button"',
      config.className ? `class="${escapeHtml(config.className)}"` : "",
      config.options.id ? `id="${escapeHtml(config.options.id)}"` : "",
      `data-sound-kind="${escapeHtml(config.kind)}"`,
      `data-sound-value="${escapeHtml(config.value)}"`,
      config.options.rate ? `data-sound-rate="${escapeHtml(config.options.rate)}"` : "",
      `aria-label="${escapeHtml(ariaLabelFor(config))}"`,
      config.options.title ? `title="${escapeHtml(config.options.title)}"` : ""
    ].filter(Boolean);
    return `<button ${attributes.join(" ")}>${escapeHtml(config.text)}</button>`;
  }

  /** Same as html(), as a DOM element, for modules that build nodes directly. */
  function create(options = {}) {
    const config = normalize(options);
    const button = document.createElement("button");
    button.type = "button";
    if (config.className) button.className = config.className;
    if (config.options.id) button.id = config.options.id;
    button.dataset.soundKind = config.kind;
    button.dataset.soundValue = config.value;
    if (config.options.rate) button.dataset.soundRate = String(config.options.rate);
    if (config.options.title) button.title = config.options.title;
    button.setAttribute("aria-label", ariaLabelFor(config));
    button.textContent = config.text;
    return button;
  }

  /** Play what a given kind/value means. Exposed so non-button triggers (tiles) stay consistent too. */
  function play(kind, value, options = {}) {
    if (!window.NorwegianAudio) return false;
    if (kind === "letter") return window.NorwegianAudio.speakLetter(value, options);
    if (kind === "sound-unit") return window.NorwegianAudio.speakSoundUnit(value, options);
    if (kind === "sound-out") return window.NorwegianAudio.soundOutWord(value, options);
    return window.NorwegianAudio.speak(value, options);
  }

  function handleClick(event) {
    const button = event.target.closest("[data-sound-kind][data-sound-value]");
    if (!button || button.disabled) return;
    const rate = Number(button.dataset.soundRate);
    play(button.dataset.soundKind, button.dataset.soundValue, Number.isFinite(rate) && rate > 0 ? { rate } : {});
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", handleClick);
  }

  return { html, create, play };
})();

if (typeof window !== "undefined") {
  window.SoundButton = SoundButton;
}
