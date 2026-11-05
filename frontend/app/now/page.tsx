import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { Reveal, Stagger, StaggerItem } from '@/components/motion';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Now', description: 'What I am focused on right now.' };

const GROUPS: [string, string][] = [
  ['learning', 'Currently Learning'],
  ['building', 'Currently Building'],
  ['experiments', 'Current Experiments'],
  ['books', 'Books Being Read'],
  ['certifications', 'Certifications in Progress'],
];

export default async function NowPage() {
  const now = await api<Record<string, any>>('/api/content/page/now');
  if (!now) return <p className='mt-16 text-slate-400'>Content is temporarily unavailable.</p>;
  return (
    <div className='pt-12 sm:pt-16'>
      <Reveal>
        <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
          <span className='gradient-text'>Now</span>
        </h1>
        <p className='mt-3 text-slate-400'>What I am focused on right now.</p>
      </Reveal>
      <Stagger className='mt-8 grid gap-4 sm:grid-cols-2'>
        {GROUPS.map(([key, title]) => (
          <StaggerItem key={key} className='h-full'>
            <section className='glass glass-hover h-full p-6' aria-label={title}>
              <h2 className='section-title'>{title}</h2>
              <ul className='mt-4 space-y-2'>
                {(now[key] || []).map((x: string) => (
                  <li key={x} className='flex items-start gap-2 text-slate-400'>
                    <span aria-hidden='true' className='mt-1 text-sky-400'>▹</span>
                    {x}
                  </li>
                ))}
              </ul>
            </section>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
