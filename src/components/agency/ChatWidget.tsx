'use client';

import { FormEvent, Fragment, ReactNode, useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };
export type ChatLabels = {
  open: string; title: string; status: string; greeting: string; suggestions: string[];
  placeholder: string; send: string; close: string; reset: string; disclaimer: string;
  unavailable: string; busy: string; error: string; order: string; contact: string;
};

const STORE_KEY = 'agency-chat';

/** Renders assistant text: paragraphs, bullet lines, **bold**, and internal Markdown links only. */
function RichText({ text }: { text: string }) {
  const inline = (line: string, key: number): ReactNode[] =>
    line.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g).map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      // Only same-site paths become links; anything else stays plain text.
      if (link && link[2].startsWith('/') && !link[2].startsWith('//')) {
        return <a key={`${key}-${i}`} href={link[2]} className="font-medium text-accent underline underline-offset-2">{link[1]}</a>;
      }
      if (link) return <Fragment key={`${key}-${i}`}>{link[1]}</Fragment>;
      const bold = part.match(/^\*\*([^*]+)\*\*$/);
      if (bold) return <strong key={`${key}-${i}`}>{bold[1]}</strong>;
      return <Fragment key={`${key}-${i}`}>{part}</Fragment>;
    });
  return (
    <>
      {text.split('\n').map((line, i) => {
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        if (!line.trim()) return <span key={i} className="block h-2" />;
        return bullet ? (
          <span key={i} className="block pl-4 -indent-3">• {inline(bullet[1], i)}</span>
        ) : (
          <span key={i} className="block">{inline(line.replace(/^#+\s*/, ''), i)}</span>
        );
      })}
    </>
  );
}

/** Floating AI assistant (streams replies from /api/assistant). */
export function ChatWidget({ locale, labels }: { locale: string; labels: ChatLabels }) {
  const [open, setOpen] = useState(false);
  // Keep the conversation while the visitor moves between pages (this tab only).
  // Read lazily: the panel starts closed, so server and client markup match.
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '[]') as Msg[];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<'unavailable' | 'busy' | 'error' | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Msg[] = [...messages, { role: 'user', content }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, messages: history.slice(-24) }),
      });
      if (!res.ok || !res.body) {
        setNotice(res.status === 503 ? 'unavailable' : res.status === 429 ? 'busy' : 'error');
        setMessages(history.slice(0, -1));
        setInput(content);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...history, { role: 'assistant', content: reply }]);
      }
      if (!reply.trim()) throw new Error('empty reply');
    } catch {
      setNotice('error');
      setMessages((m) => (m[m.length - 1]?.role === 'assistant' && !m[m.length - 1].content ? m.slice(0, -1) : m));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const prefix = `/${locale}`;

  return (
    <div className="no-print">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-button bg-primary py-3 pl-4 pr-5 text-sm font-medium text-on-primary shadow-card transition-transform hover:-translate-y-0.5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4V5Z" />
            <path d="M8 10h.01M12 10h.01M16 10h.01" />
          </svg>
          {labels.open}
        </button>
      )}

      {open && (
        <section
          aria-label={labels.title}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[85dvh] flex-col overflow-hidden rounded-t-card border border-line bg-surface shadow-card sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[600px] sm:max-h-[calc(100dvh-2.5rem)] sm:w-[380px] sm:rounded-card"
        >
          <header className="flex items-center gap-3 bg-primary px-4 py-3 text-on-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold">AI</span>
            <div className="flex-1">
              <p className="heading text-base leading-tight">{labels.title}</p>
              <p className="text-xs opacity-75">{labels.status}</p>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={() => { setMessages([]); setNotice(null); }} className="rounded-button px-2 py-1 text-xs opacity-80 hover:bg-on-primary/10 hover:opacity-100">
                {labels.reset}
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label={labels.close} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-on-primary/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-alt px-4 py-4 text-sm leading-relaxed" aria-live="polite">
            <div className="max-w-[88%] rounded-card rounded-tl-md bg-surface px-3.5 py-2.5 text-ink shadow-sm">{labels.greeting}</div>
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {labels.suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)} className="rounded-button border border-primary/30 bg-surface px-3 py-1.5 text-left text-xs text-primary hover:bg-primary hover:text-on-primary">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-card rounded-tr-md bg-primary px-3.5 py-2.5 text-on-primary">{m.content}</div>
              ) : (
                <div key={i} className="max-w-[88%] rounded-card rounded-tl-md bg-surface px-3.5 py-2.5 text-ink shadow-sm">
                  {m.content ? <RichText text={m.content} /> : (
                    <span className="inline-flex gap-1 py-1" aria-label="…">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-muted/60" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-muted/60 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-muted/60 [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              )
            )}
            {notice && (
              <div className="rounded-card border border-line bg-surface px-3.5 py-3 text-ink">
                <p>{labels[notice]}</p>
                {notice === 'unavailable' && (
                  <div className="mt-3 flex gap-2">
                    <a href={`${prefix}/order`} className="rounded-button bg-primary px-3 py-1.5 text-xs text-on-primary">{labels.order}</a>
                    <a href={`${prefix}#contact`} onClick={() => setOpen(false)} className="rounded-button border border-line px-3 py-1.5 text-xs text-ink">{labels.contact}</a>
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-line bg-surface p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                maxLength={1500}
                placeholder={labels.placeholder}
                className="field max-h-28 min-h-[44px] flex-1 resize-none"
              />
              <button type="submit" disabled={busy || !input.trim()} className="btn-primary h-11 !px-4" aria-label={labels.send}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">{labels.disclaimer}</p>
          </form>
        </section>
      )}
    </div>
  );
}
