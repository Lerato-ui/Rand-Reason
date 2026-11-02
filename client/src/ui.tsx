import { createContext, ReactNode, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { X } from 'lucide-react'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
// A chapter: numeral, title, and one sentence that says what this page will tell you.
export function Chapter({ n, title, lead, actions, children }: { n?: number; title: string; lead?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (<article className="mx-auto max-w-[1080px] px-5 pb-28 pt-8 sm:px-8 lg:pt-14"><header className="mb-10 border-b-2 border-ink pb-7"><div className="flex items-start justify-between gap-6"><p className="eyebrow">{n ? `Chapter ${ROMAN[n - 1]}` : 'Appendix'}</p>{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}</div>
    <h1 className="mt-2 text-h1">{title}</h1>{lead && <p className="serif mt-4 max-w-2xl text-lead text-ink">{lead}</p>}</header>{children}</article>)
}
// A block of prose with an optional margin note beside it (below it on narrow screens).
export const Block = ({ children, note, title, className = '' }: { children: ReactNode; note?: ReactNode; title?: string; className?: string }) => (
  <section className={`mb-12 grid gap-x-10 gap-y-4 lg:grid-cols-[minmax(0,1fr)_260px] ${className}`}>{title && <h2 className="serif text-[1.6rem] leading-tight lg:col-span-2">{title}</h2>}<div className="min-w-0">{children}</div>{note && <aside className="cap lg:pt-1 lg:border-l lg:border-line lg:pl-4">{note}</aside>}</section>)
export const Fig = ({ n, title, cap, children, className = '' }: { n?: string; title: string; cap?: ReactNode; children: ReactNode; className?: string }) => (
  <figure className={`figure my-6 min-w-0 ${className}`}><figcaption className="mb-3 font-sans text-[13px]"><b>{n ? `Figure ${n}. ` : ''}{title}</b></figcaption>{children}{cap && <p className="cap mt-3">{cap}</p>}</figure>)
export const P = ({ children, className = '' }: { children: ReactNode; className?: string }) => <p className={`serif text-prose ${className}`}>{children}</p>
export const B = ({ children, tone }: { children: ReactNode; tone?: 'pos' | 'neg' | 'rand' }) => <b className={`font-semibold ${tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : tone === 'rand' ? 'text-rand' : ''}`}>{children}</b>

// A number you edit where it sits in the sentence.
export function Num({ value, onChange, label, min = 0, max, step = 'any', prefix = '' }: { value: number | string; onChange: (v: string) => void; label: string; min?: number; max?: number; step?: string; prefix?: string }) {
  const s = String(value ?? ''); return <>{prefix}<input type="number" inputMode="decimal" aria-label={label} min={min} max={max} step={step} className="num-in" style={{ width: `${Math.max(3, s.length + 1.4)}ch` }} value={s} placeholder="0" onChange={e => onChange(e.target.value)} /></>
}
export function Pick<T extends string | number>({ value, onChange, options, label }: { value: T; onChange: (v: string) => void; options: { id: T; label: string }[]; label: string }) {
  return <select aria-label={label} className="num-in" value={String(value)} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={String(o.id)} value={String(o.id)}>{o.label}</option>)}</select>
}
export function Seg<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (<div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1.5">{options.map(o => <button key={o.id} type="button" role="radio" aria-checked={o.id === value} onClick={() => onChange(o.id)}
    className={`min-h-[38px] whitespace-nowrap rounded-full border-2 border-ink px-3.5 text-[13px] font-semibold transition-colors ${o.id === value ? 'bg-ink text-paper' : 'hover:bg-mark'}`}>{o.label}</button>)}</div>)
}
export const Field = ({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) => (
  <div><label htmlFor={id} className="lbl">{label}</label>{children}{hint && !error && <p id={id + '-h'} className="mt-1 text-meta text-mute">{hint}</p>}{error && <p id={id + '-e'} role="alert" className="mt-1 text-meta font-bold text-neg">{error}</p>}</div>)
export const Chip = ({ tone = 'neutral', children }: { tone?: 'pos' | 'neg' | 'warn' | 'info' | 'neutral'; children: ReactNode }) => (
  <span className={`pill ${{ pos: 'border-pos bg-pos text-white', neg: 'border-neg bg-neg text-white', warn: 'border-ink bg-mark', info: 'border-info text-info', neutral: 'border-line text-mute' }[tone]}`}>{children}</span>)
export const Empty = ({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) => (
  <div className="border-2 border-dashed border-ink/40 px-5 py-7"><h3 className="serif text-[1.3rem]">{title}</h3>{children && <p className="mt-1 max-w-md text-mute">{children}</p>}{action && <div className="mt-4">{action}</div>}</div>)
export function Skeleton({ className = '' }: { className?: string }) { return <div aria-hidden className={`animate-pulse bg-line ${className}`} /> }
export const Delta = ({ pct, goodWhenUp = true, suffix = 'vs last month' }: { pct: number | null; goodWhenUp?: boolean; suffix?: string }) => pct === null ? <span className="cap">Nothing to compare yet</span> : <span className={`text-meta font-semibold ${(pct >= 0) === goodWhenUp ? 'text-pos' : 'text-neg'}`}>{pct >= 0 ? '↑' : '↓'} {Math.abs(pct)}% <span className="font-normal text-mute">{suffix}</span></span>

export function Dialog({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null), id = useId()
  useEffect(() => {
    if (!open) return; const prev = document.activeElement as HTMLElement | null, el = ref.current!
    const focusable = () => [...el.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.hasAttribute('disabled'))
    ;(el.querySelector<HTMLElement>('[data-autofocus]') ?? focusable()[1] ?? focusable()[0])?.focus()
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } if (e.key === 'Tab') { const f = focusable(); if (!f.length) return; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() } } }
    document.addEventListener('keydown', key); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus() }
  }, [open]) // eslint-disable-line
  if (!open) return null
  return (<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"><div className="absolute inset-0 bg-ink/60" onClick={onClose} />
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className={`relative max-h-[92dvh] w-full overflow-y-auto border-2 border-ink bg-paper p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-pop sm:p-7 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}>
      <div className="mb-5 flex items-start justify-between gap-4"><h2 id={id} className="serif text-[1.9rem] leading-none">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="-m-2 p-2 hover:bg-mark"><X size={22} /></button></div>{children}</div></div>)
}
interface ToastOpts { action?: { label: string; run: () => void } }
const ToastCtx = createContext<(m: string, o?: ToastOpts) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ id: number; m: string; o?: ToastOpts } | null>(null)
  const push = useCallback((m: string, o?: ToastOpts) => setT({ id: Date.now(), m, o }), [])
  useEffect(() => { if (!t) return; const h = setTimeout(() => setT(null), t.o?.action ? 8000 : 4000); return () => clearTimeout(h) }, [t])
  return (<ToastCtx.Provider value={push}>{children}
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 lg:bottom-6">{t && <div key={t.id} className="pointer-events-auto flex items-center gap-4 bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-pop"><span>{t.m}</span>{t.o?.action && <button className="text-mark underline underline-offset-4" onClick={() => { t.o!.action!.run(); setT(null) }}>{t.o.action.label}</button>}</div>}</div></ToastCtx.Provider>)
}
export function useUnsaved(dirty: boolean) { useEffect(() => { if (!dirty) return; const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h) }, [dirty]) }
