# Turath Lens

Bilingual (AR/EN) heritage assistant with image understanding. Upload a photo of an Egyptian heritage site and receive a concise Arabic explanation, with follow-up Q&A.

## Run locally
- Open `web/index.html` directly in your browser.
- For geolocation (Nearby), prefer HTTPS hosting (GitHub Pages or S3/CloudFront).

## Backend
- AWS Lambda Function URL (Auth: NONE)
- Bedrock model: `anthropic.claude-3-haiku-20240307-v1:0`
- Region: `us-west-2`

Update the Function URL in `web/index.html` if needed:
- `const FUNCTION_URL = "https://...lambda-url.us-west-2.on.aws/";`

## Features
- Image upload with client-side compression
- Bilingual UI with RTL support
- Q&A with context (analyze + chat)
- Facts & Sources panel (lightweight RAG) via `facts-plugin.js` + `facts.json`
- Nearby geolocation hint via `geo-plugin.js` + `geo-sites.json` (HTTPS only)
- Voice input for follow-up via Web Speech API
- PWA install (manifest + service worker) with offline shell

## Hosting
### GitHub Pages
- Serve the `web/` folder as the site root. Ensure paths are relative (`./`), which this app uses.

### S3 / CloudFront
- Upload contents of `web/` to an S3 bucket (static site hosting) and optionally front with CloudFront for HTTPS.
- Set correct content-type metadata for `.json`, `.js`, `.html`, and images.

## CORS
- Configure CORS in one place only (prefer the Lambda Function URL origin allowlist).
- Set Allowed Origin to your production host (e.g., `https://<user>.github.io` or your CloudFront domain).

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

## Testing
- Upload a small image (<1 MB post-compression) → Answer in Arabic; TTS works
- Toggle English → UI flips LTR
- Ask a follow-up → short answer returns
- Facts panel shows for common sites (e.g., Pyramids)
- Nearby panel shows on HTTPS near known coordinates (e.g., Giza)
- Voice input fills question field and follows UI language

## Nearby (Geolocation)
- Requires HTTPS (or http://localhost) and location permission.
- Demo overrides via URL params:
  - `?nearby=on` (uses Giza Pyramids) or `?nearby=29.9792,31.1342`
  - Optional `&radiusKm=5` to expand the detection radius