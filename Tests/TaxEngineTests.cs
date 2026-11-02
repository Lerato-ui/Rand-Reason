using SaFinance.Tax; using Xunit;
public class TaxEngineTests
{
    static TaxResult Calc(decimal monthly, int age = 30, int med = 0, decimal ret = 0) => TaxEngine.Calculate(new(2027, monthly, age, ret, med, 0));
    [Fact] public void R450k() { var r = Calc(37_500); Assert.Equal(100_737m, r.TaxBeforeRebates); Assert.Equal(82_917m, r.AnnualTax); }
    [Fact] public void R300k() { var r = Calc(25_000); Assert.Equal(58_392m, r.TaxBeforeRebates); Assert.Equal(40_572m, r.AnnualTax); }
    [Fact] public void BracketBoundary() => Assert.Equal(44_118m, Calc(245_100m / 12).TaxBeforeRebates);
    [Fact] public void BelowThresholdIsZero() => Assert.Equal(0m, Calc(99_000m / 12).AnnualTax);
    [Fact] public void MedicalTwoMembers() { Assert.Equal(9_024m, Calc(37_500, med: 2).MedicalCredit); Assert.Equal(73_893m, Calc(37_500, med: 2).AnnualTax); }
    [Fact] public void AgeRebates() { Assert.Equal(27_585m, Calc(30_000, 65).Rebates); Assert.Equal(30_834m, Calc(30_000, 75).Rebates); }
    [Fact] public void UifCapped() { Assert.Equal(177.12m, Calc(50_000).MonthlyUif); Assert.Equal(150m, Calc(15_000).MonthlyUif); }
    [Fact] public void ZeroIncome() { var r = Calc(0); Assert.Equal(0m, r.AnnualTax); Assert.Equal(0m, r.EffectiveRate); }
    [Fact] public void UnverifiedYearRejected() => Assert.Throws<NotSupportedException>(() => TaxEngine.Calculate(new(2030, 1, 30, 0, 0, 0)));
    [Fact] public void LinesSumToTotal() { var r = Calc(80_000); Assert.Equal(r.TaxBeforeRebates, r.Lines[^1].Running); }
}
