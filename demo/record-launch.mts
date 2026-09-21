/**
 * Playwright-style launch demo — live app recording with cursor, spotlight, captions.
 * VO from video/public/vo is muxed after via ffmpeg.
 *
 * Usage:
 *   npm run demo:launch
 *   BASE_URL=http://localhost:5174 npm run demo:launch
 */
import { chromium, type Locator, type Page } from "playwright";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "demo", "out");
const VO_DIR = path.join(ROOT, "video", "public", "vo");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:5174";
const VIEWPORT = { width: 1440, height: 900 };

type ChapterMark = {
  id: string;
  label: string;
  startMs: number;
  voFile: string | null;
  voLeadMs: number;
};

const marks: ChapterMark[] = [];
let t0 = 0;

function nowMs() {
  return Date.now() - t0;
}

function mark(
  id: string,
  label: string,
  voFile: string | null,
  voLeadMs = 500,
) {
  marks.push({ id, label, startMs: nowMs(), voFile, voLeadMs });
  console.log(`▶ ${id} ${label} @ ${(nowMs() / 1000).toFixed(1)}s`);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function injectChrome(page: Page) {
  await page.addInitScript(() => {
    // Hide native cursor; we draw a demo cursor.
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { cursor: none !important; }
      #pw-demo-root { all: initial; }
      #pw-demo-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif; }
    `;
    document.documentElement.appendChild(style);
  });

  await page.evaluate(() => {
    if (document.getElementById("pw-demo-root")) return;
    const root = document.createElement("div");
    root.id = "pw-demo-root";
    root.innerHTML = `
      <div id="pw-spotlight" style="
        position:fixed; inset:0; pointer-events:none; z-index:2147483000;
        background: rgba(4,10,22,0.55);
        -webkit-mask-image: radial-gradient(ellipse 18% 14% at 50% 40%, transparent 0%, transparent 45%, #000 78%);
        mask-image: radial-gradient(ellipse 18% 14% at 50% 40%, transparent 0%, transparent 45%, #000 78%);
        opacity:0; transition: opacity 280ms ease, -webkit-mask-image 420ms ease, mask-image 420ms ease;
      "></div>
      <div id="pw-ring" style="
        position:fixed; left:50%; top:40%; width:220px; height:120px;
        transform:translate(-50%,-50%); border-radius:999px; pointer-events:none; z-index:2147483001;
        border:2px solid rgba(255,236,153,0.9); box-shadow:0 0 0 1px rgba(255,236,153,0.25), 0 0 36px rgba(255,236,153,0.35);
        opacity:0; transition: opacity 280ms ease, left 420ms ease, top 420ms ease, width 420ms ease, height 420ms ease;
      "></div>
      <div id="pw-pill" style="
        position:fixed; left:50%; top:28%; transform:translate(-50%,-50%);
        background:#ffec99; color:#1e1e1e; padding:8px 14px; border-radius:999px;
        font-size:14px; font-weight:800; letter-spacing:-0.01em; white-space:nowrap;
        box-shadow:0 10px 28px rgba(0,0,0,0.35); pointer-events:none; z-index:2147483002;
        opacity:0; transition: opacity 280ms ease, left 420ms ease, top 420ms ease;
      "></div>
      <div id="pw-caption" style="
        position:fixed; left:28px; right:28px; bottom:22px; pointer-events:none; z-index:2147483003;
        color:#fff; text-shadow:0 2px 12px rgba(0,0,0,0.55); opacity:0; transition: opacity 320ms ease;
      ">
        <div id="pw-cap-eye" style="font-size:12px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; opacity:0.7; margin-bottom:6px;"></div>
        <div id="pw-cap-title" style="font-size:30px; font-weight:800; letter-spacing:-0.025em; line-height:1.1;"></div>
        <div id="pw-cap-sub" style="margin-top:6px; font-size:16px; opacity:0.82; max-width:820px; line-height:1.35;"></div>
      </div>
      <div id="pw-cursor" style="
        position:fixed; left:0; top:0; width:22px; height:22px; margin-left:-2px; margin-top:-2px;
        pointer-events:none; z-index:2147483646; opacity:0;
        transition: opacity 120ms ease;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 3l12.5 8.2-5.1 1.4 2.9 6.4-2.4 1.1-2.9-6.4L4 17.8V3z" fill="#fff" stroke="#111" stroke-width="1.2"/>
        </svg>
      </div>
      <div id="pw-click" style="
        position:fixed; width:18px; height:18px; border-radius:999px; pointer-events:none; z-index:2147483645;
        border:2px solid #ffec99; opacity:0; transform:translate(-50%,-50%) scale(0.4);
      "></div>
      <div id="pw-interstitial" style="
        position:fixed; inset:0; z-index:2147483600; display:none; align-items:center; justify-content:center;
        background: radial-gradient(ellipse at 50% 40%, #1a2740 0%, #070c16 70%); color:#fff; text-align:center; padding:48px;
      ">
        <div>
          <div id="pw-int-eye" style="font-size:13px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; opacity:0.5; margin-bottom:18px;"></div>
          <div id="pw-int-title" style="font-size:52px; font-weight:800; letter-spacing:-0.035em; line-height:1.08; max-width:980px;"></div>
          <div id="pw-int-sub" style="margin-top:22px; font-size:20px; opacity:0.7; max-width:720px; margin-left:auto; margin-right:auto; line-height:1.4;"></div>
        </div>
      </div>
    `;
    document.documentElement.appendChild(root);
    (window as unknown as { __pwDemo: Record<string, unknown> }).__pwDemo = {
      moveCursor(x: number, y: number) {
        const c = document.getElementById("pw-cursor");
        if (!c) return;
        c.style.opacity = "1";
        c.style.left = `${x}px`;
        c.style.top = `${y}px`;
      },
      clickRipple(x: number, y: number) {
        const el = document.getElementById("pw-click");
        if (!el) return;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "translate(-50%,-50%) scale(0.4)";
        void el.offsetWidth;
        el.style.transition = "opacity 420ms ease, transform 420ms ease";
        el.style.opacity = "0";
        el.style.transform = "translate(-50%,-50%) scale(2.2)";
      },
      spotlight(xPct: number, yPct: number, rx: number, ry: number, label: string) {
        const spot = document.getElementById("pw-spotlight");
        const ring = document.getElementById("pw-ring");
        const pill = document.getElementById("pw-pill");
        if (!spot || !ring || !pill) return;
        const mask = `radial-gradient(ellipse ${rx}% ${ry}% at ${xPct}% ${yPct}%, transparent 0%, transparent 48%, #000 78%)`;
        spot.style.webkitMaskImage = mask;
        spot.style.maskImage = mask;
        spot.style.opacity = "1";
        ring.style.opacity = "1";
        ring.style.left = `${xPct}%`;
        ring.style.top = `${yPct}%`;
        ring.style.width = `${rx * 2.2}%`;
        ring.style.height = `${ry * 2.8}%`;
        pill.style.opacity = "1";
        pill.style.left = `${xPct}%`;
        pill.style.top = `${Math.max(yPct - ry - 4, 6)}%`;
        pill.textContent = label;
      },
      clearSpotlight() {
        for (const id of ["pw-spotlight", "pw-ring", "pw-pill"]) {
          const el = document.getElementById(id);
          if (el) el.style.opacity = "0";
        }
      },
      caption(eyebrow: string, title: string, sub = "") {
        const wrap = document.getElementById("pw-caption");
        const eye = document.getElementById("pw-cap-eye");
        const t = document.getElementById("pw-cap-title");
        const s = document.getElementById("pw-cap-sub");
        if (!wrap || !eye || !t || !s) return;
        eye.textContent = eyebrow;
        t.textContent = title;
        s.textContent = sub;
        wrap.style.opacity = "1";
      },
      clearCaption() {
        const wrap = document.getElementById("pw-caption");
        if (wrap) wrap.style.opacity = "0";
      },
      showInterstitial(eyebrow: string, title: string, sub = "") {
        const el = document.getElementById("pw-interstitial");
        const eye = document.getElementById("pw-int-eye");
        const t = document.getElementById("pw-int-title");
        const s = document.getElementById("pw-int-sub");
        if (!el || !eye || !t || !s) return;
        eye.textContent = eyebrow;
        t.textContent = title;
        s.textContent = sub;
        el.style.display = "flex";
      },
      hideInterstitial() {
        const el = document.getElementById("pw-interstitial");
        if (el) el.style.display = "none";
      },
    };
  });
}

async function demoCall(page: Page, method: string, ...args: unknown[]) {
  await page.evaluate(
    ([m, a]) => {
      const api = (window as unknown as { __pwDemo: Record<string, (...xs: unknown[]) => void> })
        .__pwDemo;
      api[m](...a);
    },
    [method, args] as const,
  );
}

async function moveTo(page: Page, x: number, y: number, steps = 18) {
  await page.mouse.move(x, y, { steps });
  await demoCall(page, "moveCursor", x, y);
}

async function clickAt(page: Page, x: number, y: number) {
  await moveTo(page, x, y, 14);
  await demoCall(page, "clickRipple", x, y);
  await page.mouse.click(x, y);
  await sleep(180);
}

async function spotlightLocator(
  page: Page,
  locator: Locator,
  label: string,
  pad = 1.35,
) {
  const box = await locator.boundingBox();
  if (!box) return null;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const xPct = (cx / VIEWPORT.width) * 100;
  const yPct = (cy / VIEWPORT.height) * 100;
  const rx = Math.min(42, Math.max(8, ((box.width * pad) / VIEWPORT.width) * 50));
  const ry = Math.min(28, Math.max(6, ((box.height * pad) / VIEWPORT.height) * 50));
  await demoCall(page, "spotlight", xPct, yPct, rx, ry, label);
  return { cx, cy, box };
}

async function clickLocator(page: Page, locator: Locator, label?: string) {
  await locator.first().waitFor({ state: "visible", timeout: 15000 });
  if (label) await spotlightLocator(page, locator.first(), label);
  const box = await locator.first().boundingBox();
  if (!box) throw new Error("No bounding box");
  await clickAt(page, box.x + box.width / 2, box.y + box.height / 2);
}

async function logoutIfNeeded(page: Page) {
  // Force clean session via localStorage wipe
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
}

async function login(page: Page, email: string, password: string) {
  await logoutIfNeeded(page);
  await injectChrome(page);
  await page.reload({ waitUntil: "networkidle" });
  await injectChrome(page);

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 15000 });
  await emailInput.fill("");
  await emailInput.fill(email);
  await page.locator('input[type="password"]').fill(password);
  await clickLocator(page, page.getByRole("button", { name: /sign in/i }).first());
  await page.getByRole("navigation", { name: "Main" }).first().waitFor({
    state: "visible",
    timeout: 15000,
  });
  await injectChrome(page);
}

async function goNav(page: Page, label: string) {
  // Ensure chrome overlays aren't covering the shell
  await demoCall(page, "hideInterstitial");
  await page.evaluate(() => {
    document.getElementById("pw-rec-chips")?.remove();
    document.getElementById("pw-hitl")?.remove();
    document.getElementById("pw-pas")?.remove();
  });

  const expand = page.getByRole("button", { name: /expand sidebar/i });
  if ((await expand.count()) > 0) {
    try {
      await expand.first().click({ timeout: 1500 });
      await sleep(350);
    } catch {
      /* already expanded */
    }
  }

  // Prefer aria-label (works collapsed + expanded); fall back to visible name.
  const byAria = page.locator(`nav[aria-label="Main"] button[aria-label="${label}"]`).first();
  const byRole = page.getByRole("button", { name: label, exact: true }).first();
  const target = (await byAria.count()) > 0 ? byAria : byRole;
  await clickLocator(page, target, label);
  await sleep(700);
}

function muxAudio(videoPath: string, outPath: string, totalMs: number) {
  const durationJson = path.join(VO_DIR, "durations.json");
  const durations: Record<string, number> = existsSync(durationJson)
    ? JSON.parse(readFileSync(durationJson, "utf8"))
    : {};

  const inputs: string[] = ["-y", "-i", videoPath];
  const filters: string[] = [];
  const amixInputs: string[] = [];
  let ai = 1;

  for (const m of marks) {
    if (!m.voFile) continue;
    const vo = path.join(VO_DIR, m.voFile);
    if (!existsSync(vo)) continue;
    inputs.push("-i", vo);
    const delay = Math.max(0, Math.round(m.startMs + m.voLeadMs));
    const label = `a${ai}`;
    filters.push(
      `[${ai}:a]adelay=${delay}|${delay},volume=1.0[${label}]`,
    );
    amixInputs.push(`[${label}]`);
    ai += 1;
    void durations;
  }

  if (amixInputs.length === 0) {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", videoPath, "-c:v", "libx264", "-pix_fmt", "yuv420p", outPath],
      { stdio: "inherit" },
    );
    return;
  }

  const n = amixInputs.length;
  filters.push(
    `${amixInputs.join("")}amix=inputs=${n}:dropout_transition=0:normalize=0[aout]`,
  );

  const args = [
    ...inputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "0:v",
    "-map",
    "[aout]",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-t",
    (totalMs / 1000 + 0.4).toFixed(2),
    outPath,
  ];
  console.log("ffmpeg mux…");
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const rawDir = path.join(OUT_DIR, "raw");
  rmSync(rawDir, { recursive: true, force: true });
  mkdirSync(rawDir, { recursive: true });

  // Probe app
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error(`App not reachable at ${BASE_URL}. Start with: npm run dev`);
    throw e;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: rawDir, size: VIEWPORT },
  });
  const page = await context.newPage();
  t0 = Date.now();

  // —— 01 Cold open ——
  mark("01", "Cold open", "01.m4a", 700);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await injectChrome(page);
  await demoCall(
    page,
    "showInterstitial",
    "Cyber underwriting",
    "Attestation isn’t reality.",
    "Soft market pressure meets hard signal truth.",
  );
  await demoCall(
    page,
    "caption",
    "Cyber underwriting",
    "Attestation isn’t reality.",
    "Soft market. Soft answers.",
  );
  await sleep(8200);

  // —— Ops login + workbench ——
  mark("02", "Workbench / AI search", "02.m4a", 550);
  await demoCall(page, "hideInterstitial");
  await login(page, "ops@cyber.internal", "ops123");
  await demoCall(
    page,
    "caption",
    "Decision Workbench",
    "One workbench.",
    "Ops + underwriting. AI search finds the case worth opening.",
  );
  await goNav(page, "Manage Submissions");
  await sleep(600);

  // AI search
  const aiBtn = page.getByRole("button", { name: /AI search/i }).first();
  if (await aiBtn.count()) {
    await clickLocator(page, aiBtn, "AI search");
    await sleep(400);
  }
  const aiInput = page.getByRole("textbox", { name: /AI search|search/i }).first();
  if (await aiInput.count()) {
    await spotlightLocator(page, aiInput, "AI search");
    const box = await aiInput.boundingBox();
    if (box) await clickAt(page, box.x + 40, box.y + box.height / 2);
    await aiInput.fill("Northwind");
    await sleep(900);
  } else {
    // fallback: highlight queue table
    const table = page.locator("table").first();
    if (await table.count()) await spotlightLocator(page, table, "Case queue");
  }
  await sleep(4200);

  // —— 03 Ingest / Decision Desk ——
  mark("03", "Ingest thinking", "03.m4a", 500);
  await demoCall(
    page,
    "caption",
    "Intake",
    "Package lands.",
    "Agents begin thinking the moment the package arrives.",
  );
  await goNav(page, "Decision Desk");
  await sleep(800);
  // Open first case if list visible
  const caseBtn = page.getByRole("button", { name: /Northwind/i }).first();
  if (await caseBtn.count()) {
    await clickLocator(page, caseBtn, "Open case");
    await sleep(1000);
  }
  const thinking = page.getByText(/thinking|agent|Ideal|Detected|Feedback/i).first();
  if (await thinking.count()) {
    await spotlightLocator(page, thinking, "Agent thinking");
  }
  await sleep(4500);

  // —— 04 Ideal vs Detected ——
  mark("04", "Ideal vs Detected", "04.m4a", 500);
  await demoCall(
    page,
    "caption",
    "Verify · Gap board",
    "Ideal vs Detected.",
    "Every material gap cites its signal.",
  );
  const ideal = page.getByText(/Ideal/i).first();
  if (await ideal.count()) {
    await spotlightLocator(page, ideal, "Ideal vs Detected", 2.2);
  }
  const mfa = page.getByText(/MFA/i).first();
  if (await mfa.count()) {
    await sleep(2200);
    await spotlightLocator(page, mfa, "Signal cite-back", 1.8);
  }
  await sleep(4500);

  // —— 05 Tier (still on desk; highlight appetite language if present) ——
  mark("05", "Tier guidance", "05.m4a", 500);
  await demoCall(
    page,
    "caption",
    "Tier",
    "Tier is guidance.",
    "Appetite assist — not a bound premium.",
  );
  const tierish = page.getByText(/appetite|tier|guidance|Refer|Resolve/i).first();
  if (await tierish.count()) await spotlightLocator(page, tierish, "Appetite / tier assist");
  await sleep(7000);

  // —— Switch to UW for risk / decide / referrals ——
  mark("06", "Accumulation / ALE", "06.m4a", 500);
  await login(page, "uw@cyber.internal", "uw123");
  await demoCall(
    page,
    "caption",
    "Review Risk",
    "Stacked exposure.",
    "Know the book before you bind. Estimated ALE.",
  );
  await goNav(page, "Decision Desk");
  const nw = page.getByRole("button", { name: /Northwind/i }).first();
  if (await nw.count()) {
    await clickLocator(page, nw, "Case");
    await sleep(900);
  }
  // Try Review Risk step if clickable
  const riskStep = page.getByText(/^Review Risk$|3 Review Risk/i).first();
  if (await riskStep.count()) {
    try {
      await clickLocator(page, riskStep, "Review Risk");
      await sleep(800);
    } catch {
      /* gated */
    }
  }
  const ale = page.getByText(/ALE|exposure|accumulation|EDR|Ideal/i).first();
  if (await ale.count()) await spotlightLocator(page, ale, "ALE · stacked exposure");
  await sleep(6500);

  // —— 07 Recommend chips ——
  mark("07", "Recommend chips", "07.m4a", 500);
  await demoCall(
    page,
    "caption",
    "Decide",
    "Quote · Refer · Decline",
    "AI recommendation with confidence — UW still owns the chip.",
  );
  // Inject temporary chips if not in DOM
  await page.evaluate(() => {
    if (document.getElementById("pw-rec-chips")) return;
    const host = document.createElement("div");
    host.id = "pw-rec-chips";
    host.style.cssText =
      "position:fixed;left:50%;bottom:120px;transform:translateX(-50%);display:flex;gap:12px;z-index:2147482500;padding:16px 18px;border-radius:16px;background:rgba(10,16,28,0.92);border:1px solid rgba(255,255,255,0.2);";
    for (const [label, bg, conf, active] of [
      ["Quote", "#b2f2bb", "62%", ""],
      ["Refer", "#ffec99", "AI · 81%", "1"],
      ["Decline", "#ffc9c9", "12%", ""],
    ] as const) {
      const c = document.createElement("div");
      c.style.cssText = `min-width:140px;border-radius:12px;padding:12px 14px;background:${bg};color:#1e1e1e;${active ? "box-shadow:0 0 0 3px rgba(255,236,153,0.55);" : ""}`;
      c.innerHTML = `<div style="font-size:12px;font-weight:700;opacity:.6">AI recommend</div><div style="font-size:22px;font-weight:800">${label}</div><div style="font-size:14px;font-weight:700;margin-top:2px">${conf}</div>`;
      host.appendChild(c);
    }
    document.body.appendChild(host);
  });
  const chips = page.locator("#pw-rec-chips");
  await spotlightLocator(page, chips, "AI recommend chips");
  await sleep(7500);
  await page.evaluate(() => document.getElementById("pw-rec-chips")?.remove());

  // —— 08 Referral inbox ——
  mark("08", "Referral chase", "08.m4a", 450);
  await demoCall(page, "clearSpotlight");
  await demoCall(
    page,
    "caption",
    "Referral Inbox",
    "Centralized chase.",
    "Remind · Resolve · Return — one hub, not five inboxes.",
  );
  await goNav(page, "Referrals");
  await sleep(700);
  const remind = page.locator('[data-video-action="remind-broker"]').first();
  const resolve = page.locator('[data-video-action="resolve-referral"]').first();
  if (await remind.count()) await spotlightLocator(page, remind, "Chase hub");
  else if (await resolve.count()) await spotlightLocator(page, resolve, "Chase hub");
  else {
    const inbox = page.getByText(/Referral|Remind|Resolve|Return/i).first();
    if (await inbox.count()) await spotlightLocator(page, inbox, "Chase hub");
  }
  await sleep(5200);

  // —— 09 HITL ——
  mark("09", "HITL bind", "09.m4a", 500);
  await demoCall(
    page,
    "caption",
    "Human-in-the-loop",
    "Underwriter binds.",
    "Agents assist. Every override stays explainable.",
  );
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "pw-hitl";
    host.style.cssText =
      "position:fixed;inset:0;z-index:2147482600;display:flex;align-items:center;justify-content:center;background:rgba(6,10,18,0.45);";
    host.innerHTML = `<div style="width:520px;border-radius:18px;background:#f7f9fc;color:#1e1e1e;padding:26px 28px;box-shadow:0 30px 80px rgba(0,0,0,.4)">
      <div style="font-size:13px;font-weight:800;letter-spacing:.08em;opacity:.5">CONFIRM BIND</div>
      <div style="font-size:26px;font-weight:800;margin-top:8px">Underwriter locks the decision</div>
      <div style="margin-top:12px;font-size:15px;opacity:.75;line-height:1.4">Override reason stays on the trail. Agents assist — they do not bind.</div>
      <div style="margin-top:14px;padding:12px 14px;border-radius:10px;background:#eef3ff;font-size:14px;font-weight:600">Reason: MFA gap accepted with compensating EDR + broker attestation.</div>
      <div style="display:flex;gap:12px;margin-top:20px;justify-content:flex-end">
        <div style="padding:12px 18px;border-radius:10px;border:1.5px solid #ccd3df;font-weight:700">Cancel</div>
        <div style="padding:12px 18px;border-radius:10px;background:#1e3a8a;color:#fff;font-weight:800">Bind · explainable</div>
      </div>
    </div>`;
    document.body.appendChild(host);
  });
  await spotlightLocator(page, page.locator("#pw-hitl > div"), "HITL confirm");
  await sleep(7800);
  await page.evaluate(() => document.getElementById("pw-hitl")?.remove());

  // —— 10 PAS ——
  mark("10", "PAS approve", "10.m4a", 450);
  await demoCall(
    page,
    "caption",
    "Sync · Closure",
    "Approve before send.",
    "Push to policy admin when you’re ready.",
  );
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "pw-pas";
    host.style.cssText =
      "position:fixed;right:48px;bottom:120px;width:380px;z-index:2147482600;border-radius:16px;background:rgba(10,16,28,0.94);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:18px 20px;box-shadow:0 24px 60px rgba(0,0,0,.45)";
    host.innerHTML = `<div style="font-size:12px;font-weight:800;letter-spacing:.1em;opacity:.55">SYNC · POLICY ADMIN</div>
      <div style="font-size:22px;font-weight:800;margin-top:8px">Approve before send</div>
      <div style="font-size:14px;margin-top:8px;opacity:.7;line-height:1.35">Push to PAS when ready. Undo until synced.</div>
      <div style="margin-top:14px;background:#ffec99;color:#1e1e1e;text-align:center;padding:12px 14px;border-radius:10px;font-weight:800;font-size:16px">Approve → send to PAS</div>`;
    document.body.appendChild(host);
  });
  await spotlightLocator(page, page.locator("#pw-pas"), "Approve → PAS");
  await sleep(5800);
  await page.evaluate(() => document.getElementById("pw-pas")?.remove());

  // —— 11 Closer ——
  mark("11", "Closer", "11.m4a", 600);
  await demoCall(page, "clearSpotlight");
  await demoCall(
    page,
    "showInterstitial",
    "Birlasoft IP accelerator",
    "Agents assist · underwriter binds · every override is explainable",
    "Cyber Underwriting Dashboard",
  );
  await demoCall(
    page,
    "caption",
    "Birlasoft IP accelerator",
    "Agents assist · underwriter binds · every override is explainable",
    "",
  );
  await sleep(8200);

  const totalMs = nowMs();
  writeFileSync(path.join(OUT_DIR, "marks.json"), JSON.stringify(marks, null, 2));

  await context.close();
  await browser.close();

  // Find recorded webm
  const files = existsSync(rawDir)
    ? (await import("node:fs")).readdirSync(rawDir).filter((f) => f.endsWith(".webm"))
    : [];
  if (!files.length) throw new Error("No Playwright video recorded");
  const webm = path.join(rawDir, files[0]!);
  const mp4 = path.join(OUT_DIR, "agents-assist-playwright.mp4");
  muxAudio(webm, mp4, totalMs);

  console.log(`\nDone → ${mp4}`);
  console.log(`Duration ~${(totalMs / 1000).toFixed(1)}s · chapters ${marks.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
