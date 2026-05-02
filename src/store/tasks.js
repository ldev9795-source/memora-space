const STORAGE_KEY = "memora_tasks";
const THEME_KEY = "memora_theme";
const ONBOARDING_KEY = "memora_onboarding_done";
const AUTH_KEY = "memora_auth_user";

const today = new Date();
const isoToday = localISO(today);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextMonday = new Date(today);
nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7));

const seedTasks = [
  {
    id: crypto.randomUUID(),
    title: "Finish the wireframe",
    notes: "Lock the timeline spacing and bottom dock hit targets.",
    completed: false,
    stashed: false,
    priority: "high",
    tags: ["design"],
    dueDate: isoToday,
    dueTime: "12:30",
    subtasks: [
      { id: crypto.randomUUID(), title: "Header", completed: true },
      { id: crypto.randomUUID(), title: "Timeline", completed: false },
      { id: crypto.randomUUID(), title: "Dock", completed: false },
      { id: crypto.randomUUID(), title: "Sheet", completed: false }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Email Jonelle about cashback",
    completed: false,
    stashed: false,
    priority: "medium",
    tags: ["admin"],
    dueDate: isoToday,
    dueTime: "12:30",
    subtasks: [],
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Go and check mail box",
    completed: false,
    stashed: false,
    priority: "low",
    tags: ["home"],
    dueDate: localISO(nextMonday),
    dueTime: "12:30",
    subtasks: [{ id: crypto.randomUUID(), title: "Bring keys", completed: false }],
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Plan launch reminders",
    notes: "Add weekly review dots to the calendar card.",
    completed: false,
    stashed: false,
    priority: "medium",
    tags: ["product"],
    dueDate: tomorrow.toISOString().slice(0, 10),
    dueTime: "13:30",
    subtasks: [],
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Hi Google, thanks for the award. Being indie feels excellent.",
    completed: false,
    stashed: true,
    priority: "low",
    tags: ["stashed"],
    dueDate: isoToday,
    dueTime: "18:17",
    subtasks: [],
    createdAt: new Date().toISOString()
  }
];

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveTasks(seedTasks);
    return seedTasks;
  }

  try {
    return JSON.parse(raw);
  } catch {
    saveTasks(seedTasks);
    return seedTasks;
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(data) {
  return {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    notes: data.notes?.trim() || "",
    completed: false,
    stashed: false,
    priority: data.priority || "low",
    tags: data.tags || [],
    dueDate: data.dueDate || isoToday,
    dueTime: data.dueTime || "",
    subtasks: data.subtasks || [],
    createdAt: new Date().toISOString()
  };
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY);
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getOnboardingDone() {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function setOnboardingDone(done) {
  localStorage.setItem(ONBOARDING_KEY, String(done));
}

export function getAuthUser() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_KEY);
}

export function todayISO() {
  return localISO(new Date());
}

function localISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
