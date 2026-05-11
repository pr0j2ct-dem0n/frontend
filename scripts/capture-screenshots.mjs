/**
 * capture-screenshots.mjs
 * 순수 웹페이지 화면 캡처 스크립트 (주석·번호·설명 없음)
 *
 * 사용법:
 *   node scripts/capture-screenshots.mjs
 *   node scripts/capture-screenshots.mjs --mobile
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://sewer-risk-dashboard.vercel.app';
const OUT_DIR = './docs/screenshots';
const MOBILE_MODE = process.argv.includes('--mobile');

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT  = { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 };

fs.mkdirSync(OUT_DIR, { recursive: true });

const log  = (msg) => console.log(`  ✅ ${msg}`);
const warn = (msg) => console.warn(`  ⚠️  ${msg}`);
const wait = (ms)  => new Promise(r => setTimeout(r, ms));

/* ── 브라우저 초기화 ── */
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: MOBILE_MODE ? MOBILE_VIEWPORT : DESKTOP_VIEWPORT,
});
const page = await browser.newPage();

/* ── 로딩 완료 대기: animate-spin / animate-pulse 사라질 때까지 최대 maxMs ── */
async function waitForLoaded(maxMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const stillLoading = await page.evaluate(() => {
      const spin  = document.querySelector('.animate-spin');
      const pulse = document.querySelector('.animate-pulse');
      return !!(spin || pulse);
    });
    if (!stillLoading) break;
    await wait(500);
  }
  await wait(800); // 렌더 마무리 여유
}

/* ── 공통 goto: 로드 + 로딩 완료 대기 ── */
async function goto(urlPath) {
  await page.goto(BASE_URL + urlPath, { waitUntil: 'networkidle2', timeout: 60000 });
  await waitForLoaded(25000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(300);
}

/* ── 특정 요소 캡처 (없으면 fallback clip) ── */
async function screenshotElement(selector, filePath, fallbackClip) {
  try {
    const el = await page.$(selector);
    if (el) {
      await el.scrollIntoView();
      await wait(400);
      await el.screenshot({ path: filePath });
      log(path.basename(filePath));
      return;
    }
  } catch {
    // ignore
  }
  warn(`selector "${selector}" not found → fallback clip`);
  await page.screenshot({ path: filePath, clip: fallbackClip });
  log(path.basename(filePath) + ' (fallback)');
}

/* ── 스크롤하며 전체 페이지 캡처 ── */
async function screenshotFull(filePath) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await page.screenshot({ path: filePath, fullPage: true });
  log(path.basename(filePath));
}

/* ════════════════════════════════════════════════════════
   캡처 시작
   ════════════════════════════════════════════════════════ */
console.log(`\n🚀 캡처 시작 — ${MOBILE_MODE ? 'mobile' : 'desktop'} | ${BASE_URL}\n`);
const prefix = MOBILE_MODE ? 'mobile-' : '';

/* ──────────────────────────────────────
   1. 메인 대시보드 전체 (full-page)
   ────────────────────────────────────── */
await goto('/');
await screenshotFull(`${OUT_DIR}/${prefix}01-main-dashboard.png`);

/* ──────────────────────────────────────
   2. 메인 상단 (Header + KPI + 지도·패널 일부)
   ────────────────────────────────────── */
await page.evaluate(() => window.scrollTo(0, 0));
await wait(200);
await page.screenshot({
  path: `${OUT_DIR}/${prefix}02-main-top-section.png`,
  clip: { x: 0, y: 0, width: DESKTOP_VIEWPORT.width, height: 720 },
});
log(`${prefix}02-main-top-section.png`);

/* ──────────────────────────────────────
   3. 서울시 위험 구간 지도
   ────────────────────────────────────── */
await screenshotElement(
  '.leaflet-container',
  `${OUT_DIR}/${prefix}03-risk-map.png`,
  { x: 16, y: 300, width: 870, height: 560 },
);

/* ──────────────────────────────────────
   4. 실시간 상황 패널 — .xl:col-span-2 두 번째 자식 div
   ────────────────────────────────────── */
{
  // 지도 오른쪽 패널: grid의 두 번째 직접 자식
  const panel = await page.$('.xl\\:col-span-2');
  if (panel) {
    await panel.scrollIntoView();
    await wait(400);
    await panel.screenshot({ path: `${OUT_DIR}/${prefix}04-realtime-status-panel.png` });
    log(`${prefix}04-realtime-status-panel.png`);
  } else {
    warn('alert panel not found → fallback clip');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${OUT_DIR}/${prefix}04-realtime-status-panel.png`,
      clip: { x: 880, y: 180, width: 540, height: 580 },
    });
    log(`${prefix}04-realtime-status-panel.png (fallback)`);
  }
}

/* ──────────────────────────────────────
   5. 시계열 분석 차트 3개
   ────────────────────────────────────── */
{
  // chart.js canvas가 있는 첫 번째 grid를 캡처
  const chartGrid = await page.$('.grid.grid-cols-1.md\\:grid-cols-3');
  if (chartGrid) {
    await chartGrid.scrollIntoView();
    await wait(600);
    await chartGrid.screenshot({ path: `${OUT_DIR}/${prefix}05-timeseries-charts.png` });
    log(`${prefix}05-timeseries-charts.png`);
  } else {
    // fallback: 페이지 하단 40% 지점
    const scrollH = await page.evaluate(() => document.body.scrollHeight);
    await page.evaluate((y) => window.scrollTo(0, y), Math.floor(scrollH * 0.60));
    await wait(500);
    await page.screenshot({
      path: `${OUT_DIR}/${prefix}05-timeseries-charts.png`,
      clip: { x: 0, y: 0, width: DESKTOP_VIEWPORT.width, height: 450 },
    });
    log(`${prefix}05-timeseries-charts.png (fallback)`);
  }
}

/* ──────────────────────────────────────
   6. 데이터 출처 및 위험도 산정 기준
   ────────────────────────────────────── */
{
  // 페이지 맨 끝으로 스크롤 후 마지막 카드 캡처
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(500);
  // bg-white rounded-xl 중 마지막 요소
  const cards = await page.$$('.bg-white.rounded-xl');
  if (cards.length > 0) {
    const lastCard = cards[cards.length - 1];
    await lastCard.scrollIntoView();
    await wait(400);
    await lastCard.screenshot({ path: `${OUT_DIR}/${prefix}06-data-sources.png` });
    log(`${prefix}06-data-sources.png`);
  } else {
    await page.screenshot({
      path: `${OUT_DIR}/${prefix}06-data-sources.png`,
      clip: { x: 0, y: 0, width: DESKTOP_VIEWPORT.width, height: 500 },
    });
    log(`${prefix}06-data-sources.png (fallback)`);
  }
}

/* ──────────────────────────────────────
   7. 강우량 상세 페이지
   ────────────────────────────────────── */
await goto('/rainfall');
await screenshotFull(`${OUT_DIR}/${prefix}07-rainfall-detail.png`);

/* ──────────────────────────────────────
   8. 하수관 수위 상세 페이지
   ────────────────────────────────────── */
await goto('/sewer-level');
await screenshotFull(`${OUT_DIR}/${prefix}08-sewer-level-detail.png`);

/* ──────────────────────────────────────
   9. 위험 구간 전체 목록
   ────────────────────────────────────── */
await goto('/risk-zones');
await screenshotFull(`${OUT_DIR}/${prefix}09-risk-zones-detail.png`);

/* ──────────────────────────────────────
   10. 최고 위험 지역 상세
   ────────────────────────────────────── */
await goto('/highest-risk-area');
await screenshotFull(`${OUT_DIR}/${prefix}10-highest-risk-area-detail.png`);

/* ── 종료 ── */
await browser.close();

const files = fs.readdirSync(OUT_DIR)
  .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
  .sort();

console.log(`\n📁 저장 폴더: ${OUT_DIR}`);
console.log(`📸 생성된 파일 ${files.length}개:\n`);
files.forEach(f => console.log(`   ${f}`));
console.log('\n✨ 완료\n');
