const STORAGE_KEY = "memora_tasks";
const FOLDERS_KEY = "memora_folders";
const NOTES_KEY = "memora_notes";
const THEME_KEY = "memora_theme";
const VIEW_MODE_KEY = "memora_view_mode";
const ONBOARDING_KEY = "memora_onboarding_done";
const AUTH_KEY = "memora_auth_user";
const WORKSPACE_VERSION_KEY = "memora_workspace_version";
const CURRENT_WORKSPACE_VERSION = 2;

const seedFolders = [
  {
    id: "inbox",
    name: "Inbox",
    color: "#9CFF00",
    description: "Saved tasks and ideas that need a home.",
    archived: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "ideas",
    name: "Ideas",
    color: "#060607",
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

export function ensureFreshWorkspace() {
  const version = Number(localStorage.getItem(WORKSPACE_VERSION_KEY) || 0);
  if (version >= CURRENT_WORKSPACE_VERSION) return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(NOTES_KEY);
  localStorage.removeItem(FOLDERS_KEY);
  localStorage.setItem(WORKSPACE_VERSION_KEY, String(CURRENT_WORKSPACE_VERSION));
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
    if (!Array.isArray(folders) || !folders.length) return seedFolders;
    const normalized = normalizeDefaultFolders(folders);
    if (JSON.stringify(normalized) !== JSON.stringify(folders)) saveFolders(normalized);
    return normalized;
  } catch {
    saveFolders(seedFolders);
    return seedFolders;
  }
}

export function saveFolders(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function loadNotes() {
  const raw = localStorage.getItem(NOTES_KEY);
  if (!raw) return [];

  try {
    const notes = JSON.parse(raw);
    return Array.isArray(notes) ? notes : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function createNote(data) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: data.title?.trim() || "Untitled note",
    body: data.body?.trim() || "",
    color: data.color || "default",
    folderId: data.folderId || "inbox",
    pinned: Boolean(data.pinned),
    archived: false,
    createdAt: now,
    updatedAt: now
  };
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
    dueDate: data.dueDate || todayISO(),
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

export function getViewMode() {
  const mode = localStorage.getItem(VIEW_MODE_KEY);
  return mode === "grid" ? "grid" : "list";
}

export function setViewMode(mode) {
  localStorage.setItem(VIEW_MODE_KEY, mode === "grid" ? "grid" : "list");
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

function normalizeDefaultFolders(folders) {
  return folders.map((folder) => {
    if (folder.id === "inbox") return { ...folder, color: "#9CFF00" };
    if (folder.id === "ideas") return { ...folder, color: "#060607" };
    return folder;
  });
}
