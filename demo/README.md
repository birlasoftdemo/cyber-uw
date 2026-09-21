# Playwright-style product launch recording

Records the **live Cyber UW app** with an animated cursor, spotlight rings, captions, and chapter VO muxed via ffmpeg.

## Prerequisites

```bash
# terminal 1 — app
npm run dev

# one-time browsers (already done if install succeeded)
npx playwright install chromium
```

## Record

```bash
npm run demo:launch
# optional:
BASE_URL=http://localhost:5174 npm run demo:launch
```

Output: `demo/out/agents-assist-playwright.mp4`

VO sources: `video/public/vo/*.m4a` (same as Remotion launch script).
