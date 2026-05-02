import { icons } from "../components/icons.js";

export function StashView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page";
  const stashed = state.tasks.filter((task) => task.stashed).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const highPriority = stashed.filter((task) => task.priority === "high").length;

  root.innerHTML = `
    <header class="topbar">
      <div>
        <div class="date-kicker">SAVED</div>
        <h1 class="display-title">Stash</h1>
      </div>
      <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
    </header>
    <section class="stash-summary glass soft-card">
      <div class="stash-summary-icon">${icons.layers}</div>
      <div>
        <span class="mono-label">Stashed</span>
        <strong>${stashed.length}</strong>
        <p>${stashed.length ? "Saved ideas and paused tasks, ready when you are." : "Nothing saved yet. Stash tasks from the timeline to see them here."}</p>
      </div>
      <button class="stash-summary-add" type="button" aria-label="Add new task">${icons.plus}</button>
    </section>
    <div class="stash-toolbar">
      <label class="stash-search glass">
        ${icons.search}
        <input type="search" placeholder="Search stash" autocomplete="off" />
      </label>
      <span class="stash-chip">${highPriority} high</span>
    </div>
    <section class="stash-list" aria-label="Stashed items"></section>
  `;
  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelector(".stash-summary-add").addEventListener("click", actions.onAdd);
  const list = root.querySelector(".stash-list");
  const search = root.querySelector(".stash-search input");

  const renderList = (query = "") => {
    list.replaceChildren();
    const needle = query.trim().toLowerCase();
    const visible = needle
      ? stashed.filter((task) => `${task.title} ${task.notes || ""} ${(task.tags || []).join(" ")}`.toLowerCase().includes(needle))
      : stashed;

    if (!visible.length) {
      list.innerHTML = `<p class="empty-state">${needle ? "NO SAVED ITEMS MATCH." : "NOTHING STASHED YET."}</p>`;
      return;
    }

    visible.forEach((task) => {
      const item = document.createElement("article");
      item.className = "stash-card glass";
      const date = task.dueDate ? new Date(`${task.dueDate}T${task.dueTime || "09:00"}`) : new Date(task.createdAt);
      const tagMarkup = (task.tags || []).slice(0, 3).map((tag) => `<span class="badge">#${escapeHTML(tag)}</span>`).join("");
      item.innerHTML = `
        <div class="stash-card-meta">
          <span>${isToday(date) ? "Today" : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          <strong>${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase()}</strong>
        </div>
        <div class="stash-card-body">
          <div class="stash-card-topline">
            <span class="stash-priority ${task.priority}">${task.priority}</span>
          </div>
          <h2>${escapeHTML(task.title)}</h2>
          ${task.notes ? `<p>${escapeHTML(task.notes)}</p>` : ""}
          ${tagMarkup ? `<div class="badges">${tagMarkup}</div>` : ""}
          <div class="stash-actions">
            <button type="button" data-action="fetch">${icons.undo}<span>Fetch</span></button>
            <button type="button" data-action="copy">${icons.copy}<span>Copy</span></button>
            <button type="button" data-action="trash">${icons.trash}<span>Delete</span></button>
          </div>
        </div>
      `;
      item.querySelector('[data-action="fetch"]').addEventListener("click", () => actions.onStash(task.id, false));
      item.querySelector('[data-action="copy"]').addEventListener("click", async (event) => {
        await navigator.clipboard?.writeText([task.title, task.notes].filter(Boolean).join("\n"));
        event.currentTarget.querySelector("span").textContent = "Copied";
        setTimeout(() => {
          if (event.currentTarget.isConnected) event.currentTarget.querySelector("span").textContent = "Copy";
        }, 1000);
      });
      item.querySelector('[data-action="trash"]').addEventListener("click", () => actions.onDelete(task.id));
      list.append(item);
    });
  };

  search.addEventListener("input", (event) => renderList(event.target.value));
  renderList();
  return root;
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
