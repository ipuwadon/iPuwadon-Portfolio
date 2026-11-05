import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: { default: "Puwadon's Engineering Journey", template: "%s | Puwadon's Engineering Journey" },
  description: 'Career milestones, projects, lessons and knowledge from an engineering journey.',
  openGraph: { title: "Puwadon's Engineering Journey", type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#05070f',
};

const links = [
  ['/journey', 'Journey'],
  ['/project', 'Projects'],
  ['/article', 'Knowledge'],
  ['/lesson', 'Lessons'],
  ['/now', 'Now'],
  ['/search', 'Search'],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`dark ${inter.variable}`}>
      <body className='min-h-screen font-sans'>
        <a
          href='#main'
          className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white'
        >
          Skip to content
        </a>
        <header className='sticky top-0 z-40 border-b border-white/5 bg-night-900/70 backdrop-blur-xl'>
          <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6'>
            <Link
              href='/'
              className='text-lg font-bold tracking-tight text-white transition hover:opacity-80'
            >
              <span className='gradient-text'>Puwadon</span>
            </Link>
            <nav aria-label='Main' className='flex flex-wrap items-center gap-x-1 gap-y-1 text-sm'>
              {links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className='rounded-lg px-3 py-1.5 font-medium text-slate-400 transition hover:bg-white/5 hover:text-white'
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main id='main' className='mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6'>
          {children}
        </main>
        <footer className='border-t border-white/5 py-8'>
          <p className='mx-auto max-w-5xl px-4 text-sm text-slate-500 sm:px-6'>
            © {new Date().getFullYear()} Puwadon Hamvivil — Engineering Journey
          </p>
        </footer>
      </body>
    </html>
  );
}
