import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

export function NotesView(state, actions) {
  const root = document.createElement("main");
  root.className = `phone-frame page notes-page${state.openNoteId ? " note-modal-open" : ""}`;
  const mode = state.notesMode === "reminders" ? "reminders" : "notes";
  const reminders = state.tasks
    .filter((task) => !task.stashed && !task.completed && (task.tags || []).includes("reminder"))
    .sort((a, b) => `${a.dueDate || ""}${a.dueTime || ""}`.localeCompare(`${b.dueDate || ""}${b.dueTime || ""}`));
  const notes = [...(state.notes || [])].sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  const openNote = state.openNoteId ? notes.find((note) => note.id === state.openNoteId) : null;

  root.innerHTML = `
    <header class="topbar notes-topbar">
      <div>
        <div class="date-kicker">CAPTURE</div>
        <h1 class="display-title">${mode === "reminders" ? "Reminders" : "Notes"}</h1>
        <p class="calendar-page-subtitle">${mode === "reminders" ? "Small nudges for later." : "Tap any note to open and edit it."}</p>
      </div>
      <div class="notes-header-actions" aria-label="Notes controls">
        <div class="notes-mode-switch" aria-label="Switch notes mode">
          <button type="button" data-notes-mode="notes" class="${mode === "notes" ? "active" : ""}" aria-pressed="${mode === "notes"}">${icons.note}<span>Notes</span></button>
          <button type="button" data-notes-mode="reminders" class="${mode === "reminders" ? "active" : ""}" aria-pressed="${mode === "reminders"}">${icons.bell}<span>Reminders</span></button>
        </div>
        <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
      </div>
    </header>
    <div class="notes-content"></div>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelectorAll("[data-notes-mode]").forEach((button) => {
    button.addEventListener("click", () => actions.onNotesMode?.(button.dataset.notesMode));
  });

  const content = root.querySelector(".notes-content");
  if (mode === "reminders") {
    content.append(remindersPanel(reminders, actions));
  } else {
    content.append(notesPanel(notes, actions));
  }

  if (openNote) {
    root.append(noteEditor(openNote, actions));
  }

  return root;
}

function notesPanel(notes, actions) {
  const fragment = document.createDocumentFragment();
  const composer = document.createElement("form");
  composer.className = "note-composer glass";
  composer.setAttribute("aria-label", "Create note");
  composer.innerHTML = `
    <div class="note-composer-fields">
      <input name="title" placeholder="Title" autocomplete="off" />
      <textarea name="body" rows="2" placeholder="Take a note..."></textarea>
    </div>
    <div class="note-composer-actions">
      <button type="button" data-action="add-reminder">${icons.bell}<span>Reminder</span></button>
      <button type="submit">${icons.plus}<span>Add</span></button>
    </div>
  `;
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    if (!title && !body) return;
    actions.onCreateNote({ title, body });
  });
  composer.querySelector('[data-action="add-reminder"]').addEventListener("click", () => actions.onNotesMode?.("reminders"));
  fragment.append(composer);

  const heading = document.createElement("div");
  heading.className = "notes-section-title notes-list-heading";
  heading.innerHTML = `<span class="mono-label">${notes.length ? `${notes.length} notes` : "Notes"}</span><span>${notes.filter((note) => note.pinned).length} pinned</span>`;
  fragment.append(heading);

  const grid = document.createElement("section");
  grid.className = "notes-grid";
  grid.setAttribute("aria-label", "Notes");
  if (!notes.length) {
    grid.innerHTML = `
      <article class="notes-empty glass">
        ${icons.note}
        <h2>No notes yet.</h2>
        <p>Start with one thought. You can open it again, edit it, pin it, or delete it later.</p>
      </article>
    `;
  } else {
    notes.forEach((note) => grid.append(noteCard(note, actions)));
  }
  fragment.append(grid);
  return fragment;
}

function remindersPanel(reminders, actions) {
  const panel = document.createElement("section");
  panel.className = "reminders-panel glass";
  panel.setAttribute("aria-label", "Reminders");
  panel.innerHTML = `
    <div class="reminders-hero">
      <div class="reminders-hero-icon">${icons.bell}</div>
      <div>
        <span class="mono-label">${reminders.length} active</span>
        <h2>Keep small things visible.</h2>
        <p>Reminder tasks stay here until you complete them.</p>
      </div>
      <button type="button" data-action="new-reminder">${icons.plus}<span>New</span></button>
    </div>
    <div class="reminder-list"></div>
  `;

  panel.querySelector('[data-action="new-reminder"]').addEventListener("click", () => actions.onAddForDate(todayISO(), "reminder"));

  const list = panel.querySelector(".reminder-list");
  if (!reminders.length) {
    list.innerHTML = `
      <div class="notes-empty reminders-empty">
        ${icons.calendar}
        <h2>No reminders.</h2>
        <p>Add a reminder when something needs to come back at the right moment.</p>
      </div>
    `;
  } else {
    reminders.forEach((task) => list.append(reminderItem(task, actions)));
  }
  return panel;
}

function reminderItem(task, actions) {
  const item = document.createElement("article");
  item.className = `reminder-item priority-${task.priority || "low"}`;
  item.innerHTML = `
    <button class="task-checkbox" type="button" aria-label="Complete reminder"></button>
    <div>
      <h2>${escapeHTML(task.title)}</h2>
      <p>${formatDate(task.dueDate)}${task.dueTime ? ` - ${formatClock(task.dueTime)}` : ""}</p>
    </div>
    <button class="reminder-edit" type="button" aria-label="Edit reminder">${icons.chevronRight}</button>
  `;
  item.querySelector(".task-checkbox").addEventListener("click", () => actions.onToggle?.(task.id));
  item.querySelector(".reminder-edit").addEventListener("click", () => actions.onEdit?.(task.id));
  item.querySelector("h2").addEventListener("click", () => actions.onEdit?.(task.id));
  return item;
}

function noteCard(note, actions) {
  const card = document.createElement("article");
  card.className = `note-card glass${note.pinned ? " pinned" : ""}`;
  card.innerHTML = `
    <div class="note-card-top">
      <span>${note.pinned ? "Pinned" : formatDate(note.updatedAt || note.createdAt)}</span>
      <button type="button" data-action="pin" aria-label="${note.pinned ? "Unpin note" : "Pin note"}">${icons.layers}</button>
    </div>
    <button class="note-card-open" type="button" aria-label="Open note">
      <h2>${escapeHTML(note.title)}</h2>
      ${note.body ? `<p>${escapeHTML(note.body)}</p>` : "<p>No extra text yet.</p>"}
    </button>
    <button class="note-delete" type="button" data-action="delete">${icons.trash}<span>Delete</span></button>
  `;
  card.querySelector(".note-card-open").addEventListener("click", () => actions.onOpenNote?.(note.id));
  card.querySelector('[data-action="pin"]').addEventListener("click", () => actions.onToggleNotePin?.(note.id));
  card.querySelector('[data-action="delete"]').addEventListener("click", () => actions.onDeleteNote?.(note.id));
  return card;
}

function noteEditor(note, actions) {
  const backdrop = document.createElement("div");
  backdrop.className = "note-editor-backdrop";
  backdrop.innerHTML = `
    <form class="note-editor glass" aria-label="Edit note">
      <div class="sheet-handle"></div>
      <div class="note-editor-top">
        <span class="mono-label">${note.pinned ? "Pinned note" : "Edit note"}</span>
        <button type="button" data-action="close" aria-label="Close editor">${icons.chevronRight}</button>
      </div>
      <input name="title" value="${escapeAttr(note.title)}" placeholder="Title" autocomplete="off" />
      <textarea name="body" rows="8" placeholder="Take a note...">${escapeHTML(note.body || "")}</textarea>
      <div class="note-editor-tools">
        <button type="button" data-action="pin">${icons.layers}<span>${note.pinned ? "Unpin" : "Pin"}</span></button>
        <button type="button" data-action="delete">${icons.trash}<span>Delete</span></button>
      </div>
      <div class="note-editor-actions">
        <button type="button" data-action="cancel">Cancel</button>
        <button type="submit" data-action="save">Save note</button>
      </div>
    </form>
  `;

  const form = backdrop.querySelector("form");
  const close = () => actions.onCloseNote?.();
  const save = () => {
    actions.onUpdateNote?.(note.id, {
      title: form.elements.title.value,
      body: form.elements.body.value
    });
  };
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  form.querySelector('[data-action="close"]').addEventListener("click", close);
  form.querySelector('[data-action="cancel"]').addEventListener("click", close);
  form.querySelector('[data-action="pin"]').addEventListener("click", () => actions.onToggleNotePin?.(note.id));
  form.querySelector('[data-action="delete"]').addEventListener("click", () => actions.onDeleteNote?.(note.id));
  form.querySelector('[data-action="save"]').addEventListener("click", (event) => {
    event.preventDefault();
    save();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    save();
  });
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("focus", () => {
      window.setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), 80);
    });
  });
  return backdrop;
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

function escapeAttr(value) {
  return escapeHTML(value).replaceAll("\n", "&#10;");
}
