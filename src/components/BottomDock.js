import { icons } from "./icons.js";

const tabs = [
  ["today", "Today", icons.today],
  ["tasks", "Planner", icons.tasks],
  ["calendar", "Notes", icons.note],
  ["stash", "Folders", icons.stash]
];

export function BottomDock(activeTab, actions) {
  const dock = document.createElement("nav");
  dock.className = "bottom-dock glass";
  dock.setAttribute("aria-label", "Primary");

  tabs.forEach(([id, label, icon]) => {
    const button = document.createElement("button");
    button.className = `dock-tab${activeTab === id || ((activeTab === "settings" || activeTab === "profile") && id === "today") ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", label);
    button.innerHTML = `${icon}<span class="dock-label">${label}</span>`;
    button.addEventListener("click", () => actions.onTab(id));
    dock.append(button);
  });

  const fab = document.createElement("button");
  fab.className = "dock-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", activeTab === "calendar" ? "Add note" : "Add task");
  fab.innerHTML = icons.plus;
  fab.addEventListener("click", actions.onAdd);
  dock.append(fab);
  return dock;
}
