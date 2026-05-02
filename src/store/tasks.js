const STORAGE_KEY = "memora_tasks";
const FOLDERS_KEY = "memora_folders";
const THEME_KEY = "memora_theme";
const ONBOARDING_KEY = "memora_onboarding_done";
const AUTH_KEY = "memora_auth_user";

const seedFolders = [
  {
    id: "inbox",
    name: "Inbox",
    color: "#0A84FF",
    description: "Saved tasks and ideas that need a home.",
    archived: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "ideas",
    name: "Ideas",
    color: "#9CFF00",
    description: "Loose thoughts, drafts, and someday items.",
    archived: false,
    createdAt: new Date().toISOString()
  }
];

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const tasks = JSON.parse(raw);
    return Array.isArray(tasks) ? tasks : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function loadFolders() {
  const raw = localStorage.getItem(FOLDERS_KEY);
  if (!raw) {
    saveFolders(seedFolders);
    return seedFolders;
  }

  try {
    const folders = JSON.parse(raw);
    return Array.isArray(folders) && folders.length ? folders : seedFolders;
  } catch {
    saveFolders(seedFolders);
    return seedFolders;
  }
}

export function saveFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function createTask(data) {
  return {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    notes: data.notes?.trim() || "",
    completed: false,
    stashed: false,
    folderId: data.folderId || "",
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
