import { icons } from "./icons.js";

export function CalendarWidget(tasks, selectedDate, actions, options = {}) {
  const date = new Date(`${selectedDate}T00:00:00`);
  const mode = options.mode || "week";
  const isMonth = mode === "month";
  const start = isMonth ? startOfMonthGrid(date) : startOfWeek(date);
  const dayCount = isMonth ? 42 : 7;
  const selectedTasks = tasks.filter((task) => task.dueDate === selectedDate && !task.stashed);
  const completed = selectedTasks.filter((task) => task.completed).length;
  const days = Array.from({ length: dayCount }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });

  const card = document.createElement("section");
  card.className = "calendar-card calendar-card-v2 glass soft-card";
  card.innerHTML = `
    <div class="calendar-commandbar">
      <div class="calendar-mode" role="tablist" aria-label="Calendar mode">
        <button class="${mode === "week" ? "active" : ""}" type="button" data-mode="week" aria-pressed="${mode === "week"}">Week</button>
        <button class="${mode === "month" ? "active" : ""}" type="button" data-mode="month" aria-pressed="${mode === "month"}">Month</button>
      </div>
      <button class="calendar-today-button" type="button" data-setting="today">Today</button>
    </div>
    <div class="calendar-focus">
      <button class="calendar-nav" type="button" data-move="-1" aria-label="Previous ${mode}">‹</button>
      <div>
        <span class="mono-label">${date.getFullYear()}</span>
        <h2>${date.toLocaleDateString(undefined, { month: "long" })}</h2>
        <p>${date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p>
      </div>
      <button class="calendar-nav" type="button" data-move="1" aria-label="Next ${mode}">›</button>
    </div>
    <div class="calendar-day-hero">
      <div>
        <span class="mono-label">Selected</span>
        <strong>${date.getDate()}</strong>
      </div>
      <p>${selectedTasks.length ? `${selectedTasks.length} scheduled · ${completed} done` : "No events yet. Add one below."}</p>
    </div>
    <div class="${isMonth ? "month-grid" : "week-grid"} calendar-grid-v2"></div>
    <div class="calendar-actions calendar-actions-v2">
      <button class="calendar-action secondary" type="button" data-action="reminder">${icons.today}<span>Reminder</span></button>
      <button class="calendar-action primary" type="button" data-action="event">${icons.plus}<span>Event</span></button>
    </div>
    <div class="calendar-feedback" aria-live="polite">${feedbackText(selectedTasks, selectedDate)}</div>
  `;

  card.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => actions.onCalendarMode?.(button.dataset.mode));
  });
  card.querySelector('[data-setting="today"]').addEventListener("click", () => actions.onCalendarToday?.());
  card.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => actions.onCalendarMove?.(Number(button.dataset.move)));
  });
  card.querySelector('[data-action="reminder"]').addEventListener("click", () => actions.onAddForDate?.(selectedDate, "reminder"));
  card.querySelector('[data-action="event"]').addEventListener("click", () => actions.onAddForDate?.(selectedDate, "event"));

  const grid = card.querySelector(".calendar-grid-v2");
  days.forEach((day) => {
    const iso = localISO(day);
    const dayTasks = tasks.filter((task) => task.dueDate === iso && !task.stashed);
    const isSelected = iso === selectedDate;
    const isToday = iso === localISO(new Date());
    const isOutside = isMonth && day.getMonth() !== date.getMonth();
    const cell = document.createElement("button");
    cell.className = `day-cell${isSelected ? " selected" : ""}${isToday ? " today" : ""}${isOutside ? " outside" : ""}${dayTasks.length ? " has-items" : ""}`;
    cell.type = "button";
    cell.setAttribute("aria-label", `${day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}, ${dayTasks.length} scheduled`);
    cell.innerHTML = `
      <span class="day-name">${day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)}</span>
      <span class="day-number">${day.getDate()}</span>
      <span class="task-dots">${dayTasks.slice(0, 3).map((task) => `<i class="task-dot ${task.priority || "low"}"></i>`).join("")}</span>
    `;
    cell.addEventListener("click", () => actions.onSelect(iso));
    grid.append(cell);
  });

  return card;
}

function feedbackText(tasks, selectedDate) {
  if (!tasks.length) return "Tap Event or Reminder to start this day.";
  const open = tasks.filter((task) => !task.completed).length;
  const label = selectedDate === localISO(new Date()) ? "today" : "this day";
  return open ? `${open} item${open === 1 ? "" : "s"} still open for ${label}.` : `Everything scheduled for ${label} is complete.`;
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
