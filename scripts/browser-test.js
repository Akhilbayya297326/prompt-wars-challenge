import assert from "node:assert/strict";
import { once } from "node:events";
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { createApp } from "../server/app.js";
import { createService } from "../server/service.js";
import { checkConcurrentSync } from "./check-concurrent-sync.js";

const app = createApp(createService());
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
let browser;
try {
  browser = await chromium.launch(
    process.env.BROWSER_PATH
      ? { executablePath: process.env.BROWSER_PATH }
      : { channel: "msedge" },
  );
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const picker = page.getByRole("combobox", { name: "Field tools" });
  const errors = [];
  async function checkAccessibility() {
    const report = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      report.violations.map((v) => ({
        rule: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
      [],
    );
  }
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:" + server.address().port);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((r) =>
        navigator.serviceWorker.addEventListener("controllerchange", r, {
          once: true,
        }),
      );
  });
  assert.ok(await page.evaluate(() => document.body.scrollWidth <= innerWidth));
  await checkAccessibility();
  for (const width of [320, 360, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Layout overflow at " + width,
    );
  }
  await page.getByRole("button", { name: /Soil & water/ }).click();
  await page.getByLabel("Crop", { exact: true }).fill("Cotton");
  await page.setViewportSize({ width: 390, height: 844 });
  await picker.selectOption("crop");
  await picker.selectOption("soil");
  assert.equal(
    await page.getByLabel("Crop", { exact: true }).inputValue(),
    "Cotton",
  );
  await page.getByRole("button", { name: /Field notebook/ }).click();
  await page.getByRole("button", { name: "Field desk", exact: true }).click();
  assert.equal(
    await page.getByLabel("Crop", { exact: true }).inputValue(),
    "Cotton",
  );
  await context.setOffline(true);
  await page.reload();
  await page.getByLabel("Crop", { exact: true }).fill("Paddy");
  await page.getByLabel("Main symptom").selectOption("wilting");
  const sample = await page.evaluate(
    () => document.createElement("canvas").toDataURL("image/png").split(",")[1],
  );
  await page.locator('input[type="file"]').setInputFiles({
    name: "sample.png",
    mimeType: "image/png",
    buffer: Buffer.from(sample, "base64"),
  });
  await page.getByRole("button", { name: "Remove photo" }).waitFor();
  await page.getByRole("button", { name: "Save offline" }).click();
  await page.getByText("Saved on this device.", { exact: false }).waitFor();
  await page.reload();
  await page.getByRole("button", { name: /Field notebook/ }).click();
  await page.getByText("Saved on this device.", { exact: false }).waitFor();
  // Both failures must leave the original offline observation available for replay.
  let attempts = 0;
  await page.route("**/api/advice", async (route) => {
    attempts++;
    if (attempts === 1)
      return route.fulfill({ status: 408, body: "Request timed out" });
    if (attempts === 2)
      return route.fulfill({ json: { steps: ["Incomplete response"] } });
    await route.continue();
  });
  const response = () =>
    page.waitForResponse((r) => r.url().endsWith("/api/advice"));
  await Promise.all([response(), context.setOffline(false)]);
  const retry = page.getByRole("button", { name: /Sync pending plans/ });
  for (const attempt of [1, 2]) {
    await page.waitForFunction(
      () => {
        const button = document.querySelector(".notebook .secondary");
        return button && !button.disabled;
      },
      null,
      { timeout: 5000 },
    );
    assert.equal(attempts, attempt);
    await page.getByText("Saved on this device.", { exact: false }).waitFor();
    await Promise.all([response(), retry.click()]);
  }
  await page.getByText(/Check soil moisture/).waitFor();
  await page.getByText(/Photo was not analyzed/).waitFor();
  assert.equal(await page.locator(".plan").count(), 1);
  await page.getByRole("button", { name: "Field desk", exact: true }).click();
  await picker.selectOption("schemes");
  await page.getByLabel("State or union territory").fill("Telangana");
  await page.getByLabel("Land area").fill("1.5");
  await page.getByRole("button", { name: "Create field plan" }).click();
  await page.getByRole("link", { name: "Rythu Bharosa" }).waitFor();
  await page.getByRole("button", { name: "Field desk", exact: true }).click();
  await picker.selectOption("soil");
  await page.getByLabel("Crop", { exact: true }).fill("Millet");
  await page.getByLabel("Soil pH").fill("5.5");
  await page.getByLabel("Nitrogen (N)").selectOption("low");
  await page.getByLabel("Water supply").selectOption("limited");
  await page.getByRole("button", { name: "Create field plan" }).click();
  await page.getByText(/pH 5.5 · acidic/).waitFor();
  await page.getByText(/Compare locally suitable millets/).waitFor();
  await page.getByRole("button", { name: "Field desk", exact: true }).click();
  await picker.selectOption("harvest");
  await page.getByLabel("Crop", { exact: true }).fill("Paddy");
  await page.getByLabel("Lot condition").selectOption("debris");
  await page.getByRole("button", { name: "Create field plan" }).click();
  await page.getByText(/Separate visible foreign matter/).waitFor();
  await page.getByRole("button", { name: "Field desk", exact: true }).click();
  await picker.selectOption("learn");
  await page
    .getByLabel("What would you like to learn?")
    .fill("Paddy irrigation");
  await page.getByRole("button", { name: "Create field plan" }).click();
  await page.getByRole("link", { name: "Search ICAR videos" }).waitFor();
  await page.getByLabel("Language / भाषा / భాష").selectOption("te");
  await page.getByRole("button", { name: "పొలం డెస్క్", exact: true }).click();
  await page.getByRole("heading", { name: "మీ పొలం డెస్క్" }).waitFor();
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("lang"), "te");
  await page.setViewportSize({ width: 320, height: 650 });
  for (const language of ["hi", "te"]) {
    await page.getByLabel("Language / भाषा / భాష").selectOption(language);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Overflow in " + language,
    );
  }
  await checkAccessibility();
  assert.deepEqual(errors, []);
  await checkConcurrentSync(
    browser,
    "http://127.0.0.1:" + server.address().port,
  );
  console.log(
    "Browser checks passed: mobile width, offline reload, durable queue, reconnect, scheme match, Telugu persistence.",
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
