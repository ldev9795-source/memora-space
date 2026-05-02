import { CalendarWidget } from "../components/CalendarWidget.js";
import { TimelineList } from "../components/TimelineList.js";
import { icons } from "../components/icons.js";

export function CalendarView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page";
  const selected = state.tasks.filter((task) => task.dueDate === state.selectedDate && !task.stashed);
  const open = selected.filter((task) => !task.completed).length;
  const date = new Date(`${state.selectedDate}T00:00:00`);
  root.innerHTML = `
    <header class="topbar calendar-page-header">
      <div>
        <div class="date-kicker">PLANNER</div>
        <h1 class="display-title">Calendar</h1>
        <p class="calendar-page-subtitle">${open ? `${open} open on ${date.toLocaleDateString(undefined, { weekday: "long" })}` : "Tap a day to shape the plan."}</p>
      </div>
      <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
    </header>
  `;
  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.append(
    CalendarWidget(state.tasks, state.selectedDate, actions, {
      mode: state.calendarMode,
      settingsOpen: state.calendarSettingsOpen
    })
  );
  const list = document.createElement("section");
  list.className = "calendar-list";
  list.innerHTML = `<div class="calendar-list-heading"><span class="mono-label">Agenda</span><strong>${selected.length}</strong></div>`;
  list.append(TimelineList(selected, actions, { completedEffectId: state.completedEffectId }));
  root.append(list);
  return root;
}
