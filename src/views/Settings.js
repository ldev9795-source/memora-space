import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

export function SettingsView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page settings-page";
  const active = state.tasks.filter((task) => !task.completed && !task.stashed).length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const stashed = state.tasks.filter((task) => task.stashed).length;
  const user = state.authUser || { name: "Guest workspace", provider: "guest" };

  root.innerHTML = `
    <header class="settings-nav">
      <button class="icon-button settings-back" type="button" aria-label="Back to Today">${icons.arrowLeft}</button>
      <h1>Settings</h1>
    </header>

    <button class="settings-profile glass" type="button" aria-label="Open profile">
      <span class="profile-avatar">${icons.user}</span>
      <span>
        <strong>${escapeHTML(user.name)}</strong>
        <small>${user.provider === "guest" ? "Guest mode" : `Signed in with ${user.provider}`}</small>
      </span>
      ${icons.chevronRight}
    </button>

    <section class="settings-group" aria-label="Appearance">
      <h2>Appearance</h2>
      <div class="settings-list glass">
        <div class="settings-row">
          <span class="settings-row-icon">${state.theme === "dark" ? icons.moon : icons.sun}</span>
          <span>Theme</span>
          <div class="mini-segment">
            <button class="${state.theme === "light" ? "active" : ""}" type="button" data-theme-choice="light">Light</button>
            <button class="${state.theme === "dark" ? "active" : ""}" type="button" data-theme-choice="dark">Dark</button>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-group" aria-label="Tasks">
      <h2>Tasks</h2>
      <div class="settings-stats-compact glass">
        <span><strong>${active}</strong>Active</span>
        <span><strong>${completed}</strong>Done</span>
        <span><strong>${stashed}</strong>Stashed</span>
      </div>
    </section>

    <section class="settings-group" aria-label="Shortcuts">
      <h2>Shortcuts</h2>
      <div class="settings-list glass">
        <button class="settings-row" type="button" data-nav="today"><span class="settings-row-icon">${icons.today}</span><span>Today</span>${icons.chevronRight}</button>
        <button class="settings-row" type="button" data-nav="tasks"><span class="settings-row-icon">${icons.tasks}</span><span>All Tasks</span>${icons.chevronRight}</button>
        <button class="settings-row" type="button" data-nav="calendar"><span class="settings-row-icon">${icons.calendar}</span><span>Calendar</span>${icons.chevronRight}</button>
        <button class="settings-row" type="button" data-nav="stash"><span class="settings-row-icon">${icons.stash}</span><span>Stash</span>${icons.chevronRight}</button>
      </div>
    </section>

    <section class="settings-group" aria-label="Data">
      <h2>Data</h2>
      <div class="settings-list glass">
        <button class="settings-row" type="button" data-action="export"><span class="settings-row-icon">${icons.download}</span><span>Export Backup</span>${icons.chevronRight}</button>
        <button class="settings-row danger" type="button" data-action="reset"><span class="settings-row-icon">${icons.trash}</span><span>Reset Local Data</span>${icons.chevronRight}</button>
      </div>
      <p class="settings-feedback mono-label" aria-live="polite"></p>
    </section>
  `;

  root.querySelector(".settings-back").addEventListener("click", () => actions.onTab("today"));
  root.querySelector(".settings-profile").addEventListener("click", actions.onProfile);
  root.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => actions.onSetTheme(button.dataset.themeChoice));
  });
  root.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.nav === "calendar") actions.onSelect(todayISO());
      actions.onTab(button.dataset.nav);
    });
  });

  const feedback = root.querySelector(".settings-feedback");
  root.querySelector('[data-action="export"]').addEventListener("click", async () => {
    await navigator.clipboard?.writeText(JSON.stringify(state.tasks, null, 2));
    feedback.textContent = "Backup copied.";
  });
  root.querySelector('[data-action="reset"]').addEventListener("click", actions.onResetTasks);

  return root;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
