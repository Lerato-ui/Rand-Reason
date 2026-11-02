namespace SaFinance.Tax;

// All money is decimal. Statutory figures are rounded to cents only at the end (AwayFromZero).
public record Bracket(decimal Lower, decimal? Upper, decimal Rate);
public record TaxYearConfig(int Year, string Label, Bracket[] Brackets, decimal Primary, decimal Secondary, decimal Tertiary,
    decimal MedMain, decimal MedFirstDep, decimal MedExtraDep, decimal RetCap, decimal RetPct,
    decimal UifRate, decimal UifCeiling, string Source, string Verified);

public static class TaxYears
{
    // Source: SARS Budget 2026 Tax Guide (Treasury); cross-checked against the SARS employer guide and secondary sources.
    public static readonly TaxYearConfig Y2027 = new(2027, "2026/27 (1 Mar 2026 – 28 Feb 2027)",
        new[] {
            new Bracket(0, 245_100, .18m), new Bracket(245_100, 383_100, .26m), new Bracket(383_100, 530_200, .31m),
            new Bracket(530_200, 695_800, .36m), new Bracket(695_800, 887_000, .39m), new Bracket(887_000, 1_878_600, .41m),
            new Bracket(1_878_600, null, .45m) },
        17_820m, 9_765m, 3_249m, 376m, 376m, 254m, 430_000m, .275m, .01m, 17_712m,
        "SARS Budget 2026 Tax Guide; sars.gov.za/tax-rates", "2026-10-19");

    public static TaxYearConfig Get(int year) => year == 2027 ? Y2027
        : throw new NotSupportedException($"Tax year {year} has not been verified; no calculation provided.");
}

public record TaxInput(int TaxYear, decimal MonthlyGross, int Age, decimal MonthlyRetirement, int MedicalMembers, decimal MonthlyOther);
public record BracketLine(decimal Lower, decimal? Upper, decimal Rate, decimal Amount, decimal Tax, decimal Running);
public record TaxResult(decimal GrossAnnual, decimal RetirementAllowed, decimal Taxable, decimal TaxBeforeRebates,
    decimal Rebates, decimal MedicalCredit, decimal AnnualTax, decimal MonthlyTaxEstimate, decimal MonthlyUif,
    decimal MonthlyTakeHome, decimal EffectiveRate, decimal MarginalRate, IReadOnlyList<BracketLine> Lines);

public static class TaxEngine
{
    static decimal R(decimal v) => Math.Round(v, 2, MidpointRounding.AwayFromZero);

    public static TaxResult Calculate(TaxInput i)
    {
        var c = TaxYears.Get(i.TaxYear);
        if (i.MonthlyGross < 0 || i.MonthlyRetirement < 0 || i.MonthlyOther < 0 || i.MedicalMembers < 0 || i.Age is < 0 or > 120)
            throw new ArgumentException("Inputs must be non-negative and age realistic.");

        var gross = i.MonthlyGross * 12m;                                   // assumes 12 equal payments
        var ret = Math.Min(i.MonthlyRetirement * 12m, Math.Min(c.RetCap, c.RetPct * gross));
        var taxable = Math.Max(0, gross - ret);

        var lines = new List<BracketLine>(); decimal running = 0, marginal = 0;
        foreach (var b in c.Brackets)
        {
            var top = b.Upper ?? decimal.MaxValue;
            var amt = Math.Max(0, Math.Min(taxable, top) - b.Lower);
            if (amt <= 0) continue;
            running += amt * b.Rate; marginal = b.Rate;
            lines.Add(new BracketLine(b.Lower, b.Upper, b.Rate, amt, R(amt * b.Rate), R(running)));
        }
        var before = running;
        var rebate = c.Primary + (i.Age >= 65 ? c.Secondary : 0) + (i.Age >= 75 ? c.Tertiary : 0);
        var med = i.MedicalMembers == 0 ? 0 :
            12m * (c.MedMain + (i.MedicalMembers >= 2 ? c.MedFirstDep : 0) + Math.Max(0, i.MedicalMembers - 2) * c.MedExtraDep);
        var annual = Math.Max(0, before - rebate - med);
        var uif = Math.Min(i.MonthlyGross, c.UifCeiling) * c.UifRate;
        var monthlyTax = annual / 12m;                                      // simplified estimate, NOT payroll PAYE
        var take = i.MonthlyGross - monthlyTax - uif - i.MonthlyRetirement - i.MonthlyOther;
        return new TaxResult(R(gross), R(ret), R(taxable), R(before), R(rebate), R(med), R(annual), R(monthlyTax), R(uif),
            R(take), gross == 0 ? 0 : annual / gross, taxable == 0 ? 0 : marginal, lines);
    }
}
