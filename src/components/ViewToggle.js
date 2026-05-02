import { icons } from "./icons.js";

export function ViewToggle(mode = "list", actions = {}, label = "View mode") {
  const root = document.createElement("div");
  root.className = "view-toggle";
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", label);
  root.innerHTML = `
    <button class="${mode === "list" ? "active" : ""}" type="button" data-view-mode="list" aria-pressed="${mode === "list"}" aria-label="List view">${icons.list}</button>
    <button class="${mode === "grid" ? "active" : ""}" type="button" data-view-mode="grid" aria-pressed="${mode === "grid"}" aria-label="Grid view">${icons.grid}</button>
  `;

  root.querySelectorAll("[data-view-mode]").forEach((button) => {
    button.addEventListener("click", () => actions.onViewMode?.(button.dataset.viewMode));
  });

  return root;
}
