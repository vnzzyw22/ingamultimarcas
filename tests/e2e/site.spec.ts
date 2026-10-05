import { expect, test, type Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 1024;

/** Coleta erros de console e exceções não tratadas da página. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function count(page: Page) {
  const text = await page.getByTestId("result-count").innerText();
  return Number(text.match(/\d+/)?.[0] ?? 0);
}

/** Escolhe uma opção no Select próprio (listbox). */
async function pick(page: Page, testId: string, option: string | RegExp) {
  await page.getByTestId(testId).click();
  await page.getByRole("listbox").getByRole("option", { name: option, exact: typeof option === "string" }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
}

async function openFilters(page: Page) {
  if (isMobile(page)) await page.getByRole("button", { name: /^Filtros/ }).click();
}

function filterScope(page: Page) {
  return isMobile(page) ? page.getByRole("dialog", { name: "Filtros" }) : page.getByRole("complementary", { name: "Filtros" });
}

test("1. home carrega com hero, busca e destaques, sem erros de console", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Escolha no estoque");
  await expect(page.getByRole("search", { name: "Busca rápida de veículos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Em destaque" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

test("2. busca rápida leva ao estoque filtrado", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("qs-model")).toBeDisabled();
  await pick(page, "qs-brand", "Toyota");
  await pick(page, "qs-model", "Corolla");
  await page.getByTestId("qs-submit").click();
  await expect(page).toHaveURL(/\/estoque\?marca=toyota&modelo=corolla/);
  await expect(page.getByTestId("result-count")).toHaveText("2 veículos encontrados");
});

test("2b. atalho de carroceria realmente filtra", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("body-shortcut-pickup").click();
  await expect(page).toHaveURL(/carroceria=pickup/);
  const grid = page.getByTestId("vehicle-grid");
  await expect(grid.getByRole("listitem")).toHaveCount(await count(page));
  expect(await count(page)).toBe(4);
});

test("3-6. filtros: marca, preço, combinação, limpar", async ({ page }) => {
  await page.goto("/estoque");
  const total = await count(page);
  expect(total).toBe(26);

  await openFilters(page);
  const scope = filterScope(page);
  // Volkswagen está além das 6 primeiras marcas: exercita "Mostrar mais".
  await scope.getByRole("button", { name: /Mostrar mais/ }).first().click();
  await scope.getByText("Volkswagen", { exact: true }).click();
  await expect(page).toHaveURL(/marca=volkswagen/);
  await expect(page.getByTestId("result-count")).toHaveText("4 veículos encontrados");

  // Modelos dependem da marca
  await expect(scope.getByRole("checkbox", { name: /^T-Cross\b/ })).toBeAttached();
  await expect(scope.getByRole("checkbox", { name: /^Corolla\b/ })).toHaveCount(0);

  // Preço máximo (combinação)
  await scope.getByLabel("Preço máximo").fill("120000");
  await scope.getByLabel("Preço máximo").press("Enter");
  await expect(page).toHaveURL(/preco-max=120000/);
  await expect(page.getByTestId("result-count")).toHaveText("2 veículos encontrados");

  if (isMobile(page)) await page.getByTestId("drawer-apply").click();
  await expect(page.getByRole("list", { name: "Filtros ativos" })).toBeVisible();
  await page.getByRole("button", { name: "Limpar tudo" }).click();
  await expect(page).toHaveURL(/\/estoque$/);
  expect(await count(page)).toBe(total);
});

test("4. filtro de preço sozinho respeita a faixa", async ({ page }) => {
  await page.goto("/estoque?preco-min=100000&preco-max=150000&ordem=menor-preco");
  await expect(page.getByTestId("vehicle-grid")).toBeVisible();
  const prices = await page.locator('[data-testid="vehicle-grid"] article p.font-display').allInnerTexts();
  const values = prices.map((p) => Number(p.replace(/\D/g, "")));
  expect(values.length).toBeGreaterThan(0);
  for (const v of values) {
    expect(v).toBeGreaterThanOrEqual(100000);
    expect(v).toBeLessThanOrEqual(150000);
  }
});

test("7. ordenação por menor preço", async ({ page }) => {
  await page.goto("/estoque");
  await openFilters(page);
  await pick(page, isMobile(page) ? "sort-mobile" : "sort-desktop", "Menor preço");
  await expect(page).toHaveURL(/ordem=menor-preco/);
  if (isMobile(page)) await page.getByTestId("drawer-apply").click();
  await expect(page.getByTestId("vehicle-grid")).toBeVisible();
  const prices = (await page.locator('[data-testid="vehicle-grid"] article p.font-display').allInnerTexts()).map((p) => Number(p.replace(/\D/g, "")));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});

test("select próprio funciona pelo teclado", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByTestId("qs-ymin");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const list = page.getByRole("listbox");
  await expect(list).toBeFocused();
  await page.keyboard.press("ArrowDown"); // primeiro ano (mais recente)
  await page.keyboard.press("Enter");
  await expect(list).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveText("2025");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(trigger).toHaveText("2025");
  await page.getByTestId("qs-submit").click();
  await expect(page).toHaveURL(/ano-min=2025/);
});

test("estado vazio com limpar filtros", async ({ page }) => {
  await page.goto("/estoque?marca=bmw&carroceria=pickup");
  await expect(page.getByText("Não encontramos veículos com esses filtros.")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).last().click();
  await expect(page).toHaveURL(/\/estoque$/);
});

test("8-10. card abre o veículo certo; galeria; WhatsApp contextual", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/estoque?q=corolla+xei");
  await page.getByRole("link", { name: "Toyota Corolla" }).first().click();
  await expect(page).toHaveURL(/\/veiculo\/toyota-corolla-xei-2-0-2024$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Toyota Corolla");
  await expect(page.getByTestId("vehicle-price")).toHaveText("R$ 129.900");

  // Galeria: próxima foto / miniatura / tela cheia
  const gallery = page.getByRole("region", { name: /Fotos do/ });
  const counter = page.getByTestId("gallery-counter");
  await expect(counter).toHaveText(/01\s*\/\s*04/);
  if (!isMobile(page)) {
    await gallery.locator("div[tabindex='0']").hover();
    await gallery.getByRole("button", { name: "Próxima foto" }).first().click();
    await expect(counter).toHaveText(/02\s*\/\s*04/);
  }
  await gallery.getByRole("button", { name: "Ver foto 4 de 4" }).click();
  await expect(counter).toHaveText(/04\s*\/\s*04/);
  await gallery.getByRole("button", { name: "Ver fotos em tela cheia" }).click();
  const full = page.getByRole("dialog", { name: /tela cheia/ });
  await expect(full).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("fullscreen-counter")).toHaveText(/01\s*\/\s*04/);
  await page.keyboard.press("Escape");
  await expect(full).toBeHidden();

  const href = await page.getByTestId("vehicle-whatsapp").first().getAttribute("href");
  const text = decodeURIComponent(new URL(href!).searchParams.get("text")!);
  expect(text).toBe(
    "Olá! Tenho interesse no Toyota Corolla XEi 2.0 2024 anunciado pela Ingá Multimarcas por R$ 129.900 (ref. DEMO-001). Gostaria de receber mais informações.",
  );
  await expect(page.getByRole("heading", { name: "Você também pode gostar" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("'Tenho interesse' monta mensagem com nome e intenção", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url: string) => {
      (window as unknown as { __opened: string[] }).__opened.push(url);
      return null;
    }) as typeof window.open;
  });
  await page.goto("/veiculo/jeep-compass-limited-1-3-t270-2023");
  await page.getByTestId("interest-open").click();
  const dialog = page.getByRole("dialog", { name: "Como podemos ajudar?" });
  await dialog.getByRole("button", { name: "Continuar no WhatsApp" }).click();
  await expect(dialog.getByText("Informe seu nome")).toBeVisible();
  await dialog.getByText("Financiar").click();
  await dialog.getByLabel("Seu nome").fill("Marina");
  await dialog.getByRole("button", { name: "Continuar no WhatsApp" }).click();
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  const msg = decodeURIComponent(new URL(opened[0]!).searchParams.get("text")!);
  expect(msg).toContain("Sou Marina");
  expect(msg).toContain("Jeep Compass Limited 1.3 T270 2023");
  expect(msg).toContain("simular um financiamento");
});

test("11. venda seu carro valida e gera mensagem estruturada (sem falsa confirmação)", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __opened: string[] }).__opened = [];
    window.open = ((url: string) => {
      (window as unknown as { __opened: string[] }).__opened.push(url);
      return null;
    }) as typeof window.open;
  });
  await page.goto("/venda-seu-carro");
  await page.getByTestId("tradein-submit").click();
  await expect(page.getByText("Informe seu nome.")).toBeVisible();
  await expect(page.getByLabel("Nome", { exact: true })).toBeFocused();

  await page.getByLabel("Nome", { exact: true }).fill("Carlos Souza");
  await page.getByLabel("WhatsApp", { exact: true }).fill("44999990000");
  await expect(page.getByLabel("WhatsApp", { exact: true })).toHaveValue("(44) 99999-0000");
  await page.getByLabel("Marca", { exact: true }).fill("Fiat");
  await page.getByLabel("Modelo", { exact: true }).fill("Argo");
  await page.getByLabel("Ano do modelo", { exact: true }).selectOption("2021");
  await page.getByLabel("Quilometragem", { exact: true }).fill("45000");
  await page.getByTestId("tradein-submit").click();

  await expect(page.getByTestId("tradein-ready")).toContainText("Mensagem pronta no WhatsApp");
  await expect(page.getByText(/recebemos|enviado com sucesso/i)).toHaveCount(0);
  const opened = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
  const msg = decodeURIComponent(new URL(opened[0]!).searchParams.get("text")!);
  expect(msg).toContain("*Nome:* Carlos Souza");
  expect(msg).toContain("*Veículo:* Fiat Argo");
  expect(msg).toContain("*Quilometragem:* 45.000 km");
});

test("12. financiamento calcula a parcela", async ({ page }) => {
  await page.goto("/financiamento");
  await page.getByTestId("finance-value").fill("100000");
  await page.getByTestId("finance-down").fill("30000");
  await page.getByRole("button", { name: "48x" }).click();
  // 70.000 a 1,89% a.m. em 48x ≈ R$ 2.231,35
  await expect(page.getByTestId("finance-installment")).toContainText("2.231,35");
  await expect(page.getByText("Simulação estimativa. As condições finais dependem da análise da instituição financeira.")).toBeVisible();
  await page.getByTestId("finance-down").fill("150000");
  await expect(page.getByText("A entrada cobre o valor total")).toBeVisible();
});

test("13. navegação mobile pelo menu", async ({ page }) => {
  test.skip(!isMobile(page), "somente mobile");
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: /Financiamento/ }).click();
  await expect(page).toHaveURL(/\/financiamento$/);
  await expect(menu).toBeHidden();
});

test("14. páginas principais sem erros de console e sem rolagem horizontal", async ({ page }) => {
  const errors = trackErrors(page);
  for (const path of ["/", "/estoque", "/veiculo/ford-mustang-gt-5-0-v8-2020", "/venda-seu-carro", "/financiamento", "/contato", "/sobre", "/rota-inexistente"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Nenhum elemento visível pode ultrapassar a viewport (exceto dentro de áreas com rolagem própria).
    const offenders = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const scrollable = (el: Element | null): boolean => {
        for (let n = el?.parentElement; n; n = n.parentElement) {
          const o = getComputedStyle(n).overflowX;
          if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true;
        }
        return false;
      };
      return [...document.querySelectorAll("main *, header *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > vw + 1 && !scrollable(el) && !el.closest("dialog");
        })
        .slice(0, 3)
        .map((el) => `${el.tagName}.${String(el.className).slice(0, 60)}`);
    });
    expect(offenders, `elementos além da viewport em ${path}`).toEqual([]);
  }
  // 404 da rota inexistente gera um erro de rede esperado no console.
  expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
});

test("15. painel protegido: /admin cai no login, rotas de escrita recusam e o painel não é indexado", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "Painel da loja" })).toBeVisible();
  // sem login, nada de /admin/api devolve dados
  expect((await request.get("/admin/api/backup")).status()).not.toBe(200);
  expect((await request.post("/admin/api/fotos", { multipart: { vehicleId: "x" } })).status()).not.toBe(200);
  // contato sem origem do próprio site é recusado ou ignorado (nunca grava)
  expect([204, 403]).toContain((await request.post("/api/leads", { data: { type: "contato", name: "Teste" } })).status());
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow:\s*\/admin/);
});
