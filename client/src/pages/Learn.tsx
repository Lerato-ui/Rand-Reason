import { useEffect } from 'react'; import { Link, useLocation } from 'react-router-dom'
import { Block, Chapter } from '../ui'
const A = [
 { id: 'tax', t: 'How South African income tax works', b: 'Tax is progressive: each slice of taxable income is taxed at its own rate, from 18% to 45% for 2026/27. A rebate then reduces the tax itself. Moving into a higher bracket never taxes all your income at the higher rate, only the part above the threshold.', to: '/tax', l: 'Open the tax calculator' },
 { id: 'takehome', t: 'Gross, taxable, tax and take-home', b: 'Gross is your agreed pay. Taxable income is gross less allowed deductions such as retirement contributions. Tax liability is what the brackets, rebates and credits produce for the year. PAYE is what your employer withholds towards it each pay period. Take-home is what remains after PAYE, UIF and your other deductions.', to: '/tax', l: 'See the steps for your salary' },
 { id: 'budget', t: 'Budgeting when income moves around', b: 'Plan on a lower-than-average month and cover fixed commitments first. When a better month arrives, move the extra towards a goal before it gets absorbed into spending.', to: '/budget', l: 'Open the budget' },
 { id: 'cushion', t: 'Building an emergency fund', b: 'A common starting point is one month of essential costs, growing towards three to six. Start small: R500 a month is R6,000 in a year.', to: '/goals', l: 'Create a goal' },
 { id: 'payment', t: 'Before you commit to a monthly payment', b: 'An instalment looks smaller than the total it adds up to. Add the interest and fees over the whole term, then check what is left of your month after it is paid.', to: '/budget', l: 'See what it leaves you' },
 { id: 'interest', t: 'Interest and inflation', b: 'Interest grows savings; inflation reduces what each rand buys. R10,000 growing at 7% against 5% inflation gains about 2% in real terms. Projections are not guarantees.', to: '/goals', l: 'Plan a goal' }]
export default function Learn() {
  const { hash } = useLocation(); useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView() }, [hash])
  return (<Chapter title="Learn" lead="Plain explanations of the numbers behind everyday money decisions. General education, not personal advice.">{A.map(a => <Block key={a.id} note={<Link className="btnq" to={a.to}>{a.l} →</Link>}><div id={a.id} className="scroll-mt-6"><h2 className="serif text-[1.75rem] leading-tight">{a.t}</h2><p className="serif mt-2 text-prose">{a.b}</p></div></Block>)}
    <p className="cap">Tax source: SARS Budget 2026 Tax Guide (sars.gov.za). Check current figures with SARS before relying on them.</p></Chapter>)
}
