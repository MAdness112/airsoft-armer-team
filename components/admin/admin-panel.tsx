'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Album, BookOpen, LogOut, Settings, Shield, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getSupabase, isDemoMode } from '@/lib/supabase';
import { albums, members, operations } from '@/lib/mock-data';
import { ImageUploader } from './image-uploader';
import { ContentEditor } from './content-editor';
import { MembersManager } from './members-manager';
type Section =
  | 'dashboard'
  | 'members'
  | 'operations'
  | 'albums'
  | 'settings'
  | 'about';
const nav: [Section, string, typeof Users][] = [
  ['dashboard', 'Dashboard', Shield],
  ['members', 'Members', Users],
  ['operations', 'Operations', BookOpen],
  ['albums', 'Albums', Album],
  ['about', 'About / Despre noi', BookOpen],
  ['settings', 'Site settings', Settings],
];
export function AdminPanel({
  section = 'dashboard',
}: Readonly<{ section?: Section }>) {
  const [authed, setAuthed] = useState(isDemoMode);
  const [loading, setLoading] = useState(!isDemoMode);
  useEffect(() => {
    if (isDemoMode) return;
    const db = getSupabase()!;
    void db.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setLoading(false);
    });
    const { subscription } = db.auth.onAuthStateChange((_e, s) =>
      setAuthed(Boolean(s)),
    ).data;
    return () => subscription.unsubscribe();
  }, []);
  if (loading)
    return <div className="admin-login">CHECKING CREDENTIALS...</div>;
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return (
    <SidebarProvider>
      <Sidebar className="admin-sidebar">
        <SidebarHeader>
          <Link href="/" className="admin-logo">
            AAT <span>CONTROL</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>CONTENT</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map(([id, label, Icon]) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={section === id}
                      render={
                        <Link
                          href={id === 'dashboard' ? '/admin' : `/admin/${id}`}
                        />
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <button
            onClick={async () => {
              if (!isDemoMode) await getSupabase()!.auth.signOut();
              setAuthed(false);
            }}
          >
            <LogOut size={16} /> Sign out
          </button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="admin-main">
        <header>
          <SidebarTrigger />
          <div>
            <b>{section.toUpperCase()}</b>
            <span>
              {isDemoMode
                ? 'DEMO MODE // CHANGES ARE LOCAL'
                : 'SUPABASE CONNECTED'}
            </span>
          </div>
        </header>
        <AdminContent section={section} />
      </SidebarInset>
    </SidebarProvider>
  );
}
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const { error } = await getSupabase()!.auth.signInWithPassword({
      email: String(data.get('email')),
      password: String(data.get('password')),
    });
    setBusy(false);
    if (error) setError('INVALID LOGIN');
    else onLogin();
  }
  return (
    <main className="admin-login">
      <div>
        <span className="admin-mark">AAT</span>
        <p>SECURE CONTENT ADMINISTRATION</p>
        <h1>
          CONTROL
          <br />
          PANEL
        </h1>
        {isDemoMode ? (
          <>
            <div className="admin-alert">
              SUPABASE NOT CONFIGURED
              <br />
              <small>
                Admin unlocked in demo mode. Data is not persisted to the
                server.
              </small>
            </div>
            <button className="button button-primary" onClick={onLogin}>
              ENTER DEMO ADMIN →
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label>
              EMAIL
              <input name="email" type="email" required />
            </label>
            <label>
              PASSWORD
              <input name="password" type="password" required />
            </label>
            <button className="button button-primary" disabled={busy}>
              {busy ? 'AUTHENTICATING...' : 'SIGN IN →'}
            </button>
            {error && <p className="form-error">{error}</p>}
          </form>
        )}
        <Link href="/">← BACK TO SITE</Link>
      </div>
    </main>
  );
}
function AdminContent({ section }: { section: Section }) {
  if (section === 'dashboard') return <Dashboard />;
  if (section === 'settings' || section === 'about')
    return <ContentEditor section={section} />;
  if (section === 'members') return <MembersManager />;
  return <Manager section={section} />;
}
function Dashboard() {
  const stats = [
    ['TOTAL MEMBERS', members.length],
    ['OPERATIONS', operations.length],
    ['ALBUMS', albums.length],
    ['PHOTOS', albums.reduce((n, a) => n + a.photos.length, 0)],
  ];
  return (
    <div className="admin-content">
      <div className="admin-title">
        <div>
          <p>OVERVIEW</p>
          <h1>UNIT STATUS</h1>
        </div>
        <Link className="admin-view" href="/">
          VIEW PUBLIC SITE ↗
        </Link>
      </div>
      <div className="admin-stats">
        {stats.map(([l, v]) => (
          <div key={l}>
            <span>{l}</span>
            <b>{v}</b>
            <small>DEMO DATA</small>
          </div>
        ))}
      </div>
      <div className="admin-columns">
        <section>
          <h2>RECENT OPERATIONS</h2>
          {operations.slice(0, 3).map((o) => (
            <div className="admin-row" key={o.id}>
              <img src={o.cover} alt="" />
              <span>
                <b>{o.title}</b>
                <small>{o.date}</small>
              </span>
            </div>
          ))}
        </section>
        <section>
          <h2>RECENT UPLOADS</h2>
          {albums[0].photos.slice(0, 3).map((p) => (
            <div className="admin-row" key={p.id}>
              <img src={p.url} alt="" />
              <span>
                <b>{p.alt}</b>
                <small>DEMO ASSET</small>
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
function Manager({
  section,
}: {
  section: 'members' | 'operations' | 'albums';
}) {
  const initial =
    section === 'members'
      ? members
      : section === 'operations'
        ? operations
        : albums;
  const [items, setItems] = useState(
    initial.map((x) => ({
      id: x.id,
      title: 'callsign' in x ? x.callsign : x.title,
      slug: x.slug,
      status: 'status' in x ? x.status : 'draft',
    })),
  );
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const title = String(data.callsign ?? data.title);
    const slug = String(
      data.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    );
    if (!isDemoMode) {
      const payload =
        section === 'members'
          ? {
              callsign: title,
              first_name: data.first_name,
              last_name: data.last_name,
              slug,
              role_id: null,
              status: 'active',
              profile_image_url: data.image || '/images/team-demo.png',
            }
          : {
              title,
              slug,
              date: data.date || new Date().toISOString().slice(0, 10),
              location: data.location || '',
              description: data.description || '',
              cover_url: data.image || '/images/operation-demo.png',
            };
      const { error } = await getSupabase()!.from(section).insert(payload);
      if (error) {
        setMessage(`UPLOAD FAILED // ${error.message}`);
        return;
      }
    }
    setItems((v) => [
      ...v,
      { id: crypto.randomUUID(), title, slug, status: 'draft' },
    ]);
    setMessage('RECORD SAVED');
    setEditing(false);
  }
  async function remove(id: string) {
    if (!isDemoMode) {
      const { error } = await getSupabase()!
        .from(section)
        .delete()
        .eq('id', id);
      if (error) {
        setMessage(`DELETE FAILED // ${error.message}`);
        return;
      }
    }
    setItems((v) => v.filter((x) => x.id !== id));
    setMessage('RECORD REMOVED');
  }
  return (
    <div className="admin-content">
      <div className="admin-title">
        <div>
          <p>CONTENT</p>
          <h1>{section.toUpperCase()}</h1>
        </div>
        <button className="admin-primary" onClick={() => setEditing(!editing)}>
          + ADD {section.slice(0, -1).toUpperCase()}
        </button>
      </div>
      {editing && (
        <form className="admin-form" onSubmit={save}>
          <h2>NEW {section.slice(0, -1).toUpperCase()}</h2>
          {section === 'members' ? (
            <>
              <label>
                CALLSIGN
                <input name="callsign" required />
              </label>
              <div className="form-grid">
                <label>
                  FIRST NAME
                  <input name="first_name" required />
                </label>
                <label>
                  LAST NAME
                  <input name="last_name" required />
                </label>
              </div>
              <label>
                ROLE
                <input name="role" />
              </label>
            </>
          ) : (
            <>
              <label>
                TITLE
                <input name="title" required />
              </label>
              <div className="form-grid">
                <label>
                  DATE
                  <input name="date" type="date" required />
                </label>
                <label>
                  LOCATION
                  <input name="location" required />
                </label>
              </div>
              <label>
                DESCRIPTION
                <textarea name="description" rows={4} />
              </label>
            </>
          )}
          <label>
            SLUG
            <input name="slug" placeholder="generated-automatically" />
          </label>
          {section === 'albums' && <ImageUploader />}
          <div>
            <button className="admin-primary">SAVE RECORD</button>
            <button type="button" onClick={() => setEditing(false)}>
              CANCEL
            </button>
          </div>
        </form>
      )}
      {message && <div className="admin-message">{message}</div>}
      <div className="admin-table">
        <div className="admin-table-head">
          <span>NAME</span>
          <span>SLUG</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>
        {items.map((item) => (
          <div key={item.id}>
            <b>{item.title}</b>
            <span>{item.slug}</span>
            <span>{item.status}</span>
            <button onClick={() => remove(item.id)}>DELETE</button>
          </div>
        ))}
      </div>
    </div>
  );
}
