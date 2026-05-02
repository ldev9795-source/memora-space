export function FolderSheet(actions, folder = null) {
  const isEditing = Boolean(folder);
  const overlay = document.createElement("div");
  overlay.className = "sheet-backdrop";
  overlay.innerHTML = `
    <form class="folder-sheet glass" aria-label="${isEditing ? "Rename folder" : "Create folder"}">
      <button class="sheet-handle" type="button" aria-label="Close folder sheet"></button>
      <div>
        <span class="mono-label">${isEditing ? "Rename" : "New folder"}</span>
        <h2>${isEditing ? "Edit folder" : "Create a folder"}</h2>
        <p>${isEditing ? "Keep the name clear and easy to find." : "Give saved tasks and ideas a place to live."}</p>
      </div>
      <label>
        <span class="mono-label">Folder name</span>
        <input name="name" placeholder="Inbox, Ideas, Work..." autocomplete="off" required value="${escapeAttr(folder?.name || "")}" />
      </label>
      <div class="folder-sheet-actions">
        <button type="button" data-action="cancel">Cancel</button>
        <button type="submit">${isEditing ? "Save" : "Create"}</button>
      </div>
    </form>
  `;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.classList.contains("sheet-handle")) actions.onFolderSheetClose();
  });

  overlay.querySelector('[data-action="cancel"]').addEventListener("click", actions.onFolderSheetClose);
  overlay.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    actions.onFolderSave(String(data.get("name") || "").trim());
  });

  overlay.querySelectorAll("input").forEach((control) => {
    control.addEventListener("focus", () => {
      window.setTimeout(() => {
        control.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 180);
    });
  });

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
