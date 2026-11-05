import {
  aiProjects,
  certifications,
  education,
  experience,
  languages,
  profile,
  skillGroups,
} from '@/lib/resume';
import { CountUp, HeroIntro, Reveal, Stagger, StaggerItem } from '@/components/motion';

const BADGE_STYLE: Record<string, string> = {
  blue: 'badge',
  purple: 'badge badge-purple',
  green: 'badge badge-green',
};

const NAV = [
  ['#skills', 'Skills'],
  ['#experience', 'Experience'],
  ['#projects', 'AI & Projects'],
  ['#education', 'Education'],
  ['#contact', 'Contact'],
];

export default function Home() {
  return (
    <>
      <header className='sticky top-0 z-40 border-b border-white/5 bg-night-900/70 backdrop-blur-xl'>
        <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6'>
          <a href='#main' className='text-lg font-bold tracking-tight transition hover:opacity-80'>
            <span className='gradient-text'>Puwadon</span>
          </a>
          <nav aria-label='Main' className='flex flex-wrap items-center gap-x-1 gap-y-1 text-sm'>
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className='rounded-lg px-3 py-1.5 font-medium text-slate-400 transition hover:bg-white/5 hover:text-white'
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id='main' className='mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6'>
        {/* Hero */}
        <HeroIntro className='relative pt-20 sm:pt-28'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow sm:h-96 sm:w-96'
          />
          <p className='badge badge-purple'>{profile.tagline}</p>
          <h1 className='mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl'>
            {profile.name.split(' ')[0]}{' '}
            <span className='gradient-text'>{profile.name.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className='mt-3 text-xl font-medium text-slate-300 sm:text-2xl'>{profile.title}</p>
          <p className='mt-6 max-w-3xl leading-relaxed text-slate-400'>{profile.summary}</p>
          <p className='mt-8 text-slate-400'>
            <CountUp
              to={profile.yearsOfExperience}
              suffix='+'
              className='gradient-text text-5xl font-bold'
            />{' '}
            <span className='text-lg'>years of experience</span>
          </p>
          <div className='mt-8 flex flex-wrap gap-3'>
            <a href='/resume.pdf' download className='btn-primary'>
              ⬇ Download Resume
            </a>
            <a href={profile.contact.github} target='_blank' rel='noopener noreferrer' className='btn-ghost'>
              GitHub
            </a>
            <a href={profile.contact.linkedin} target='_blank' rel='noopener noreferrer' className='btn-ghost'>
              LinkedIn
            </a>
          </div>
        </HeroIntro>

        {/* Skills */}
        <section id='skills' className='mt-24 scroll-mt-24' aria-label='Core skills'>
          <Reveal>
            <h2 className='section-title'>
              Core <span className='gradient-text'>Skills</span>
            </h2>
          </Reveal>
          <Stagger className='mt-8 grid gap-4 md:grid-cols-3'>
            {skillGroups.map((g) => (
              <StaggerItem key={g.title} className='h-full'>
                <div className='glass glass-hover h-full p-6'>
                  <h3 className='text-lg font-semibold text-white'>{g.title}</h3>
                  <ul className='mt-4 flex flex-wrap gap-2' role='list'>
                    {g.skills.map((s) => (
                      <li key={s} className={BADGE_STYLE[g.style]}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Experience */}
        <section id='experience' className='mt-24 scroll-mt-24' aria-label='Professional experience'>
          <Reveal>
            <h2 className='section-title'>
              Professional <span className='gradient-text'>Experience</span>
            </h2>
          </Reveal>
          <div className='relative mt-10 space-y-8 before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-gradient-to-b before:from-blue-400/60 before:via-violet-400/40 before:to-transparent sm:space-y-10'>
            {experience.map((job) => (
              <Reveal key={job.company + job.period} className='relative pl-8'>
                <span
                  aria-hidden='true'
                  className='absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-blue-400 bg-night-900 shadow-glow-blue'
                />
                <article className='glass glass-hover p-6'>
                  <header className='flex flex-wrap items-baseline justify-between gap-2'>
                    <div>
                      <h3 className='text-lg font-semibold text-white'>{job.role}</h3>
                      <p className='mt-0.5 font-medium text-sky-300'>{job.company}</p>
                    </div>
                    <p className='text-sm text-slate-500'>{job.period}</p>
                  </header>
                  <ul className='mt-4 space-y-2'>
                    {job.highlights.map((h) => (
                      <li key={h} className='flex items-start gap-2 text-sm leading-relaxed text-slate-400'>
                        <span aria-hidden='true' className='mt-0.5 text-sky-400'>
                          ▹
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* AI & Projects */}
        <section id='projects' className='mt-24 scroll-mt-24' aria-label='AI and side projects'>
          <Reveal>
            <h2 className='section-title'>
              AI & <span className='gradient-text'>Projects</span>
            </h2>
            <p className='mt-3 max-w-2xl text-slate-400'>
              Applying AI, automation, and DevOps practices to improve software delivery and operational
              efficiency.
            </p>
          </Reveal>
          <Stagger className='mt-8 grid gap-4 sm:grid-cols-2'>
            {aiProjects.map((p) => (
              <StaggerItem key={p.title} className='h-full'>
                <article className='glass glass-hover flex h-full flex-col p-6'>
                  <h3 className='text-lg font-semibold text-white'>{p.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-400'>{p.description}</p>
                  <ul className='mt-auto flex flex-wrap gap-2 pt-4' role='list'>
                    {p.tags.map((t) => (
                      <li key={t} className='badge badge-purple'>
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Education, Certifications, Languages */}
        <section id='education' className='mt-24 scroll-mt-24' aria-label='Education and certifications'>
          <Reveal>
            <h2 className='section-title'>
              Education & <span className='gradient-text'>Certifications</span>
            </h2>
          </Reveal>
          <Stagger className='mt-8 grid gap-4 md:grid-cols-3'>
            <StaggerItem className='h-full'>
              <div className='glass glass-hover h-full p-6'>
                <h3 className='text-lg font-semibold text-white'>Education</h3>
                <p className='mt-3 text-slate-300'>{education.degree}</p>
                <p className='mt-1 text-sm text-slate-400'>{education.school}</p>
                <p className='mt-1 text-sm text-slate-500'>{education.period}</p>
              </div>
            </StaggerItem>
            <StaggerItem className='h-full'>
              <div className='glass glass-hover h-full p-6'>
                <h3 className='text-lg font-semibold text-white'>Professional Development</h3>
                <ul className='mt-3 space-y-2'>
                  {certifications.map((c) => (
                    <li key={c} className='flex items-start gap-2 text-sm text-slate-400'>
                      <span aria-hidden='true' className='mt-0.5 text-sky-400'>
                        ▹
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
            <StaggerItem className='h-full'>
              <div className='glass glass-hover h-full p-6'>
                <h3 className='text-lg font-semibold text-white'>Languages</h3>
                <ul className='mt-3 space-y-2'>
                  {languages.map((l) => (
                    <li key={l.name} className='flex items-center justify-between text-sm'>
                      <span className='text-slate-300'>{l.name}</span>
                      <span className='badge'>{l.level}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          </Stagger>
        </section>

        {/* Contact */}
        <section id='contact' className='mt-24 scroll-mt-24' aria-label='Contact'>
          <Reveal>
            <div className='glass shadow-glow-soft p-8 text-center sm:p-12'>
              <h2 className='section-title'>
                Let&apos;s <span className='gradient-text'>Connect</span>
              </h2>
              <p className='mx-auto mt-4 max-w-xl text-slate-400'>
                Open to opportunities in software development, data engineering, and AI-assisted
                engineering.
              </p>
              <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
                <a href={`mailto:${profile.contact.email}`} className='btn-primary'>
                  ✉ {profile.contact.email}
                </a>
                <a href={`tel:${profile.contact.phone.replace(/[^+\d]/g, '')}`} className='btn-ghost'>
                  ☎ {profile.contact.phone}
                </a>
              </div>
              <div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
                <a
                  href={profile.contact.linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn-ghost'
                >
                  LinkedIn
                </a>
                <a
                  href={profile.contact.github}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='btn-ghost'
                >
                  GitHub
                </a>
                <a href='/resume.pdf' download className='btn-ghost'>
                  Resume (PDF)
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className='border-t border-white/5 py-8'>
        <p className='mx-auto max-w-5xl px-4 text-center text-sm text-slate-500 sm:px-6'>
          © {new Date().getFullYear()} {profile.name} — Built with Next.js & Tailwind CSS
        </p>
      </footer>
    </>
  );
}
