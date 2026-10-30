import { expect, test, type Page } from "@playwright/test";
import { ALL_RECORDS } from "../src/lib/content";

async function walkIn(page: Page, path = "/") {
  await page.goto(path);
  const enter = page.getByRole("button", { name: "Walk in", exact: true });
  await expect(enter).toBeEnabled({ timeout: 45_000 });
  await enter.click();
  await expect(page.getByRole("navigation", { name: "Store controls" })).toBeVisible();
}

async function openNova(page: Page) {
  // The directory is intentionally clipped for sighted visitors. Dispatch avoids
  // coordinate hit testing while exercising its actual React click handler.
  await page.getByRole("button", { name: "Open the record NOVA", exact: true }).dispatchEvent("click");
  const dialog = page.getByRole("dialog", { name: "NOVA", exact: true });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  return dialog;
}

test("front door links to Quick View and every record", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Welcome to the Recordverse." })).toBeVisible();
  const directory = page.locator("details").filter({ has: page.getByText("Store directory", { exact: true }) });
  await directory.getByText("Store directory", { exact: true }).click();
  for (const slug of ALL_RECORDS) {
    await expect(directory.getByRole("link").and(page.locator(`[href="/work/${slug}"]`))).toBeVisible();
  }
  const quick = page.getByRole("link", { name: "Quick View", exact: true });
  await expect(quick).toHaveAttribute("href", "/quick");
  await quick.click();
  await expect(page).toHaveURL("/quick");
});

test("walk in shows the HUD without browser errors", async ({ page }) => {
  const errors: string[] = [];
  const collect = (message: string) => {
    if (!/WebGL|GPU stall/i.test(message)) errors.push(message);
  };
  page.on("console", (message) => {
    if (message.type() === "error") collect(message.text());
  });
  page.on("pageerror", (error) => collect(error.message));
  await walkIn(page);
  // Let the entered world draw before checking errors from the first HUD frames.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(errors).toEqual([]);
});

test("keyboard movement retains a room label", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop keyboard movement only");
  await walkIn(page);
  await page.keyboard.down("w");
  try {
    // A timed hold is the input under test, rather than a loading delay.
    await page.waitForTimeout(1_000);
  } finally {
    await page.keyboard.up("w");
  }
  await expect(page.locator(".hud-brand b")).toHaveText(/\S/);
});

test("record directory opens NOVA, flips sides, and restores the store URL", async ({ page }) => {
  await walkIn(page);
  const dialog = await openNova(page);
  await expect(page).toHaveURL("/work/nova");
  await expect(dialog.getByRole("tab", { name: /A-SIDE\s*The experience/i })).toHaveAttribute("aria-selected", "true");
  await dialog.getByRole("tab", { name: /B-SIDE/i }).click();
  await expect(dialog.getByRole("tabpanel", { name: /B-SIDE/i })).toBeVisible();
  await expect(dialog.getByRole("heading", { name: /^Tracklist:/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL("/");
});

test("record dialog receives and traps keyboard focus", async ({ page }) => {
  await walkIn(page);
  const dialog = await openNova(page);
  const focusIsInside = () => dialog.evaluate((element) => element.contains(document.activeElement));
  await expect.poll(focusIsInside).toBe(true);
  for (let index = 0; index < 30; index++) {
    await page.keyboard.press("Tab");
    expect(await focusIsInside(), `Focus escaped after Tab ${index + 1}`).toBe(true);
  }
});

test("store map opens and Escape closes it", async ({ page }, testInfo) => {
  await walkIn(page);
  if (testInfo.project.name === "desktop") await page.keyboard.press("m");
  else await page.getByRole("button", { name: "Map", exact: true }).click();
  const map = page.getByRole("dialog", { name: "Store map", exact: true });
  await expect(map).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(map).toHaveCount(0);
});

test("checkout contains the receipt and email composer", async ({ page }) => {
  await walkIn(page);
  await page.getByRole("button", { name: /Go to Checkout Counter/ }).dispatchEvent("click");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("OPEN TO WORK", { exact: true })).toBeVisible();
  const email = dialog.getByRole("button", { name: "Write the email", exact: true });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute("type", "submit");
  expect(await email.evaluate((element) => element.closest("form") !== null)).toBe(true);
  // The mailto destination is computed inside the submit handler, not an href.
  // Check its recipient via the copy control without opening an external mail app.
  await expect(dialog.getByRole("button", { name: /ved@snowbros\.me/ })).toBeVisible();
});

test.describe("reduced motion", () => {
  // Playwright gives this test a fresh context with the project's device settings.
  test.use({ reducedMotion: "reduce" });
  test("still opens a record dialog", async ({ page }) => {
    await walkIn(page);
    await openNova(page);
  });
});

test("without WebGL the front door links into Quick View", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (/^(webgl|webgl2|experimental-webgl)$/.test(args[0])) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByText(/Quick View is the way in/)).toBeVisible();
  await page.getByRole("link", { name: "Quick View", exact: true }).click();
  await expect(page).toHaveURL("/quick");
  await expect(page.getByRole("heading", { name: "Ved Chauhan", level: 1 })).toBeVisible();
});

test("store deep link opens Accounic after entry", async ({ page }) => {
  await walkIn(page, "/?at=accounic");
  await expect(page.getByRole("dialog", { name: "Accounic", exact: true })).toBeVisible({ timeout: 15_000 });
});
