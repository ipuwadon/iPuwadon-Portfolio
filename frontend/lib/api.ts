const API = process.env.API_URL || 'http://localhost:8000';

export async function api<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(API + path, { cache: 'no-store' });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
}

export type Summary = {
  type: string;
  slug: string;
  title: string;
  summary?: string;
  category?: string;
  tags?: string[];
  date?: string | null;
  status?: string | null;
};
