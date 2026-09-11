import type { MetadataRoute } from 'next';
import { getAlbums, getMembers, getOperations } from '@/lib/data';
import { getSiteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes = [
    '',
    '/team',
    '/operations',
    '/gallery',
    '/about',
    '/contact',
    '/recruitment',
    '/rules',
  ].map((route) => ({ url: `${base}${route}`, lastModified: new Date() }));
  const [members, operations, albums] = await Promise.all([
    getMembers(),
    getOperations(),
    getAlbums(),
  ]);
  return [
    ...staticRoutes,
    ...members.map((item) => ({
      url: `${base}/team/${item.slug}`,
      lastModified: new Date(),
    })),
    ...operations.map((item) => ({
      url: `${base}/operations/${item.slug}`,
      lastModified: new Date(item.date),
    })),
    ...albums.map((item) => ({
      url: `${base}/gallery/${item.slug}`,
      lastModified: new Date(item.date),
    })),
  ];
}
