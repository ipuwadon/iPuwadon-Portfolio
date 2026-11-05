# Puwadon Hamvivil — Portfolio

A single-page developer portfolio for **Puwadon Hamvivil** (Software Developer | Data Engineer), built as a fully static site — no backend or database required.

**Live:** deployed on Vercel.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router, **static export** — `output: 'export'`)
- TypeScript + Tailwind CSS
- Framer Motion (scroll-reveal and stagger animations, respects `prefers-reduced-motion`)
- Inter font via `next/font`
- Dark, glassmorphism design with blue/purple glow accents

## Project structure

```
├── app/
│   ├── layout.tsx       # Root layout, metadata, Inter font
│   ├── page.tsx         # The portfolio page (hero, skills, experience, projects, contact)
│   └── globals.css      # Design system (glass cards, gradient text, badges, buttons)
├── components/motion.tsx # Framer Motion helpers (Reveal, Stagger, CountUp, HeroIntro)
├── lib/resume.ts        # All resume content as typed data — edit this to update the page
├── public/resume.pdf    # Downloadable resume
└── next.config.mjs      # Static export configuration
```

## Develop locally

```powershell
npm install
npm run dev        # http://localhost:3000
```

## Build (static export)

```powershell
npm run build      # outputs static site to out/
```

Preview the production build locally:

```powershell
npx serve out
```

## Deploy

**Vercel:** import the GitHub repo — no configuration needed (auto-detects Next.js; Root Directory = repo root).

**GitHub Pages or any static host:** upload the `out/` folder.

## Updating content

All text content (summary, skills, experience, projects, education, contact) lives in
[`lib/resume.ts`](./lib/resume.ts). Edit it and redeploy — no other files need changing.
To update the downloadable resume, replace [`public/resume.pdf`](./public/resume.pdf).
