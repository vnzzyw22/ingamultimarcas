import { defineConfig, devices } from "@playwright/test";

const PORT = 3250; // exclusiva da Ingá (3100 costuma estar com outro projeto e o Playwright reaproveitaria o servidor errado)

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  // Requer `npm run build` antes.
  // USE_DEMO_DATA=1: os testes usam o estoque demonstrativo, nunca o banco real.
  webServer: { command: `npx next start -p ${PORT}`, port: PORT, reuseExistingServer: true, timeout: 60_000, env: { USE_DEMO_DATA: "1", ALLOW_INDEXING: "1" } },
});
