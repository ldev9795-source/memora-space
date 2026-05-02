import { BottomDock } from "./components/BottomDock.js";
import { AddTaskSheet } from "./components/AddTaskSheet.js";
import { TodayView } from "./views/Today.js";
import { AllTasksView } from "./views/AllTasks.js";
import { CalendarView } from "./views/Calendar.js";
import { StashView } from "./views/Stash.js";
import { SettingsView } from "./views/Settings.js";
import { ProfileView } from "./views/Profile.js";
import { LoginView } from "./views/Login.js";
import { OnboardingView } from "./views/Onboarding.js";
import {
  getSessionUser,
  isSupabaseConfigured,
  sendEmailOtp,
  signInWithGoogle,
  signOutSupabase,
  verifyEmailOtp
} from "./lib/supabaseClient.js";
import {
  clearAuthUser,
  getAuthUser,
  getOnboardingDone,
  getTheme,
  loadTasks,
  saveTasks,
  setAuthUser,
  setOnboardingDone,
  setTheme,
  todayISO
} from "./store/tasks.js";

const app = document.querySelector("#app");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const state = {
  tab: "today",
  filter: "all",
  query: "",
  selectedDate: todayISO(),
  onboardingDone: getOnboardingDone(),
  onboardingStep: 0,
  authUser: getAuthUser(),
  pendingEmail: "",
  pendingCode: "",
  authMessage: "",
  calendarMode: "week",
  calendarSettingsOpen: false,
  tasks: loadTasks(),
  theme: getTheme() || preferredTheme,
  sheetOpen: false,
  editingId: null,
  draftTask: null,
  installReady: false,
  deferredPrompt: null
};

readAuthRedirectMessage();

const actions = {
  onNextOnboarding() {
    state.onboardingStep = Math.min(2, state.onboardingStep + 1);
    render();
  },
  onPrevOnboarding() {
    state.onboardingStep = Math.max(0, state.onboardingStep - 1);
    render();
  },
  onFinishOnboarding() {
    state.onboardingDone = true;
    setOnboardingDone(true);
    render();
  },
  async onGoogleLogin() {
    if (!isSupabaseConfigured()) {
      state.authMessage = "Add Supabase URL and publishable key in supabase.config.js first.";
      render();
      return;
    }
    try {
      state.authMessage = "Opening Google...";
      render();
      await signInWithGoogle();
    } catch (error) {
      state.authMessage = error.message || "Google sign-in failed.";
      render();
    }
  },
  onGuestLogin() {
    state.authUser = {
      id: "guest",
      name: "Guest workspace",
      email: "",
      provider: "guest",
      createdAt: new Date().toISOString()
    };
    state.authMessage = "";
    setAuthUser(state.authUser);
    render();
  },
  async onSendEmailCode(email) {
    state.pendingEmail = String(email || "").trim();
    if (!isSupabaseConfigured()) {
      state.pendingCode = String(Math.floor(100000 + Math.random() * 900000));
      state.authMessage = `Demo code: ${state.pendingCode}. Configure Supabase for real email.`;
      render();
      return;
    }
    try {
      await sendEmailOtp(state.pendingEmail);
      state.pendingCode = "";
      state.authMessage = "Check your email for the verification code.";
      render();
    } catch (error) {
      state.authMessage = error.message || "Could not send email code.";
      render();
    }
  },
  async onVerifyEmail(code) {
    if (isSupabaseConfigured()) {
      try {
        const user = await verifyEmailOtp(state.pendingEmail, String(code || "").trim());
        state.authUser = user;
        state.pendingEmail = "";
        state.pendingCode = "";
        state.authMessage = "";
        setAuthUser(state.authUser);
        render();
      } catch (error) {
        state.authMessage = error.message || "Could not verify code.";
        render();
      }
      return;
    }
    if (String(code || "").trim() !== state.pendingCode) {
      state.authMessage = "Code did not match.";
      render();
      return;
    }
    state.authUser = {
      id: crypto.randomUUID(),
      name: state.pendingEmail.split("@")[0] || "Email user",
      email: state.pendingEmail,
      provider: "email",
      createdAt: new Date().toISOString()
    };
    state.pendingEmail = "";
    state.pendingCode = "";
    state.authMessage = "";
    setAuthUser(state.authUser);
    render();
  },
  async onLogout() {
    await signOutSupabase();
    clearAuthUser();
    state.authUser = null;
    state.tab = "today";
    render();
  },
  onTab(tab) {
    state.tab = tab;
    state.calendarSettingsOpen = false;
    render();
  },
  onSettings() {
    state.tab = "settings";
    state.sheetOpen = false;
    state.calendarSettingsOpen = false;
    render();
  },
  onProfile() {
    state.tab = "profile";
    state.sheetOpen = false;
    state.calendarSettingsOpen = false;
    render();
  },
  onAdd() {
    state.sheetOpen = true;
    state.editingId = null;
    state.draftTask = null;
    state.calendarSettingsOpen = false;
    render();
  },
  onAddForDate(date, kind = "task") {
    state.sheetOpen = true;
    state.editingId = null;
    state.calendarSettingsOpen = false;
    state.draftTask = {
      dueDate: date,
      dueTime: kind === "reminder" ? "09:00" : "12:00",
      priority: kind === "reminder" ? "medium" : "low",
      title: kind === "reminder" ? "Reminder" : "",
      tags: kind === "reminder" ? ["reminder"] : ["event"],
      submitLabel: kind === "reminder" ? "ADD REMINDER" : "ADD EVENT"
    };
    render();
  },
  onEdit(id) {
    state.sheetOpen = true;
    state.editingId = id;
    state.draftTask = null;
    state.calendarSettingsOpen = false;
    render();
  },
  onClose() {
    state.sheetOpen = false;
    state.editingId = null;
    state.draftTask = null;
    render();
  },
  onSave(task) {
    state.tasks = state.editingId ? state.tasks.map((item) => (item.id === task.id ? task : item)) : [task, ...state.tasks];
    state.sheetOpen = false;
    state.editingId = null;
    state.draftTask = null;
    persist();
  },
  onToggle(id) {
    state.tasks = state.tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            completed: !task.completed,
            completedAt: task.completed ? undefined : new Date().toISOString()
          }
        : task
    );
    persist();
  },
  onDelete(id) {
    state.tasks = state.tasks.filter((task) => task.id !== id);
    persist();
  },
  onStash(id, stashed = true) {
    state.tasks = state.tasks.map((task) => (task.id === id ? { ...task, stashed } : task));
    persist();
  },
  onFilter(filter) {
    state.filter = filter;
    render();
  },
  onSearch(query) {
    state.query = query;
    render();
  },
  onSelect(date) {
    state.selectedDate = date;
    state.calendarSettingsOpen = false;
    render();
  },
  onCalendarMode(mode) {
    state.calendarMode = mode;
    state.calendarSettingsOpen = false;
    render();
  },
  onCalendarMove(amount) {
    const date = new Date(`${state.selectedDate}T00:00:00`);
    if (state.calendarMode === "month") {
      date.setMonth(date.getMonth() + amount);
    } else {
      date.setDate(date.getDate() + amount * 7);
    }
    state.selectedDate = localISO(date);
    state.calendarSettingsOpen = false;
    render();
  },
  onCalendarToday() {
    state.selectedDate = todayISO();
    state.calendarSettingsOpen = false;
    render();
  },
  onCalendarSettings() {
    state.calendarSettingsOpen = !state.calendarSettingsOpen;
    render();
  },
  onTheme() {
    state.theme = state.theme === "dark" ? "light" : "dark";
    setTheme(state.theme);
    render();
  },
  onSetTheme(theme) {
    state.theme = theme;
    setTheme(state.theme);
    render();
  },
  onResetTasks() {
    if (!confirm("Delete every local task and restore the starter data?")) return;
    localStorage.removeItem("memora_tasks");
    state.tasks = loadTasks();
    state.tab = "today";
    render();
  },
  async onInstall() {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    await state.deferredPrompt.userChoice;
    state.deferredPrompt = null;
    state.installReady = false;
    render();
  }
};

function readAuthRedirectMessage() {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const params = queryParams.get("error") || queryParams.get("error_description") ? queryParams : hashParams;
  const oauthError = params.get("error_description") || params.get("error");
  if (!oauthError) return;
  state.onboardingDone = true;
  setOnboardingDone(true);
  state.authMessage = oauthError.replace(/\+/g, " ");
  window.history.replaceState({}, document.title, window.location.pathname || "/");
}

function persist() {
  saveTasks(state.tasks);
  render();
}

function render() {
  document.documentElement.dataset.theme = state.theme;
  app.replaceChildren();
  if (!state.onboardingDone) {
    app.append(OnboardingView(state, actions));
    return;
  }
  if (!state.authUser) {
    app.append(LoginView(state, actions));
    return;
  }
  const view = {
    today: TodayView,
    tasks: AllTasksView,
    calendar: CalendarView,
    stash: StashView,
    settings: SettingsView,
    profile: ProfileView
  }[state.tab](state, actions);

  app.append(view, BottomDock(state.tab, actions));
  if (state.sheetOpen) app.append(AddTaskSheet(actions, state.tasks.find((task) => task.id === state.editingId), state.draftTask || {}));
}

function localISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.deferredPrompt = event;
  state.installReady = true;
  render();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => registration.update());
  });
}

render();

async function hydrateSupabaseSession() {
  const user = await getSessionUser();
  if (!user) return;
  state.authUser = user;
  setAuthUser(user);
  render();
}

hydrateSupabaseSession();
