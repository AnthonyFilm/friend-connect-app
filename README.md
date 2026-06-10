# Connect Friend Party App

Two static pages:

- `enter.html`: guests add questions and activities
- `viewer.html`: host draws random prompts
- `index.html`: simple doorway to both pages

Edit greetings in `config.js`.
Edit colors at the top of `styles.css`.

## Local Test

```powershell
node server.js
```

Open:

```text
http://127.0.0.1:5173/
```

Without Supabase settings, prompts are saved only in the current browser.

## Shared Internet Version With Supabase

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run this SQL:

```sql
create table public.party_prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  category text not null check (
    category in (
      'Deep conversation',
      'Playful',
      'Reflection',
      'Gratitude',
      'Dreams',
      'Repair',
      'Creative'
    )
  ),
  text text not null check (char_length(text) between 1 and 420)
);

alter table public.party_prompts enable row level security;

grant usage on schema public to anon;
grant select, insert on public.party_prompts to anon;

create policy "party guests can add prompts"
on public.party_prompts
for insert
to anon
with check (true);

create policy "party host can read prompts"
on public.party_prompts
for select
to anon
using (true);
```

4. In Supabase, find your project URL and anon/publishable key.
5. Paste them into `config.js`:

```js
supabaseUrl: "https://YOUR-PROJECT.supabase.co",
supabaseAnonKey: "YOUR-PUBLISHABLE-ANON-KEY",
```

6. Deploy the whole `friend-connect-app` folder to Netlify Drop, Vercel, Cloudflare Pages, or GitHub Pages.
7. Share `enter.html` with guests.
8. Keep `viewer.html` open on the host device.

The entry page does not load or list previous submissions. The viewer page can read the shared list so the host can draw prompts.
