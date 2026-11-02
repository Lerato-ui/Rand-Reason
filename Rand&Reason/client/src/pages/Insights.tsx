import { useMemo } from 'react'; import { Link } from 'react-router-dom'
import { BudgetData, bucketFlows, dmy, Goal, Txn, useLocal, zar } from '../lib'
import { computeInsights } from '../insights'
import { MonthBars } from '../charts'
import { B, Block, Chapter, Chip, Empty, Fig, P } from '../ui'
export default function Insights() {
  const [tx] = useLocal<Txn[]>('rr-txns', []), [b] = useLocal<BudgetData>('rr-budget', { income: 0, limits: {} }), [gs] = useLocal<Goal[]>('rr-goals', [])
  const { items, missing } = useMemo(() => computeInsights(tx, b, gs), [tx, b, gs]), flow = useMemo(() => bucketFlows(tx, '12m'), [tx])
  return (<Chapter n={6} title="Insights" lead={items.length ? <>{items.length} observation{items.length > 1 ? 's' : ''}, each with its figures, its period and its limits.</> : 'Observations come only from what you have recorded. If the data cannot support a statement, it is not made.'}>
    {items.length === 0 ? <Block note="Insights compare like with like, so they need history to compare."><Empty title="Not enough to say anything honest yet" action={<Link className="btn" to="/expenses">Write down some entries</Link>}>The notes below say what to add.</Empty></Block> :
      items.map((i, k) => <Block key={i.id} note={<><Chip tone={i.kind === 'Recommendation' ? 'warn' : 'info'}>{i.kind}</Chip><span className="mt-2 block">{i.limits}</span></>}><div className="flex gap-4"><span className="serif text-[2.6rem] leading-none text-rand">{k + 1}</span><div className="min-w-0"><h2 className="serif text-[1.65rem] leading-tight">{i.obs}</h2><P className="mt-2">{i.evidence}</P><P className="mt-2 !text-mute">{i.why}</P>
        {i.txns && i.txns.length > 0 && <ul className="mt-3 divide-y divide-line border-y border-line text-[15px]">{i.txns.map(t => <li key={t.id} className="flex justify-between gap-3 px-1 py-1.5"><span>{dmy(t.date)} {t.merchant || t.note || t.category}</span><b>{zar(t.amount)}</b></li>)}</ul>}{i.next && <Link className="btnq mt-2" to={i.next.to}>{i.next.label}</Link>}</div></div></Block>)}
    {missing.length > 0 && <Block title="To unlock more"><ul className="list-disc space-y-1.5 pl-5 text-prose font-serif">{missing.map(m => <li key={m}>{m}</li>)}</ul></Block>}
    {tx.length > 0 && <Block title="The last twelve months" note="Green is income and orange is expenses for each month. Months with no entries show as empty."><Fig n="1" title="Money in and out, by month"><MonthBars data={flow} label="Monthly income and expenses" /></Fig></Block>}
  </Chapter>)
}
