import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { monthLabel, monthOptions, SAMPLE_KEYS, useMonth } from './lib'
import { ToastProvider } from './ui'
import Overview from './pages/Overview'; import Tax from './pages/Tax'; import Budget from './pages/Budget'; import Expenses from './pages/Expenses'; import Goals from './pages/Goals'; import Insights from './pages/Insights'; import Settings from './pages/Settings'; import Learn from './pages/Learn'
const NAV = [{ to: '/', l: 'Overview', n: 'I' }, { to: '/tax', l: 'Tax', n: 'II' }, { to: '/budget', l: 'Budget', n: 'III' }, { to: '/expenses', l: 'Expenses', n: 'IV' }, { to: '/goals', l: 'Goals', n: 'V' }, { to: '/insights', l: 'Insights', n: 'VI' }]
const SECOND = [{ to: '/learn', l: 'Learn', n: '' }, { to: '/settings', l: 'Settings', n: '' }]
const Mark = ({ cls = '' }: { cls?: string }) => <NavLink to="/" aria-label="Rand & Reason, overview" className={`serif text-[1.65rem] font-semibold leading-none tracking-tight ${cls}`}>Rand <span className="text-rand">&amp;</span> Reason</NavLink>
export default function App() {
  const loc = useLocation(), nav = useNavigate(), [more, setMore] = useState(false), [month, setMonth] = useMonth(), [q, setQ] = useState('')
  useEffect(() => { setMore(false); window.scrollTo(0, 0) }, [loc.pathname])
  const opts = monthOptions(); if (!opts.includes(month)) opts.push(month)
  const link = (n: { to: string; l: string; n: string }) => <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `group flex min-h-[40px] items-baseline gap-3 py-1.5 ${isActive ? 'font-bold' : 'text-ink/75 hover:text-ink'}`}>{({ isActive }) => <><span className={`w-6 shrink-0 text-right text-[11px] font-semibold ${isActive ? 'text-rand' : 'text-mute'}`}>{n.n}</span><span className={`serif text-[1.2rem] leading-tight ${isActive ? 'bg-mark px-1' : 'group-hover:bg-mark/60 px-1'}`}>{n.l}</span></>}</NavLink>
  const MonthSel = () => <><label htmlFor="mo" className="sr-only">Month</label><select id="mo" className="inp !h-10 !w-auto !pr-7 !text-[0.95rem] font-semibold" value={month} onChange={e => setMonth(e.target.value)}>{opts.map(k => <option key={k} value={k}>{monthLabel(k)}</option>)}</select></>
  return (<ToastProvider><div className="min-h-screen lg:pl-64">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:bg-paper focus:p-3">Skip to content</a>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r-2 border-ink bg-paper px-6 py-8 lg:flex" aria-label="Application"><Mark />
      <p className="mt-1 text-[12px] text-mute">Your money, in plain sentences.</p>
      <nav className="mt-9 flex flex-col" aria-label="Chapters"><p className="eyebrow mb-1">Contents</p>{NAV.map(link)}</nav>
      <form role="search" className="relative mt-8" onSubmit={e => { e.preventDefault(); nav(`/expenses?q=${encodeURIComponent(q)}`) }}><Search size={15} className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-mute" aria-hidden /><label htmlFor="gs" className="sr-only">Search transactions</label><input id="gs" className="inp !h-10 !pl-7 !text-[0.95rem]" placeholder="Find a transaction" value={q} onChange={e => setQ(e.target.value)} /></form>
      <div className="mt-4"><p className="eyebrow mb-1">Reading</p><MonthSel /></div>
      <nav className="mt-auto border-t border-line pt-4" aria-label="Secondary">{SECOND.map(link)}<p className="mt-3 text-[11.5px] text-mute">Records stay in this browser only.</p></nav></aside>
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b-2 border-ink bg-paper px-4 lg:hidden"><Mark cls="!text-[1.35rem]" /><MonthSel /></header>
    {localStorage.getItem('rr-sample') && <div role="status" className="border-b border-ink bg-mark px-4 py-2 text-center text-[13px] font-semibold">You are reading invented sample data, not your own. <button className="underline underline-offset-4" onClick={() => { SAMPLE_KEYS.concat(['rr-sample']).forEach(k => localStorage.removeItem(k)); location.reload() }}>Remove sample data</button></div>}
    <main id="main">
      <Routes><Route path="/" element={<Overview />} /><Route path="/overview" element={<Navigate to="/" replace />} /><Route path="/tax" element={<Tax />} /><Route path="/budget" element={<Budget />} /><Route path="/expenses" element={<Expenses />} /><Route path="/goals" element={<Goals />} /><Route path="/insights" element={<Insights />} /><Route path="/learn" element={<Learn />} /><Route path="/settings" element={<Settings />} />
        <Route path="*" element={<div className="px-8 py-24"><h1 className="text-h1">That page does not exist.</h1><NavLink className="btnq mt-3" to="/">Back to the start</NavLink></div>} /></Routes>
      <footer className="mx-auto max-w-[1080px] px-5 pb-28 text-meta text-mute sm:px-8 lg:pb-10"><p className="max-w-2xl border-t border-line pt-4">Rand &amp; Reason gives estimates for planning. It is not tax or financial advice and nothing here is a SARS assessment.</p></footer></main>
    {more && <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="More"><button className="absolute inset-0 bg-ink/60" aria-label="Close" onClick={() => setMore(false)} /><div className="absolute inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] border-t-2 border-ink bg-paper px-6 py-3"><div className="flex justify-end"><button aria-label="Close" onClick={() => setMore(false)}><X size={20} /></button></div>{[NAV[5], ...SECOND].map(link)}</div></div>}
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Chapters">
      {NAV.slice(0, 5).map(n => <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `flex min-h-[58px] flex-col items-center justify-center gap-0.5 ${isActive ? 'bg-mark font-bold' : ''}`}><span className="text-[10px] font-semibold text-rand">{n.n}</span><span className="serif text-[13px] leading-none">{n.l}</span></NavLink>)}
      <button onClick={() => setMore(!more)} aria-expanded={more} className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 ${more ? 'bg-mark font-bold' : ''}`}><span className="text-[10px] font-semibold text-rand">VI+</span><span className="serif text-[13px] leading-none">More</span></button></nav>
  </div></ToastProvider>)
}
