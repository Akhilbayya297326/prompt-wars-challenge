# Krishi Chakra

A multilingual field assistant for Indian smallholder farmers. A farmer can record a symptom, interpret a soil card, prepare a harvest lot for sale, discover welfare schemes or learn about a farm question. Each workflow produces a plan that the farmer can reopen in the field notebook.

**Chosen vertical** — Agricultural decision support. **Persona** — A smallholder farmer using a phone, sometimes with a weak connection, who needs a practical next step in English, Hindi or Telugu. Agriculture is the project’s working vertical under the participant’s open-topic interpretation of the challenge.

## Try it locally

Requires Node.js 22.12+ or 24 LTS, npm and a modern browser.

```sh
npm ci
npm run build
npm start
```

Open [the field desk](http://localhost:8080). The built-in field guide works on the first run with no external credentials. The production build includes the offline app shell. A first successful online visit is needed to cache it.

## Two-minute demonstration

1. In **Crop health**, enter Paddy, choose Wilting and create a plan. The guide asks you to compare the soil moisture near affected and healthy plants. Switch to Leaf spots in a second request and compare the first action.
2. In **Soil & water**, select low nitrogen and limited water. The guide identifies N for follow-up and suggests comparing locally suitable millets or pulses. Change the water supply and compare the plan.
3. In **Scheme finder**, enter Telangana and 1.5 hectares. Inspect the state scheme and smallholder pension leads, then try another state or a holding above two hectares. Each link explains what to verify.
4. Switch to తెలుగు or हिन्दी. Create a plan in that language. Previously saved plans keep their original language. Supported browsers can dictate a note, open a named tool by voice and read a plan aloud.
5. Open the app once online, disconnect, reload, and create a plan. Reopen the Field notebook. The pending entry survives a reload. Reconnect with the app open and watch that entry turn into a completed plan.

## How decisions are made

| Tool           | Context and output                                                                                                                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dr. Akhil      | Uses the selected symptom to choose an inspection step. With Gemini configured, a crop photo and notes support a provisional interpretation and three next steps. The result identifies whether AI reviewed the photo.                                                                                                       |
| Smart AgriCore | Accepts a soil card photo or manual pH and low/medium/high NPK ratings from the lab. The guide reports pH, flags low nutrients and changes its water planning advice. With location permission it requests today’s rain probability from Open-Meteo. Gemini can read legible card values and interpret the supplied context. |
| Harvest Grader | Uses the reported condition to suggest sorting or sampling. With a photo and Gemini, estimates visible quality across damage, colour, foreign matter and spoilage. Includes a buyer negotiation question. Official grades require commodity-specific tests.                                                                  |
| Yojana Setu    | Uses state, reported hectares and social category to prioritize government resources. Telangana and Andhra Pradesh have named state leads. Other states receive central and directory leads. The responsible agency verifies eligibility.                                                                                    |
| Vidya Vani     | Builds a topic and crop search within ICAR’s video channel and links to ICAR advisories. Gemini adds a plain-language lesson when configured. Video availability and language depend on the source.                                                                                                                          |

## Architecture and configuration

React renders accessible forms and the notebook. Express serves both the built app and its JSON API on the same origin. Shared modules hold allowed values and the curated source catalogue. The service starts with deterministic guidance. Gemini optionally expands it with a structured response. Every response carries its origin. The application keeps resource URLs under server control.

### Prompt design

Each workflow has its own task instruction. The server passes the selected language, validated form context, official resource shortlist, any available forecast and an optional image. The model receives the farmer’s text as data. The response contract requires a title, an evidence-based summary and three short actions. A second validation step checks field types, lengths and step count before the result reaches the notebook. Malformed output, timeout and provider failure lead back to the localized field guide.

Copy `.env.example` to `.env` locally or configure secrets through the runtime. Keep the real values outside Git.

| Variable         | Purpose                                                                                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PORT`           | HTTP listener, defaults to 8080.                                                                                                                                  |
| `GEMINI_API_KEY` | Optional server-side Gemini credential enabling multimodal analysis.                                                                                              |
| `GEMINI_MODEL`   | Defaults to `gemini-2.5-flash`. Select an available multimodal model for your account.                                                                            |
| `MONGODB_URI`    | Optional Atlas connection. The service uses database `krishi_chakra` and collection `field_plans`. Its account needs read, write and index creation access there. |

The Dockerfile builds and serves the same application with a non-root runtime user and honors the host-provided port. `GET /api/health` exposes a basic liveness check. `POST /api/advice` validates the request, then returns a plan. The frontend bundles no provider credential.

### Offline flow and data handling

The service worker caches the versioned application shell. Axios sends requests from a durable IndexedDB queue. A completed response replaces its pending entry and drops the input photo from the notebook. Reconnect, app focus, manual sync and periodic checks retry pending requests while the app is open. Temporary errors keep the entry pending. Permanent input errors appear in the notebook.

Requests have random IDs and a fingerprint of their validated inputs. A running process shares concurrent inference for the same request. A bounded in-memory cache reuses recent results by default. Atlas adds a unique key and a 24-hour TTL index for completed results. Expiry runs asynchronously. Separate instances can call the provider concurrently before either persists the result. Farmer photos are sent for inference when enabled and stay out of the database. Result text may contain farmer-provided details. The device retains notebook entries until removed or site data is cleared.

The server checks image type, signature and size, validates fields and coordinates, limits request size and frequency, and applies security headers. Browsers request microphone and location permission only after a user action. Location is rounded to two decimals for weather. Browser speech capabilities and available voices vary. The form works with touch and keyboard alone. Use HTTPS or localhost for offline caching and browser permissions.

## Deploy frontend and API together on Vercel

Import this repository with the Vite preset. The build creates the static app in `dist`. The Node.js Functions at `api/health.js` and `api/advice.js` use the same Express application as the standalone server. Set optional server credentials in the Vercel project's environment settings. Verify the public URL by opening `/api/health` and creating a completed plan in the field notebook.

## Alternative deployment with Render and Vercel

Render runs the Express API. Vercel serves the built React app. The browser sends requests to its own `/api` path, and Vercel forwards those requests to Render.

1. **Start on Render.** In the dashboard, choose **New → Web Service**, connect this GitHub repository, select branch `main` and keep the repository root as the working directory. Choose **Docker** as the language. The root `Dockerfile` supplies both the build and startup commands. Set **Health Check Path** to `/api/health` and select the instance plan you want. To control future releases yourself, choose **Off** for Auto-Deploy. [Render Docker setup](https://render.com/docs/docker) · [Render health checks](https://render.com/docs/health-checks)
2. **Choose the backend capabilities.** You can run the field guide without credentials. For image analysis, add `GEMINI_API_KEY` in the Render service's **Environment** settings. Add `MONGODB_URI` only if you have configured Atlas and granted the service network and database access. Both secrets belong on Render. Click **Create Web Service**. After the service is live, open its HTTPS address with `/api/health` appended. Expect `{"status":"ok"}`.
3. **Connect the two hosts.** If you choose the split setup, remove the two Vercel Function entry points in `api/` and add the following rewrite to the root `vercel.json`. Replace `YOUR-SERVICE.onrender.com` with the exact hostname Render assigned. Commit your changes to the existing `main` branch. This rewrite forwards both the health check and plan requests while keeping a single browser origin. [Vercel external rewrites](https://vercel.com/docs/routing/rewrites)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-SERVICE.onrender.com/api/:path*"
    }
  ]
}
```

4. **Import on Vercel.** Choose **Add New → Project**, import this repository, select **Vite**, leave **Root Directory** at the repository root, and use `npm ci`, `npm run build` and `dist` for the install command, build command and output directory respectively. Select Node.js **24.x** and click **Deploy**. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
5. **Verify from your phone.** Open `/api/health` on the **Vercel** address and look for the same JSON. Then open the homepage, enter **Paddy**, choose **Wilting**, and create a plan. Its appearance as a completed notebook entry exercises the API route that a homepage check alone misses. If Render's health URL works and Vercel's returns a 404, check the rewrite hostname, the committed file location and the commit Vercel deployed.

## Verification

The browser accepts photos up to 12 MB, reduces the longest edge to 1,280 pixels and encodes a compact JPEG before queueing. Re-encoding drops the original camera metadata.

```sh
npm test
npm run build
npm run test:browser
npm audit --omit=dev
```

The browser test launches headless Microsoft Edge and a temporary local server. On machines with another Chromium browser, set `BROWSER_PATH` to its executable. Tests cover validation, symptom-sensitive guidance, soil and water reasoning, resource matching, language fallback, provider failure, replay, HTTP behavior, offline reload and reconnect. They run without credentials or paid API calls.

The browser suite also exercises all five workflows at a 390-pixel mobile width, photo submission during a connection loss, and axe-core WCAG A/AA rule checks on the English and Telugu field desk.

## Scope and assumptions

The built-in guide uses the farmer’s form entries. Image interpretation needs an enabled Gemini model. Market references prompt a local price check. Scheme links support discovery and verification. Agronomic advice is provisional, harvest inspection is indicative, and the app does not issue official grades, guarantee prices or award benefits. For crop treatment or fertilizer rates, take the observations to a local extension officer or soil lab.

Government and educational sources include [ICAR](https://icar.gov.in/farmers-corner), [Soil Health Card](https://soilhealth.dac.gov.in/), [e-NAM assaying](https://enam.gov.in/commodity/assaying), [PM-KISAN](https://pmkisan.gov.in/) and [myScheme](https://www.myscheme.gov.in/). Optional forecasts use [Open-Meteo](https://open-meteo.com/). The resource catalogue includes the relevant state and pension verification links.
