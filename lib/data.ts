import { readContent } from './content-settings';
import {
  albums as mockAlbums,
  members as mockMembers,
  operations as mockOperations,
  settings as mockSettings,
} from './mock-data';
import { getSupabase } from './supabase';
import type { Album, Member, Operation, Photo, SiteSettings } from './types';
type Row = Record<string, unknown>;
const text = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;
const list = (value: unknown) => (Array.isArray(value) ? value : []);
export async function getMembers(): Promise<Member[]> {
  const db = getSupabase();
  if (!db) return mockMembers;
  const { data, error } = await db
    .from('members')
    .select('*, roles(name), member_badges(badges(name))')
    .eq('is_published', true)
    .order('display_order');
  if (error) throw new Error('Members could not be loaded: ' + error.message);
  return (data ?? []).map((r: Row) => ({
    id: text(r.id),
    roleId: text(r.role_id) || undefined,
    profilePosition: text(r.profile_object_position, '50% 50%'),
    heroPosition: text(r.hero_object_position, '50% 50%'),
    slug: text(r.slug),
    firstName: text(r.first_name),
    lastName: text(r.last_name),
    callsign: text(r.callsign),
    role: text((r.roles as Row | null)?.name, '—'),
    status: text(r.status, 'active') as Member['status'],
    operatorId: text(r.operator_id) || undefined,
    shortBio: text(r.short_bio) || undefined,
    bio: text(r.bio) || undefined,
    profileImage: text(r.profile_image_url, '/images/team-demo.png'),
    heroImage: text(r.hero_image_url) || undefined,
    memberSince: text(r.member_since) || undefined,
    primaryReplica: text(r.primary_replica) || undefined,
    secondaryReplica: text(r.secondary_replica) || undefined,
    gear: text(r.gear) || undefined,
    specialty: text(r.specialty) || undefined,
    playStyle: text(r.play_style) || undefined,
    motto: text(r.motto) || undefined,
    badges: list(r.member_badges)
      .map((x) => text(((x as Row).badges as Row | null)?.name))
      .filter(Boolean),
    featured: Boolean(r.featured),
    displayOrder: Number(r.display_order ?? 0),
    isDemo: Boolean(r.is_demo),
  }));
}
export async function getOperations(): Promise<Operation[]> {
  const db = getSupabase();
  if (!db) return mockOperations;
  const { data, error } = await db
    .from('operations')
    .select('*, operation_members(member_id), albums(slug)')
    .eq('is_published', true)
    .order('date', { ascending: false });
  if (error)
    throw new Error('Operations could not be loaded: ' + error.message);
  return (data ?? []).map((r: Row) => ({
    id: text(r.id),
    slug: text(r.slug),
    title: text(r.title),
    date: text(r.date),
    location: text(r.location),
    description: text(r.description),
    cover: text(r.cover_url, '/images/operation-demo.png'),
    eventType: text(r.event_type) || undefined,
    organizer: text(r.organizer) || undefined,
    memberIds: list(r.operation_members).map((x) => text((x as Row).member_id)),
    tags: [],
    albumSlug: text((list(r.albums)[0] as Row | undefined)?.slug) || undefined,
    result: text(r.result) || undefined,
    isDemo: Boolean(r.is_demo),
  }));
}
export async function getAlbums(): Promise<Album[]> {
  const db = getSupabase();
  if (!db) return mockAlbums;
  const { data, error } = await db
    .from('albums')
    .select('*, photos(*, photo_members(member_id)), album_members(member_id)')
    .eq('is_published', true)
    .order('date', { ascending: false });
  if (error) throw new Error('Albums could not be loaded: ' + error.message);
  return (data ?? []).map((r: Row) => ({
    id: text(r.id),
    slug: text(r.slug),
    title: text(r.title),
    date: text(r.date),
    location: text(r.location),
    description: text(r.description),
    cover: text(r.cover_url, '/images/operation-demo.png'),
    photographer: text(r.photographer) || undefined,
    tags: [],
    memberIds: list(r.album_members).map((x) => text((x as Row).member_id)),
    photos: list(r.photos)
      .map((p): Photo => {
        const row = p as Row;
        return {
          id: text(row.id),
          url: text(row.url),
          alt: text(row.alt, 'Fotografie din teren'),
          memberIds: list(row.photo_members).map((x) =>
            text((x as Row).member_id),
          ),
          sortOrder: Number(row.sort_order ?? 0),
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder),
    downloadEnabled: Boolean(r.download_enabled),
    isDemo: Boolean(r.is_demo),
  }));
}
export async function getSettings(): Promise<SiteSettings> {
  const db = getSupabase();
  if (!db) return mockSettings;
  const { data, error } = await db
    .from('site_settings')
    .select('value')
    .eq('key', 'general')
    .maybeSingle();
  if (error) throw new Error('Settings could not be loaded: ' + error.message);
  return {
    ...mockSettings,
    ...(data?.value as Partial<SiteSettings>),
    ...readContent(data?.value),
  };
}
