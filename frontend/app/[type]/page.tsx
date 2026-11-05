import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api, Summary } from '@/lib/api';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const dynamic = 'force-dynamic';

type P = { params: { type: string }; searchParams: { category?: string; tag?: string } };

export function generateMetadata({ params }: P): Metadata {
  const t = params.type.charAt(0).toUpperCase() + params.type.slice(1);
  return { title: t, description: `Browse ${params.type} content` };
}

export default async function ListPage({ params, searchParams }: P) {
  const qs = new URLSearchParams();
  if (searchParams.category) qs.set('category', searchParams.category);
  if (searchParams.tag) qs.set('tag', searchParams.tag);
  const items = await api<Summary[]>(`/api/content/${encodeURIComponent(params.type)}?${qs}`);
  if (!items) notFound();
  return (
    <div className='pt-12 sm:pt-16'>
      <Reveal>
        <h1 className='text-3xl font-bold capitalize tracking-tight sm:text-4xl'>
          <span className='gradient-text'>{params.type}</span>
        </h1>
        {(searchParams.category || searchParams.tag) && (
          <p className='mt-3 text-sm text-slate-400'>
            Filtered by <span className='badge ml-1'>{searchParams.category || searchParams.tag}</span>{' '}
            <Link className='ml-2 text-sky-400 underline underline-offset-4 hover:text-sky-300' href={`/${params.type}`}>
              Clear
            </Link>
          </p>
        )}
        {items.length === 0 && <p className='mt-6 text-slate-400'>Nothing here yet.</p>}
      </Reveal>
      <Stagger className='mt-8 grid gap-4 sm:grid-cols-2'>
        {items.map((i) => (
          <StaggerItem key={i.slug} className='h-full'>
            <article className='glass glass-hover flex h-full flex-col p-5'>
              <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                {i.date && <time dateTime={i.date}>{i.date}</time>}
                {i.status && (
                  <span className='rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-slate-400'>
                    {i.status}
                  </span>
                )}
              </div>
              <Link
                href={`/${i.type}/${i.slug}`}
                className='mt-2 text-lg font-semibold text-white transition hover:text-sky-300'
              >
                {i.title}
              </Link>
              {i.summary && <p className='mt-2 text-sm leading-relaxed text-slate-400'>{i.summary}</p>}
              <p className='mt-auto flex flex-wrap gap-2 pt-4 text-sm'>
                {i.category && (
                  <Link className='badge' href={`/${i.type}?category=${encodeURIComponent(i.category)}`}>
                    {i.category}
                  </Link>
                )}
                {(i.tags || []).map((t) => (
                  <Link
                    key={t}
                    className='badge badge-purple'
                    href={`/${i.type}?tag=${encodeURIComponent(t)}`}
                  >
                    #{t}
                  </Link>
                ))}
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
