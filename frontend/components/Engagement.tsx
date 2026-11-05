'use client';

import { useCallback, useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const KINDS = ['helpful', 'interesting', 'inspiring', 'appreciate'];

type C = { id: number; author: string; body: string; created_at: string; replies: C[] };

function Form({ base, parent, onDone }: { base: string; parent?: number; onDone: () => void }) {
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(`${base}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, body, parent_id: parent }),
    });
    if (r.ok) {
      setBody('');
      setMsg('');
      onDone();
    } else {
      setMsg(r.status === 429 ? 'Too many requests, please wait.' : 'Please check your input.');
    }
  }

  return (
    <form onSubmit={submit} className='mt-4 space-y-3'>
      <label className='block text-sm text-slate-400'>Name
        <input className='input-dark mt-1 block w-full' value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={80} required />
      </label>
      <label className='block text-sm text-slate-400'>{parent ? 'Reply' : 'Comment'}
        <textarea className='input-dark mt-1 block w-full' rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} required />
      </label>
      <button className='btn-primary'>{parent ? 'Reply' : 'Post comment'}</button>
      {msg && <p role='alert' className='text-sm text-rose-400'>{msg}</p>}
    </form>
  );
}

function Node({ c, base, reload }: { c: C; base: string; reload: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li className='mt-4'>
      <p className='text-sm'>
        <strong className='text-white'>{c.author}</strong>{' '}
        <span className='text-slate-500'>{new Date(c.created_at).toLocaleString()}</span>
      </p>
      <p className='mt-1 text-slate-300'>{c.body}</p>
      <button className='mt-1 text-sm text-sky-400 underline underline-offset-4 transition hover:text-sky-300' onClick={() => setOpen(!open)}>Reply</button>
      {open && <Form base={base} parent={c.id} onDone={() => { setOpen(false); reload(); }} />}
      {c.replies.length > 0 && (
        <ul className='ml-4 border-l border-white/10 pl-4'>{c.replies.map((r) => <Node key={r.id} c={r} base={base} reload={reload} />)}</ul>
      )}
    </li>
  );
}

export default function Engagement({ type, slug }: { type: string; slug: string }) {
  const base = `${API}/api/content/${type}/${slug}`;
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<C[]>([]);
  const [msg, setMsg] = useState('');

  const loadComments = useCallback(async () => {
    const r = await fetch(`${base}/comments`);
    if (r.ok) setComments(await r.json());
  }, [base]);

  useEffect(() => {
    fetch(`${base}/reactions`).then((r) => (r.ok ? r.json() : {})).then(setCounts);
    loadComments();
    fetch(`${API}/api/events/pageview`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `/${type}/${slug}` }),
    });
  }, [base, loadComments, type, slug]);

  async function react(kind: string) {
    const r = await fetch(`${base}/reactions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind }),
    });
    if (r.ok) {
      setCounts(await r.json());
      setMsg('');
    } else {
      setMsg(r.status === 409 ? 'You already gave this reaction.' : 'Could not add reaction.');
    }
  }

  return (
    <section className='glass mt-12 p-6'>
      <h2 className='section-title'>Reactions</h2>
      <div className='mt-4 flex flex-wrap gap-2'>
        {KINDS.map((k) => (
          <button
            key={k}
            onClick={() => react(k)}
            className='btn-ghost capitalize hover:shadow-glow-purple'
          >
            {k} <span className='ml-1.5 text-sky-400'>({counts[k] ?? 0})</span>
          </button>
        ))}
      </div>
      <p role='status' className='mt-2 text-sm text-slate-400'>{msg}</p>
      <h2 className='section-title mt-8'>Comments</h2>
      <ul>{comments.map((c) => <Node key={c.id} c={c} base={base} reload={loadComments} />)}</ul>
      <Form base={base} onDone={loadComments} />
    </section>
  );
}
