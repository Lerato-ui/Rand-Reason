# SA Finance — Visual Studio setup

This project contains an ASP.NET Core 8 (C#) API and a React + TypeScript frontend. 

## Requirements

- Visual Studio 2022 with the **ASP.NET and web development** workload.
- .NET 8 SDK. In Visual Studio Installer, modify your installation if the .NET 8 SDK/targeting pack is missing.
- Node.js LTS (includes npm), available from https://nodejs.org/.

> This project targets **.NET 8**, not .NET 10. You do not need to retarget it to run it in Visual Studio 2022.

## First-time setup (recommended)

1. Extract `SaFinance_VisualStudio.zip` to a normal folder, for example `C:\Users\YourName\source\repos\Rand & Reason`.
2. Open Visual Studio 2022.
3. Select **Open a project or solution** and open `Rand & Reason.csproj` from the extracted `Rand & Reason` folder.
4. In Visual Studio, choose **View > Terminal**. Make sure the terminal is in the `Rand & Reason` project folder (the folder containing `Rand & Reason.csproj`).
5. Install the React dependencies:

   ```powershell
   cd client
   npm install
   ```

6. Build the React frontend so its files are placed in the ASP.NET app's `wwwroot` folder:

   ```powershell
   npm run build
   ```

   If the build fails, read the first TypeScript/build error shown in the terminal and fix that before continuing. The first build requires internet access so npm can download the packages.

7. Return to Visual Studio. In **Solution Explorer**, right-click the `Rand & Reason` project and select **Set as Startup Project** if necessary.
8. In the run-target dropdown beside the green Start button, select the **SaFinance** project profile (not IIS Express if you want the configured local URL).
9. Press **Ctrl+F5** to run without debugging, or **F5** to run with debugging.
10. Open `http://localhost:5000` in your browser. The React interface should load, and tax calculations are sent to the C# API at `/api/tax`.

## Frontend development mode (optional)

Use this when you want React changes to refresh without rebuilding the frontend every time.

1. Keep the first-time `npm install` completed.
2. Run the ASP.NET Core project from Visual Studio. Its API should be available at `http://localhost:5000`.
3. Open a **second** terminal in Visual Studio and run:

   ```powershell
   cd client
   npm run dev
   ```

4. Open the Vite URL printed in that terminal (usually `http://localhost:5173`). Vite proxies `/api` requests to `http://localhost:5000`.
5. When you are finished developing, stop the Vite server with **Ctrl+C**. To run the normal built site again, run `npm run build` in `client` and then start the ASP.NET project.

## Run the automated tests

In the Visual Studio terminal, from the folder containing `Rand & Reason.csproj`, run:

```powershell
dotnet test .\Tests\SaFinance.Tests.csproj
```

You can also right-click the test project (if loaded into the solution) and use Visual Studio's Test Explorer. If the test project does not appear automatically, use **Test > Configure Run Settings** or open `Tests\Rand & Reason.Tests.csproj` separately, or run the command above.

## Common problems

- **`npm` is not recognized:** install Node.js LTS, then close and reopen Visual Studio so its terminal refreshes PATH.
- **The page is blank or returns 404:** confirm `npm run build` completed successfully and created `wwwroot\index.html`.
- **Port 5000 is already in use:** stop the other process using that port, or change the launch URL and the Vite proxy together in `client\vite.config.ts`.
- **A .NET SDK/targeting-pack error appears:** install the .NET 8 SDK and ASP.NET Core 8 targeting pack through Visual Studio Installer or the official .NET download page.
- **Tax API errors:** keep the ASP.NET Core app running while using the React development server; the frontend needs `/api/tax` for tax calculations.

## Project notes

- C# tax calculations: `Tax/TaxEngine.cs`
- API endpoint: `POST /api/tax`
- React pages: Overview, Tax, Expenses, Budget, Goals, Insights, Learn, and Settings
- Browser data is stored in local storage on that browser/device only; there is no account-based cloud sync or backup.
- The tax output is an estimate, not a SARS assessment or professional tax advice.


