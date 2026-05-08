import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5174';
const OUT_DIR = path.resolve('./docs/screenshots');

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
await new Promise(r => setTimeout(r, 1500));

// 1. 전체 대시보드 (헤더 포함)
await page.screenshot({ path: `${OUT_DIR}/01_full_dashboard.png`, fullPage: false });
console.log('✅ 01_full_dashboard.png');

// 2. 헤더 영역만
await page.screenshot({
  path: `${OUT_DIR}/02_header.png`,
  clip: { x: 0, y: 0, width: 1440, height: 64 },
});
console.log('✅ 02_header.png');

// 3. KPI 카드 4개 (헤더 아래)
await page.screenshot({
  path: `${OUT_DIR}/03_kpi_cards.png`,
  clip: { x: 0, y: 64, width: 1440, height: 180 },
});
console.log('✅ 03_kpi_cards.png');

// 4. 지도 + 상황 패널 영역
const mapSection = await page.$('.xl\\:col-span-3');
if (mapSection) {
  const box = await mapSection.boundingBox();
  if (box) {
    await page.screenshot({
      path: `${OUT_DIR}/04_map.png`,
      clip: { x: box.x - 20, y: box.y - 30, width: box.width + 40, height: box.height + 60 },
    });
    console.log('✅ 04_map.png');
  }
}

// 5. 시계열 차트 3개
await page.evaluate(() => window.scrollBy(0, 900));
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${OUT_DIR}/05_charts.png`, fullPage: false });
console.log('✅ 05_charts.png');

// 6. 데이터 출처 섹션
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${OUT_DIR}/06_data_source.png`, fullPage: false });
console.log('✅ 06_data_source.png');

// 7. 전체 페이지 풀 스크롤 캡처
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: `${OUT_DIR}/00_fullpage.png`, fullPage: true });
console.log('✅ 00_fullpage.png');

await browser.close();
console.log('\n🎉 모든 스크린샷 저장 완료:', OUT_DIR);
