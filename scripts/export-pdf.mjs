import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const IMG_DIR = './docs/screenshots';
const OUT_PDF = './docs/screenshots/dashboard-screenshots.pdf';

const files = [
  '01-main-dashboard.png',
  '02-main-top-section.png',
  '03-risk-map.png',
  '04-realtime-status-panel.png',
  '05-timeseries-charts.png',
  '06-data-sources.png',
  '07-rainfall-detail.png',
  '08-sewer-level-detail.png',
  '09-risk-zones-detail.png',
  '10-highest-risk-area-detail.png',
];

const labels = [
  '01 · 메인 대시보드 (전체)',
  '02 · 메인 상단 — 헤더 + KPI + 지도/패널',
  '03 · 서울시 위험 구간 지도',
  '04 · 실시간 상황 패널',
  '05 · 시계열 분석 차트',
  '06 · 데이터 출처 및 위험도 산정 기준',
  '07 · 강우량 상세 페이지',
  '08 · 하수관 수위 상세 페이지',
  '09 · 위험 구간 전체 목록',
  '10 · 최고 위험 지역 상세',
];

function toBase64(filePath) {
  return fs.readFileSync(filePath).toString('base64');
}

const pages = files.map((f, i) => {
  const absPath = path.resolve(IMG_DIR, f);
  const b64 = toBase64(absPath);
  return `
    <div class="page">
      <div class="label">${labels[i]}</div>
      <img src="data:image/png;base64,${b64}" />
    </div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #fff; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; }
  .page {
    width: 100%;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 20px 0;
  }
  .page:last-child { page-break-after: avoid; }
  .label {
    width: 100%;
    font-size: 11px;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
    letter-spacing: 0.02em;
  }
  img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
</head>
<body>
${pages}
</body>
</html>`;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: OUT_PDF,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});
await browser.close();

console.log(`✅ PDF 저장 완료: ${OUT_PDF}`);
