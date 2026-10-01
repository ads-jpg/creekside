// End-to-end test: real page + real API code + Netlify Blobs' local server, driven in Chromium.
// Usage: node test/e2e.mjs [path/to/jspdf.umd.min.js] [screenshot-dir]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { startServer } from './server.mjs';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { ({ chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }

const JSPDF = process.argv[2] && fs.existsSync(process.argv[2]) ? fs.readFileSync(process.argv[2], 'utf8') : null;
const SHOTS = process.argv[3] || null;
const PASS = 'bride-and-groom-2026';
const srv = await startServer({ passcode: PASS });

const results = [];
function check(name, cond, detail) { results.push({ name, ok: !!cond }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail && !cond ? '  -> ' + String(detail).slice(0, 600) : '')); }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
async function phone(opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, acceptDownloads: true }, opts));
  await ctx.addInitScript(() => {
    window.__clip = [];
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__clip.push(t); } }, configurable: true });
  });
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
  await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  await ctx.route('https://cdnjs.cloudflare.com/**', r => JSPDF ? r.fulfill({ contentType: 'application/javascript', body: JSPDF }) : r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(srv.url + (opts.hash || '/'));
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'n-' + name + '.png'), fullPage: true }); };
const tap = (page, sel) => page.locator(sel).first().click();
const barBtn = page => page.locator('#bar .btn-primary');
const apiList = async () => (await (await fetch(srv.url + '/api/orders')).json()).orders;

async function fillOrder(page, o) {
  await page.fill('#guest-name', o.name);
  await barBtn(page).click();
  await tap(page, `.item[data-id="${o.item}"]`);
  await barBtn(page).click();
  if (o.bread) await tap(page, `.tile[data-id="${o.bread}"]`);
  for (const [ing, val] of o.mods || []) await tap(page, `.seg button[data-ing="${ing}"][data-val="${val}"]`);
  for (const ing of o.adds || []) await tap(page, `.pill[data-act="add"][data-ing="${ing}"]`);
  await barBtn(page).click();
  for (const [grp, val] of o.extras || []) await tap(page, `.pill[data-grp="${grp}"][data-val="${val}"]`);
  if (o.notes) await page.fill('#notes', o.notes);
  await barBtn(page).click();
}
async function submitOrder(page, o) {
  await fillOrder(page, o);
  await barBtn(page).click();
  await page.waitForSelector('.done h2');
}

/* ---------- Sarah ---------- */
const sarah = await phone();
{
  const p = sarah.page;
  check('Welcome screen shows name, subtitle and note', (await p.textContent('h1')).includes('Dressed & Fed')
    && (await p.textContent('.hero .sub')).includes("Please select your Jimmy John's order below."));
  check('Public dashboard starts empty', (await p.textContent('#who-slot')).includes('No orders yet'));
  check('Guests see no host dashboard button', (await p.locator('.host-card').count()) === 0);
  await shot(p, '01-welcome');
  await barBtn(p).click();
  check('Name is required', (await p.locator('#name-err').count()) === 1);
  await fillOrder(p, { name: 'Sarah Johnson', item: 'bigjohn', bread: 'french8', mods: [['tomato', 'none'], ['mayo', 'extra']], adds: ['cucumber'], extras: [['chips', 'regular'], ['drink', 'lemonade']] });
  const review = await p.textContent('.summary');
  check('Review shows the full order', ['Sarah Johnson', '#2 Big John®', 'French (8")', 'No tomatoes', 'Extra mayo', 'Add cucumbers', 'Regular Jimmy Chips®', 'Classic Lemonade'].every(x => review.includes(x)), review);
  await barBtn(p).click();
  await p.waitForSelector('.done h2');
  check('Confirmation screen', (await p.textContent('.done h2')) === 'Order Submitted!' && (await p.textContent('.done p')).includes("Thank you, Sarah! Your Jimmy John's order has been recorded."));
  check('Order saved on the server', (await apiList()).length === 1);
  await tap(p, '[data-act="go-home"]');
  await p.waitForTimeout(300);
  check('Back to home shows who has ordered', (await p.locator('#guest-name').count()) === 1 && (await p.textContent('#who-slot')).includes('Sarah Johnson'));
  await p.reload(); await p.waitForTimeout(600);
  check('Returning guest sees "Your orders from this phone"', (await p.locator('.mine-row').count()) === 1);
  check('Who\'s ordered shows Sarah', (await p.textContent('#who-slot')).includes('Sarah Johnson') && (await p.textContent('#who-slot')).includes('No tomatoes'));
  await tap(p, '[data-act="edit-mine"]');
  await p.waitForSelector('.summary');
  await tap(p, '[data-act="goto"][data-step="3"]');
  await p.fill('#notes', 'Light on the mayo, please.');
  await barBtn(p).click();
  check('Edit shows Update Order', (await barBtn(p).textContent()) === 'Update Order');
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  let list = await apiList();
  check('Editing does not duplicate', list.length === 1 && list[0].rev === 2 && list[0].notes === 'Light on the mayo, please.');
  await tap(p, '[data-act="new-order"]');
  await fillOrder(p, { name: ' sarah  johnson ', item: 'pepe' });
  check('Same name from same phone warns it will replace', (await p.textContent('.notice.info')).includes('already has an order from this phone'));
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  list = await apiList();
  check('Same-name resubmission replaces, keeps spelling', list.length === 1 && list[0].item === 'The Pepe®' && list[0].name === 'Sarah Johnson', JSON.stringify(list.map(x => [x.name, x.item])));
  await tap(p, '[data-act="new-order"]');
  await fillOrder(p, { name: 'Tom Johnson', item: 'turkeytom', mods: [['mayo', 'none']] });
  await barBtn(p).dblclick();
  await p.waitForSelector('.done h2');
  check('Double-tap Submit saves once; two people from one phone', (await apiList()).length === 2);
  check('No page errors (Sarah)', !sarah.errors.length, sarah.errors.join(' | '));
}

/* ---------- Mike ---------- */
const mike = await phone();
{
  const p = mike.page;
  check('Another phone sees everyone who ordered', (await p.textContent('#who-slot #total-orders')) === '2' && (await p.textContent('#who-slot')).includes('Tom Johnson'));
  check('Public dashboard shows summaries', /#4Turkey Tom®\s*1/.test(await p.textContent('#who-slot #sandwich-summary')) && (await p.locator('#who-slot #mod-summary').count()) === 1);
  check('Public dashboard has no host controls', (await p.locator('#who-slot [data-act="status"], #who-slot [data-act="admin-del"], #who-slot [data-act="admin-edit"], #who-slot [data-act="copy-all"]').count()) === 0 && (await p.locator('#who-slot .ocard .st-pill').count()) === 2);
  await p.fill('#admin-search', 'tom');
  check('Guests can search the public dashboard', (await p.locator('#who-slot .ocard').count()) === 1 && await p.evaluate(() => document.activeElement.id === 'admin-search'));
  await p.fill('#admin-search', '');
  await submitOrder(p, { name: 'Mike Smith', item: 'turkeytom', bread: 'wheat', mods: [['mayo', 'none']], extras: [['dessert', 'chocchip']] });
  check('Second guest saved separately', (await apiList()).length === 3);
  // try to take over Sarah's name from a different phone
  await tap(p, '[data-act="new-order"]');
  await fillOrder(p, { name: 'Sarah Johnson', item: 'vito' });
  check('Other phone is warned the name is taken', (await p.textContent('.notice.warn')).includes('already has an order'));
  await barBtn(p).click(); await p.waitForTimeout(500);
  check('Server refuses to overwrite someone else\'s order', (await p.textContent('[role="alert"]')).includes("wasn't saved") && (await apiList()).find(o => o.name === 'Sarah Johnson').item === 'The Pepe®');
  const sid = (await apiList()).find(o => o.name === 'Sarah Johnson').id;
  const tamper = await p.evaluate(async id => {
    const tok = JSON.parse(localStorage.getItem('dnf-device-token'));
    const put = await fetch('/api/orders/' + id, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: tok, order: { name: 'Sarah Johnson', itemId: 'vito', item: 'Vito®' } }) });
    const del = await fetch('/api/orders/' + id, { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: tok }) });
    const st = await fetch('/api/orders/' + id + '/status', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'Ordered' }) });
    return [put.status, del.status, st.status];
  }, sid);
  check('A guest cannot edit, cancel or change status of others\' orders', JSON.stringify(tamper) === '[403,403,403]', JSON.stringify(tamper));
  // cancel own order and re-order
  await tap(p, '[data-act="back"]'); await tap(p, '[data-act="back"]'); await tap(p, '[data-act="back"]'); await tap(p, '[data-act="back"]');
  await p.waitForSelector('.mine-row');
  await tap(p, '[data-act="cancel-mine"]');
  await tap(p, '[data-act="modal-ok"]');
  await p.waitForTimeout(500);
  check('Guest can cancel their own order', (await apiList()).length === 2 && (await p.locator('.mine-row').count()) === 0);
  await p.fill('#guest-name', '');
  await submitOrder(p, { name: 'Mike Smith', item: 'turkeytom', bread: 'wheat', mods: [['mayo', 'none']], extras: [['dessert', 'chocchip']] });
  check('No page errors (Mike)', !mike.errors.length, mike.errors.join(' | '));
}

/* ---------- Host ---------- */
const host = await phone({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: 1, hasTouch: false, hash: '/#host' });
{
  const p = host.page;
  check('Host link opens a passcode screen', await p.isVisible('#host-pass'));
  await p.fill('#host-pass', 'wrong');
  await p.press('#host-pass', 'Enter');
  await p.waitForSelector('.login .error');
  check('Wrong passcode is refused', (await p.textContent('.login .error')).includes('isn’t right'));
  await p.fill('#host-pass', PASS);
  await p.press('#host-pass', 'Enter');
  await p.waitForSelector('#total-orders');
  await p.waitForTimeout(300);
  check('Dashboard total = 3', (await p.textContent('#total-orders')) === '3');
  const rows = await p.locator('table.orders tbody tr').allTextContents();
  const mikeRow = rows.find(t => t.includes('Mike Smith')) || '';
  check('Row shows Mike correctly', ['#4', 'Turkey Tom®', 'Sliced Wheat', 'No mayo', 'Chocolate Chip Cookie', 'Submitted'].every(x => mikeRow.includes(x)), mikeRow);
  check('Sandwich summary', /#1The Pepe®\s*1/.test(await p.textContent('#sandwich-summary')) && /#4Turkey Tom®\s*2/.test(await p.textContent('#sandwich-summary')));
  check('Customization summary', /No mayo\s*2/.test(await p.textContent('#mod-summary')));

  const lia = await phone();
  await submitOrder(lia.page, { name: 'Lia Chen', item: 'bigjohn', bread: 'unwich', mods: [['tomato', 'none']], extras: [['chips', 'bbq']] });
  await p.waitForFunction(() => document.querySelector('#total-orders')?.textContent === '4', null, { timeout: 12000 }).catch(() => {});
  check('Dashboard updates on its own when someone orders', (await p.textContent('#total-orders')) === '4');
  await shot(p, '10-dashboard');

  await p.fill('#admin-search', 'mik');
  check('Search by guest name', JSON.stringify(await p.locator('table.orders tbody .guest').allTextContents()) === '["Mike Smith"]');
  await p.fill('#admin-search', '');
  await p.selectOption('#admin-filter', 'turkeytom');
  check('Filter by sandwich', JSON.stringify(await p.locator('table.orders tbody .guest').allTextContents()) === '["Mike Smith","Tom Johnson"]');
  await p.selectOption('#admin-filter', 'all');
  await p.selectOption('#admin-sort', 'name-desc');
  check('Sort by guest name', JSON.stringify(await p.locator('table.orders tbody .guest').allTextContents()) === '["Tom Johnson","Sarah Johnson","Mike Smith","Lia Chen"]');
  await p.selectOption('#admin-sort', 'name-asc');

  await p.locator('table.orders tbody tr', { hasText: 'Sarah Johnson' }).locator('[data-val="Reviewed"]').click();
  await p.locator('table.orders tbody tr', { hasText: 'Mike Smith' }).locator('[data-val="Ordered"]').click();
  await p.waitForTimeout(500);
  check('Statuses saved on server', (await apiList()).map(o => o.status).sort().join(',') === 'Ordered,Reviewed,Submitted,Submitted');
  await p.reload(); await p.waitForTimeout(800);
  check('Host stays signed in after reload (#host)', await p.isVisible('#total-orders'));
  check('Status persists after reload', (await p.locator('table.orders tbody tr', { hasText: 'Sarah Johnson' }).locator('[aria-checked="true"]').textContent()) === 'Reviewed');

  // Sarah edits after review -> flagged
  await sarah.page.reload(); await sarah.page.waitForTimeout(500);
  await sarah.page.locator('.mine-row', { hasText: 'Sarah Johnson' }).locator('[data-act="edit-mine"]').click();
  await sarah.page.waitForSelector('.summary');
  await tap(sarah.page, '[data-act="goto"][data-step="3"]');
  await tap(sarah.page, '.pill[data-grp="dessert"][data-val="oatmeal"]');
  await barBtn(sarah.page).click(); await barBtn(sarah.page).click(); await sarah.page.waitForSelector('.done h2');
  await p.waitForFunction(() => document.body.textContent.includes('Changed after reviewed'), null, { timeout: 12000 }).catch(() => {});
  check('Edits after review are flagged for the host', (await p.locator('table.orders tbody tr', { hasText: 'Sarah Johnson' }).textContent()).includes('Changed after reviewed'));

  await tap(p, '[data-act="copy-all"]');
  const clip = await p.evaluate(() => window.__clip.at(-1));
  check('Copy All Orders', clip.includes('Total orders: 4') && clip.includes('#4 Turkey Tom®: 2') && clip.includes('Mike Smith: Sliced Wheat; No mayo'), clip);
  const [csvDl] = await Promise.all([p.waitForEvent('download'), tap(p, '[data-act="export-csv"]')]);
  const csv = fs.readFileSync(await csvDl.path(), 'utf8');
  check('Export CSV downloads a file', csvDl.suggestedFilename() === 'dressed-and-fed-orders.csv' && csv.includes('"Mike Smith","#4","Turkey Tom®","Sliced Wheat","No mayo","Chocolate Chip Cookie","None"'), csv.slice(0, 300));
  if (JSPDF) {
    const [pdfDl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), tap(p, '[data-act="export-pdf"]')]);
    const head = fs.readFileSync(await pdfDl.path()).subarray(0, 5).toString();
    check('Printable PDF downloads', pdfDl.suggestedFilename() === 'dressed-and-fed-orders.pdf' && head === '%PDF-');
  }

  // paste a texted order
  await tap(p, '#paste-box > summary');
  await p.fill('#paste-text', 'Name: jo lee\nSandwich: #9 Italian Night Club\nBread: Sliced Wheat\nCustomizations: No onions, Add Jimmy Peppers\nExtras: BBQ Jimmy Chips, Diet Coke');
  await tap(p, '[data-act="paste-fill"]');
  await p.waitForSelector('.summary');
  check('Pasted order fills in', (await p.textContent('.summary')).includes('#9 Italian Night Club®'));
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  await tap(p, '[data-act="back-admin"]'); await p.waitForTimeout(400);
  check('Pasted order saved', (await p.textContent('#total-orders')) === '5');

  // host enters, edits, and removes an order
  await tap(p, '[data-act="host-add"]');
  await submitOrder(p, { name: 'Grandma Rose', item: 'veggie', extras: [['pickle', 'whole']] });
  await tap(p, '[data-act="back-admin"]'); await p.waitForTimeout(400);
  check('Host-entered order appears', (await p.textContent('#total-orders')) === '6');
  await p.locator('table.orders tbody tr', { hasText: 'Mike Smith' }).locator('[data-act="admin-edit"]').click();
  await p.waitForSelector('.summary');
  await tap(p, '[data-act="goto"][data-step="3"]');
  await p.fill('#notes', 'Host note: cut in half');
  await barBtn(p).click(); await barBtn(p).click(); await p.waitForSelector('.done h2');
  check('Host can edit any order', (await apiList()).find(o => o.name === 'Mike Smith').notes === 'Host note: cut in half');
  await tap(p, '[data-act="back-admin"]'); await p.waitForTimeout(400);
  check('Host edit is not flagged as changed', !(await p.locator('table.orders tbody tr', { hasText: 'Mike Smith' }).textContent()).includes('Changed after'));
  await p.locator('table.orders tbody tr', { hasText: 'Grandma Rose' }).locator('[data-act="admin-del"]').click();
  await tap(p, '[data-act="modal-ok"]');
  await p.waitForTimeout(500);
  check('Host can remove an order', (await p.textContent('#total-orders')) === '5' && (await apiList()).length === 5);
  check('No page errors (host)', !host.errors.length, host.errors.join(' | '));
  await tap(p, '[data-act="host-lock"]');
  check('Lock signs the host out', (await p.locator('#admin-body').count()) === 0 && (await p.locator('#who-slot [data-act="status"]').count()) === 0 && (await p.evaluate(() => localStorage.getItem('dnf-host-passcode'))) === null);

  const hm = await phone({ colorScheme: 'dark', hash: '/#host' });
  await hm.page.fill('#host-pass', PASS); await hm.page.press('#host-pass', 'Enter');
  await hm.page.waitForSelector('#total-orders'); await hm.page.waitForTimeout(300);
  check('Phone dashboard uses cards', (await hm.page.locator('.ocard').count()) === 5);
  check('No sideways scrolling on phone', !(await hm.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)));
  await shot(hm.page, '11-dashboard-phone-dark');
  const g = await phone({ colorScheme: 'dark' });
  await shot(g.page, '02-welcome-dark');
}

await browser.close();
await srv.stop();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
