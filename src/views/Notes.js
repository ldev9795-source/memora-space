import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

export function NotesView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page notes-page";
  const reminders = state.tasks
    .filter((task) => !task.stashed && !task.completed && (task.tags || []).includes("reminder"))
    .sort((a, b) => `${a.dueDate || ""}${a.dueTime || ""}`.localeCompare(`${b.dueDate || ""}${b.dueTime || ""}`))
    .slice(0, 4);
  const notes = [...(state.notes || [])].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt) - new Date(a.createdAt));

  root.innerHTML = `
    <header class="topbar">
      <div>
        <div class="date-kicker">NOTES</div>
        <h1 class="display-title">Notes</h1>
        <p class="calendar-page-subtitle">Capture ideas and keep reminders close.</p>
      </div>
      <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
    </header>
    <form class="note-composer glass" aria-label="Create note">
      <input name="title" placeholder="Title" autocomplete="off" />
      <textarea name="body" rows="3" placeholder="Take a note..."></textarea>
      <div>
        <button type="button" data-action="add-reminder">${icons.bell}<span>Reminder</span></button>
        <button type="submit">${icons.plus}<span>Add Note</span></button>
      </div>
    </form>
    <section class="reminder-strip glass" aria-label="Reminders">
      <div class="notes-section-title">
        <span class="mono-label">Reminders</span>
        <button type="button" data-action="new-reminder">${icons.plus}<span>New</span></button>
      </div>
      <div class="reminder-list"></div>
    </section>
    <section class="notes-grid" aria-label="Notes"></section>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelectorAll('[data-action="add-reminder"], [data-action="new-reminder"]').forEach((button) => {
    button.addEventListener("click", () => actions.onAddForDate(todayISO(), "reminder"));
  });

  root.querySelector(".note-composer").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    if (!title && !body) return;
    actions.onCreateNote({ title, body });
  });

  const reminderList = root.querySelector(".reminder-list");
  if (!reminders.length) {
    reminderList.innerHTML = `<p class="empty-state">NO REMINDERS YET.</p>`;
  } else {
    reminders.forEach((task) => reminderList.append(reminderItem(task, actions)));
  }

  const notesGrid = root.querySelector(".notes-grid");
  if (!notes.length) {
    notesGrid.innerHTML = `<p class="empty-state">NO NOTES YET. START WITH A SMALL THOUGHT.</p>`;
  } else {
    notes.forEach((note) => notesGrid.append(noteCard(note, actions)));
  }

  return root;
}

function reminderItem(task, actions) {
  const item = document.createElement("article");
  item.className = `reminder-item priority-${task.priority || "low"}`;
  item.innerHTML = `
    <button class="task-checkbox" type="button" aria-label="Complete reminder"></button>
    <div>
      <h2>${escapeHTML(task.title)}</h2>
      <p>${formatDate(task.dueDate)}${task.dueTime ? ` · ${formatClock(task.dueTime)}` : ""}</p>
    </div>
  `;
  item.querySelector("button").addEventListener("click", () => actions.onToggle?.(task.id));
  item.querySelector("h2").addEventListener("click", () => actions.onEdit?.(task.id));
  return item;
}

function noteCard(note, actions) {
  const card = document.createElement("article");
  card.className = `note-card glass${note.pinned ? " pinned" : ""}`;
  card.innerHTML = `
    <div class="note-card-top">
      <span>${note.pinned ? "Pinned" : formatDate(note.createdAt)}</span>
      <button type="button" data-action="pin" aria-label="${note.pinned ? "Unpin note" : "Pin note"}">${icons.layers}</button>
    </div>
    <h2>${escapeHTML(note.title)}</h2>
    ${note.body ? `<p>${escapeHTML(note.body)}</p>` : ""}
    <button class="note-delete" type="button" data-action="delete">${icons.trash}<span>Delete</span></button>
  `;
  card.querySelector('[data-action="pin"]').addEventListener("click", () => actions.onToggleNotePin?.(note.id));
  card.querySelector('[data-action="delete"]').addEventListener("click", () => actions.onDeleteNote?.(note.id));
  return card;
}

function formatClock(value) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatDate(value) {
  if (!value) return "Anytime";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Anytime" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
