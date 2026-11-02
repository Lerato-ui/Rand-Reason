# Rand & Reason: product design notes

## Concept: the statement
The app is a short book you can edit. Each destination is a chapter written in sentences; the numbers inside the sentences are live inputs (marker-yellow, dotted orange underline). Charts are numbered figures with captions, and margin notes explain the working beside the prose. No dashboard cards.
Type: Fraunces (prose, headings, large figures) and Instrument Sans (labels, tables, UI). Colour: warm paper, ink, deep green for income, one orange for what matters and for expenses, marker yellow for anything editable. Series are never separated by colour alone (income solid, expenses orange, net dotted; values also in text and hidden tables).
Signature interaction: sliding across the cash-flow figure re-writes the opening sentence and redraws the spending figure for that period.

## Sitemap
Overview `/` · Tax `/tax` · Budget `/budget` · Expenses `/expenses` · Goals `/goals` · Insights `/insights` · Learn `/learn` · Settings `/settings`. `/overview` redirects to `/`.
Desktop: a contents index on the left (chapters I to VI, Learn and Settings, search, month). Below 1024px: top bar with month picker and a bottom chapter bar.

## Journeys
| # | Journey | Start | Result | Confusion handled |
|---|---|---|---|---|
| 1 | New user | Overview start screen | Live take-home from one salary field, three entry paths | No fabricated data; says nothing is saved |
| 2 | Take-home | Tax | Take-home, annual tax, bracket table, step table | Pay frequency converted and shown; unsupported inputs listed |
| 3 | Record expenses | Expenses | Ledger, category breakdown on Overview | Validation text, undo on delete |
| 4 | Monthly budget | Budget | Plan vs income vs actual per category | Over-allocation allowed but flagged; savings never counted as spending |
| 5 | Savings target | Goals | Required monthly, completion date, milestones, projection | Growth is an explicit 0% default assumption |
| 6 | Understand a trend | Insights | Observation, evidence, why, contributors, limits | Like-for-like periods only; says what to add when data is thin |
| 7 | Returning user | Overview | Period-switchable cash flow, attention list | Inputs, period and data persist in the browser |

## Wireframes (desktop)
```
Overview                                  [8w|3m|6m|12m]
NET CASH FLOW (big)   Income  Expenses  | WHAT NEEDS ATTENTION
[ cash-flow line chart, tooltip ]       | over-limit, insights
Where the money went (select) | Budget this month
Goals                         | Recent transactions

Tax                                      Budget
[inputs: pay, situation, deductions] | [take-home, tax] [income|savings] [plan bar]
                                     | [metrics] [split bar] [brackets] [steps]  Fixed rows / Variable rows
```

## Data model (localStorage)
`rr-txns` Txn[] (income/expense only; no transfers, so nothing is double counted) · `rr-budget` {income, savings, limits} · `rr-goals` Goal[] {target, saved, date, monthly, rate, log} · `rr-taxinputs` · `rr-takehome` · `rr-period`.
Money is summed in whole cents (`sumR`). Month keys use local dates.

## Not built / limits
No accounts, sync or server storage. No sample-data mode. Insights thresholds are listed on each insight. Tax scope limits are shown on the Tax page.
