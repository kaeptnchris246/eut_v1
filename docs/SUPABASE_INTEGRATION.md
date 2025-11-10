# Supabase Integration Blueprint

This document outlines the steps required to swap local JWT auth for Supabase Auth while keeping the existing Postgres schema intact.

---

## 1. Create Supabase project

1. Sign in at https://supabase.com/ and create a new project.
2. Choose a strong database password and region close to your users.
3. Note the project **URL**, **anon** key, and **service role** key (Settings → API).

---

## 2. Configure environment variables

Update `.env` (backend) with Supabase details:

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

Never expose the service role key to the frontend or end users.

---

## 3. Database schema alignment

The local schema already matches the required structure (`app_users`, `funds`, `commitments`, etc.). Two options exist for user management:

### Option A – Sync via trigger (recommended)

1. In Supabase SQL editor, create `app_users` table (copy from `db/schema.sql`).
2. Create a trigger to sync auth users into `app_users`:

   ```sql
   create or replace function handle_new_auth_user()
   returns trigger as $$
   begin
     insert into app_users (id, email, full_name, role)
     values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'investor')
     on conflict (id) do nothing;
     return new;
   end;
   $$ language plpgsql;

   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure handle_new_auth_user();
   ```

3. Optional: update trigger to set `role` based on metadata.
4. Disable password hashes in `app_users` (no longer required); keep column for backward compatibility but leave null.

### Option B – API-managed users

- Keep `app_users` as-is; on signup call Supabase Admin API (service role key) to create auth user and insert into `app_users` manually.
- Requires secure backend-only route; avoid exposing service key to frontend.

---

## 4. Backend changes

1. Install Supabase client:

   ```bash
   cd api
   npm install @supabase/supabase-js
   ```

2. Replace local password-based `signup`/`login` logic:

   - `POST /auth/signup`: call Supabase Admin API to create user (`supabase.auth.admin.createUser`).
   - `POST /auth/login`: verify credentials via `supabase.auth.signInWithPassword` and proxy the session.
   - `GET /auth/me`: fetch user profile from Supabase using the JWT provided by Supabase.

3. Update JWT middleware to accept Supabase-issued JWTs (validate via Supabase JWKS or use Supabase client with `auth.getUser`).

4. Remove bcrypt hashing (`password_hash`) once Supabase handles passwords.

---

## 5. Frontend adjustments

- Swap local `/auth/login` call with Supabase Auth client or keep backend proxy endpoints for consistency.
- Ensure tokens returned by Supabase (access_token) are stored in-memory as today; refresh tokens should stay server-side if using admin API.
- Update login errors to surface Supabase messages.

---

## 6. Policies & security

- Enable Row Level Security (RLS) on Supabase tables.
- Define policies so that:
  - Users can `select` and `insert` commitments where `user_id = auth.uid()`.
  - Admin role can manage funds (use Supabase `auth.jwt()` claims for role).
- Consider storing role metadata in Supabase auth `user_metadata` and map onto JWT via `app_metadata`.

Example policy for commitments:

```sql
create policy "Users manage own commitments"
  on commitments
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

Admin policy example (assuming `role` claim):

```sql
create policy "Admins manage funds"
  on funds
  for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
```

---

## 7. Migration plan

1. Deploy Supabase project, migrate schema, and copy existing data.
2. Update backend environment variables with Supabase keys.
3. Merge backend changes (new auth flow) and deploy.
4. Smoke-test login/signup flows.
5. Remove obsolete password hashing utilities once validated.

Rollback strategy: keep local JWT auth code path until Supabase integration is fully validated. Toggle via feature flag or environment switch if needed.

---

## 8. Future enhancements

- Enable OAuth providers (Supabase → Authentication → Providers).
- Use Supabase Storage for document uploads (KYC, reports).
- Integrate Supabase Functions for serverless workflows (e.g., send email on commitment confirmation).

This blueprint should serve as a starting point. Adjust to meet security, compliance, and product requirements.
