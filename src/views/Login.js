import { icons } from "../components/icons.js";

export function LoginView(state, actions) {
  const root = document.createElement("main");
  root.className = "auth-page page";
  const sent = Boolean(state.pendingEmail);

  root.innerHTML = `
    <section class="auth-card glass">
      <span class="auth-mark">${icons.layers}</span>
      <div class="auth-copy">
        <span class="mono-label">Sign in</span>
        <h1>Start with your account.</h1>
        <p>Use Google for one-tap access or verify your email. Supabase Auth can replace this local session when your keys are ready.</p>
      </div>

      <button class="google-button" type="button">
        <span>G</span>
        Continue with Google
      </button>

      <form class="email-auth">
        <label>
          <span class="mono-label">Email verification</span>
          <input type="email" name="email" placeholder="you@example.com" autocomplete="email" value="${state.pendingEmail || ""}" required />
        </label>
        ${sent ? '<label><span class="mono-label">Code</span><input type="text" name="code" inputmode="numeric" maxlength="6" placeholder="123456" required /></label>' : ""}
        <button class="auth-primary" type="submit">${sent ? "Verify Email" : "Send Code"}</button>
      </form>

      <div class="auth-footer">
        <button type="button" class="guest-button">Continue as guest</button>
      </div>
      <p class="auth-feedback mono-label" aria-live="polite">${state.authMessage || ""}</p>
    </section>
  `;

  root.querySelector(".google-button").addEventListener("click", actions.onGoogleLogin);
  root.querySelector(".guest-button").addEventListener("click", actions.onGuestLogin);
  root.querySelector(".email-auth").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (sent) {
      actions.onVerifyEmail(data.get("code"));
    } else {
      actions.onSendEmailCode(data.get("email"));
    }
  });

  return root;
}
