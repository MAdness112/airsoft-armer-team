# Airsoft Armer Team — website + CMS

Site oficial multi-pagină pentru Airsoft Armer Team, construit cu React/Next-compatible Vinext, TypeScript, Tailwind CSS și Supabase. Proiectul pornește fără backend în **Demo Mode** și trece automat pe Supabase când sunt configurate variabilele publice.

## Ce este inclus

- intro cinematografic 2.5D, o singură dată per sesiune, cu skip și `prefers-reduced-motion`;
- homepage editorial, responsive navbar, echipă, operațiuni, albume, statistici calculate, valori și recrutare;
- profiluri tip dossier, loadout opțional și albume filtrate după membru;
- pagini dinamice pentru operațiuni și albume, lightbox cu tastatură și navigare;
- About, timeline, home field fără coordonate inventate, Contact, Recruitment, Rules, 404 și error state;
- `/admin` cu autentificare Supabase, dashboard, CRUD de bază și upload multiplu;
- schema PostgreSQL normalizată, indexuri, RLS și politici Storage;
- metadata pe conținut, OpenGraph bazat pe cover, sitemap și robots;
- date locale demo clar etichetate și seed SQL separat.

## Pornire locală

Necesită Node.js 22.13+.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Deschide URL-ul afișat de terminal. Fără variabile Supabase, aplicația pornește automat în Demo Mode. Admin-ul demo este deblocat, iar formularele simulează salvarea fără a trimite date unui server.

## Variabile de mediu

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=https://www.domeniul-tau.ro
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

Folosește doar cheia `anon`/publishable în frontend. **Nu adăuga niciodată `service_role` în proiect sau în Vercel.**

## Configurare Supabase

1. Creează un proiect pe [Supabase](https://supabase.com/).
2. Instalează Supabase CLI și autentifică-te: `npx supabase login`.
3. Leagă proiectul: `npx supabase link --project-ref PROJECT_REF`.
4. Aplică migrația: `npx supabase db push`.
5. Opțional, încarcă datele demo din `supabase/seed.sql` prin SQL Editor. Toate au `is_demo = true` și pot fi șterse cu comenzile comentate la începutul fișierului.
6. Copiază URL-ul și cheia publică `anon` din **Project Settings → API** în `.env.local`.

Migrarea creează automat bucket-urile publice `album-photos` și `site-media`, limitează fișierele la 15 MB și acceptă JPEG, PNG, WebP și AVIF (plus SVG doar în `site-media`). Originalele stau în Storage, nu în PostgreSQL; baza păstrează metadata și legăturile.

## Crearea primului administrator

1. În Supabase Dashboard deschide **Authentication → Users → Add user** și creează utilizatorul cu email și parolă.
2. Copiază UUID-ul utilizatorului.
3. Rulează în SQL Editor, înlocuind UUID-ul:

```sql
insert into public.profiles (id, display_name, is_admin)
values ('USER_UUID', 'Administrator AAT', true)
on conflict (id) do update set is_admin = true;
```

4. Deschide `/admin` și autentifică-te. RLS verifică `profiles.is_admin` pentru fiecare operație de scriere; ascunderea interfeței nu este mecanismul de securitate.

## Date și imagini

- date demo locale: `lib/mock-data.ts`;
- adaptor demo/Supabase: `lib/data.ts`;
- client public Supabase: `lib/supabase.ts`;
- schema și RLS: `supabase/migrations/202609080001_initial_schema.sql`;
- seed opțional: `supabase/seed.sql`.

În producție, folosește URL-uri publice Supabase Storage pentru `profile_image_url`, `cover_url` și `photos.url`. Pentru transformări AVIF/WebP și thumbnails poți activa Supabase Image Transformations sau procesa imaginile înainte de upload. Interfața include lazy browser loading pentru paginile secundare prin navigare și imaginile pot fi înlocuite din admin.

## Comenzi de verificare

```bash
npm run lint
npm run typecheck
npm run build
```

## Publicare pe Vercel

1. Încarcă proiectul într-un repository Git.
2. În Vercel: **Add New → Project**, selectează repository-ul.
3. Configurează variabilele din `.env.example` pentru Production, Preview și Development.
4. Build command: `npm run build`.
5. După primul deploy, setează `NEXT_PUBLIC_SITE_URL` la domeniul final și redeploy.
6. În Supabase Authentication adaugă domeniul Vercel în **URL Configuration → Site URL / Redirect URLs**.

Nu este necesar un server separat: Vercel rulează aplicația, iar Supabase furnizează PostgreSQL, Auth și Storage prin API HTTPS.

## Înlocuirea conținutului demo

Imaginile din `public/images/*-demo.png`, membrii și operațiunile locale sunt demonstrative. După conectarea Supabase, încarcă media reală, creează conținutul din admin și elimină rândurile `is_demo = true`. Anul fondării și coordonatele nu sunt completate intenționat.
