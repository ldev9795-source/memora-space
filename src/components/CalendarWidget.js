import { icons } from "./icons.js";

export function CalendarWidget(tasks, selectedDate, actions, options = {}) {
  const date = new Date(`${selectedDate}T00:00:00`);
  const mode = options.mode || "week";
  const isMonth = mode === "month";
  const start = isMonth ? startOfMonthGrid(date) : startOfWeek(date);
  const dayCount = isMonth ? 42 : 7;
  const selectedTasks = tasks.filter((task) => task.dueDate === selectedDate && !task.stashed);
  const days = Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });

  const card = document.createElement("section");
  card.className = "calendar-card glass soft-card";
  card.innerHTML = `
    <div class="calendar-top">
      <div class="calendar-mode" role="tablist" aria-label="Calendar mode">
        <button class="${mode === "week" ? "active" : ""}" type="button" data-mode="week" aria-pressed="${mode === "week"}">Week</button>
        <button class="${mode === "month" ? "active" : ""}" type="button" data-mode="month" aria-pressed="${mode === "month"}">Month</button>
      </div>
      <div class="calendar-settings-wrap">
        <button class="icon-button calendar-settings-button" type="button" aria-label="Calendar settings" aria-expanded="${options.settingsOpen ? "true" : "false"}">${icons.gear}</button>
        ${options.settingsOpen ? settingsMenu() : ""}
      </div>
    </div>
    <div class="calendar-monthbar">
      <button class="calendar-nav" type="button" data-move="-1" aria-label="Previous ${mode}">‹</button>
      <div>
        <span class="mono-label">${date.getFullYear()}</span>
        <strong>${date.toLocaleDateString(undefined, { month: "long" })}</strong>
      </div>
      <button class="calendar-nav" type="button" data-move="1" aria-label="Next ${mode}">›</button>
    </div>
    <div class="calendar-selected">
      <span>${date.toLocaleDateString(undefined, { weekday: "long" })}</span>
      <strong>${date.getDate()}</strong>
    </div>
    <div class="${isMonth ? "month-grid" : "week-grid"}"></div>
    <div class="calendar-actions">
      <button class="calendar-action secondary" type="button" data-action="reminder">Add Reminder</button>
      <button class="calendar-action primary" type="button" data-action="event">+ New Event</button>
    </div>
    <p class="calendar-summary mono-label">${selectedTasks.length || "No"} ${selectedTasks.length === 1 ? "item" : "items"} scheduled</p>
  `;

  card.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => actions.onCalendarMode?.(button.dataset.mode));
  });

  card.querySelector(".calendar-settings-button").addEventListener("click", () => actions.onCalendarSettings?.());
  card.querySelectorAll("[data-setting]").forEach((button) => {
    button.addEventListener("click", () => {
      const setting = button.dataset.setting;
      if (setting === "today") actions.onCalendarToday?.();
      if (setting === "week") actions.onCalendarMode?.("week");
      if (setting === "month") actions.onCalendarMode?.("month");
    });
  });

  card.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => actions.onCalendarMove?.(Number(button.dataset.move)));
  });

  card.querySelector('[data-action="reminder"]').addEventListener("click", () => {
    actions.onAddForDate?.(selectedDate, "reminder");
  });
  card.querySelector('[data-action="event"]').addEventListener("click", () => {
    actions.onAddForDate?.(selectedDate, "event");
  });

  const grid = card.querySelector(isMonth ? ".month-grid" : ".week-grid");
  days.forEach((day) => {
    const iso = localISO(day);
    const dayTasks = tasks.filter((task) => task.dueDate === iso && !task.stashed);
    const isSelected = iso === selectedDate;
    const isToday = iso === localISO(new Date());
    const isOutside = isMonth && day.getMonth() !== date.getMonth();
    const cell = document.createElement("button");
    cell.className = `day-cell${isSelected ? " selected" : ""}${isToday ? " today" : ""}${isOutside ? " outside" : ""}`;
    cell.type = "button";
    cell.setAttribute("aria-label", day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }));
    cell.innerHTML = `
      <span class="day-name">${day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)}</span>
      <span class="day-number">${day.getDate()}</span>
      <span class="task-dots">${dayTasks.slice(0, 3).map(() => '<i class="task-dot"></i>').join("")}</span>
    `;
    cell.addEventListener("click", () => actions.onSelect(iso));
    grid.append(cell);
  });

  return card;
}

function settingsMenu() {
  return `
    <div class="calendar-settings-menu glass" role="menu">
      <button type="button" data-setting="today">Today</button>
      <button type="button" data-setting="week">Week view</button>
      <button type="button" data-setting="month">Month view</button>
    </div>
  `;
}

function startOfWeek(date) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() - clone.getDay());
  return clone;
}

function startOfMonthGrid(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfWeek(first);
}

function localISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
