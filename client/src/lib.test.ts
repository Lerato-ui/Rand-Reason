import { describe, expect, it } from 'vitest'
import { bucketFlows, byCategory, monthKey, monthsToReach, prevMonthKey, requiredMonthly, shiftMonth, sumR, Txn } from './lib'
const t = (o: Partial<Txn>): Txn => ({ id: Math.random().toString(), type: 'expense', amount: 10, category: 'Groceries', date: '2026-10-05', note: '', ...o })
describe('money', () => { it('sums in cents without float drift', () => { expect(0.1 + 0.2).not.toBe(0.3); expect(sumR([0.1, 0.2])).toBe(0.3); expect(sumR([19.99, 5.01, 0.1])).toBe(25.1) }) })
describe('month keys use local dates', () => {
  it('formats and shifts', () => { expect(monthKey(new Date(2026, 0, 1, 0, 30))).toBe('2026-01'); expect(prevMonthKey(new Date(2026, 0, 1))).toBe('2025-12'); expect(shiftMonth('2026-01', -1)).toBe('2025-12'); expect(shiftMonth('2026-12', 1)).toBe('2027-01') })
})
describe('goal maths', () => {
  it('no growth: remaining / months', () => { expect(requiredMonthly(12000, 0, 12)).toBe(1000); expect(requiredMonthly(12000, 6000, 12)).toBe(500) })
  it('zero when already funded, null when date passed', () => { expect(requiredMonthly(1000, 1000, 6)).toBe(0); expect(requiredMonthly(1000, 0, 0)).toBeNull() })
  it('timeline inverts required contribution (with and without growth)', () => { for (const r of [0, 6]) { const c = requiredMonthly(100000, 10000, 24, r)!; expect(monthsToReach(100000, 10000, c, r)!).toBeCloseTo(24, 6) } })
  it('never reached with no contribution and no savings', () => { expect(monthsToReach(1000, 0, 0, 0)).toBeNull(); expect(monthsToReach(1000, 0, 0, 5)).toBeNull(); expect(monthsToReach(1000, 1000, 0)).toBe(0) })
  it('growth lowers the required contribution', () => { expect(requiredMonthly(100000, 0, 24, 8)!).toBeLessThan(requiredMonthly(100000, 0, 24, 0)!) })
})
describe('cash flow', () => {
  const now = new Date(2026, 9, 21)
  it('buckets monthly and counts each transaction once', () => {
    const tx = [t({ amount: 100.1, date: '2026-10-02' }), t({ amount: 50.2, date: '2026-10-31' }), t({ type: 'income', amount: 1000, date: '2026-09-30' }), t({ amount: 5, date: '2025-01-01' })]
    const b = bucketFlows(tx, '3m', now); expect(b.map(x => x.label)).toEqual(['Aug', 'Sep', 'Oct']); expect(b[2].expenses).toBe(150.3); expect(b[1].income).toBe(1000); expect(b[1].net).toBe(1000); expect(b.reduce((s, x) => s + x.expenses, 0)).toBe(150.3)
  })
  it('weekly buckets are contiguous and cover 56 days', () => { const b = bucketFlows([t({ date: '2026-10-21' }), t({ date: '2026-08-27' })], '8w', now); expect(b).toHaveLength(8); expect(b[7].to).toBe('2026-10-21'); expect(b[0].from).toBe('2026-08-27'); expect(b[7].expenses).toBe(10); expect(b[0].expenses).toBe(10) })
  it('ranks categories by spend and ignores income', () => { const r = byCategory([t({ amount: 5 }), t({ category: 'Rent', amount: 50 }), t({ type: 'income', amount: 999 })]); expect(r).toEqual([{ name: 'Rent', value: 50 }, { name: 'Groceries', value: 5 }]) })
})
