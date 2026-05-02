import { TimelineList } from "../components/TimelineList.js";
import { ViewToggle } from "../components/ViewToggle.js";
import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

const filters = ["all", "today", "upcoming", "completed"];

export function AllTasksView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page";
  root.innerHTML = `
    <header class="topbar">
      <div>
        <div class="date-kicker">TASKS</div>
        <h1 class="display-title">All Tasks</h1>
      </div>
      <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
    </header>
    <label class="search-field glass">
      ${icons.search}
      <input type="search" placeholder="SEARCH" value="${escapeAttr(state.query || "")}" />
    </label>
    <div class="task-toolbar">
      <div class="filter-row"></div>
      <div class="view-toggle-slot"></div>
    </div>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelector(".search-field input").addEventListener("input", (event) => actions.onSearch(event.target.value));
  const filterRow = root.querySelector(".filter-row");
  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.className = `pill-toggle${state.filter === filter ? " active" : ""}`;
    button.type = "button";
    button.textContent = filter;
    button.addEventListener("click", () => actions.onFilter(filter));
    filterRow.append(button);
  });
  root.querySelector(".view-toggle-slot").append(ViewToggle(state.viewMode, actions, "Tasks view mode"));

  root.append(TimelineList(applyFilter(state.tasks, state.filter, state.query), actions, { completedEffectId: state.completedEffectId, viewMode: state.viewMode }));
  return root;
}

function applyFilter(tasks, filter, query = "") {
  const today = todayISO();
  const needle = query.trim().toLowerCase();
  const active = tasks.filter((task) => !task.stashed);
  const filtered = (() => {
    if (filter === "today") return active.filter((task) => task.dueDate === today);
    if (filter === "upcoming") return active.filter((task) => task.dueDate > today && !task.completed);
    if (filter === "completed") return active.filter((task) => task.completed);
    return active;
  })();

  if (!needle) return filtered;
  return filtered.filter((task) => `${task.title} ${task.notes || ""} ${(task.tags || []).join(" ")}`.toLowerCase().includes(needle));
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
