import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'
// Dev: proxies /api to the C# backend. Build: outputs into ../wwwroot so `dotnet run` serves it.
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': 'http://localhost:5000' } }, build: { outDir: '../wwwroot', emptyOutDir: true } })
