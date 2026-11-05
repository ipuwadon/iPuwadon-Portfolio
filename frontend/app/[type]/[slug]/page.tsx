import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import Engagement from '@/components/Engagement';
import { Reveal } from '@/components/motion';

export const dynamic = 'force-dynamic';

type Item = Record<string, any> & { type: string; slug: string; title: string; body: string };
type P = { params: { type: string; slug: string } };

const SKIP = new Set(['type', 'slug', 'title', 'body', 'summary', 'tags', 'category', 'featured', 'date', 'media', 'reflection', 'reactions']);
const label = (k: string) => k.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const item = await api<Item>(`/api/content/${params.type}/${params.slug}`);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    openGraph: { title: item.title, description: item.summary, type: 'article' },
  };
}

export default async function DetailPage({ params }: P) {
  const item = await api<Item>(`/api/content/${params.type}/${params.slug}`);
  if (!item) notFound();
  const fields = Object.entries(item).filter(([k]) => !SKIP.has(k));
  return (
    <article className='mx-auto max-w-3xl pt-12 sm:pt-16'>
      <Reveal>
        <header>
          <p className='text-xs font-medium uppercase tracking-widest text-violet-400'>{params.type}</p>
          <h1 className='mt-3 text-3xl font-bold tracking-tight sm:text-4xl'>
            <span className='gradient-text'>{item.title}</span>
          </h1>
          <div className='mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400'>
            {item.date && <time dateTime={item.date}>{item.date}</time>}
            {item.category && <span className='badge'>{item.category}</span>}
            {item.tags?.map((t: string) => (
              <span key={t} className='badge badge-purple'>#{t}</span>
            ))}
          </div>
        </header>
      </Reveal>
      <Reveal delay={0.1}>
        <div className='prose-dark mt-8'>
          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{item.body}</ReactMarkdown>
        </div>
      </Reveal>
      {fields.map(([k, v]) => (
        <Reveal key={k}>
          <section className='glass mt-6 p-6'>
            <h2 className='section-title'>{label(k)}</h2>
            {Array.isArray(v) ? (
              <ul className='mt-3 flex flex-wrap gap-2'>
                {v.map((x) => <li key={String(x)} className='badge'>{String(x)}</li>)}
              </ul>
            ) : (
              <p className='mt-3 text-slate-400'>{String(v)}</p>
            )}
          </section>
        </Reveal>
      ))}
      {item.reflection && (
        <Reveal>
          <section className='glass mt-6 p-6'>
            <h2 className='section-title'>Reflection</h2>
            <div className='mt-4 space-y-4'>
              <div>
                <h3 className='font-semibold text-sky-300'>What Happened</h3>
                <p className='mt-1 text-slate-400'>{item.reflection.what_happened}</p>
              </div>
              <div>
                <h3 className='font-semibold text-sky-300'>What I Learned</h3>
                <p className='mt-1 text-slate-400'>{item.reflection.what_i_learned}</p>
              </div>
              <div>
                <h3 className='font-semibold text-sky-300'>What I Would Do Differently Today</h3>
                <p className='mt-1 text-slate-400'>{item.reflection.what_i_would_do_differently}</p>
              </div>
            </div>
          </section>
        </Reveal>
      )}
      {item.media?.length > 0 && (
        <Reveal>
          <section className='mt-6'>
            <h2 className='section-title'>Media</h2>
            <div className='mt-4 space-y-4'>
              {item.media.map((m: { src: string; alt: string }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={m.src}
                  src={m.src}
                  alt={m.alt}
                  loading='lazy'
                  decoding='async'
                  className='h-auto max-w-full rounded-xl border border-white/10'
                />
              ))}
            </div>
          </section>
        </Reveal>
      )}
      <Engagement type={params.type} slug={params.slug} />
    </article>
  );
}
