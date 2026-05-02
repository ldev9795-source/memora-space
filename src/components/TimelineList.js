import { TaskItem } from "./TaskItem.js";

export function TimelineList(tasks, actions = {}, options = {}) {
  const root = document.createElement("section");
  root.className = "timeline";
  const visibleTasks = tasks.filter((task) => !task.stashed);

  if (!visibleTasks.length && !options.notes?.length) {
    root.innerHTML = `<p class="empty-state">NO TASKS HERE. THE SPACE IS CLEAR.</p>`;
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

    group.tasks.forEach((task) => content.append(TaskItem(task, actions)));
    root.append(section);
  });

  return root;
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
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(":", ".");
}
