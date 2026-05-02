import { createTask, todayISO } from "../store/tasks.js";

export function AddTaskSheet(actions, task = null, draft = {}) {
  const safeDraft = draft || {};
  const isEditing = Boolean(task);
  const tags = task?.tags?.join(", ") || "";
  const title = task?.title || safeDraft.title || "";
  const notes = task?.notes || safeDraft.notes || "";
  const dueDate = task?.dueDate || safeDraft.dueDate || todayISO();
  const dueTime = task?.dueTime || safeDraft.dueTime || "";
  const priority = task?.priority || safeDraft.priority || "low";
  const tagValue = tags || safeDraft.tags?.join(", ") || "";
  const submitLabel = isEditing ? "UPDATE TASK" : safeDraft.submitLabel || "ADD TASK";
  const overlay = document.createElement("div");
  overlay.className = "sheet-backdrop";
  overlay.innerHTML = `
    <form class="add-sheet glass" aria-label="Add task">
      <button class="sheet-handle" type="button" aria-label="Close add task"></button>
      <label>
        <span class="mono-label">Task</span>
        <input name="title" class="title-input" placeholder="START TYPING..." autocomplete="off" required value="${escapeAttr(title)}" />
      </label>
      <label>
        <span class="mono-label">Notes</span>
        <textarea name="notes" rows="3" placeholder="Optional notes">${escapeHTML(notes)}</textarea>
      </label>
      <div class="sheet-grid">
        <label>
          <span class="mono-label">Date</span>
          <input name="dueDate" type="date" value="${dueDate}" />
        </label>
        <label>
          <span class="mono-label">Time</span>
          <input name="dueTime" type="time" value="${dueTime}" />
        </label>
      </div>
      <fieldset>
        <legend class="mono-label">Priority</legend>
        <div class="segmented priority-row">
          <label><input type="radio" name="priority" value="low" ${priority === "low" ? "checked" : ""} /> Low</label>
          <label><input type="radio" name="priority" value="medium" ${priority === "medium" ? "checked" : ""} /> Medium</label>
          <label><input type="radio" name="priority" value="high" ${priority === "high" ? "checked" : ""} /> High</label>
        </div>
      </fieldset>
      <label>
        <span class="mono-label">Tags</span>
        <input name="tags" placeholder="design, home, admin" autocomplete="off" value="${escapeAttr(tagValue)}" />
      </label>
      <button class="submit-task" type="submit">${submitLabel}</button>
    </form>
  `;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.classList.contains("sheet-handle")) actions.onClose();
  });

  const form = overlay.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const nextTask = createTask({
      title: data.get("title"),
      notes: data.get("notes"),
      dueDate: data.get("dueDate"),
      dueTime: data.get("dueTime"),
      priority: data.get("priority"),
      tags: String(data.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    });
    actions.onSave(isEditing ? { ...task, ...nextTask, id: task.id, completed: task.completed, stashed: task.stashed, folderId: task.folderId, createdAt: task.createdAt } : nextTask);
  });

  setTimeout(() => overlay.querySelector(".title-input").focus(), 60);
  return overlay;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHTML(value).replaceAll('"', "&quot;");
}
