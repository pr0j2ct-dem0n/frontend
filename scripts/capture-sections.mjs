import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:5174';
const OUT = './docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
await new Promise(r => setTimeout(r, 1800));

// A. KPI + 헤더 전체
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/s_kpi_header.png`, clip: { x: 0, y: 0, width: 1440, height: 280 } });
console.log('✅ s_kpi_header.png');

// B. 지도 영역만 (더 크게)
await page.screenshot({ path: `${OUT}/s_map_large.png`, clip: { x: 16, y: 280, width: 870, height: 580 } });
console.log('✅ s_map_large.png');

// C. 상황 패널만
await page.screenshot({ path: `${OUT}/s_alert_panel.png`, clip: { x: 888, y: 280, width: 540, height: 580 } });
console.log('✅ s_alert_panel.png');

// D. 시계열 차트 3개
await page.evaluate(() => window.scrollTo(0, 900));
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/s_charts_3.png`, clip: { x: 0, y: 0, width: 1440, height: 320 } });
console.log('✅ s_charts_3.png');

// E. 데이터 출처 섹션
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/s_datasource.png`, clip: { x: 0, y: 100, width: 1440, height: 600 } });
console.log('✅ s_datasource.png');

// F. 풀 페이지 (축소)
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: `${OUT}/s_fullpage.png`, fullPage: true });
console.log('✅ s_fullpage.png');

await browser.close();
console.log('\n🎉 완료');
