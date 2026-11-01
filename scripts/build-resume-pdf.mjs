// Renders resume.html to Narendaran_S_G_Resume.pdf (A4) with headless Chromium.
// Run locally:  npx playwright install chromium && node scripts/build-resume-pdf.mjs
// The GitHub Action runs this automatically whenever resume.html changes.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, 'resume.html')).href, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: path.join(root, 'Narendaran_S_G_Resume.pdf'),
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});
await browser.close();
console.log('Wrote Narendaran_S_G_Resume.pdf');
