import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Bucket, compactZar, zar } from './lib'
const EASE = [0.2, 0.7, 0.2, 1] as const
export const C = { inc: '#0F3D2E', incSoft: '#2E7D5B', exp: '#E4451C', grid: '#D9D0BD', ink: '#5E5A50', neg: '#C2331A' }
export const CAT_COLORS = ['#0F3D2E', '#2E7D5B', '#E4451C', '#E9A23B', '#7AA78F', '#2B5E8C', '#8C6BB1', '#A59F8F']
function useWidth<T extends HTMLElement>() { const ref = useRef<T>(null), [w, setW] = useState(300); useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width)))); ro.observe(el); setW(Math.max(240, Math.round(el.clientWidth))); return () => ro.disconnect() }, []); return [ref, w] as const }
const niceMax = (v: number) => { if (v <= 0) return 1000; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p }
const Axis = ({ max, w, m, y }: { max: number; w: number; m: { l: number; r: number }; y: (v: number) => number }) => <>{[0, 1, 2, 3, 4].map(i => { const v = (max / 4) * i; return <g key={i}><line x1={m.l} x2={w - m.r} y1={y(v)} y2={y(v)} stroke={C.grid} strokeWidth="1" /><text x={m.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill={C.ink}>{compactZar(v)}</text></g> })}</>
const Legend = ({ items }: { items: { l: string; c: string; dash?: boolean }[] }) => <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-mute">{items.map(i => <span key={i.l} className="flex items-center gap-2"><svg width="22" height="8" aria-hidden><line x1="0" y1="4" x2="22" y2="4" stroke={i.c} strokeWidth="3" strokeDasharray={i.dash ? '4 3' : undefined} strokeLinecap="round" /></svg>{i.l}</span>)}</div>

// Smooth curve through points (Catmull-Rom to Bezier), control points clamped so curves never dip past the axes.
function smooth(pts: [number, number][], lo: number, hi: number) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : ''
  const cl = (v: number) => Math.min(hi, Math.max(lo, v)); let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${cl(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${cl(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}` }
  return d
}
// Cash flow: smooth gradient areas for income and expenses plus a net line. Scrubbing reports the active point so the whole page can follow it.
export function CashflowArea({ data, periodLabel, onActive }: { data: Bucket[]; periodLabel: string; onActive?: (i: number | null) => void }) {
  const [ref, w] = useWidth<HTMLDivElement>(), reduce = useReducedMotion(), [act, setActRaw] = useState<number | null>(null), gid = useId().replace(/:/g, '')
  const setAct = (v: number | null | ((p: number | null) => number | null)) => setActRaw(p => { const n = typeof v === 'function' ? v(p) : v; onActive?.(n); return n })
  const H = w < 480 ? 230 : 290, m = { l: w < 480 ? 44 : 52, r: 12, t: 12, b: 28 }, iw = w - m.l - m.r, ih = H - m.t - m.b, n = data.length
  const hi = niceMax(Math.max(...data.flatMap(d => [d.income, d.expenses]), 0)), lo = Math.min(0, ...data.map(d => d.net)) < 0 ? -niceMax(-Math.min(...data.map(d => d.net))) : 0
  const x = (i: number) => m.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1)), y = (v: number) => m.t + ih - ((v - lo) / (hi - lo)) * ih, y0 = y(0)
  const pts = (k: 'income' | 'expenses' | 'net'): [number, number][] => data.map((d, i) => [x(i), y(d[k])]), top = m.t, bot = m.t + ih
  const path = (k: 'income' | 'expenses' | 'net') => smooth(pts(k), top, bot), area = (k: 'income' | 'expenses') => `${path(k)} L${x(n - 1)},${y0} L${x(0)},${y0} Z`
  const any = data.some(d => d.income > 0 || d.expenses > 0), step = Math.ceil(54 / (iw / Math.max(1, n - 1)))
  const pick = (cx: number, el: SVGSVGElement) => { const px = cx - el.getBoundingClientRect().left; let best = 0, bd = 1e9; data.forEach((_, i) => { const d = Math.abs(x(i) - px); if (d < bd) { bd = d; best = i } }); setAct(best) }
  const a = act !== null ? data[act] : null, tipW = 190, tipX = a ? Math.min(Math.max(x(act!) - tipW / 2, 4), w - tipW - 4) : 0
  const summary = `Income, expenses and net cash flow for ${periodLabel}. ` + data.map(d => `${d.label}: income ${zar(d.income)}, expenses ${zar(d.expenses)}, net ${zar(d.net)}.`).join(' ')
  if (!any) return <div ref={ref} className="rounded-xl border border-dashed border-line bg-ground/60 p-6 text-sm text-mute">No income or expenses recorded in {periodLabel}. Add transactions and the chart draws here.</div>
  const ticks = [0, 1, 2, 3, 4].map(i => lo + ((hi - lo) / 4) * i)
  return (<div ref={ref} className="relative w-full min-w-0 select-none"><Legend items={[{ l: 'Income', c: C.inc }, { l: 'Expenses', c: C.exp }, { l: 'Net cash flow', c: '#17261F', dash: true }]} />
    <svg width={w} height={H} role="img" aria-label={summary} tabIndex={0} className="touch-pan-y overflow-visible" onPointerMove={e => pick(e.clientX, e.currentTarget)} onPointerDown={e => pick(e.clientX, e.currentTarget)} onPointerLeave={e => e.pointerType === 'mouse' && setAct(null)} onBlur={() => setAct(null)}
      onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); setAct(v => Math.min(n - 1, (v ?? -1) + 1)) } else if (e.key === 'ArrowLeft') { e.preventDefault(); setAct(v => Math.max(0, (v ?? n) - 1)) } else if (e.key === 'Escape') setAct(null) }}>
      <defs><linearGradient id={gid + 'i'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.inc} stopOpacity=".32" /><stop offset="1" stopColor={C.inc} stopOpacity="0" /></linearGradient><linearGradient id={gid + 'e'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.exp} stopOpacity=".26" /><stop offset="1" stopColor={C.exp} stopOpacity="0" /></linearGradient></defs>
      {ticks.map((v, i) => <g key={i}><line x1={m.l} x2={w - m.r} y1={y(v)} y2={y(v)} stroke={C.grid} strokeWidth="1" strokeDasharray={Math.abs(v) < 1 && lo < 0 ? undefined : '2 4'} /><text x={m.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill={C.ink}>{compactZar(v)}</text></g>)}
      {data.map((d, i) => (i % step === 0 || i === n - 1) && <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 && n > 1 ? 'start' : i === n - 1 && n > 1 ? 'end' : 'middle'} fontSize="11" fontWeight={act === i ? 800 : 400} fill={act === i ? '#17261F' : C.ink}>{d.label}</text>)}
      <motion.path d={area('expenses')} fill={`url(#${gid}e)`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6 }} />
      <motion.path d={area('income')} fill={`url(#${gid}i)`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6 }} />
      {act !== null && <g><line x1={x(act)} x2={x(act)} y1={m.t} y2={m.t + ih} stroke="#17261F" strokeOpacity=".4" strokeDasharray="3 3" /><rect x={x(act) - 18} y={m.t + ih} width="36" height="0" /></g>}
      <motion.path d={path('expenses')} fill="none" stroke={C.exp} strokeWidth="2.5" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9, ease: EASE }} />
      <motion.path d={path('net')} fill="none" stroke="#17261F" strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: .85 }} transition={{ duration: .6 }} />
      <motion.path d={path('income')} fill="none" stroke={C.inc} strokeWidth="3" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9, ease: EASE }} />
      {a ? <g><circle cx={x(act!)} cy={y(a.income)} r="6" fill={C.inc} stroke="#fff" strokeWidth="2.5" /><circle cx={x(act!)} cy={y(a.expenses)} r="6" fill={C.exp} stroke="#fff" strokeWidth="2.5" /><circle cx={x(act!)} cy={y(a.net)} r="5" fill="#17261F" stroke="#fff" strokeWidth="2" /></g> : <g><circle cx={x(n - 1)} cy={y(data[n - 1].income)} r="4.5" fill={C.inc} stroke="#fff" strokeWidth="2" /><circle cx={x(n - 1)} cy={y(data[n - 1].expenses)} r="4.5" fill={C.exp} stroke="#fff" strokeWidth="2" /></g>}
    </svg>
    {a && <div role="status" className="pointer-events-none absolute z-10 rounded-xl border border-line bg-white p-3 text-xs shadow-pop" style={{ left: tipX, top: 30, width: tipW }}><p className="mb-1.5 font-bold">{a.label}{a.from.slice(8) === '01' && a.to.slice(8) === '31' ? '' : `, to ${a.to.split('-').reverse().join('/')}`}</p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5"><dt className="text-mute">Income</dt><dd className="text-right font-bold">{zar(a.income)}</dd><dt className="text-mute">Expenses</dt><dd className="text-right font-bold">{zar(a.expenses)}</dd><dt className="border-t border-line pt-1 text-mute">Net</dt><dd className={`border-t border-line pt-1 text-right font-bold ${a.net < 0 ? 'text-neg' : 'text-pos'}`}>{a.net < 0 ? '−' : '+'}{zar(Math.abs(a.net))}</dd></dl></div>}
    <p className="mt-1 text-meta text-mute">Slide across the chart: the numbers and spending breakdown above follow it. Arrow keys work when it is focused.</p>
    <div className="sr-only"><table><caption>{summary}</caption><thead><tr><th>Period</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead><tbody>{data.map(d => <tr key={d.label + d.from}><td>{d.label}</td><td>{zar(d.income)}</td><td>{zar(d.expenses)}</td><td>{zar(d.net)}</td></tr>)}</tbody></table></div></div>)
}

// Grouped monthly bars (insights): income solid, expenses amber, with values in a hidden table.
export function MonthBars({ data, label }: { data: Bucket[]; label: string }) {
  const [ref, w] = useWidth<HTMLDivElement>(), reduce = useReducedMotion(), H = 220, m = { l: 44, r: 6, t: 8, b: 26 }, iw = w - m.l - m.r, ih = H - m.t - m.b, n = data.length, max = niceMax(Math.max(...data.flatMap(d => [d.income, d.expenses]), 0)), gw = iw / n, bw = Math.max(4, Math.min(18, gw * .32)), y = (v: number) => m.t + ih - (v / max) * ih, step = Math.ceil(40 / gw)
  return (<div ref={ref} className="w-full min-w-0"><Legend items={[{ l: 'Income', c: C.inc }, { l: 'Expenses', c: C.exp }]} /><svg width={w} height={H} role="img" aria-label={label + ': ' + data.map(d => `${d.label} income ${zar(d.income)}, expenses ${zar(d.expenses)}`).join('; ')}><Axis max={max} w={w} m={m} y={y} />
    {data.map((d, i) => { const c = m.l + gw * i + gw / 2; return <g key={i}><motion.rect x={c - bw - 1} width={bw} rx="2" fill={C.inc} initial={reduce ? false : { y: y(0), height: 0 }} animate={{ y: y(d.income), height: y(0) - y(d.income) }} transition={{ duration: .6, ease: EASE, delay: i * .025 }} /><motion.rect x={c + 1} width={bw} rx="2" fill={C.exp} initial={reduce ? false : { y: y(0), height: 0 }} animate={{ y: y(d.expenses), height: y(0) - y(d.expenses) }} transition={{ duration: .6, ease: EASE, delay: i * .025 + .04 }} />{(i % step === 0 || i === n - 1) && <text x={c} y={H - 8} textAnchor="middle" fontSize="11" fill={C.ink}>{d.label}</text>}</g> })}</svg></div>)
}

export interface Seg { name: string; value: number; color: string }
export function Donut({ parts, selected, onSelect, big, small, label }: { parts: Seg[]; selected?: string | null; onSelect?: (n: string | null) => void; big: string; small: string; label: string }) {
  const total = parts.reduce((s, p) => s + p.value, 0), R = 66, CIRC = 2 * Math.PI * R; let off = 0
  return (<div className="relative mx-auto h-[190px] w-[190px]"><svg viewBox="0 0 180 180" className="h-full w-full -rotate-90" role="img" aria-label={`${label}: ` + parts.map(p => `${p.name} ${zar(p.value)}`).join(', ')}><circle cx="90" cy="90" r={R} fill="none" stroke="#EEF2EC" strokeWidth="24" />
    {total > 0 && parts.map(p => { const len = (p.value / total) * CIRC, dash = `${Math.max(0, len - 3)} ${CIRC - Math.max(0, len - 3)}`, o = -off; off += len; const on = selected === p.name
      return <circle key={p.name} cx="90" cy="90" r={R} fill="none" stroke={p.color} strokeWidth={on ? 29 : 24} strokeLinecap="butt" strokeDasharray={dash} strokeDashoffset={o} className={onSelect ? 'cursor-pointer' : ''} style={{ transition: 'stroke-width .2s', opacity: selected && !on ? .4 : 1 }} onClick={() => onSelect?.(on ? null : p.name)} /> })}</svg>
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"><span className="text-[1.65rem] font-extrabold leading-none">{big}</span><span className="mt-1 max-w-[100px] text-meta leading-tight text-mute">{small}</span></div></div>)
}

export interface BarPart { name: string; value: number; color: string; pattern?: boolean }
export function StackBar({ parts, label }: { parts: BarPart[]; label: string }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.value), 0), reduce = useReducedMotion(), fill = (p: BarPart) => p.pattern ? `repeating-linear-gradient(135deg,${p.color} 0 3px,#fff 3px 6px)` : p.color
  if (total <= 0) return null
  return (<div><div role="img" aria-label={label + ': ' + parts.filter(p => p.value > 0).map(p => `${p.name} ${zar(p.value)}`).join(', ')} className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-ground">{parts.filter(p => p.value > 0).map(p => <motion.div key={p.name} className="h-full first:rounded-l-full last:rounded-r-full" style={{ background: fill(p) }} initial={reduce ? false : { width: 0 }} animate={{ width: `${(p.value / total) * 100}%` }} transition={{ duration: .6, ease: EASE }} />)}</div>
    <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">{parts.map(p => <li key={p.name}><span className="flex items-center gap-2 text-xs font-semibold text-mute"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: fill(p) }} aria-hidden />{p.name}</span><span className="block pl-[18px] text-[13.5px] font-bold">{zar(p.value)}</span></li>)}</ul></div>)
}

export interface ProjPoint { m: number; v: number }
export function ProjectionChart({ actual, projected, target, dateM, nowLabel, endLabel }: { actual: ProjPoint[]; projected: ProjPoint[]; target: number; dateM: number | null; nowLabel: string; endLabel: string }) {
  const [ref, w] = useWidth<HTMLDivElement>(), reduce = useReducedMotion(), H = w < 480 ? 210 : 250, m = { l: w < 480 ? 44 : 52, r: 14, t: 14, b: 28 }, iw = w - m.l - m.r, ih = H - m.t - m.b
  const xs = [...actual, ...projected].map(p => p.m), minM = Math.min(0, ...xs), maxM = Math.max(1, ...xs, dateM ?? 0), max = niceMax(Math.max(target, ...actual.map(p => p.v), ...projected.map(p => p.v)) * 1.02)
  const x = (mm: number) => m.l + ((mm - minM) / (maxM - minM)) * iw, y = (v: number) => m.t + ih - (Math.min(v, max) / max) * ih, path = (ps: ProjPoint[]) => ps.map((p, i) => `${i ? 'L' : 'M'}${x(p.m).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
  const summary = `Savings projection. Target ${zar(target)}. Saved now ${zar(actual[actual.length - 1]?.v ?? 0)}. ` + (projected.length > 1 ? `Projected to reach ${zar(projected[projected.length - 1].v)} by ${endLabel}.` : 'No projection at the current contribution.')
  return (<div ref={ref} className="min-w-0"><Legend items={[{ l: 'Saved so far', c: C.inc }, { l: 'Projected', c: C.exp, dash: true }, { l: 'Target', c: '#17261F' }]} />
    <svg width={w} height={H} role="img" aria-label={summary} className="overflow-visible"><Axis max={max} w={w} m={m} y={y} />
      <line x1={m.l} x2={w - m.r} y1={y(target)} y2={y(target)} stroke="#17261F" strokeWidth="1.5" /><text x={w - m.r} y={y(target) - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="#17261F">Target {compactZar(target)}</text>
      {dateM !== null && dateM >= minM && dateM <= maxM && <g><line x1={x(dateM)} x2={x(dateM)} y1={m.t} y2={m.t + ih} stroke={C.neg} strokeDasharray="3 3" /><text x={x(dateM)} y={H - 8} textAnchor={dateM > (minM + maxM) / 2 ? 'end' : 'start'} fontSize="11" fontWeight="700" fill={C.neg}>Target date</text></g>}
      <text x={x(0)} y={H - 8} fontSize="11" fill={C.ink}>{nowLabel}</text>
      {projected.length > 1 && <motion.path key={projected.length + '' + projected[projected.length - 1].v} d={path(projected)} fill="none" stroke={C.exp} strokeWidth="2.75" strokeDasharray="6 4" strokeLinecap="round" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} />}
      {actual.length > 1 && <path d={path(actual)} fill="none" stroke={C.inc} strokeWidth="3" strokeLinecap="round" />}{actual.length > 0 && <circle cx={x(0)} cy={y(actual[actual.length - 1].v)} r="5" fill={C.inc} stroke="#fff" strokeWidth="2" />}</svg><p className="sr-only">{summary}</p></div>)
}
