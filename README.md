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
3. Add your local and production app URLs to Supabase Auth redirect URLs.
4. Copy `supabase.config.example.js` values into `supabase.config.js`:

```js
window.MEMORA_SUPABASE_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
};
```

The app uses:
- Google OAuth via `signInWithOAuth({ provider: "google" })`
- Email OTP via `signInWithOtp` and `verifyOtp`

Do not put Supabase service role or secret keys in this browser app.
