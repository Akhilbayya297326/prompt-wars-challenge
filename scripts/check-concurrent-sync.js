import assert from "node:assert/strict";

// Exercise the IndexedDB fallback on browsers that do not provide Web Locks.
export async function checkConcurrentSync(browser, url) {
  const context = await browser.newContext();
  try {
    await context.addInitScript(() =>
      Object.defineProperty(navigator, "locks", { value: undefined }),
    );
    const first = await context.newPage();
    const second = await context.newPage();
    const held = Promise.withResolvers();
    await first.route("**/api/advice", (route) => held.resolve(route));
    await first.goto(url);
    await first.getByLabel("Crop", { exact: true }).fill("Paddy");
    await first.getByRole("button", { name: "Create field plan" }).click();
    await first.getByText("Saved on this device.", { exact: false }).waitFor();
    const request = await held.promise;
    await second.goto(url);
    await second.getByRole("button", { name: /Field notebook/ }).click();
    await second.getByRole("button", { name: "Remove from device" }).click();
    await second.getByText("Your notebook is empty").waitFor();

    // The first tab's success response arrives after the second tab removed the plan.
    await request.continue();
    await first
      .getByText("Saved on this device.", { exact: false })
      .waitFor({ state: "hidden" });
    assert.equal(
      await first.locator(".plan").count(),
      0,
      "A late response restored a deleted plan",
    );
  } finally {
    await context.close();
  }
}
