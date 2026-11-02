using SaFinance.Tax;
var app = WebApplication.CreateBuilder(args).Build();
app.UseDefaultFiles(); app.UseStaticFiles();
app.Use(async (ctx, next) => { ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
    ctx.Response.Headers["Content-Security-Policy"] = "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"; await next(); });
app.MapPost("/api/tax", (TaxInput i) =>
{
    try { return Results.Ok(TaxEngine.Calculate(i)); }
    catch (Exception e) when (e is ArgumentException or NotSupportedException) { return Results.BadRequest(new { error = e.Message }); }
});
app.Run();
