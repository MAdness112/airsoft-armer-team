'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase, isDemoMode } from '@/lib/supabase';
import { members as demoMembers } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { ProfileUploader } from './profile-uploader';
type Row = Record<string, unknown> & {
  id: string;
  callsign: string;
  first_name: string;
  role_id: string | null;
  status: string;
  roles?: { name: string } | null;
  member_badges?: { badge_id: string }[];
};
type Option = { id: string; name: string };
export const validMemberId = (id: unknown): id is string =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
const fields = [
  ['callsign', 'CALLSIGN'],
  ['first_name', 'NAME / FIRST NAME'],
  ['last_name', 'LAST NAME (OPTIONAL)'],
  ['slug', 'SLUG'],
  ['operator_id', 'OPERATOR ID'],
  ['short_bio', 'SHORT BIO'],
  ['bio', 'BIO'],
  ['profile_image_url', 'PROFILE PHOTO URL'],
  ['profile_object_position', 'PROFILE CROP POSITION'],
  ['hero_image_url', 'HERO PHOTO URL'],
  ['hero_object_position', 'HERO CROP POSITION'],
  ['member_since', 'MEMBER SINCE'],
  ['primary_replica', 'PRIMARY REPLICA'],
  ['secondary_replica', 'SECONDARY REPLICA'],
  ['gear', 'GEAR'],
  ['specialty', 'SPECIALTY'],
  ['play_style', 'PLAY STYLE'],
  ['motto', 'MOTTO'],
  ['instagram', 'INSTAGRAM'],
  ['display_order', 'DISPLAY ORDER'],
] as const;
const blank = () =>
  Object.fromEntries(
    fields.map(([key]) => [
      key,
      key.includes('object_position')
        ? '50% 50%'
        : key === 'display_order'
          ? 0
          : '',
    ]),
  );
function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <Select value={value || null} onValueChange={(v) => onChange(v || '')}>
        <SelectTrigger aria-label={label}>
          <SelectValue>
            {options.find((o) => o.id === value)?.name || 'Select...'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
export function MembersManager() {
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]),
    [roles, setRoles] = useState<Option[]>([]),
    [badges, setBadges] = useState<Option[]>([]),
    [admin, setAdmin] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [message, setMessage] = useState(''),
    [editor, setEditor] = useState<Record<string, unknown> | null>(null),
    [selectedBadges, setSelectedBadges] = useState<string[]>([]),
    [deleting, setDeleting] = useState<Row | null>(null),
    [roleName, setRoleName] = useState('');
  const load = useCallback(async () => {
    if (isDemoMode) {
      setItems(
        demoMembers.map((m) => ({
          id: m.id,
          callsign: m.callsign,
          first_name: m.firstName,
          role_id: null,
          status: m.status,
          roles: { name: m.role },
          is_demo: true,
        })),
      );
      setLoading(false);
      return;
    }
    const db = getSupabase()!;
    const { data: user, error: authError } = await db.auth.getUser();
    if (authError || !user.user) throw new Error('Sign in again.');
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('is_admin')
      .eq('id', user.user.id)
      .single();
    if (profileError || !profile?.is_admin)
      throw new Error('Admin access required.');
    const results = await Promise.all([
      db
        .from('members')
        .select('*,roles(name),member_badges(badge_id)')
        .order('display_order'),
      db.from('roles').select('id,name').order('display_order'),
      db.from('badges').select('id,name').order('name'),
    ]);
    for (const r of results) if (r.error) throw new Error(r.error.message);
    setItems(results[0].data as Row[]);
    setRoles(results[1].data as Option[]);
    setBadges(results[2].data as Option[]);
    setAdmin(true);
    setLoading(false);
  }, []);
  useEffect(() => {
    void load().catch((e) => {
      setMessage(String(e.message));
      setLoading(false);
    });
  }, [load]);
  const locked = busy || uploading;
  function edit(row?: Row) {
    setMessage('');
    setEditor(
      row
        ? { ...row }
        : {
            ...blank(),
            role_id: '',
            status: 'active',
            featured: false,
            is_published: true,
            is_demo: false,
          },
    );
    setSelectedBadges(row?.member_badges?.map((b) => b.badge_id) || []);
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editor || locked || !admin) return;
    setBusy(true);
    setMessage('');
    try {
      const db = getSupabase()!;
      const id = editor.id;
      if (id && !validMemberId(id))
        throw new Error('Demo or invalid member ID.');
      if (!roles.some((r) => r.id === editor.role_id))
        throw new Error('Select a role from the list.');
      const payload: Record<string, unknown> = {};
      for (const [key] of fields)
        payload[key] = String(editor[key] ?? '').trim();
      payload.slug =
        payload.slug ||
        String(payload.callsign)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      if (!payload.callsign || !payload.first_name)
        throw new Error('Callsign and first name are required.');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(payload.slug)))
        throw new Error(
          'Use lowercase letters, numbers and hyphens for the slug.',
        );
      for (const key of ['operator_id', 'member_since'])
        if (!payload[key]) payload[key] = null;
      payload.display_order = Number(payload.display_order);
      payload.role_id = editor.role_id;
      payload.status = editor.status;
      for (const key of ['featured', 'is_published', 'is_demo'])
        payload[key] = Boolean(editor[key]);
      const query = id
        ? db.from('members').update(payload).eq('id', id)
        : db.from('members').insert(payload);
      const { data, error } = await query.select('id').single();
      if (error) throw error;
      setEditor({ ...editor, id: data.id });
      const old =
        items
          .find((m) => m.id === data.id)
          ?.member_badges?.map((b) => b.badge_id) || [];
      const added = selectedBadges.filter((x) => !old.includes(x)),
        removed = old.filter((x) => !selectedBadges.includes(x));
      if (added.length) {
        const r = await db
          .from('member_badges')
          .insert(added.map((badge_id) => ({ member_id: data.id, badge_id })));
        if (r.error)
          throw new Error('Member saved; badges failed: ' + r.error.message);
      }
      if (removed.length) {
        const r = await db
          .from('member_badges')
          .delete()
          .eq('member_id', data.id)
          .in('badge_id', removed);
        if (r.error)
          throw new Error('Member saved; badges failed: ' + r.error.message);
      }
      await load();
      router.refresh();
      setEditor(null);
      setMessage('SUCCESS // MEMBER SAVED');
    } catch (e) {
      setMessage(
        'SAVE FAILED // ' + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting || !admin || !validMemberId(deleting.id) || deleting.is_demo)
      return;
    setBusy(true);
    try {
      const { data, error } = await getSupabase()!
        .from('members')
        .delete()
        .eq('id', deleting.id)
        .select('id');
      if (error) throw error;
      if (!data?.length)
        throw new Error('Member no longer exists or deletion was denied.');
      await load();
      router.refresh();
      setDeleting(null);
      setMessage('SUCCESS // MEMBER DELETED');
    } catch (e) {
      setMessage(
        'DELETE FAILED // ' + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setBusy(false);
    }
  }
  async function addRole() {
    if (!roleName.trim() || !admin) return;
    setBusy(true);
    try {
      const name = roleName.trim();
      const { data, error } = await getSupabase()!
        .from('roles')
        .insert({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })
        .select('id,name')
        .single();
      if (error) throw error;
      setRoles((v) => [...v, data]);
      setEditor((v) => (v ? { ...v, role_id: data.id } : v));
      setRoleName('');
      setMessage('ROLE CREATED');
    } catch (e) {
      setMessage(
        'ROLE FAILED // ' + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-content">
      <div className="admin-title">
        <div>
          <p>{isDemoMode ? 'DEMO DATA // READ ONLY' : 'REAL SUPABASE DATA'}</p>
          <h1>MEMBERS</h1>
        </div>
        <button
          className="admin-primary"
          disabled={!admin || locked || !!editor}
          onClick={() => edit()}
        >
          + ADD MEMBER
        </button>
      </div>
      {message && <output className="admin-message">{message}</output>}
      {editor && (
        <form className="admin-form wide" onSubmit={save}>
          <h2>{editor.id ? 'EDIT MEMBER' : 'ADD MEMBER'}</h2>
          <fieldset disabled={locked}>
            <div className="form-grid">
              {fields.map(([key, label]) => (
                <label key={key}>
                  {label}
                  {['bio', 'short_bio', 'gear'].includes(key) ? (
                    <textarea
                      value={String(editor[key] ?? '')}
                      onChange={(e) =>
                        setEditor({ ...editor, [key]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      name={key}
                      required={['callsign', 'first_name'].includes(key)}
                      type={
                        key === 'member_since'
                          ? 'date'
                          : key === 'display_order'
                            ? 'number'
                            : 'text'
                      }
                      value={String(editor[key] ?? '')}
                      onChange={(e) =>
                        setEditor({ ...editor, [key]: e.target.value })
                      }
                    />
                  )}
                </label>
              ))}
              <Choice
                label="ROLE"
                value={String(editor.role_id || '')}
                options={roles}
                onChange={(v) => setEditor({ ...editor, role_id: v })}
              />
              <Choice
                label="STATUS"
                value={String(editor.status)}
                options={['active', 'reserve', 'veteran'].map((id) => ({
                  id,
                  name: id.toUpperCase(),
                }))}
                onChange={(v) => setEditor({ ...editor, status: v })}
              />
            </div>
            <div className="form-grid">
              <label>
                NEW ROLE
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="DOC"
                />
              </label>
              <button
                type="button"
                onClick={() => void addRole()}
                disabled={!roleName.trim()}
              >
                ADD ROLE
              </button>
            </div>
            {['featured', 'is_published', 'is_demo'].map((key) => (
              <label key={key} className="member-check">
                <Checkbox
                  checked={Boolean(editor[key])}
                  onCheckedChange={(v) => setEditor({ ...editor, [key]: v })}
                />
                {key.replaceAll('_', ' ').toUpperCase()}
              </label>
            ))}
            {badges.length > 0 && (
              <div>
                <h3>BADGES</h3>
                {badges.map((b) => (
                  <label key={b.id} className="member-check">
                    <Checkbox
                      checked={selectedBadges.includes(b.id)}
                      onCheckedChange={(v) =>
                        setSelectedBadges((old) =>
                          v ? [...old, b.id] : old.filter((x) => x !== b.id),
                        )
                      }
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <ProfileUploader
            disabled={busy}
            onBusy={setUploading}
            onUploaded={(url) =>
              setEditor((v) => (v ? { ...v, profile_image_url: url } : v))
            }
          />
          {!!editor.profile_image_url && (
            <img
              className="member-photo-preview"
              src={String(editor.profile_image_url)}
              style={{
                objectPosition: String(
                  editor.profile_object_position || '50% 50%',
                ),
              }}
              alt="Current member portrait"
            />
          )}
          <div className="member-actions">
            <button className="admin-primary" disabled={locked}>
              {uploading ? 'UPLOADING...' : busy ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => setEditor(null)}
            >
              CANCEL
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p>LOADING MEMBERS...</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table-head">
            <span>CALLSIGN / NAME</span>
            <span>ROLE</span>
            <span>STATUS</span>
            <span>ACTIONS</span>
          </div>
          {items.map((item) => (
            <div key={item.id}>
              <span>
                <b>{item.callsign}</b>
                <small style={{ display: 'block' }}>
                  {item.first_name}
                  {item.is_demo ? ' // DEMO' : ''}
                </small>
              </span>
              <span>{item.roles?.name || '—'}</span>
              <span>{item.status.toUpperCase()}</span>
              <span className="member-actions">
                <button
                  disabled={!admin || locked || !validMemberId(item.id)}
                  onClick={() => edit(item)}
                >
                  EDIT
                </button>
                <button
                  disabled={
                    !admin ||
                    locked ||
                    !validMemberId(item.id) ||
                    Boolean(item.is_demo)
                  }
                  onClick={() => setDeleting(item)}
                >
                  DELETE
                </button>
              </span>
            </div>
          ))}
          {items.length === 0 && <p>No members found.</p>}
        </div>
      )}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>DELETE {deleting?.callsign}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes this member and their linked tags. Uploaded photos
            remain in Storage.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <button disabled={busy} onClick={() => setDeleting(null)}>
              CANCEL
            </button>
            <button
              className="admin-primary"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? 'DELETING...' : 'DELETE MEMBER'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
