import { TaskItem } from "./TaskItem.js";

export function TimelineList(tasks, actions = {}, options = {}) {
  const root = document.createElement("section");
  const isGrid = options.viewMode === "grid";
  root.className = `timeline${options.variant ? ` timeline-${options.variant}` : ""}${isGrid ? " timeline-grid-mode" : ""}`;
  const visibleTasks = tasks.filter((task) => !task.stashed);

  if (!visibleTasks.length && !options.notes?.length) {
    root.innerHTML = `<p class="empty-state">NO TASKS HERE. THE SPACE IS CLEAR.</p>`;
    return root;
  }

  if (isGrid) {
    const grid = document.createElement("div");
    grid.className = "task-grid";
    const notes = (options.notes || []).map((note) => ({ ...note, type: "note" }));
    const taskCards = visibleTasks.map((task) => ({ ...task, type: "task", time: task.dueTime || "09:00" }));
    [...notes, ...taskCards]
      .sort((a, b) => (a.time || "09:00").localeCompare(b.time || "09:00"))
      .forEach((item) => {
        if (item.type === "note") {
          const note = document.createElement("article");
          note.className = "journal journal-card";
          note.innerHTML = `<span class="timestamp-pill">${formatTime(item.time || "10:30")}</span><p>${escapeHTML(item.text)}</p>`;
          grid.append(note);
          return;
        }
        grid.append(TaskItem(item, actions, { justCompleted: item.id === options.completedEffectId, mode: "grid" }));
      });
    root.append(grid);
    return root;
  }

  const groups = groupByTime(visibleTasks, options.notes || []);
  groups.forEach((group) => {
    const section = document.createElement("div");
    section.className = "timeline-group";
    section.innerHTML = `<span class="timestamp-pill">${formatTime(group.time)}</span><div class="timeline-content"></div>`;
    const content = section.querySelector(".timeline-content");

    group.notes.forEach((note) => {
      const p = document.createElement("p");
      p.className = "journal";
      p.textContent = note.text;
      content.append(p);
    });

    group.tasks.forEach((task) => content.append(TaskItem(task, actions, { justCompleted: task.id === options.completedEffectId })));
    root.append(section);
  });

  return root;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function groupByTime(tasks, notes) {
  const map = new Map();

  [...tasks]
    .sort((a, b) => `${a.dueDate || ""}${a.dueTime || ""}`.localeCompare(`${b.dueDate || ""}${b.dueTime || ""}`))
    .forEach((task) => {
      const key = task.dueTime || "09:00";
      if (!map.has(key)) map.set(key, { time: key, tasks: [], notes: [] });
      map.get(key).tasks.push(task);
    });

  notes.forEach((note) => {
    const key = note.time || "10:30";
    if (!map.has(key)) map.set(key, { time: key, tasks: [], notes: [] });
    map.get(key).notes.push(note);
  });

  return [...map.values()].sort((a, b) => a.time.localeCompare(b.time));
}

function formatTime(value) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}
