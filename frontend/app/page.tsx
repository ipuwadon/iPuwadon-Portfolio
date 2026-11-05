import Link from 'next/link';
import { api, Summary } from '@/lib/api';
import { HeroIntro, Reveal, Stagger, StaggerItem } from '@/components/motion';

export const dynamic = 'force-dynamic';

type Home = {
  intro: string;
  professional_summary: string;
  years_of_experience: number;
  core_expertise: string[];
  current_learning: string[];
  featured_projects: Summary[];
  latest_articles: Summary[];
  recent_journey: Summary[];
};

function CardGrid({ title, items, delay = 0 }: { title: string; items: Summary[]; delay?: number }) {
  if (!items.length) return null;
  return (
    <section className='mt-16' aria-label={title}>
      <Reveal delay={delay}>
        <h2 className='section-title'>{title}</h2>
      </Reveal>
      <Stagger className='mt-5 grid gap-4 sm:grid-cols-2'>
        {items.map((i) => (
          <StaggerItem key={i.type + i.slug}>
            <Link
              href={`/${i.type}/${i.slug}`}
              className='glass glass-hover group flex h-full flex-col p-5'
            >
              <span className='text-xs font-medium uppercase tracking-widest text-violet-400'>
                {i.type}
              </span>
              <span className='mt-2 text-lg font-semibold text-white transition group-hover:text-sky-300'>
                {i.title}
              </span>
              {i.summary && <span className='mt-2 text-sm text-slate-400'>{i.summary}</span>}
              <span className='mt-auto pt-4 text-sm font-medium text-sky-400'>Read more →</span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

export default async function HomePage() {
  const h = await api<Home>('/api/home');
  if (!h) return <p className='mt-16 text-slate-400'>Content is temporarily unavailable.</p>;
  return (
    <div>
      {/* Hero */}
      <HeroIntro className='relative pt-20 sm:pt-28'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow sm:h-96 sm:w-96'
        />
        <p className='badge badge-purple'>AI · Cloud · Enterprise Engineering</p>
        <h1 className='mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl'>
          Puwadon&apos;s <span className='gradient-text'>Engineering Journey</span>
        </h1>
        <p className='mt-6 max-w-2xl text-lg leading-relaxed text-slate-400'>{h.intro}</p>
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link href='/project' className='btn-primary'>Explore projects</Link>
          <Link href='/journey' className='btn-ghost'>Follow the journey</Link>
        </div>
      </HeroIntro>

      {/* Professional summary */}
      <Reveal className='mt-20'>
        <section className='glass shadow-glow-soft p-6 sm:p-8' aria-label='Professional summary'>
          <h2 className='section-title'>Professional summary</h2>
          <p className='mt-3 leading-relaxed text-slate-400'>{h.professional_summary}</p>
          <p className='mt-4 text-slate-400'>
            <span className='gradient-text text-3xl font-bold'>{h.years_of_experience}+</span>{' '}
            years of experience
          </p>
        </section>
      </Reveal>

      {/* Skills */}
      <div className='mt-10 grid gap-6 sm:grid-cols-2'>
        <Reveal>
          <section className='glass h-full p-6' aria-label='Core expertise'>
            <h2 className='section-title'>Core expertise</h2>
            <ul className='mt-4 flex flex-wrap gap-2' role='list'>
              {h.core_expertise.map((s) => (
                <li key={s} className='badge'>{s}</li>
              ))}
            </ul>
          </section>
        </Reveal>
        <Reveal delay={0.1}>
          <section className='glass h-full p-6' aria-label='Currently learning'>
            <h2 className='section-title'>Currently learning</h2>
            <ul className='mt-4 flex flex-wrap gap-2' role='list'>
              {h.current_learning.map((s) => (
                <li key={s} className='badge badge-purple'>{s}</li>
              ))}
            </ul>
          </section>
        </Reveal>
      </div>

      <CardGrid title='Featured projects' items={h.featured_projects} />
      <CardGrid title='Latest articles' items={h.latest_articles} />
      <CardGrid title='Recent journey updates' items={h.recent_journey} />
    </div>
  );
}
