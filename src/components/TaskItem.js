export function TaskItem(task, actions = {}, options = {}) {
  const subCount = task.subtasks?.length || 0;
  const doneSub = task.subtasks?.filter((subtask) => subtask.completed).length || 0;
  const dueBadge = getDueBadge(task);
  const tags = task.tags?.slice(0, 2) || [];
  const priority = task.priority || "low";

  const item = document.createElement("article");
  item.className = `task-item priority-${priority}${options.mode === "grid" ? " task-card-mode" : ""}${task.completed ? " completed" : ""}${options.justCompleted ? " completed-pop" : ""}`;
  item.dataset.id = task.id;

  item.innerHTML = `
    <button class="task-checkbox ${task.completed ? "checked" : ""}" aria-label="${task.completed ? "Mark incomplete" : "Mark complete"}">
      ${task.completed ? "✓" : ""}
    </button>
    <div>
      <p class="task-title">${escapeHTML(task.title)}</p>
      ${task.notes ? `<p class="task-notes">${escapeHTML(task.notes)}</p>` : ""}
      <div class="badges">
        ${dueBadge ? `<span class="badge filled">${dueBadge}</span>` : ""}
        ${subCount ? `<span class="badge">${doneSub}/${subCount}</span>` : ""}
        <span class="badge priority-badge priority-${priority}">${priority}</span>
        ${tags.map((tag) => `<span class="badge">#${escapeHTML(tag)}</span>`).join("")}
      </div>
    </div>
    <div class="task-actions">
      ${subCount ? `<span class="expand" aria-hidden="true">↗</span>` : ""}
    </div>
  `;

  item.querySelector(".task-checkbox").addEventListener("click", () => {
    item.classList.add("pulse");
    actions.onToggle?.(task.id);
  });

  item.querySelector(".task-title").addEventListener("click", () => actions.onEdit?.(task.id));

  let startX = 0;
  let currentX = 0;
  item.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    currentX = event.clientX;
    item.setPointerCapture(event.pointerId);
  });

  item.addEventListener("pointermove", (event) => {
    currentX = event.clientX;
    const diff = Math.max(-82, Math.min(82, currentX - startX));
    item.style.transform = `translateX(${diff * 0.35}px)`;
  });

  item.addEventListener("pointerup", () => {
    const diff = currentX - startX;
    item.style.transform = "";
    if (diff > 72) actions.onToggle?.(task.id);
    if (diff < -72) actions.onDelete?.(task.id);
  });

  item.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    item.classList.add("pulse");
    actions.onStash?.(task.id);
  });

  return item;
}

function getDueBadge(task) {
  if (!task.dueDate) return "";
  const due = new Date(`${task.dueDate}T00:00:00`);
  const now = new Date();
  const today = new Date(`${localISO(now)}T00:00:00`);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0) return "overdue";
  if (diff === 0) return task.dueTime ? formatClock(task.dueTime) : "today";
  if (diff === 1) return "tomorrow";
  if (diff < 7) return `${diff} days`;
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatClock(value) {
  const [hours = "0", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
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
