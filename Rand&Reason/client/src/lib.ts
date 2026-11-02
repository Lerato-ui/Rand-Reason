import { useEffect, useState } from 'react'
const f = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })
export const zar = (v: number) => f.format(v)
export const pct = (v: number) => `${(v * 100).toFixed(1)}%`
export const CATS = ['Rent','Groceries','Transport','Electricity','Data & airtime','Medical','Insurance','Education','Debt','Family support','Entertainment','Other']
export interface Txn { id: string; type: 'income' | 'expense'; amount: number; category: string; date: string; note: string; merchant?: string }
export type Kind = 'home' | 'study' | 'safety' | 'business' | 'travel' | 'vehicle' | 'other'
export const KINDS: { id: Kind; label: string }[] = [{ id: 'home', label: 'Home' }, { id: 'study', label: 'Further study' }, { id: 'safety', label: 'Emergency fund' }, { id: 'business', label: 'Business' }, { id: 'travel', label: 'Travel' }, { id: 'vehicle', label: 'Vehicle' }, { id: 'other', label: 'Other' }]
export interface Contribution { date: string; amount: number }
export interface Goal { id: string; name: string; target: number; saved: number; date: string; kind?: Kind; monthly?: number; rate?: number; log?: Contribution[] }
// Our own grouping for the budget view (not a statutory classification).
export const FIXED = ['Rent', 'Debt', 'Insurance', 'Education', 'Family support']
export const VARIABLE = ['Groceries', 'Transport', 'Electricity', 'Data & airtime', 'Medical', 'Entertainment', 'Other']
export const ESSENTIAL = ['Rent', 'Groceries', 'Transport', 'Electricity', 'Data & airtime', 'Medical', 'Insurance', 'Education', 'Debt', 'Family support']
export const FLEX = ['Entertainment', 'Other']
export interface BracketLine { lower: number; upper: number | null; rate: number; amount: number; tax: number; running: number }
export interface TaxResult { grossAnnual: number; retirementAllowed: number; taxable: number; taxBeforeRebates: number; rebates: number; medicalCredit: number; annualTax: number; monthlyTaxEstimate: number; monthlyUif: number; monthlyTakeHome: number; effectiveRate: number; marginalRate: number; lines: BracketLine[] }
export interface TaxInput { taxYear: number; monthlyGross: number; age: number; monthlyRetirement: number; medicalMembers: number; monthlyOther: number }
// Local persistence only: data lives in this browser (no sync, no backup). Export/clear it from Settings in a later version.
export function useLocal<T>(key: string, init: T) {
  const [v, s] = useState<T>(() => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* storage full or blocked */ } }, [key, v])
  return [v, s] as const
}
// All tax maths happens in the C# engine; the frontend never re-implements SARS rules.
export async function fetchTax(i: TaxInput, signal?: AbortSignal): Promise<TaxResult> {
  const r = await fetch('/api/tax', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(i), signal })
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Tax service unavailable')
  return r.json()
}
export interface BudgetData { income: number; limits: Record<string, number>; savings?: number }
const p2 = (n: number) => String(n).padStart(2, '0')
export const isoDate = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
export const monthKey = (d = new Date()) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}`
export const prevMonthKey = (d = new Date()) => monthKey(new Date(d.getFullYear(), d.getMonth() - 1, 1))
export const shiftMonth = (key: string, n: number) => { const [y, m] = key.split('-').map(Number); return monthKey(new Date(y, m - 1 + n, 1)) }
export const spendBy = (tx: Txn[], m: string) => tx.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce<Record<string, number>>((a, t) => ({ ...a, [t.category]: (a[t.category] ?? 0) + t.amount }), {})
export const status = (limit: number, spent: number) => limit <= 0 ? (spent > 0 ? 'No limit set' : '—') : spent > limit ? 'Over limit' : spent >= 0.8 * limit ? 'Near limit (80%+)' : 'On track'

export const monthsLeft = (iso: string, now = new Date()) => { const d = new Date(iso + 'T00:00:00'); return (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth() + (d.getDate() - now.getDate()) / 30.4375 }
// Goal maths. Rate is an optional, user-supplied annual growth assumption (0 = none). Contributions are assumed at each month end.
export const mRate = (annualPct: number) => annualPct > 0 ? Math.pow(1 + annualPct / 100, 1 / 12) - 1 : 0
export function requiredMonthly(target: number, saved: number, months: number, annualPct = 0): number | null {
  if (months <= 0) return null; const i = mRate(annualPct), need = target - saved * Math.pow(1 + i, months)
  if (need <= 0) return 0; return i === 0 ? need / months : need * i / (Math.pow(1 + i, months) - 1)
}
export function monthsToReach(target: number, saved: number, contribution: number, annualPct = 0): number | null {
  if (saved >= target) return 0; const i = mRate(annualPct)
  if (i === 0) return contribution > 0 ? (target - saved) / contribution : null
  const num = target * i + contribution, den = saved * i + contribution
  return den <= 0 || num <= den ? null : Math.log(num / den) / Math.log(1 + i)
}
export const addMonths = (m: number, now = new Date()) => new Date(now.getFullYear(), now.getMonth() + Math.ceil(m), now.getDate())
export const monthYear = (d: Date) => d.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })
export const isoIn = (months: number) => isoDate(addMonths(months))
export function useTax(i: TaxInput | null) {
  const [r, setR] = useState<TaxResult | null>(null); const [err, setErr] = useState(''); const key = JSON.stringify(i)
  useEffect(() => { if (!i) return; const ac = new AbortController(); const t = setTimeout(() => fetchTax(i, ac.signal).then(x => { setR(x); setErr('') }).catch(e => e.name !== 'AbortError' && setErr(e.message)), 250); return () => { clearTimeout(t); ac.abort() } }, [key]) // eslint-disable-line
  return { r, err }
}

// ---- Money: sum in whole cents so totals never drift ----
export const cents = (n: number) => Math.round((n + Number.EPSILON) * 100)
export const r2 = (n: number) => cents(n) / 100
export const sumR = (xs: number[]) => xs.reduce((s, x) => s + cents(x), 0) / 100
export const compactZar = (v: number) => { const a = Math.abs(v); return (v < 0 ? '−' : '') + 'R' + (a >= 1e6 ? (a / 1e6).toFixed(a % 1e6 ? 1 : 0) + 'm' : a >= 1e3 ? (a / 1e3).toFixed(a % 1e3 ? 1 : 0) + 'k' : String(Math.round(a))) }
export const dmy = (iso: string) => iso.split('-').reverse().join('/')
export const fmtDay = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

// ---- Cash-flow aggregation ----
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export type Period = '8w' | '3m' | '6m' | '12m'
export const PERIODS: { id: Period; label: string; long: string }[] = [{ id: '8w', label: '8 weeks', long: 'the last 8 weeks' }, { id: '3m', label: '3 months', long: 'the last 3 months' }, { id: '6m', label: '6 months', long: 'the last 6 months' }, { id: '12m', label: '12 months', long: 'the last 12 months' }]
export interface Bucket { label: string; from: string; to: string; income: number; expenses: number; net: number }
// Transfers do not exist in the model: only income and expense transactions are counted, each exactly once.
export function bucketFlows(tx: Txn[], period: Period, now = new Date()): Bucket[] {
  const ranges: { label: string; from: string; to: string }[] = []
  if (period === '8w') for (let i = 7; i >= 0; i--) { const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7 * i), start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6); ranges.push({ label: `${start.getDate()} ${MON[start.getMonth()]}`, from: isoDate(start), to: isoDate(end) }) }
  else { const n = period === '3m' ? 3 : period === '6m' ? 6 : 12; for (let i = n - 1; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1), k = monthKey(d); ranges.push({ label: MON[d.getMonth()] + (n > 6 ? ` ${String(d.getFullYear()).slice(2)}` : ''), from: k + '-01', to: k + '-31' }) } }
  return ranges.map(r => { const inR = tx.filter(t => t.date >= r.from && t.date <= r.to), income = sumR(inR.filter(t => t.type === 'income').map(t => t.amount)), expenses = sumR(inR.filter(t => t.type === 'expense').map(t => t.amount)); return { ...r, income, expenses, net: r2(income - expenses) } })
}
export const inRange = (tx: Txn[], from: string, to: string) => tx.filter(t => t.date >= from && t.date <= to)
export function byCategory(tx: Txn[]) { const m: Record<string, number> = {}; for (const t of tx) if (t.type === 'expense') m[t.category] = (m[t.category] ?? 0) + cents(t.amount); return Object.entries(m).map(([name, c]) => ({ name, value: c / 100 })).sort((a, b) => b.value - a.value) }

// ---- Selected month, shared by the top bar and every page ----
export const monthOptions = (n = 18, now = new Date()) => Array.from({ length: n }, (_, i) => monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)))
export const monthLabel = (k: string) => new Date(+k.slice(0, 4), +k.slice(5) - 1, 1).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
export function useMonth() { const [m, setM] = useLocal<string>('rr-month', monthKey()); return [m, setM] as const }
export const pctChange = (a: number, b: number) => b > 0 ? Math.round(((a - b) / b) * 100) : null

// ---- Sample data: separate from real data, always labelled, removable in one click ----
export const SAMPLE_KEYS = ['rr-txns', 'rr-budget', 'rr-goals', 'rr-taxinputs', 'rr-takehome']
export function makeSample(now = new Date()) {
  const txns: Txn[] = [], M: [string, number, number, string][] = [['Rent', 9500, 1, 'Landlord'], ['Groceries', 640, 8, 'Checkers'], ['Transport', 390, 5, 'Uber'], ['Electricity', 900, 1, 'City Power'], ['Data & airtime', 499, 1, 'Vodacom'], ['Entertainment', 260, 4, 'Ster-Kinekor'], ['Medical', 350, 1, 'Dis-Chem']]
  for (let mo = 0; mo < 8; mo++) { const d0 = new Date(now.getFullYear(), now.getMonth() - mo, 1), k = monthKey(d0), last = mo === 0 ? now.getDate() : 28
    txns.push({ id: `s-i${mo}`, type: 'income', amount: 28500, category: 'Other', date: `${k}-01`, note: 'Salary', merchant: 'Employer' })
    M.forEach(([c, a, n, m], ci) => { for (let j = 0; j < n; j++) { const day = Math.min(28, 1 + Math.floor(j * 27 / Math.max(n, 1)) + (ci % 3)); if (day > last) continue; const wobble = 1 + (((mo * 7 + j * 3 + ci * 5) % 9) - 4) / 20, amt = c === 'Rent' ? a : r2(a * wobble * (c === 'Transport' && mo === 0 ? 1.45 : 1)); txns.push({ id: `s-${c}-${mo}-${j}`, type: 'expense', amount: amt, category: c, date: `${k}-${String(day).padStart(2, '0')}`, note: '', merchant: m }) } }) }
  const budget: BudgetData = { income: 28500, savings: 3000, limits: { Rent: 9500, Groceries: 5500, Transport: 1800, Electricity: 1000, 'Data & airtime': 550, Entertainment: 1200, Medical: 400 } }
  const y = now.getFullYear(), mm = String(now.getMonth() + 1).padStart(2, '0'), dd = String(Math.min(now.getDate(), 28)).padStart(2, '0')
  const goals: Goal[] = [{ id: 's-g1', name: 'Home deposit', kind: 'home', target: 150000, saved: 42000, date: `${y + 2}-06-30`, monthly: 4500, log: [3, 2, 1].map(i => ({ date: isoDate(new Date(now.getFullYear(), now.getMonth() - i, 25)), amount: 3000 })) }, { id: 's-g2', name: 'Emergency fund', kind: 'safety', target: 60000, saved: 15000, date: `${y + 1}-12-31` }]
  void mm; void dd; return { txns, budget, goals }
}
