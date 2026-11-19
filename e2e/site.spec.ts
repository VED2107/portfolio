import { expect, test } from "@playwright/test";

const SELECTED = ["amr-drug-repurposing", "nova", "snowbros-atlas", "stc-academy"];

test("homepage: one h1, the four selected projects in order, the pair, contact", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hey, I'm Ved.");
  const hrefs = await page.locator("#work .feature-link").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs.slice(0, 4)).toEqual(SELECTED.map((s) => `/work/${s}`));
  expect(hrefs).toContain("/work/vinnys-atelier");
  expect(hrefs).toContain("/work/accounic");
  await expect(page.getByRole("link", { name: /Résumé/ }).first()).toHaveAttribute("href", "/Ved_Chauhan_RESUME.pdf");
  await expect(page.getByRole("heading", { name: "Have something worth building?" })).toBeVisible();
});

test("no horizontal overflow at 360, 390, 768, 1024 and 1440", async ({ page }) => {
  test.setTimeout(240_000);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/about", "/work/nova"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test("old routes land somewhere sensible", async ({ page }) => {
  await page.goto("/quick");
  await expect(page).toHaveURL(/\/$/);
  const res = await page.goto("/work/ved-exe");
  expect(res?.status()).toBe(200);
  const missing = await page.goto("/work/not-a-project");
  expect(missing?.status()).toBe(404);
});

test("case study: headline, section index, every chapter present", async ({ page }) => {
  await page.goto("/work/amr-drug-repurposing");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Making a complex research workflow traceable");
  for (const id of ["problem", "evidence", "decisions", "outcomes", "limits"]) await expect(page.locator(`section#${id}`)).toHaveCount(1);
  await expect(page.locator("#limits")).toContainText("not clinical evidence");
  await expect(page.getByRole("link", { name: "Next project" }).or(page.locator(".next-link"))).toHaveAttribute("href", "/work/nova");
});

test("screenshot viewer: opens, traps nothing outside, Escape closes, focus returns", async ({ page }) => {
  await page.goto("/work/accounic");
  const opener = page.getByRole("button", { name: /^Enlarge:/ }).first();
  await opener.click();
  const dialog = page.locator("dialog.lightbox[open]");
  await expect(dialog).toBeVisible();
  await expect(page.locator("dialog.lightbox[open] .sheet-close")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("experiment dialog opens from the keyboard and returns focus", async ({ page }) => {
  await page.goto("/");
  const item = page.locator(".exp").filter({ hasText: "Mentor" });
  await item.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Mentor" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(item).toBeFocused();
});

test("experiments strip never drifts with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const strip = page.locator(".strip");
  await strip.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  const a = await strip.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(1200);
  const b = await strip.evaluate((el) => el.scrollLeft);
  expect(b).toBe(a);
  await expect(page.getByRole("button", { name: /moving strip/ })).toHaveCount(0);
});

test("experiments strip drifts on desktop and the pause button stops it", async ({ page, isMobile }) => {
  test.skip(isMobile, "drift is only offered to a fine pointer");
  await page.goto("/");
  const strip = page.locator(".strip");
  await strip.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  const a = await strip.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(1000);
  expect(await strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(a);
  await page.getByRole("button", { name: "Pause the moving strip" }).click();
  await page.mouse.move(5, 5);
  const c = await strip.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(800);
  expect(await strip.evaluate((el) => el.scrollLeft)).toBe(c);
});

test("theme choice persists across reloads and is applied before paint", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch between light and dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  // The inline boot script sets it from storage before React hydrates.
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe("rgb(10, 10, 10)");
});

test("copy email reports success to assistive tech", async ({ page, context, isMobile }) => {
  test.skip(isMobile, "the copy control lives in the desktop header and the footer");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy email address" }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Email address copied" })).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("vedchauhan2107@gmail.com");
});

test("browser Back from a case study returns to the same place on the homepage", async ({ page }) => {
  await page.goto("/");
  await page.locator('a[href="/work/snowbros-atlas"].feature-link').scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(400);
  await page.locator('a[href="/work/snowbros-atlas"].feature-link').click();
  await expect(page).toHaveURL(/snowbros-atlas/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Making problems between files visible");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  // The project that was clicked is back on screen.
  await expect(page.locator('a[href="/work/snowbros-atlas"].feature-link')).toBeInViewport();
  // and the page did not jump back to the top
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before / 2);
});

test("content renders without JavaScript", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#work .feature").first()).toBeVisible();
  const hidden = await page.locator("[data-reveal]").evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
  expect(hidden).toBe(0);
  await ctx.close();
});

test("the photo stack opens the About page, as on the reference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About Ved" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Based in Patan, Gujarat.");
});

test("notes switch shows every note and survives a reload", async ({ page, isMobile }) => {
  test.skip(isMobile, "notes are a desktop layer");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Notes" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-notes", "on");
  await page.reload();
  await expect(page.getByRole("button", { name: "Notes" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".note-card").first()).toHaveCSS("opacity", "1");
});

test("same input, same result: both runs match for any input", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("Try it: type anything");
  await input.fill("Ved Chauhan 2026");
  const runs = page.locator(".same-run code");
  await expect(runs.nth(0)).toHaveText(/^[0-9a-f]{16}$/);
  expect(await runs.nth(0).textContent()).toBe(await runs.nth(1).textContent());
  await expect(page.getByText("Byte-identical. Every time.")).toBeVisible();
});
