# Onboarding flows

## Web (`apps/web`)

- **Supabase Auth** → after OAuth / magic link, **`/auth/callback`** reads `farm_profiles` and:
  - sends the user to **`/onboarding`** if the row is missing or `onboarding_completed` is not `true`;
  - otherwise redirects to the `next` query param (default `/dashboard`).
- **Onboarding UI:** **`/onboarding`** — steps: cultures → region & hectares → experience → review; saves to **`farm_profiles`** via Supabase (`onboarding_completed: true`), then navigates to **`/dashboard`**.
- Requires **RLS / tables** for `farm_profiles` in Supabase (see product SQL migrations).

## Mobile (`apps/mobile`)

1. **First launch:** **`/`** (`app/index.tsx`) checks AsyncStorage `@agrinexus/welcome_seen`. If unset → **`/welcome`** (hero + bullets + **Continue** / **Sign in**).
2. **Welcome → Continue** sets `welcome_seen` and routes to **`/(tabs)`** as guest, or to **`/onboarding`** if already signed in but farm profile not saved.
3. **Sign in** from welcome sets `welcome_seen` first so cold start after login does not loop on welcome.
4. **Signed-in users:** if **`@agrinexus/mobile_farm_profile_v1`** is missing → **`/onboarding`** (crops + region + ha) → save JSON locally → **`/(tabs)`**.
5. **New sign-in / sign-out** clears the mobile farm profile key so the next user (or same user after logout) completes onboarding again.

Implementation: `lib/mobileFarmProfile.ts`, screens `app/welcome.tsx`, `app/onboarding.tsx`, gate `app/index.tsx`.

## Env hints

- Mobile: `EXPO_PUBLIC_WEB_ORIGIN`, `EXPO_PUBLIC_BACKEND_URL` (see `apps/mobile/README.md`).
- Web callback: Supabase **redirect URLs** must include `/auth/callback`.
