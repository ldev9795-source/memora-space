import { icons } from "../components/icons.js";

export function ProfileView(state, actions) {
  const root = document.createElement("main");
  root.className = "phone-frame page settings-page";
  const user = state.authUser || { name: "Guest workspace", email: "", provider: "guest" };
  const provider = user.provider === "google" ? "Google" : user.provider === "email" ? "Email verification" : "Guest";

  root.innerHTML = `
    <header class="settings-nav">
      <button class="icon-button settings-back" type="button" aria-label="Back to Settings">${icons.arrowLeft}</button>
      <h1>Profile</h1>
    </header>

    <section class="profile-hero glass">
      <span class="profile-avatar large">${icons.user}</span>
      <h2>${escapeHTML(user.name)}</h2>
      <p>${user.email ? escapeHTML(user.email) : "Local guest mode. Sign in anytime to sync this workspace."}</p>
    </section>

    <section class="settings-group" aria-label="Account">
      <h2>Account</h2>
      <div class="settings-list glass">
        <div class="settings-row"><span class="settings-row-icon">${icons.shield}</span><span>Status</span><strong class="profile-status">${user.provider === "guest" ? "Guest" : "Signed in"}</strong></div>
        <div class="settings-row"><span class="settings-row-icon">${icons.database}</span><span>Provider</span><strong class="profile-status">${provider}</strong></div>
        <button class="settings-row" type="button" data-action="copy-plan"><span class="settings-row-icon">${icons.copy}</span><span>Copy Auth Plan</span>${icons.chevronRight}</button>
        <button class="settings-row danger" type="button" data-action="logout"><span class="settings-row-icon">${icons.undo}</span><span>Sign Out</span>${icons.chevronRight}</button>
      </div>
      <p class="settings-feedback mono-label" aria-live="polite"></p>
    </section>
  `;

  root.querySelector(".settings-back").addEventListener("click", () => actions.onTab("settings"));
  const feedback = root.querySelector(".settings-feedback");
  root.querySelector('[data-action="copy-plan"]').addEventListener("click", async () => {
    await navigator.clipboard?.writeText("Configure supabase.config.js with your Supabase project URL and publishable key. Enable Google in Supabase Auth Providers, add this app origin to redirect URLs, then the existing Google and email OTP buttons will use Supabase Auth.");
    feedback.textContent = "Auth plan copied.";
  });
  root.querySelector('[data-action="logout"]').addEventListener("click", actions.onLogout);

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
