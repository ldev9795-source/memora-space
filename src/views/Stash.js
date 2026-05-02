import { icons } from "../components/icons.js";
import { ViewToggle } from "../components/ViewToggle.js";

export function StashView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page folders-page";
  const folders = state.folders || [];
  const activeFolders = folders.filter((folder) => !folder.archived);
  const archivedFolders = folders.filter((folder) => folder.archived);
  const selectedFolder = folders.find((folder) => folder.id === state.folderId) || activeFolders[0] || folders[0];
  const filedTasks = state.tasks.filter((task) => task.stashed);
  const folderTasks = filedTasks.filter((task) => (task.folderId || "inbox") === selectedFolder?.id);

  root.innerHTML = `
    <header class="topbar folders-topbar">
      <div>
        <div class="date-kicker">PERSONAL</div>
        <h1 class="display-title">Folders</h1>
      </div>
      <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
    </header>
    <section class="folder-hero glass">
      <div class="folder-hero-icon" style="--folder-color:${selectedFolder?.color || "#0A84FF"}">${icons.stash}</div>
      <div>
        <span class="mono-label">${filedTasks.length} filed items</span>
        <h2>${escapeHTML(selectedFolder?.name || "Folders")}</h2>
        <p>${escapeHTML(selectedFolder?.description || "Create places for ideas, archived tasks, and reusable notes.")}</p>
      </div>
      <button class="folder-create" type="button" aria-label="Create folder">${icons.plus}</button>
    </section>
    <section class="folder-strip" aria-label="Folders">
      ${activeFolders.map((folder) => folderButton(folder, state.folderId, filedTasks)).join("")}
      ${archivedFolders.length ? `<button class="folder-pill archived" type="button" data-folder-archive-list>Archived ${archivedFolders.length}</button>` : ""}
    </section>
    <div class="folder-tools glass">
      <label class="stash-search glass">
        ${icons.search}
        <input type="search" placeholder="Search folder" autocomplete="off" />
      </label>
      <div class="folder-tool-actions" aria-label="Folder actions">
        <button type="button" data-action="new-task" aria-label="New task">${icons.plus}<span>Task</span></button>
        <button type="button" data-action="rename" aria-label="Rename folder">${icons.copy}<span>Rename</span></button>
        <button type="button" data-action="archive" aria-label="${selectedFolder?.archived ? "Unarchive folder" : "Archive folder"}">${icons.download}<span>${selectedFolder?.archived ? "Unarchive" : "Archive"}</span></button>
        <button type="button" data-action="delete" aria-label="Delete folder">${icons.trash}<span>Delete</span></button>
      </div>
      <div class="view-toggle-slot"></div>
    </div>
    <section class="stash-list folder-task-list" aria-label="Folder items"></section>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelector(".folder-create").addEventListener("click", actions.onFolderCreate);
  root.querySelectorAll("[data-folder]").forEach((button) => {
    button.addEventListener("click", () => actions.onFolderSelect(button.dataset.folder));
  });
  root.querySelector("[data-folder-archive-list]")?.addEventListener("click", () => {
    if (archivedFolders[0]) actions.onFolderSelect(archivedFolders[0].id);
  });
  root.querySelector('[data-action="new-task"]').addEventListener("click", () => actions.onAddToFolder(selectedFolder?.id || "inbox"));
  root.querySelector('[data-action="rename"]').addEventListener("click", () => actions.onFolderEdit(selectedFolder?.id));
  root.querySelector('[data-action="archive"]').addEventListener("click", () => actions.onFolderArchive(selectedFolder?.id));
  root.querySelector('[data-action="delete"]').addEventListener("click", () => actions.onFolderDelete(selectedFolder?.id));
  root.querySelector(".view-toggle-slot").append(ViewToggle(state.viewMode, actions, "Folder view mode"));

  const list = root.querySelector(".folder-task-list");
  const search = root.querySelector(".stash-search input");

  const renderList = (query = "") => {
    list.replaceChildren();
    list.classList.toggle("folder-grid-mode", state.viewMode === "grid");
    const needle = query.trim().toLowerCase();
    const visible = needle
      ? folderTasks.filter((task) => `${task.title} ${task.notes || ""} ${(task.tags || []).join(" ")}`.toLowerCase().includes(needle))
      : folderTasks;

    if (!visible.length) {
      list.innerHTML = `<p class="empty-state">${needle ? "NO ITEMS MATCH THIS FOLDER." : "THIS FOLDER IS EMPTY. ARCHIVE TASKS HERE FROM ANY LIST."}</p>`;
      return;
    }

    visible.forEach((task) => list.append(folderTaskCard(task, folders, actions, state.viewMode)));
  };

  search.addEventListener("input", (event) => renderList(event.target.value));
  renderList();
  return root;
}

function folderButton(folder, selectedId, tasks) {
  const count = tasks.filter((task) => (task.folderId || "inbox") === folder.id).length;
  return `<button class="folder-pill${folder.id === selectedId ? " active" : ""}" type="button" data-folder="${folder.id}" style="--folder-color:${folder.color}"><span></span>${escapeHTML(folder.name)} <strong>${count}</strong></button>`;
}

function folderTaskCard(task, folders, actions, viewMode = "list") {
  const item = document.createElement("article");
  item.className = `stash-card folder-card glass priority-${task.priority || "low"}${task.completed ? " completed" : ""}${viewMode === "grid" ? " folder-card-grid" : ""}`;
  const date = task.dueDate ? new Date(`${task.dueDate}T${task.dueTime || "09:00"}`) : new Date(task.createdAt);
  const tagMarkup = (task.tags || []).slice(0, 3).map((tag) => `<span class="badge">#${escapeHTML(tag)}</span>`).join("");
  item.innerHTML = `
    <div class="stash-card-meta">
      <span>${isToday(date) ? "Today" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      <strong>${formatClock(task.dueTime || "09:00")}</strong>
    </div>
    <div class="stash-card-body">
      <div class="stash-card-topline">
        <span class="stash-priority ${task.priority}">${task.priority}</span>
      </div>
      <h2>${escapeHTML(task.title)}</h2>
      ${task.notes ? `<p>${escapeHTML(task.notes)}</p>` : ""}
      ${tagMarkup ? `<div class="badges">${tagMarkup}</div>` : ""}
      <label class="folder-move">
        <span class="mono-label">Folder</span>
        <select>${folders.filter((folder) => !folder.archived).map((folder) => `<option value="${folder.id}" ${folder.id === (task.folderId || "inbox") ? "selected" : ""}>${escapeHTML(folder.name)}</option>`).join("")}</select>
      </label>
      <div class="stash-actions">
        <button type="button" data-action="fetch">${icons.undo}<span>Fetch</span></button>
        <button type="button" data-action="copy">${icons.copy}<span>Copy</span></button>
        <button type="button" data-action="trash">${icons.trash}<span>Delete</span></button>
      </div>
    </div>
  `;
  item.querySelector("select").addEventListener("change", (event) => actions.onMoveToFolder(task.id, event.target.value));
  item.querySelector('[data-action="fetch"]').addEventListener("click", () => actions.onStash(task.id, false));
  item.querySelector('[data-action="copy"]').addEventListener("click", async (event) => {
    await navigator.clipboard?.writeText([task.title, task.notes].filter(Boolean).join("\n"));
    event.currentTarget.querySelector("span").textContent = "Copied";
    setTimeout(() => {
      if (event.currentTarget.isConnected) event.currentTarget.querySelector("span").textContent = "Copy";
    }, 1000);
  });
  item.querySelector('[data-action="trash"]').addEventListener("click", () => actions.onDelete(task.id));
  return item;
}

function formatClock(value) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

function isToday(date) {
  return localISO(date) === localISO(new Date());
}

function localISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
