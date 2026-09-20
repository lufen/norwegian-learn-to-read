/**
 * Settings menu — text size, dyslexia-friendly font, audio speed.
 */

const SettingsMenu = (() => {
  function render(container) {
    container.innerHTML = "";
    const panel = document.createElement("div");
    panel.className = "settings-panel";
    panel.innerHTML = `
      <h3>Settings</h3>
      <label class="settings-row">
        Text size
        <select id="text-size-select">
          <option value="normal">Normal</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra large</option>
        </select>
      </label>
      <label class="settings-row">
        <input type="checkbox" id="dyslexia-font-toggle" />
        Dyslexia-friendly font
      </label>
      <label class="settings-row">
        Audio speed
        <select id="audio-rate-select">
          <option value="0.6">Slow</option>
          <option value="1">Normal</option>
          <option value="1.3">Fast</option>
        </select>
      </label>
    `;
    container.appendChild(panel);

    const textSizeSelect = panel.querySelector("#text-size-select");
    textSizeSelect.value = window.NorwegianSettings.getTextSize();
    textSizeSelect.addEventListener("change", (e) => {
      window.NorwegianSettings.setTextSize(e.target.value);
    });

    const dyslexiaToggle = panel.querySelector("#dyslexia-font-toggle");
    dyslexiaToggle.checked = window.NorwegianSettings.getDyslexiaFont();
    dyslexiaToggle.addEventListener("change", (e) => {
      window.NorwegianSettings.setDyslexiaFont(e.target.checked);
    });

    const audioRateSelect = panel.querySelector("#audio-rate-select");
    audioRateSelect.value = String(window.NorwegianSettings.getAudioRate());
    audioRateSelect.addEventListener("change", (e) => {
      window.NorwegianSettings.setAudioRate(parseFloat(e.target.value));
    });
  }

  return { render };
})();

if (typeof window !== "undefined") {
  window.SettingsMenu = SettingsMenu;
}
