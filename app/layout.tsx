import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Puwadon Hamvivil — Software Developer | Data Engineer',
  description:
    'Portfolio of Puwadon Hamvivil: 15+ years delivering Oracle-based enterprise applications, data engineering, CI/CD automation, and AI-assisted software development.',
  openGraph: {
    title: 'Puwadon Hamvivil — Software Developer | Data Engineer',
    description:
      '15+ years of Oracle, PL/SQL, data engineering, and AI-assisted development across financial services, insurance, telecom, and retail.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#05070f',
};

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
        {children}
      </body>
    </html>
  );
}
