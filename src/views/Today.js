import { TimelineList } from "../components/TimelineList.js";
import { ViewToggle } from "../components/ViewToggle.js";
import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

const scopes = [
  ["open", "Open"],
  ["all", "All"],
  ["done", "Done"]
];

export function TodayView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page today-page";
  const today = todayISO();
  const todayTasks = state.tasks.filter((task) => task.dueDate === today && !task.stashed);
  const openTasks = todayTasks.filter((task) => !task.completed);
  const doneTasks = todayTasks.filter((task) => task.completed);
  const progress = todayTasks.length ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;
  const nextTask = openTasks.slice().sort((a, b) => (a.dueTime || "23:59").localeCompare(b.dueTime || "23:59"))[0];
  const focusTags = [...new Set(todayTasks.flatMap((task) => task.tags || []))].slice(0, 4);
  const overdue = state.tasks.some((task) => task.dueDate < today && !task.completed && !task.stashed);
  const scope = state.todayScope || "open";
  const scopedTasks = applyTodayScope(todayTasks, scope);
  const notes = scope === "done" ? [] : getTodayNotes();

  root.innerHTML = `
    <header class="topbar today-topbar">
      <div>
        <div class="date-kicker">${new Date().toLocaleDateString(undefined, { month: "short", day: "2-digit" })}${overdue ? '<span class="red-dot"></span>' : ""}</div>
        <h1 class="display-title">Today</h1>
      </div>
      <div class="topbar-actions">
        <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
        <button class="icon-button settings-open" type="button" aria-label="Open settings">${icons.gear}</button>
      </div>
    </header>
    <section class="install-banner glass">
      <span class="mono-label">Install Memora Space</span>
      <button class="pill-toggle active" type="button">Add</button>
    </section>
    <section class="today-hero glass" aria-label="Today summary">
      <div class="today-progress" style="--progress:${progress}%">
        <span>${progress}</span>
        <small>%</small>
      </div>
      <div class="today-hero-copy">
        <span class="mono-label">${openTasks.length ? "Next Focus" : "Day Clear"}</span>
        <h2>${nextTask ? escapeHTML(nextTask.title) : "Nothing urgent waiting."}</h2>
        <p>${nextTask ? `${formatClock(nextTask.dueTime || "09:00")} · ${escapeHTML(nextTask.priority)} priority` : "Add a task or let the list stay quiet."}</p>
      </div>
    </section>
    <section class="today-actions" aria-label="Quick actions">
      <button class="glass" type="button" data-action="add-task">${icons.plus}<span>Task</span></button>
      <button class="glass" type="button" data-action="add-reminder">${icons.today}<span>Reminder</span></button>
      <button class="glass" type="button" data-action="calendar">${icons.calendar}<span>Plan</span></button>
    </section>
    <section class="today-metrics" aria-label="Today metrics">
      <span><strong>${openTasks.length}</strong> Open</span>
      <span><strong>${doneTasks.length}</strong> Done</span>
      <span><strong>${todayTasks.length}</strong> Total</span>
    </section>
    ${focusTags.length ? `<section class="today-tags" aria-label="Focus tags">${focusTags.map((tag) => `<span>#${escapeHTML(tag)}</span>`).join("")}</section>` : ""}
    <section class="today-section-heading">
      <div>
        <span class="mono-label">Schedule</span>
        <h2>${scope === "done" ? "Completed" : scope === "all" ? "Full day" : "Up next"}</h2>
      </div>
      <div class="today-scope" role="tablist" aria-label="Today task filter">
        ${scopes.map(([id, label]) => `<button type="button" class="${scope === id ? "active" : ""}" data-scope="${id}" role="tab" aria-selected="${scope === id ? "true" : "false"}">${label}</button>`).join("")}
      </div>
      <div class="view-toggle-slot"></div>
    </section>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelector(".settings-open").addEventListener("click", actions.onSettings);
  root.querySelector('[data-action="add-task"]').addEventListener("click", actions.onAdd);
  root.querySelector('[data-action="add-reminder"]').addEventListener("click", () => actions.onAddForDate(today, "reminder"));
  root.querySelector('[data-action="calendar"]').addEventListener("click", () => actions.onTab("calendar"));
  root.querySelectorAll("[data-scope]").forEach((button) => {
    button.addEventListener("click", () => actions.onTodayScope(button.dataset.scope));
  });
  root.querySelector(".view-toggle-slot").append(ViewToggle(state.viewMode, actions, "Today view mode"));

  const banner = root.querySelector(".install-banner");
  if (state.installReady) {
    banner.classList.add("show");
    banner.querySelector("button").addEventListener("click", actions.onInstall);
  }

  root.append(
    TimelineList(scopedTasks, actions, {
      notes,
      completedEffectId: state.completedEffectId,
      variant: "today",
      viewMode: state.viewMode
    })
  );

  return root;
}

function applyTodayScope(tasks, scope) {
  if (scope === "done") return tasks.filter((task) => task.completed);
  if (scope === "all") return tasks;
  return tasks.filter((task) => !task.completed);
}

function getTodayNotes() {
  return [
    {
      time: "10:30",
      text: "Had a great day at work today. Made progress on the project and received positive feedback from the team. Inspiration for brand aesthetics."
    },
    {
      time: "13:30",
      text: "This space keeps notes and tasks in one quiet stream. Finish what matters, file what can wait, and let the day stay readable."
    }
  ];
}

function formatClock(value) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
