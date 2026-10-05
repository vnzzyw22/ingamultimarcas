// Captura a busca da home com uma lista aberta. Uso: node scripts/dev/shot-qs.mjs <largura> <altura> <saida.png> <testId>
import { chromium, devices } from "@playwright/test";
const [, , w, h, out, testId] = process.argv;
const b = await chromium.launch();
const ctx = await b.newContext({ ...(Number(w) < 800 ? devices["Pixel 7"] : {}), viewport: { width: Number(w), height: Number(h) } });
const p = await ctx.newPage();
await p.goto((process.env.BASE ?? "http://localhost:3100") + "/", { waitUntil: "networkidle" });
await p.getByTestId("qs-brand").click();
await p.getByRole("option", { name: "Toyota", exact: true }).click();
await p.getByTestId(testId).scrollIntoViewIfNeeded();
await p.getByTestId(testId).click();
await p.keyboard.press("ArrowDown");
await p.waitForTimeout(400);
await p.screenshot({ path: out });
await b.close();
