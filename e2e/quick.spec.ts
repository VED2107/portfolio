import { expect, test } from "@playwright/test";

test("Quick View has all sections and at least nine records", async ({ page }) => {
  await page.goto("/quick");
  await expect(page.getByRole("heading", { name: "Ved Chauhan", level: 1 })).toBeVisible();
  for (const id of ["work", "studio", "releases", "about", "playground", "contact"]) {
    await expect(page.locator(`section#${id}`).getByRole("heading", { level: 2 })).toBeVisible();
  }
  const records = page.locator("#work").getByRole("link").and(page.locator('[href^="/work/"]'));
  expect(await records.count()).toBeGreaterThanOrEqual(9);
});

test("Quick View has no horizontal overflow at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/quick");
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Atlas standalone record includes both sides, store link, and JSON-LD", async ({ page, request }) => {
  // Inspect the server response too: both sides must be in the delivered HTML.
  const response = await request.get("/work/snowbros-atlas");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html.match(/role="tabpanel"/g)).toHaveLength(2);
  expect(html).toMatch(/id="[^"]*-a-panel"/);
  expect(html).toMatch(/id="[^"]*-b-panel"/);
  await page.goto("/work/snowbros-atlas");
  await expect(page.getByRole("heading", { level: 1, name: "Snowbros Atlas", exact: true })).toBeVisible();
  await expect(page.getByRole("tabpanel", { includeHidden: true })).toHaveCount(2);
  await expect(page.getByRole("link", { name: "Open it in the store", exact: true })).toHaveAttribute("href", "/?at=snowbros-atlas");
  const jsonLd = page.locator('script[type="application/ld+json"]');
  await expect(jsonLd).toHaveCount(1);
  expect(JSON.parse((await jsonLd.textContent())!)).toMatchObject({ "@type": "CreativeWork", name: "Snowbros Atlas" });
});

test("unknown record returns the shop's 404", async ({ page }) => {
  const response = await page.goto("/work/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("This record isn't in the shop.", { exact: true })).toBeVisible();
});

test("sitemap lists Quick View and NOVA", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const sitemap = await response.text();
  expect(sitemap).toMatch(/<loc>https?:\/\/[^<]+\/quick<\/loc>/);
  expect(sitemap).toMatch(/<loc>https?:\/\/[^<]+\/work\/nova<\/loc>/);
});
