/**
 * Per-child profiles — lets more than one child share the same device/
 * browser without mixing up progress. The very first profile ("default")
 * deliberately maps to the original, un-namespaced progress storage key, so
 * anyone who used the app before this feature keeps their existing progress
 * automatically, with no migration step.
 */

const NorwegianProfiles = (() => {
  const STORAGE_KEY = "nlr_profiles";
  const AVATARS = ["🦁", "🐸", "🐧", "🦊", "🐼", "🐢", "🦄", "🐨"];

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        return parsed;
      }
    } catch (e) {
      /* fall through to default below */
    }
    return { activeId: "default", profiles: [{ id: "default", name: "Player 1", avatar: AVATARS[0] }] };
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* ignore storage errors */
    }
  }

  let data = load();

  function list() {
    return data.profiles.slice();
  }

  function getActiveId() {
    return data.activeId;
  }

  function getActive() {
    return data.profiles.find((p) => p.id === data.activeId) || data.profiles[0];
  }

  function switchTo(id) {
    if (!data.profiles.some((p) => p.id === id)) return;
    data.activeId = id;
    save(data);
  }

  function create(name) {
    const id = `child-${Date.now().toString(36)}`;
    const avatar = AVATARS[data.profiles.length % AVATARS.length];
    data.profiles.push({ id, name: (name || "").trim() || `Player ${data.profiles.length + 1}`, avatar });
    data.activeId = id;
    save(data);
    return id;
  }

  /** "default" reuses the original un-namespaced key; everyone else gets their own. */
  function storageKeyFor(id) {
    return id === "default" ? "nlr_progress" : `nlr_progress_${id}`;
  }

  return { list, getActiveId, getActive, switchTo, create, storageKeyFor, AVATARS };
})();

if (typeof window !== "undefined") {
  window.NorwegianProfiles = NorwegianProfiles;
}
