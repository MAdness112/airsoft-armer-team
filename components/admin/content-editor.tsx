'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase, isDemoMode } from '@/lib/supabase';
import {
  aboutFields,
  contentSchema,
  contentDefaults,
  readContent,
  locationFields,
  introToggles,
  type ContentSettings,
} from '@/lib/content-settings';
import { Checkbox } from '@/components/ui/checkbox';
import { ProfileUploader } from './profile-uploader';
import { MapIntro } from '@/components/site/map-intro';
export function ContentEditor({ section }: { section: 'about' | 'settings' }) {
  const router = useRouter();
  const [data, setData] = useState<ContentSettings>(contentDefaults),
    [general, setGeneral] = useState<Record<string, unknown>>({}),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [message, setMessage] = useState(''),
    [preview, setPreview] = useState(0),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    async function load() {
      if (isDemoMode)
        throw new Error('Demo is read only. Connect Supabase to save content.');
      const db = getSupabase()!;
      const { data: user, error } = await db.auth.getUser();
      if (error || !user.user) throw new Error('Sign in again.');
      const { data: p, error: pe } = await db
        .from('profiles')
        .select('is_admin')
        .eq('id', user.user.id)
        .single();
      if (pe || !p?.is_admin) throw new Error('Admin access required.');
      const result = await db
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .maybeSingle();
      if (result.error) throw result.error;
      if (live) {
        setGeneral(result.data?.value || {});
        setData(readContent(result.data?.value));
        setReady(true);
      }
    }
    void load()
      .catch((e) => {
        if (live) setMessage(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  function change<K extends keyof ContentSettings>(
    key: K,
    value: ContentSettings[K],
  ) {
    setData((v) => ({ ...v, [key]: value }));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || busy || uploading) return;
    setBusy(true);
    setMessage('');
    try {
      const parsed = contentSchema.parse(data);
      const keys: (keyof ContentSettings)[] =
        section === 'about'
          ? [
              ...aboutFields.map((f) => f[0]),
              'values',
              ...locationFields.map((f) => f[0]),
              'fieldImage',
              'fieldShowMap',
            ]
          : [
              ...locationFields.map((f) => f[0]),
              ...introToggles.map((f) => f[0]),
              'introDuration',
              'blackiceSymbolUrl',
            ];
      const patch = Object.fromEntries(keys.map((k) => [k, parsed[k]]));
      const db = getSupabase()!;
      const current = await db
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .maybeSingle();
      if (current.error) throw current.error;
      const other =
        section === 'settings'
          ? Object.fromEntries(
              [
                'teamName',
                'shortName',
                'tagline',
                'contactEmail',
                'footerText',
                'accentColor',
                'recruitmentEnabled',
              ]
                .filter((k) => general[k] !== undefined)
                .map((k) => [k, general[k]]),
            )
          : {};
      const value = { ...current.data?.value, ...other, ...patch };
      const result = await db
        .from('site_settings')
        .upsert({ key: 'general', value })
        .select('value')
        .single();
      if (result.error) throw result.error;
      setData(readContent(result.data.value));
      setGeneral(result.data.value);
      router.refresh();
      setMessage('CHANGES SAVED');
    } catch (e) {
      setMessage(
        'SAVE FAILED // ' + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setBusy(false);
    }
  }
  const locked = !ready || busy || uploading;
  return (
    <div className="admin-content">
      <div className="admin-title">
        <div>
          <p>SITE CONTENT</p>
          <h1>{section === 'about' ? 'DESPRE NOI' : 'SITE SETTINGS'}</h1>
        </div>
        <a
          className="admin-view"
          href={section === 'about' ? '/about' : '/'}
          target="_blank"
          rel="noreferrer"
        >
          PREVIEW PAGE ↗
        </a>
      </div>
      {loading ? (
        <p>LOADING CONTENT...</p>
      ) : (
        <form className="admin-form wide" onSubmit={save}>
          <fieldset disabled={locked}>
            {section === 'about' ? (
              <>
                {aboutFields.map(([key, label]) => (
                  <label key={key}>
                    {label}
                    {key === 'aboutTitle' || key === 'aboutSubtitle' ? (
                      <input
                        value={data[key]}
                        onChange={(e) => change(key, e.target.value)}
                      />
                    ) : (
                      <textarea
                        rows={
                          key === 'aboutMainDescription' || key === 'aboutStory'
                            ? 9
                            : 4
                        }
                        value={data[key]}
                        onChange={(e) => change(key, e.target.value)}
                      />
                    )}
                  </label>
                ))}
                <p>
                  Markdown: **bold**, *italic*, ## Heading, - list,
                  [link](https://...).
                </p>
                <h2>OUR VALUES</h2>
                {data.values.map((v, i) => (
                  <div className="value-editor" key={v.id}>
                    <label>
                      TITLE
                      <input
                        required
                        value={v.title}
                        onChange={(e) =>
                          change(
                            'values',
                            data.values.map((x) =>
                              x.id === v.id
                                ? { ...x, title: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      SHORT DESCRIPTION
                      <textarea
                        value={v.description}
                        onChange={(e) =>
                          change(
                            'values',
                            data.values.map((x) =>
                              x.id === v.id
                                ? { ...x, description: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <label>
                      OPTIONAL ICON (EMOJI)
                      <input
                        value={v.icon}
                        onChange={(e) =>
                          change(
                            'values',
                            data.values.map((x) =>
                              x.id === v.id
                                ? { ...x, icon: e.target.value }
                                : x,
                            ),
                          )
                        }
                      />
                    </label>
                    <div className="member-actions">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => {
                          const list = [...data.values];
                          [list[i - 1], list[i]] = [list[i], list[i - 1]];
                          change('values', list);
                        }}
                      >
                        MOVE UP
                      </button>
                      <button
                        type="button"
                        disabled={i === data.values.length - 1}
                        onClick={() => {
                          const list = [...data.values];
                          [list[i + 1], list[i]] = [list[i], list[i + 1]];
                          change('values', list);
                        }}
                      >
                        MOVE DOWN
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          change(
                            'values',
                            data.values.filter((x) => x.id !== v.id),
                          )
                        }
                      >
                        DELETE VALUE
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    change('values', [
                      ...data.values,
                      {
                        id: crypto.randomUUID(),
                        title: 'NEW VALUE',
                        description: '',
                        icon: '',
                      },
                    ])
                  }
                >
                  + ADD VALUE
                </button>
              </>
            ) : (
              <>
                <h2>GENERAL</h2>
                {[
                  'teamName',
                  'shortName',
                  'tagline',
                  'contactEmail',
                  'footerText',
                  'accentColor',
                ].map((key) => (
                  <label key={key}>
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                    <input
                      value={String(general[key] || '')}
                      onChange={(e) =>
                        setGeneral({ ...general, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
              </>
            )}
            <h2>TEAM LOCATION</h2>
            <div className="form-grid">
              {locationFields.map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    required
                    type={
                      key === 'latitude' || key === 'longitude'
                        ? 'number'
                        : 'text'
                    }
                    step="any"
                    min={
                      key === 'latitude'
                        ? -85
                        : key === 'longitude'
                          ? -180
                          : undefined
                    }
                    max={
                      key === 'latitude'
                        ? 85
                        : key === 'longitude'
                          ? 180
                          : undefined
                    }
                    value={data[key]}
                    onChange={(e) =>
                      change(
                        key,
                        key === 'latitude' || key === 'longitude'
                          ? Number(e.target.value)
                          : e.target.value,
                      )
                    }
                  />
                </label>
              ))}
            </div>
            {section === 'about' ? (
              <>
                <label>
                  FIELD IMAGE URL
                  <input
                    value={data.fieldImage}
                    onChange={(e) => change('fieldImage', e.target.value)}
                  />
                </label>
                <label htmlFor="field-show-map" className="member-check">
                  <Checkbox
                    id="field-show-map"
                    checked={data.fieldShowMap}
                    onCheckedChange={(v) => change('fieldShowMap', v)}
                  />
                  SHOW MAP
                </label>
              </>
            ) : (
              <>
                <h2>INTRO / BLACKICE</h2>
                {introToggles.map(([key, label]) => (
                  <label className="member-check" key={key}>
                    <Checkbox
                      checked={data[key]}
                      onCheckedChange={(v) => change(key, v)}
                    />
                    {label}
                  </label>
                ))}
                <label>
                  INTRO DURATION (6–9 SECONDS)
                  <input
                    type="number"
                    step="0.5"
                    min="6"
                    max="9"
                    value={data.introDuration}
                    onChange={(e) =>
                      change('introDuration', Number(e.target.value))
                    }
                  />
                </label>
                <label>
                  BLACKICE SYMBOL URL
                  <input
                    value={data.blackiceSymbolUrl}
                    onChange={(e) =>
                      change('blackiceSymbolUrl', e.target.value)
                    }
                  />
                </label>
                <p>
                  Use a cropped symbol with a transparent background. The
                  original team identity remains primary.
                </p>
              </>
            )}
          </fieldset>
          {ready && (
            <ProfileUploader
              label={
                section === 'about'
                  ? 'UPLOAD FIELD IMAGE'
                  : 'UPLOAD BLACKICE SYMBOL'
              }
              disabled={busy}
              onBusy={setUploading}
              onUploaded={(url) =>
                change(
                  section === 'about' ? 'fieldImage' : 'blackiceSymbolUrl',
                  url,
                )
              }
            />
          )}
          <div className="member-actions">
            <button disabled={locked} className="admin-primary">
              {busy ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
            {section === 'settings' && (
              <>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => setPreview((v) => v + 1)}
                >
                  PLAY GEOLOCATION INTRO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      sessionStorage.removeItem('aat_intro_seen');
                      sessionStorage.removeItem('aat-intro-seen');
                    } catch {}
                    setPreview((v) => v + 1);
                  }}
                >
                  RESET INTRO PREVIEW
                </button>
              </>
            )}
          </div>
        </form>
      )}
      {message && <output className="admin-message">{message}</output>}
      {preview > 0 && (
        <MapIntro
          key={preview}
          settings={data}
          force
          onComplete={() => setPreview(0)}
        />
      )}
    </div>
  );
}
