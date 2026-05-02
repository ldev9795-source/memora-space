# Memora Space

Mobile-first PWA task manager with timeline tasks, calendar planning, stash/archive, onboarding, and Supabase-ready auth.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Supabase Auth

1. Create a Supabase project.
2. In Supabase Auth, enable Google provider.
3. Open Authentication → URL Configuration:
   - Set Site URL to `https://www.memoraspace.online`
   - Add Redirect URLs for `https://www.memoraspace.online/`, `https://memoraspace.online/`, `https://memora-space.vercel.app/`, and any local dev server you actually run, such as `http://localhost:4173/`
   - Remove `http://localhost:3000` unless you are running this app on port 3000.
4. Copy `supabase.config.example.js` values into `supabase.config.js`:

```js
window.MEMORA_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY",
  siteUrl: "https://www.memoraspace.online/"
};
```

For Google Cloud OAuth, set the authorized redirect URI to your Supabase callback:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

The authorized JavaScript origins should include `https://www.memoraspace.online`, `https://memoraspace.online`, and `https://memora-space.vercel.app`.

The app uses:
- Google OAuth via `signInWithOAuth({ provider: "google" })`
- Email OTP via `signInWithOtp` and `verifyOtp`

Do not put Supabase service role or secret keys in this browser app.
