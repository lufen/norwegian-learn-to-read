/**
 * App router — shows/hides pages and wires up the main navigation.
 */

const App = (() => {
  const VALID_PAGES = ["home", "alphabet", "listen-game", "journey", "reading", "spelling", "handwriting", "writing", "progress"];

  function getRenderer(pageName) {
    switch (pageName) {
      case "alphabet":
        return (container) => window.AlphabetPage.render(container);
      case "listen-game":
        return (container) => window.ListenGamePage.render(container);
      case "journey":
        return (container) => window.JourneyPage.render(container);
      case "reading":
        return (container) => window.ReadingPage.render(container);
      case "spelling":
        return (container) => window.SpellingPage.render(container);
      case "handwriting":
        return (container) => window.HandwritingPage.render(container);
      case "writing":
        return (container) => window.WritingPage.render(container);
      case "progress":
        return (container) => window.ProgressPage.render(container);
      case "home":
      default:
        return renderHome;
    }
  }

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
      <button type="button" class="home-tile" data-page="listen-game">
        <span class="home-tile-icon">👂</span>
        <span>Listen &amp; Click</span>
      </button>
      <button type="button" class="home-tile" data-page="journey">
        <span class="home-tile-icon">🚀</span>
        <span>Letter Journey</span>
      </button>
      <button type="button" class="home-tile home-tile-primary" data-page="reading">
        <span class="home-tile-icon">📖</span>
        <span>Read a Little Book</span>
      </button>
      <button type="button" class="home-tile home-tile-primary" data-page="handwriting">
        <span class="home-tile-icon">✍️</span>
        <span>Write Letters</span>
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
    const normalizedPage = VALID_PAGES.includes(pageName) ? pageName : "home";
    const renderer = getRenderer(normalizedPage);
    renderer(container);

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === normalizedPage);
    });

    window.location.hash = normalizedPage === "home" ? "" : normalizedPage;
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
    navigate(initialPage);
  }

  return { init, navigate };
})();

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
