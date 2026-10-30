# AI assistant: secure configuration and honest readiness

## Current status

The clickable Three.js robot, accessible chat dialog, native Node backend, and Vercel function adapters are implemented. **No AI provider key has been supplied, and no live provider connection or generated answer has been tested.** Without configuration, the server returns `AI_NOT_CONFIGURED` and the UI disables Send. It never substitutes a canned answer.

Mock provider responses exist only in automated tests. Passing those tests proves the request/UI/error paths, not live AI availability or factual model behavior.

## Local configuration

1. Install **Node.js 22 or later**.
2. Copy `.env.example` to `.env` locally.
3. Enter the provider credentials/model in that private file:

```dotenv
AI_API_KEY=your-own-provider-key
AI_MODEL=gemini-3.5-flash-lite
AI_FALLBACK_MODEL=gemini-3.6-flash
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
```

`AI_API_KEY` and `AI_MODEL` are required. `AI_FALLBACK_MODEL` (or `AI_SECONDARY_MODEL`) is optional: if configured and the primary model fails or is unavailable, the server automatically attempts the fallback model before reporting an error. The adapter uses an **OpenAI-compatible Chat Completions API** (such as Google Gemini's endpoint `https://generativelanguage.googleapis.com/v1beta/openai` or standard OpenAI/compatible endpoints). The base URL should precede `/chat/completions`.

4. Run `npm run dev`, `sh start-preview.sh`, or `START_PREVIEW.bat` on Windows.
5. Open **http://localhost:4175** and click the robot or the small assistant launcher.
6. The status will say **Server configured — connection not verified**. Send a real question and confirm a successful server reply before considering the provider tested. Test an unavailable fact as well as a known résumé/project fact.

Do not send keys through chat. Do not use `VITE_`, `NEXT_PUBLIC_`, or any browser-visible environment variable for this key. Do not place it in HTML, JavaScript under assets, Git remotes, README, test fixtures or commits. The existing GitHub publishing token is unrelated and must never be used as an AI key.

The root server loads `.env` using Node's native environment-file API. The populated file is Git-ignored, the local server refuses it, and the static build does not copy it. There is no dotenv dependency or client-side credential SDK.

## Vercel

`api/chat.js` and `api/assistant-status.js` are serverless entrypoints. `npm run build` writes a public-only `dist` directory. `vercel.json` selects that output and includes the server/profile source required by the functions. The existing journey rewrites remain.

Configure `AI_API_KEY`, `AI_MODEL`, and optionally `AI_BASE_URL` in **the deployment project's server-side environment settings**, then redeploy. Do not upload a populated `.env` to GitHub. The project has not been deployed or live-provider tested as part of this implementation.

## API

- `GET /api/assistant-status` returns only configuration state and a safe message. It never returns a key, model, base URL or `connected:true` assertion.
- `POST /api/chat`, JSON `{ "messages": [{ "role": "user", "content": "What projects has Fardin built?" }] }`.
- Success: `{ "reply": "..." }` from the actual configured provider.
- Safe error: `{ "error": { "code": "...", "message": "..." } }`.

Only user/assistant roles are accepted. The final message must be user. Maximum: eight messages, 1000 characters each and 16 KiB total request bytes. The frontend trims old context to the same byte budget; no greeting or fabricated conversation enters the model context.

The server selects endpoint/model/system instructions, rejects non-HTTPS or credential-bearing base URLs, refuses redirects, sends the key only in Authorization, bounds provider output and aborts after 15 seconds. The UI times out after 20 seconds and restores failed/aborted questions. Provider error bodies and credential echoes are not shown.

## Grounding and privacy

The model context is an allowlisted professional profile derived from `assets/js/data.js` and the professional sections of the supplied `Fardin_Hossain_Resume.pdf`. It includes education, projects, skills, experience and certifications. Personal family/birth/street-address details and phone numbers are excluded. Reported benchmarks and credential claims are attributed to the portfolio/résumé, not independently verified.

System instructions require unknown facts to be acknowledged and conversation/data strings to be treated as untrusted. The model is not given browsing or tools. This is a grounding policy, not a claim that an untested model cannot hallucinate; review live responses after configuring the provider.

Messages are kept only in component memory while the page is active. The app does not persist transcripts or add analytics. When you send, recent conversation is sent to the server and configured provider. Avoid sensitive information and review that provider's privacy policy.

## Abuse controls and limits

A bounded TTL, per-process limiter allows twelve requests per minute. It does not trust arbitrary client forwarding headers. **It is best-effort, not a shared production quota:** serverless replicas/cold starts do not share buckets, and multiple visitors may share a proxy peer bucket. Configure a persistent edge/store limiter and provider-side spending limits before enabling public high-traffic usage. These are documented production tasks, not features claimed implemented.

## Inspection preview

`PREVIEW.html` and the in-chat browser artifact contain only the frontend. They intentionally show **Inspection preview: run local Node server for chat**, disable Send and make no assistant API requests. They are not connected to a hidden provider or the assistant's tools. Use the Node server to test the real backend.

## Tests

`npm run test:backend` exercises missing configuration, validation, bounds, malicious roles, rate limiting, timeout, safe errors, key protection, profile context and static-source protection. Provider fetches are explicit mocks only.

`npm run test:browser` includes real Chromium tests for robot phases/name reveal, click/pause behavior, modal focus/keyboard/draft states, missing-key honesty, fixture-only transport/error/XSS paths, all requested widths in both themes, sticky chapter tracking and theme-specific scenery.
