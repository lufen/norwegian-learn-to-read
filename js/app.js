/**
 * App router — shows/hides pages and wires up the main navigation.
 */

const App = (() => {
  const pages = {
    home: renderHome,
    alphabet: (container) => window.AlphabetPage.render(container),
    spelling: (container) => window.SpellingPage.render(container),
    writing: (container) => window.WritingPage.render(container),
    progress: (container) => window.ProgressPage.render(container)
  };

  function renderHome(container) {
    container.innerHTML = "";
    const heading = document.createElement("div");
    heading.className = "page-header home-header";
    heading.innerHTML = `
      <h2>Velkommen! Welcome!</h2>
      <p>Learn to read and write Norwegian, one letter and word at a time.</p>
    `;
    container.appendChild(heading);

    const menu = document.createElement("div");
    menu.className = "home-menu";
    menu.innerHTML = `
      <button type="button" class="home-tile" data-page="alphabet">
        <span class="home-tile-icon">🔤</span>
        <span>Letters &amp; Sounds</span>
      </button>
      <button type="button" class="home-tile" data-page="spelling">
        <span class="home-tile-icon">🧩</span>
        <span>Spell Words</span>
      </button>
      <button type="button" class="home-tile" data-page="writing">
        <span class="home-tile-icon">✍️</span>
        <span>Write Words</span>
      </button>
      <button type="button" class="home-tile" data-page="progress">
        <span class="home-tile-icon">⭐</span>
        <span>My Progress</span>
      </button>
    `;
    container.appendChild(menu);

    menu.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.page));
    });
  }

  function navigate(pageName) {
    const container = document.getElementById("page-container");
    const isKnownPage = Object.prototype.hasOwnProperty.call(pages, pageName);
    const renderer = isKnownPage ? pages[pageName] : pages.home;
    renderer(container);

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === pageName);
    });

    window.location.hash = pageName === "home" ? "" : pageName;
  }

  function init() {
    window.NorwegianSettings.applyToDocument();
    window.SettingsMenu.render(document.getElementById("settings-container"));

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(link.dataset.page);
      });
    });

    const settingsToggle = document.getElementById("settings-toggle");
    const settingsPanelWrap = document.getElementById("settings-container");
    settingsToggle.addEventListener("click", () => {
      settingsPanelWrap.classList.toggle("open");
    });

    const initialPage = (window.location.hash || "#home").replace("#", "") || "home";
    navigate(Object.prototype.hasOwnProperty.call(pages, initialPage) ? initialPage : "home");
  }

  return { init, navigate };
})();

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
