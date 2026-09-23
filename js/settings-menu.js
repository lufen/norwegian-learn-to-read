/**
 * Settings menu — text size, dyslexia-friendly font, audio speed.
 */

const SettingsMenu = (() => {
  function render(container) {
    container.innerHTML = "";
    const panel = document.createElement("div");
    panel.className = "settings-panel";
    panel.innerHTML = `
      <h3>For voksne</h3>
      <p>Innstillinger og oversikt over øvingen, ikke en vurdering av barnets leseferdighet.</p>
      <button type="button" class="btn" id="open-progress">📊 Se øvingen</button>
      <p>Lyd: nettleserstemme brukes når et kontrollert norsk lydopptak mangler.
        Uttalen kan variere mellom enheter. Lytt sammen med barnet.</p>
      <label class="settings-row">
        Tekststørrelse
        <select id="text-size-select">
          <option value="normal">Normal</option>
          <option value="large">Stor</option>
          <option value="xlarge">Ekstra stor</option>
        </select>
      </label>
      <label class="settings-row">
        <input type="checkbox" id="dyslexia-font-toggle" />
        Alternativ skrifttype
      </label>
      <label class="settings-row">
        Talehastighet
        <select id="audio-rate-select">
          <option value="0.6">Langsom</option>
          <option value="1">Normal</option>
          <option value="1.3">Rask</option>
        </select>
      </label>
    `;
    container.appendChild(panel);
    panel.querySelector("#open-progress").addEventListener("click", () => window.App.navigate("progress"));

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
