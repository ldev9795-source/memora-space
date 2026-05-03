import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

export function SettingsView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page settings-page";
  const active = state.tasks.filter((task) => !task.completed && !task.stashed).length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const stashed = state.tasks.filter((task) => task.stashed).length;
  const today = todayISO();
  const todayTasks = state.tasks.filter((task) => task.dueDate === today && !task.stashed);
  const doneToday = todayTasks.filter((task) => task.completed).length;
  const progress = todayTasks.length ? Math.round((doneToday / todayTasks.length) * 100) : 0;
  const nextTask = todayTasks.filter((task) => !task.completed).sort((a, b) => (a.dueTime || "23:59").localeCompare(b.dueTime || "23:59"))[0];
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

    <section class="settings-group" aria-label="Today summary">
      <h2>Today Summary</h2>
      <div class="settings-today-summary glass">
        <div class="today-progress mini" style="--progress:${progress}%">
          <span>${progress}</span>
          <small>%</small>
        </div>
        <div>
          <span class="mono-label">${nextTask ? "Next Focus" : "Day Clear"}</span>
          <h3>${nextTask ? escapeHTML(nextTask.title) : "Nothing urgent waiting."}</h3>
          <p>${nextTask ? `${formatClock(nextTask.dueTime || "09:00")} · ${escapeHTML(nextTask.priority)} priority` : "Add a task or let the list stay quiet."}</p>
        </div>
      </div>
    </section>

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
        <span><strong>${stashed}</strong>Filed</span>
      </div>
    </section>

    <section class="settings-group" aria-label="Shortcuts">
      <h2>Shortcuts</h2>
      <div class="settings-list glass">
        <button class="settings-row" type="button" data-nav="today"><span class="settings-row-icon">${icons.today}</span><span>Today</span>${icons.chevronRight}</button>
        <button class="settings-row" type="button" data-nav="tasks"><span class="settings-row-icon">${icons.tasks}</span><span>Planner</span>${icons.chevronRight}</button>
        <button class="settings-row" type="button" data-nav="calendar"><span class="settings-row-icon">${icons.note}</span><span>Notes</span>${icons.chevronRight}</button>
        <button class="settings-row" type="button" data-nav="stash"><span class="settings-row-icon">${icons.stash}</span><span>Folders</span>${icons.chevronRight}</button>
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
    await navigator.clipboard?.writeText(JSON.stringify({ tasks: state.tasks, notes: state.notes, folders: state.folders }, null, 2));
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

function formatClock(value) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}
