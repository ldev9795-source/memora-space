import { TimelineList } from "../components/TimelineList.js";
import { icons } from "../components/icons.js";
import { todayISO } from "../store/tasks.js";

export function TodayView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page";
  const todayTasks = state.tasks.filter((task) => task.dueDate === todayISO() && !task.stashed);
  const activeCount = todayTasks.filter((task) => !task.completed).length;
  const doneCount = todayTasks.filter((task) => task.completed).length;
  const focusTags = [...new Set(todayTasks.flatMap((task) => task.tags || []))].slice(0, 3);
  const overdue = state.tasks.some((task) => task.dueDate < todayISO() && !task.completed && !task.stashed);

  root.innerHTML = `
    <header class="topbar">
      <div>
        <div class="date-kicker">${new Date().toLocaleDateString(undefined, { month: "short", day: "2-digit" })}${overdue ? '<span class="red-dot"></span>' : ""}</div>
        <h1 class="display-title">Today</h1>
      </div>
      <div>
        <button class="icon-button theme-toggle" type="button" aria-label="Toggle theme">${state.theme === "dark" ? icons.sun : icons.moon}</button>
        <button class="icon-button settings-open" type="button" aria-label="Open settings">${icons.gear}</button>
      </div>
    </header>
    <section class="install-banner glass">
      <span class="mono-label">Install Memora Space</span>
      <button class="pill-toggle active" type="button">Add</button>
    </section>
    <section class="today-insights" aria-label="Today overview">
      <span><strong>${activeCount}</strong> Active</span>
      <span><strong>${doneCount}</strong> Done</span>
      ${focusTags.length ? focusTags.map((tag) => `<span>#${escapeHTML(tag)}</span>`).join("") : "<span>Clear focus</span>"}
    </section>
  `;

  root.querySelector(".theme-toggle").addEventListener("click", actions.onTheme);
  root.querySelector(".settings-open").addEventListener("click", actions.onSettings);
  const banner = root.querySelector(".install-banner");
  if (state.installReady) {
    banner.classList.add("show");
    banner.querySelector("button").addEventListener("click", actions.onInstall);
  }

  root.append(
    TimelineList(todayTasks, actions, {
      notes: [
        {
          time: "10:30",
          text: "Had a great day at work today. Made progress on the project and received positive feedback from the team. Inspiration for brand aesthetics."
        },
        {
          time: "13:30",
          text: "This space keeps notes and tasks in one quiet stream. Finish what matters, stash what can wait, and let the day stay readable."
        }
      ],
      completedEffectId: state.completedEffectId
    })
  );

  const input = document.createElement("button");
  input.className = "quick-input glass";
  input.type = "button";
  input.innerHTML = `${icons.plus}<span>Start typing...</span>${icons.mic}`;
  input.addEventListener("click", actions.onAdd);
  root.append(input);
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
