import { ViewToggle } from "../components/ViewToggle.js";
import { icons } from "../components/icons.js";

export function NotesView(state, actions) {
  const root = document.createElement("main");
  root.className = `phone-frame page notes-page${state.openNoteId ? " note-modal-open" : ""}`;
  const folders = (state.folders || []).filter((folder) => !folder.archived);
  const selectedFolder = state.noteFolderId || "all";
  const query = state.query || "";
  const activeNotes = normalizeNotes(state.notes || []);
  const visibleNotes = filterNotes(activeNotes, selectedFolder, query);
  const pinnedCount = activeNotes.filter((note) => note.pinned).length;
  const openNote = state.openNoteId ? activeNotes.find((note) => note.id === state.openNoteId) : null;

  root.innerHTML = `
    <header class="topbar notes-topbar">
      <div>
        <div class="date-kicker">CAPTURE</div>
        <h1 class="display-title">Notes</h1>
        <p class="calendar-page-subtitle">Write, edit, pin, and file thoughts into folders.</p>
      </div>
      <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
    </header>
    <section class="notes-hero glass">
      <div class="notes-hero-icon">${icons.note}</div>
      <div>
        <span class="mono-label">${activeNotes.length} notes · ${pinnedCount} pinned</span>
        <h2>Keep every thought easy to find.</h2>
        <p>Capture quick ideas, open them again, and move them into folders when they need structure.</p>
      </div>
      <button type="button" class="notes-new" aria-label="New note">${icons.plus}</button>
    </section>
    <label class="notes-search glass">
      ${icons.search}
      <input type="search" placeholder="Search notes" value="${escapeAttr(query)}" autocomplete="off" />
    </label>
    <section class="note-composer glass" aria-label="Create note">
      <form class="note-composer-form">
        <input name="title" placeholder="Title" autocomplete="off" />
        <textarea name="body" rows="3" placeholder="Start a note..."></textarea>
        <div class="note-composer-row">
          <label>
            <span>Folder</span>
            <select name="folderId">
              ${folders.map((folder) => `<option value="${folder.id}" ${folder.id === (state.folderId || "inbox") ? "selected" : ""}>${escapeHTML(folder.name)}</option>`).join("")}
            </select>
          </label>
          <button type="submit">${icons.plus}<span>Add note</span></button>
        </div>
      </form>
    </section>
    <section class="notes-controls" aria-label="Notes filters">
      <div class="notes-folder-strip">
        <button type="button" class="${selectedFolder === "all" ? "active" : ""}" data-note-folder="all">All <strong>${activeNotes.length}</strong></button>
        <button type="button" class="${selectedFolder === "pinned" ? "active" : ""}" data-note-folder="pinned">Pinned <strong>${pinnedCount}</strong></button>
        ${folders.map((folder) => noteFolderButton(folder, selectedFolder, activeNotes)).join("")}
      </div>
      <div class="view-toggle-slot"></div>
    </section>
    <section class="notes-grid ${state.viewMode === "list" ? "notes-list-mode" : ""}" aria-label="Notes"></section>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelector(".notes-new").addEventListener("click", () => actions.onNewNote?.());
  root.querySelector(".notes-search input").addEventListener("input", (event) => actions.onSearch(event.target.value));
  root.querySelectorAll("[data-note-folder]").forEach((button) => {
    button.addEventListener("click", () => actions.onNoteFolder?.(button.dataset.noteFolder));
  });
  root.querySelector(".view-toggle-slot").append(ViewToggle(state.viewMode, actions, "Notes view mode"));

  const composer = root.querySelector(".note-composer-form");
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") || "").trim();
    const body = String(data.get("body") || "").trim();
    if (!title && !body) return;
    actions.onCreateNote({
      title,
      body,
      folderId: data.get("folderId") || "inbox"
    });
  });

  const grid = root.querySelector(".notes-grid");
  if (!visibleNotes.length) {
    grid.append(emptyNotes(query, selectedFolder));
  } else {
    visibleNotes.forEach((note) => grid.append(noteCard(note, folders, actions)));
  }

  if (openNote) {
    root.append(noteEditor(openNote, folders, actions));
  }

  return root;
}

function normalizeNotes(notes) {
  return [...notes]
    .filter((note) => !note.archived)
    .map((note) => ({ ...note, folderId: note.folderId || "inbox" }))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

function filterNotes(notes, selectedFolder, query) {
  const needle = String(query || "").trim().toLowerCase();
  return notes.filter((note) => {
    const folderMatch = selectedFolder === "all" || (selectedFolder === "pinned" ? note.pinned : (note.folderId || "inbox") === selectedFolder);
    if (!folderMatch) return false;
    if (!needle) return true;
    return `${note.title} ${note.body || ""}`.toLowerCase().includes(needle);
  });
}

function noteFolderButton(folder, selectedFolder, notes) {
  const count = notes.filter((note) => (note.folderId || "inbox") === folder.id).length;
  return `<button type="button" class="${selectedFolder === folder.id ? "active" : ""}" data-note-folder="${folder.id}" style="--folder-color:${folder.color}"><i></i>${escapeHTML(folder.name)} <strong>${count}</strong></button>`;
}

function emptyNotes(query, selectedFolder) {
  const empty = document.createElement("article");
  empty.className = "notes-empty glass";
  empty.innerHTML = `
    ${icons.note}
    <h2>${query ? "No matching notes." : selectedFolder === "all" ? "No notes yet." : "Nothing filed here."}</h2>
    <p>${query ? "Try a smaller search or clear the field." : "Start with one thought. You can open it again, edit it, pin it, or move it into a folder later."}</p>
  `;
  return empty;
}

function noteCard(note, folders, actions) {
  const folder = folders.find((item) => item.id === (note.folderId || "inbox"));
  const card = document.createElement("article");
  card.className = `note-card glass${note.pinned ? " pinned" : ""}`;
  card.innerHTML = `
    <button class="note-card-open" type="button" aria-label="Open note">
      <div class="note-card-meta">
        <span>${note.pinned ? "Pinned" : formatDate(note.updatedAt || note.createdAt)}</span>
        <span class="note-folder-dot" style="--folder-color:${folder?.color || "#9CFF00"}">${escapeHTML(folder?.name || "Inbox")}</span>
      </div>
      <h2>${escapeHTML(note.title || "Untitled note")}</h2>
      ${note.body ? `<p>${escapeHTML(note.body)}</p>` : "<p>No extra text yet.</p>"}
    </button>
    <div class="note-card-actions">
      <button type="button" data-action="pin" aria-label="${note.pinned ? "Unpin note" : "Pin note"}">${icons.layers}</button>
      <button type="button" data-action="delete" aria-label="Delete note">${icons.trash}</button>
    </div>
  `;
  card.querySelector(".note-card-open").addEventListener("click", () => actions.onOpenNote?.(note.id));
  card.querySelector('[data-action="pin"]').addEventListener("click", () => actions.onToggleNotePin?.(note.id));
  card.querySelector('[data-action="delete"]').addEventListener("click", () => actions.onDeleteNote?.(note.id));
  return card;
}

function noteEditor(note, folders, actions) {
  const backdrop = document.createElement("div");
  backdrop.className = "note-editor-backdrop";
  backdrop.innerHTML = `
    <form class="note-editor glass" aria-label="Edit note">
      <div class="sheet-handle"></div>
      <div class="note-editor-top">
        <button type="button" data-action="close" aria-label="Close editor">${icons.chevronRight}</button>
        <span class="mono-label">${formatDate(note.updatedAt || note.createdAt)}</span>
        <button type="button" data-action="pin" aria-label="${note.pinned ? "Unpin note" : "Pin note"}">${icons.layers}</button>
      </div>
      <input name="title" value="${escapeAttr(note.title)}" placeholder="Title" autocomplete="off" />
      <textarea name="body" rows="10" placeholder="Start writing...">${escapeHTML(note.body || "")}</textarea>
      <label class="note-folder-select">
        <span class="mono-label">Folder</span>
        <select name="folderId">
          ${folders.map((folder) => `<option value="${folder.id}" ${folder.id === (note.folderId || "inbox") ? "selected" : ""}>${escapeHTML(folder.name)}</option>`).join("")}
        </select>
      </label>
      <div class="note-editor-actions">
        <button type="button" data-action="delete">${icons.trash}<span>Delete</span></button>
        <button type="submit">${icons.tasks}<span>Done</span></button>
      </div>
    </form>
  `;

  const form = backdrop.querySelector("form");
  const close = () => actions.onCloseNote?.();
  const save = () => {
    actions.onUpdateNote?.(note.id, {
      title: form.elements.title.value,
      body: form.elements.body.value,
      folderId: form.elements.folderId.value
    });
  };
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) save();
  });
  form.querySelector('[data-action="close"]').addEventListener("click", save);
  form.querySelector('[data-action="pin"]').addEventListener("click", () =>
    actions.onUpdateNote?.(note.id, {
      title: form.elements.title.value,
      body: form.elements.body.value,
      folderId: form.elements.folderId.value,
      keepOpen: true,
      togglePin: true
    })
  );
  form.querySelector('[data-action="delete"]').addEventListener("click", () => actions.onDeleteNote?.(note.id));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    save();
  });
  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.addEventListener("focus", () => {
      window.setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), 80);
    });
  });
  return backdrop;
}

function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Today" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
