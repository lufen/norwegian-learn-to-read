/**
 * App router — shows/hides pages and wires up the main navigation.
 */

const App = (() => {
  const VALID_PAGES = ["home", "alphabet", "journey", "reading", "spelling", "handwriting", "writing", "progress", "challenges"];

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
    progress: "For voksne. Oversikt over øvingen",
    challenges: "Lek med lyder og bilder"
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
      case "challenges":
        return (container) => window.ChallengesPage.render(container);
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
      <h2>Hei! Skal vi leke?</h2>
      <p>Velg et bilde. Vi øver litt sammen.</p>
      ${window.SoundButton.html({ kind: "word", value: "Trykk på fortsett for å leke videre. Du kan også velge en annen lek.", label: "Hør hjelpen" })}
    `;
    container.appendChild(heading);

    const savedPage = window.NorwegianProgress.getActivityState("navigation").page;
    const resumePage = VALID_PAGES.includes(savedPage) && !["home", "progress"].includes(savedPage) ? savedPage : "journey";
    const primary = document.createElement("div");
    primary.className = "home-menu";
    primary.innerHTML = `
      <button type="button" class="home-tile home-tile-primary" data-page="${resumePage}">
        <span class="home-tile-icon" aria-hidden="true">▶️</span>
        <span>Fortsett å leke</span><small>${PAGE_SPOKEN_LABELS[resumePage]}</small>
      </button>
      <button type="button" class="home-tile" data-page="challenges">
        <span class="home-tile-icon" aria-hidden="true">🎲</span><span>Lek med lyder og bilder</span>
      </button>`;
    container.appendChild(primary);

    const choices = document.createElement("details");
    choices.className = "home-activities";
    choices.innerHTML = "<summary>🧸 Velg en annen lek</summary>";
    container.appendChild(choices);
    const menu = document.createElement("div");
    menu.className = "home-menu";
    menu.innerHTML = `
      <button type="button" class="home-tile" data-page="alphabet">
        <span class="home-tile-icon">🔤</span>
        <span>Bokstaver og lyder</span>
      </button>
      <button type="button" class="home-tile" data-page="journey">
        <span class="home-tile-icon">🚀</span>
        <span>Bokstavreisen</span>
      </button>
      <button type="button" class="home-tile home-tile-primary" data-page="handwriting">
        <span class="home-tile-icon">✍️</span>
        <span>Skriv bokstaver</span>
      </button>
      <button type="button" class="home-tile home-tile-primary" data-page="reading">
        <span class="home-tile-icon">📖</span>
        <span>Les en liten bok</span>
      </button>
      <button type="button" class="home-tile" data-page="spelling">
        <span class="home-tile-icon">🧩</span>
        <span>Lytt til ord</span>
      </button>
      <button type="button" class="home-tile" data-page="writing">
        <span class="home-tile-icon">📝</span>
        <span>Bygg ord</span>
      </button>
    `;
    choices.appendChild(menu);

    container.querySelectorAll("[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => navigate(btn.dataset.page));
    });
    const recommendation = window.Curriculum.recommendations();
    const suggested = document.createElement("section");
    suggested.className = "home-recommendations";
    if (recommendation.word || recommendation.bookIndex >= 0) {
      suggested.innerHTML = "<h3>🌱 Prøv med bokstaver du har øvd på</h3>";
      if (recommendation.word) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-secondary";
        button.textContent = `${recommendation.word.emoji || "🧩"} Bygg ${recommendation.word.text}`;
        button.addEventListener("click", () => {
          const saved = window.NorwegianProgress.getActivityState("writing");
          window.NorwegianProgress.saveActivityState("writing", {
            ...saved, levelIndex: recommendation.word.levelIndex, wordIndex: recommendation.word.wordIndex
          });
          navigate("writing");
        });
        suggested.appendChild(button);
      }
      if (recommendation.bookIndex >= 0) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-secondary";
        button.textContent = "📖 Les en bok med kjente bokstaver";
        button.addEventListener("click", () => {
          const saved = window.NorwegianProgress.getActivityState("reading");
          window.NorwegianProgress.saveActivityState("reading", { ...saved, bookIndex: recommendation.bookIndex, pageIndex: 0 });
          navigate("reading");
        });
        suggested.appendChild(button);
      }
      container.appendChild(suggested);
    }
  }

  let currentPage = "home";

  function navigate(pageName) {
    const container = document.getElementById("page-container");
    const normalizedPage = VALID_PAGES.includes(pageName) ? pageName : "home";
    if (window.PracticeSession) window.PracticeSession.invalidate();
    container.dataset.page = normalizedPage;
    currentPage = normalizedPage;
    if (!["home", "progress"].includes(normalizedPage)) {
      window.NorwegianProgress.saveActivityState("navigation", { page: normalizedPage });
    }
    document.getElementById("settings-container").classList.remove("open");
    document.getElementById("settings-toggle").setAttribute("aria-expanded", "false");
    if (window.NorwegianAudio) {
      // Never let a letter sound (or a sound-it-out sequence) from the page
      // being left keep playing over the new one.
      window.NorwegianAudio.cancel();
      if (PAGE_SPOKEN_LABELS[normalizedPage]) {
        window.NorwegianAudio.speak(PAGE_SPOKEN_LABELS[normalizedPage]);
      }
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
    btn.setAttribute("aria-label", `Bytt spiller (${active.name})`);
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
        <p class="child-confirm-message">Hvem spiller?</p>
        <div class="profile-list" id="profile-list"></div>
        <div class="detail-actions">
          <button type="button" class="btn btn-secondary" id="profile-add">➕ Ny spiller</button>
          <button type="button" class="btn btn-outline" id="profile-close">Lukk</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    function switchAndClose(id) {
      window.NorwegianProfiles.switchTo(id);
      window.NorwegianProgress.reloadState();
      resetSessionPacing();
      updateProfileButton();
      overlay.remove();
      navigate("home");
    }

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
        chip.addEventListener("click", () => switchAndClose(chip.dataset.profileId));
      });
    }

    /**
     * No typing required: a new player is created by tapping a picture
     * avatar, not by typing a name into a native window.prompt() dialog —
     * which a non-reading child couldn't operate at all.
     */
    function showAvatarPicker() {
      const card = overlay.querySelector(".profile-switch-card");
      card.innerHTML = `
        <p class="child-confirm-message">Velg et bilde!</p>
        <div class="profile-list" id="avatar-list">
          ${window.NorwegianProfiles.AVATARS.map((avatar) => `
            <button type="button" class="profile-chip" data-avatar="${avatar}">
              <span class="profile-chip-avatar" aria-hidden="true">${avatar}</span>
            </button>
          `).join("")}
        </div>
        <div class="detail-actions">
          <button type="button" class="btn btn-outline" id="avatar-back">↩️ Tilbake</button>
        </div>
      `;
      if (window.NorwegianAudio) window.NorwegianAudio.speak("Velg et bilde.");
      card.querySelectorAll("[data-avatar]").forEach((chip) => {
        chip.addEventListener("click", () => {
          const id = window.NorwegianProfiles.create("", chip.dataset.avatar);
          switchAndClose(id);
        });
      });
      card.querySelector("#avatar-back").addEventListener("click", () => {
        overlay.remove();
        showProfileSwitcher();
      });
    }

    overlay.querySelector("#profile-add").addEventListener("click", showAvatarPicker);
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

  /** Call whenever the active profile changes — a fresh child gets a fresh clock. */
  function resetSessionPacing() {
    sessionStart = Date.now();
    breakReminderShown = false;
  }

  function checkBreakReminder() {
    if (breakReminderShown || !sessionStart) return;
    if (Date.now() - sessionStart < BREAK_REMINDER_MS) return;
    breakReminderShown = true;
    window.ChildConfirm.show({
      icon: "⏰",
      message: "Vil du ta en liten pause?",
      spokenMessage: "Du har spilt en stund. Er det på tide med en liten pause?",
      confirmLabel: "😴 Ta en pause",
      cancelLabel: "▶️ Lek videre",
      onConfirm: () => navigate("home"),
      onCancel: () => resetSessionPacing()
    });
  }

  function init() {
    window.NorwegianSettings.applyToDocument();
    window.SettingsMenu.render(document.getElementById("settings-container"));
    updateProfileButton();
    resetSessionPacing();
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
      const open = settingsPanelWrap.classList.toggle("open");
      settingsToggle.setAttribute("aria-expanded", String(open));
    });

    const profileToggle = document.getElementById("profile-toggle");
    if (profileToggle) {
      profileToggle.addEventListener("click", () => showProfileSwitcher());
    }

    const initialPage = (window.location.hash || "#home").replace("#", "") || "home";
    navigate(initialPage);

    // A hash can also change without a nav-link click (browser back/forward,
    // a bookmarked link, or another module setting location.hash directly,
    // like the Little Books "take a break" button) — without this, those
    // are silent no-ops since navigate() is otherwise only ever called from
    // explicit click handlers.
    window.addEventListener("hashchange", () => {
      const targetPage = (window.location.hash || "#home").replace("#", "") || "home";
      if (targetPage === currentPage) return;
      navigate(targetPage);
    });
  }

  return { init, navigate };
})();

if (typeof window !== "undefined") {
  window.App = App;
}

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
