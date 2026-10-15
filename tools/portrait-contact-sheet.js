/* sheet.js — all ten portraits at ship size, side by side. Judge the SET. */
const fs = require('fs'); const path = require('path');
const { PAGES, withPage, go } = require('./lib');
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
withPage('desktop', async (page) => {
  await go(page, PAGES.team);
  await page.evaluate(() => document.querySelector('.scatter').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  // lay all ten out in one even grid so nothing is bigger than anything else
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'sheet';
    host.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#E6DED2;' +
      'display:grid;grid-template-columns:repeat(5,1fr);gap:18px;padding:24px;' +
      'align-content:start';
    [...document.querySelectorAll('.tm')]
      .sort((a, b) => a.dataset.i - b.dataset.i)
      .forEach((t) => {
        const c = t.cloneNode(true);
        c.style.cssText = 'margin:0;width:auto';
        host.appendChild(c);
      });
    document.body.appendChild(host);
  });
  await page.waitForTimeout(400);
  await page.locator('#sheet').screenshot({ path: path.join(OUT, 'contact-sheet.png') });
  console.log('  contact sheet written');
}).catch((e) => { console.error(e); process.exit(1); });
