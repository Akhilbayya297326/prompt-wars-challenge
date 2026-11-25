import test from "node:test";
import assert from "node:assert/strict";
import { languages, tools } from "../shared/fields.js";
import { createService } from "../server/service.js";
import { isFieldPlan } from "../src/plan-response.js";

const example = {
  source: "field-guide",
  title: "Paddy",
  summary: "Inspect the affected plot.",
  steps: ["Compare the soil near healthy and wilted plants."],
  refs: [],
};

test("the notebook accepts real field-guide results in every workflow and language", async () => {
  const run = createService();
  for (const tool of tools) {
    for (const lang of languages) {
      const plan = await run({
        tool,
        lang,
        crop: "Paddy",
        state: "Telangana",
        topic: "Irrigation",
        observation: "wilting",
      });
      assert.ok(isFieldPlan(plan), tool + " / " + lang);
    }
  }
});

test("incomplete responses cannot replace a pending observation", () => {
  for (const invalid of [
    null,
    "Service unavailable",
    { steps: ["Incomplete"] },
    { ...example, steps: [null] },
    { ...example, refs: [{}] },
    { ...example, weather: { rain: 50 } },
    {
      ...example,
      refs: [{ url: "broken link", title: "Guide", reason: "Review" }],
    },
  ]) {
    assert.equal(isFieldPlan(invalid), false);
  }
});

test("older entries without optional weather and AI flags still render", () => {
  assert.equal(isFieldPlan(example), true);
});
