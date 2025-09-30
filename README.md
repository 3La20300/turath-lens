# Turath Lens

Bilingual (AR/EN) heritage assistant with image understanding. Upload a photo of an Egyptian heritage site and receive a concise Arabic explanation, with follow-up Q&A.

## Run locally
- Easiest: serve from a local server so JSON fetches work and geolocation is allowed on localhost.
  - PowerShell (from `web/`):
    # serve on http://localhost:5173
    cd "web"
    python -m http.server 5173
  - Then open: http://localhost:5173/index.html
- You can open `web/index.html` via file:// for quick UI checks, but some browsers block `fetch()` for local JSON.

## Backend
- AWS Lambda Function URL (Auth: NONE)
- Bedrock model: `anthropic.claude-3-haiku-20240307-v1:0`
- Region: `us-west-2`

Update the Function URL in `web/index.html` if needed:
- `const FUNCTION_URL = "https://gevuleglncapqi5ayvenhx6q5q0esmjc.lambda-url.us-west-2.on.aws/";`

## Features
- Image upload with client-side compression
- Bilingual UI with RTL support + language auto-detect
- Q&A with context (analyze + chat)
- Facts & Sources panel (lightweight RAG) via `facts-plugin.js` + `facts.json`
- Nearby geolocation hint via `geo-plugin.js` + `geo-sites.json` (HTTPS or localhost)
- Voice input for follow-up via Web Speech API
- PWA install (manifest + service worker) with offline shell

## Hosting
### GitHub Pages
- Auto-deploys `web/` on push to `main` via GitHub Actions.
- Default site URL: `https://3La20300.github.io/turath-lens/`
- Paths are relative (`./`), so it works under the repo path.

### S3 / CloudFront
- Upload contents of `web/` to S3 static hosting and front with CloudFront for HTTPS.
- Set correct content-type metadata for `.json`, `.js`, `.html`, and images.

## CORS (Lambda Function URL)
- Configure CORS in one place only (prefer the Function URL settings).
- Example Allowed Origin (GitHub Pages):
  - `https://3La20300.github.io`
- Remove any wildcard or older origins to avoid duplicate headers.

## Lambda settings (recommended)
- Memory: 1024–1536 MB
- Timeout: 30–60 s
- Provisioned Concurrency: 1 (on an alias) to avoid cold starts
- IAM: limit to specific Bedrock model ARN + `AWSLambdaBasicExecutionRole`
- Logs: Set CloudWatch log retention (7–30 days)

## PWA
- `web/manifest.json` and `web/service-worker.js` added
- Chrome/Edge will show “Install App” on HTTPS origins
- Offline page: `web/offline.html`

## Nearby (Geolocation)
- Requires HTTPS (or http://localhost) and user permission.
- Demo overrides via URL params:
  - `?nearby=on` (Giza) or `?nearby=29.9792,31.1342`
  - Optional `&radiusKm=5` to expand the detection radius
- Emulate location in Chrome:
  - DevTools → More tools → Sensors → Geolocation: Custom location → set lat/lon → reload.

## Troubleshooting
- Facts panel not showing
  - Hard refresh (DevTools → Network → Disable cache → Ctrl+F5) to update the service worker cache
  - Open `/facts.json` directly to ensure it loads (no 404)
  - Manually test in Console: `FactsPlugin.maybeShowFacts({ text: 'أهرامات الجيزة' })`
- Nearby panel not showing
  - Use HTTPS or localhost
  - Allow location and reload; or use `?nearby=on` to force it
  - Console: `GeoPlugin.checkNearby({ maxKm: 10 })`
- Network/CORS errors
  - Verify the Function URL is correct and the Allowed Origin matches your site exactly

## GitHub Pages deployment
This repo includes a workflow to deploy the `web/` folder to GitHub Pages on every push to `main`.

Steps:
1. In GitHub Settings → Pages, set Source to “GitHub Actions”.
2. Push to `main` and wait for the `Deploy to GitHub Pages` workflow to finish.
3. Your site will be available at `https://3La20300.github.io/turath-lens/`.
4. Update your Lambda Function URL CORS to allow exactly this origin and remove any wildcard/old origins.