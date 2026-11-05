import Link from 'next/link';
import type { Metadata } from 'next';
import { api, Summary } from '@/lib/api';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Search', description: 'Search journey, projects, articles and lessons.' };

type SP = { q?: string; type?: string; category?: string; tag?: string; sort?: string };

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const q = (searchParams.q || '').trim();
  let data: { total: number; results: Summary[] } | null = null;
  if (q) {
    const qs = new URLSearchParams({ q });
    (['type', 'category', 'tag', 'sort'] as const).forEach((k) => {
      const v = searchParams[k];
      if (v) qs.set(k, v);
    });
    data = await api(`/api/search?${qs}`);
  }
  return (
    <div className='pt-12 sm:pt-16'>
      <Reveal>
        <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
          <span className='gradient-text'>Search</span>
        </h1>
        <p className='mt-3 text-slate-400'>Search journey, projects, articles and lessons.</p>
        <form method='get' role='search' className='glass mt-6 flex flex-wrap items-center gap-3 p-4'>
          <label className='sr-only' htmlFor='q'>Search</label>
          <input id='q' name='q' defaultValue={q} placeholder='Search…' className='input-dark min-w-[12rem] flex-1' />
          <label className='sr-only' htmlFor='type'>Content type</label>
          <select id='type' name='type' defaultValue={searchParams.type || ''} className='input-dark'>
            <option value=''>All types</option>
            <option value='journey'>Journey</option>
            <option value='project'>Projects</option>
            <option value='article'>Articles</option>
            <option value='lesson'>Lessons</option>
          </select>
          <input name='category' placeholder='Category' aria-label='Category' defaultValue={searchParams.category || ''} className='input-dark w-32' />
          <input name='tag' placeholder='Tag' aria-label='Tag' defaultValue={searchParams.tag || ''} className='input-dark w-32' />
          <label className='sr-only' htmlFor='sort'>Sort by</label>
          <select id='sort' name='sort' defaultValue={searchParams.sort || 'relevance'} className='input-dark'>
            <option value='relevance'>Relevance</option>
            <option value='date'>Date</option>
          </select>
          <button className='btn-primary'>Search</button>
        </form>
        {q && data && data.total === 0 && (
          <p className='mt-6 text-slate-400'>No results found for &quot;{q}&quot;.</p>
        )}
      </Reveal>
      <Stagger className='mt-8 grid gap-4 sm:grid-cols-2'>
        {data?.results.map((r) => (
          <StaggerItem key={r.type + r.slug} className='h-full'>
            <article className='glass glass-hover flex h-full flex-col p-5'>
              <span className='text-xs font-medium uppercase tracking-widest text-violet-400'>{r.type}</span>
              <Link
                href={`/${r.type}/${r.slug}`}
                className='mt-2 text-lg font-semibold text-white transition hover:text-sky-300'
              >
                {r.title}
              </Link>
              {r.summary && <p className='mt-2 text-sm leading-relaxed text-slate-400'>{r.summary}</p>}
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
