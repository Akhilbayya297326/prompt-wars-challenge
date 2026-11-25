import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { validate, InvalidInput } from "../server/validate.js";
import { createService } from "../server/service.js";
import { createApp } from "../server/app.js";

const request = (extra = {}) => ({
  id: randomUUID(),
  lang: "en",
  tool: "crop",
  crop: "Paddy",
  ...extra,
});

test("rejects invalid ranges, unexpected image contents, missing context and invalid coordinates", () => {
  for (const override of [
    { lang: "de" },
    { crop: "   " },
    { ph: 15 },
    { tool: "schemes" },
    { tool: "learn" },
    { photo: "data:image/png;base64,YmFk" },
    { land: -2 },
    { tool: "soil", location: { lat: 100, lon: 0 } },
  ]) {
    assert.throws(() => validate(request(override)), InvalidInput);
  }
});

test("a field plan changes with the evidence and distinguishes unreviewed images", async () => {
  const run = createService();
  const wilt = await run(
    validate(
      request({
        observation: "wilting",
        photo: "data:image/jpeg;base64,/9j/2Q==",
      }),
    ),
  );
  const spots = await run(validate(request({ observation: "spots" })));
  assert.notEqual(wilt.steps[0], spots.steps[0]);
  assert.match(wilt.steps[0], /moisture/);
  assert.equal(wilt.photoReviewed, false);
  assert.equal(wilt.source, "field-guide");
});

test("soil ratings, water access and unavailable weather produce an actionable fallback", async () => {
  const run = createService({
    weatherProvider: async () => {
      throw Error();
    },
  });
  const result = await run(
    validate(
      request({
        tool: "soil",
        ph: 5.6,
        n: "low",
        water: "limited",
        location: { lat: 17.39, lon: 78.49 },
      }),
    ),
  );
  assert.match(result.summary, /acidic/);
  assert.match(result.steps[0], /^N/);
  assert.match(result.steps[1], /millets/);
  assert.equal(result.weatherUnavailable, true);
});

test("concurrent replay coalesces inference and a later retry reuses the completed result", async () => {
  let calls = 0;
  const model = async (_input, guide) => {
    calls++;
    return guide;
  };
  const run = createService({ model });
  const input = validate(request());
  const outcomes = await Promise.all([run(input), run(input), run(input)]);
  assert.equal(outcomes[0].source, "gemini");
  assert.deepEqual(await run(input), outcomes[2]);
  assert.equal(calls, 1);
});

test("AI outage preserves the selected Telugu guide and marks its source", async () => {
  const result = await createService({
    model: async () => {
      throw Error();
    },
  })(validate(request({ lang: "te" })));
  assert.equal(result.modelUnavailable, true);
  assert.equal(result.source, "field-guide");
  assert.match(result.steps[0], /[\u0C00-\u0C7F]/);
});

test("HTTP API validates before inference and serves a complete guide without a key", async (t) => {
  const app = createApp(createService());
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = "http://127.0.0.1:" + server.address().port + "/api/advice";
  const send = (data) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  assert.equal((await send(request({ lang: "bad" }))).status, 400);
  assert.equal(
    (await fetch(url, { method: "POST", body: "hello" })).status,
    415,
  );
  const res = await send(request({ tool: "harvest", quality: "debris" }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.ok(res.headers.get("content-security-policy"));
  const result = await res.json();
  assert.equal(result.steps.length, 3);
  assert.match(result.summary, /Official grading/);
});
