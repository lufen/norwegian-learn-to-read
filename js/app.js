/**
 * App router — shows/hides pages and wires up the main navigation.
 */

const App = (() => {
  const VALID_PAGES = ["home", "alphabet", "journey", "reading", "spelling", "handwriting", "writing", "progress"];

  // Spoken labels for each destination so a non-reading child hears where a
  // tap is taking them, both from the home tiles and the top nav links.
  const PAGE_SPOKEN_LABELS = {
    home: "Hjem",
    alphabet: "Bokstaver og lyder",
    journey: "Bokstavreisen",
    reading: "Les en liten bok",
    spelling: "Stave ord",
    handwriting: "Skriv bokstaven",
    writing: "Skriv ord",
    progress: "Min fremgang"
  };

  function getRenderer(pageName) {
    switch (pageName) {
      case "alphabet":
        return (container) => window.AlphabetPage.render(container);
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
    if (window.NorwegianAudio && PAGE_SPOKEN_LABELS[normalizedPage]) {
      window.NorwegianAudio.speak(PAGE_SPOKEN_LABELS[normalizedPage]);
    }
    const renderer = getRenderer(normalizedPage);
    renderer(container);

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === normalizedPage);
    });

    window.location.hash = normalizedPage === "home" ? "" : normalizedPage;
  }

  function updateProfileButton() {
    const btn = document.getElementById("profile-toggle");
    if (!btn || !window.NorwegianProfiles) return;
    const active = window.NorwegianProfiles.getActive();
    btn.textContent = active.avatar;
    btn.setAttribute("aria-label", `Switch player (currently ${active.name})`);
  }

  /** Big icon-driven overlay to pick or add a child profile — no reading required to use it. */
  function showProfileSwitcher() {
    const existing = document.getElementById("profile-switch-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "profile-switch-overlay";
    overlay.className = "child-confirm-overlay";
    overlay.innerHTML = `
      <div class="child-confirm-card profile-switch-card">
        <p class="child-confirm-message">Who's playing?</p>
        <div class="profile-list" id="profile-list"></div>
        <div class="detail-actions">
          <button type="button" class="btn btn-secondary" id="profile-add">➕ New player</button>
          <button type="button" class="btn btn-outline" id="profile-close">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    function renderList() {
      const list = overlay.querySelector("#profile-list");
      const activeId = window.NorwegianProfiles.getActiveId();
      list.innerHTML = window.NorwegianProfiles.list().map((profile) => `
        <button type="button" class="profile-chip${profile.id === activeId ? " active" : ""}" data-profile-id="${profile.id}">
          <span class="profile-chip-avatar" aria-hidden="true">${profile.avatar}</span>
          <span>${profile.name}</span>
        </button>
      `).join("");
      list.querySelectorAll("[data-profile-id]").forEach((chip) => {
        chip.addEventListener("click", () => {
          window.NorwegianProfiles.switchTo(chip.dataset.profileId);
          window.NorwegianProgress.reloadState();
          updateProfileButton();
          overlay.remove();
          navigate("home");
        });
      });
    }

    overlay.querySelector("#profile-add").addEventListener("click", () => {
      const name = window.prompt("What's this player's name?", "");
      if (name === null) return;
      const id = window.NorwegianProfiles.create(name);
      window.NorwegianProfiles.switchTo(id);
      window.NorwegianProgress.reloadState();
      updateProfileButton();
      overlay.remove();
      navigate("home");
    });
    overlay.querySelector("#profile-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.remove();
    });

    renderList();
  }

  // Session pacing: a single, gentle, non-blocking reminder after a long
  // stretch of continuous play — not a hard stop, since a good session
  // length varies a lot per child, but silence forever isn't right either.
  const BREAK_REMINDER_MS = 15 * 60 * 1000;
  let sessionStart = null;
  let breakReminderShown = false;

  function checkBreakReminder() {
    if (breakReminderShown || !sessionStart) return;
    if (Date.now() - sessionStart < BREAK_REMINDER_MS) return;
    breakReminderShown = true;
    window.ChildConfirm.show({
      icon: "⏰",
      message: "You've been playing a while. Time for a little break?",
      spokenMessage: "Du har spilt en stund. Er det på tide med en liten pause?",
      confirmLabel: "😴 Take a break",
      cancelLabel: "▶️ 5 more minutes",
      onConfirm: () => navigate("home"),
      onCancel: () => {
        breakReminderShown = false;
        sessionStart = Date.now();
      }
    });
  }

  function init() {
    window.NorwegianSettings.applyToDocument();
    window.SettingsMenu.render(document.getElementById("settings-container"));
    updateProfileButton();
    sessionStart = Date.now();
    window.setInterval(checkBreakReminder, 60 * 1000);

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

    const profileToggle = document.getElementById("profile-toggle");
    if (profileToggle) {
      profileToggle.addEventListener("click", () => showProfileSwitcher());
    }

    const initialPage = (window.location.hash || "#home").replace("#", "") || "home";
    navigate(initialPage);
  }

  return { init, navigate };
})();

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
