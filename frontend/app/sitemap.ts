import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || 'http://localhost:3000';
  const items = (await api<{ path: string; lastmod?: string | null }[]>('/api/sitemap')) || [];
  const fixed = ['', '/journey', '/project', '/article', '/lesson', '/now', '/search'].map((p) => ({ url: base + p }));
  return [...fixed, ...items.map((i) => ({ url: base + i.path, lastModified: i.lastmod || undefined }))];
}
