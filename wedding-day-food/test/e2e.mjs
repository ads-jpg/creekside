// End-to-end test of the guest flow and host dashboard against a mock artifact runtime.
// Usage: node test/e2e.mjs [path/to/jspdf.umd.min.js] [screenshot-dir]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use a local playwright if installed, else the globally installed one.
let chromium;
try { ({ chromium } = await import('playwright')); }
catch (e) { ({ chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright')); }

const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE = fs.readFileSync(path.join(here, '..', 'index.html'), 'utf8');
const MOCK = fs.readFileSync(path.join(here, 'mock-runtime.js'), 'utf8');
const JSPDF = process.argv[2] && fs.existsSync(process.argv[2]) ? fs.readFileSync(process.argv[2], 'utf8') : null;
const SHOTS = process.argv[3] || null;
const HTML = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>${PAGE}</body></html>`;

/* ---------- shared store with the same access rules the artifact declares ---------- */
const store = new Map();
function allowed(who, p, mode) {
  const seg = p.split('/');
  if (who.owner) return true;                                           // owner meets every level
  if (seg[0] === 'orders') return seg[1] === who.uid && who.level !== 'view'; // orders/{self}: interact
  if (seg[0] === 'admin') return false;                                 // admin/*: owner only
  return mode === 'read' ? true : who.level !== 'view';
}
function dbOp(who, op, p, data) {
  const denied = { error: { code: 'invalid_argument', message: 'write not permitted at ' + p } };
  if (op === 'get') return allowed(who, p, 'read') && store.has(p) ? { exists: true, data: store.get(p) } : { exists: false };
  if (op === 'list') {
    const depth = p.split('/').length + 1;
    const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.split('/').length === depth && allowed(who, k, 'read'))
      .sort().map(k => ({ id: k.split('/').pop(), data: store.get(k) }));
    return { docs };
  }
  if (!allowed(who, p, 'write')) return denied;
  if (op === 'set') { store.set(p, data); return { ok: true }; }
  if (op === 'update') { if (!store.has(p)) return denied; store.set(p, Object.assign({}, store.get(p), data)); return { ok: true }; }
  if (op === 'delete') { store.delete(p); return { ok: true }; }
  return denied;
}

/* ---------- harness ---------- */
const results = [];
function check(name, cond, detail) { results.push({ name, ok: !!cond, detail }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail && !cond ? '  -> ' + detail : '')); }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
async function openAs(who, opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }, opts));
  await ctx.exposeFunction('__db', (w, op, p, d) => dbOp(w, op, p, d));
  await ctx.addInitScript(`window.__WHO = ${JSON.stringify(who)};\n${MOCK}`);
  await ctx.route('https://fonts.googleapis.com/**', r => r.abort());
  await ctx.route('https://fonts.gstatic.com/**', r => r.abort());
  await ctx.route('https://cdnjs.cloudflare.com/**', r => JSPDF ? r.fulfill({ contentType: 'application/javascript', body: JSPDF }) : r.abort());
  await ctx.route('https://wedding.test/**', r => r.fulfill({ contentType: 'text/html', body: HTML }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://wedding.test/');
  await page.waitForTimeout(250);
  return { ctx, page, errors };
}
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); };
const tap = (page, sel) => page.locator(sel).first().click();
const barBtn = page => page.locator('#bar .btn-primary');

async function guestOrder(page, o) {
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

/* ---------- 1. Guest: Sarah ---------- */
const sarah = await openAs({ uid: 'u_sarah', owner: false, level: 'interact' });
{
  const p = sarah.page;
  check('Welcome screen shows title, subtitle and note', (await p.textContent('h1')).includes('Dressed & Fed')
    && (await p.textContent('.hero .sub')).includes("Please select your Jimmy John's order below.")
    && (await p.textContent('.hero .note')).includes('Your order will be sent to the host'));
  check('Guests see no host dashboard link', (await p.locator('[data-act="open-admin"]').count()) === 0);
  await shot(p, '01-welcome');
  await barBtn(p).click();
  check('Name is required', (await p.locator('#name-err').count()) === 1 && (await p.locator('.item').count()) === 0);
  await p.fill('#guest-name', 'Sarah Johnson');
  await barBtn(p).click();
  check('Sandwich step lists numbered menu', (await p.locator('.item').count()) === 26 && (await p.textContent('.item[data-id="bigjohn"]')).includes('#2'));
  check('Continue disabled until a sandwich is picked', await barBtn(p).isDisabled());
  await tap(p, '.item[data-id="bigjohn"]');
  check('Selected sandwich shows ingredients', (await p.textContent('.item[aria-checked="true"]')).includes('Roast beef, lettuce, tomato & mayo'));
  await shot(p, '02-sandwich');
  await barBtn(p).click();
  const ingRows = await p.locator('.ing-row .lbl').allTextContents();
  check('Customize shows only Big John ingredients', JSON.stringify(ingRows) === JSON.stringify(['Roast beef', 'Lettuce', 'Tomato', 'Mayo']), ingRows.join(','));
  check('Onion offered as an add, not a removal', (await p.locator('.seg [data-ing="onion"]').count()) === 0 && (await p.locator('.pill[data-ing="onion"]').count()) === 1);
  await tap(p, '.tile[data-id="french8"]');
  await tap(p, '.seg button[data-ing="tomato"][data-val="none"]');
  await tap(p, '.seg button[data-ing="mayo"][data-val="extra"]');
  await tap(p, '.pill[data-act="add"][data-ing="cucumber"]');
  await shot(p, '03-customize');
  await barBtn(p).click();
  await tap(p, '.pill[data-grp="chips"][data-val="regular"]');
  await tap(p, '.pill[data-grp="drink"][data-val="lemonade"]');
  await shot(p, '04-extras');
  await barBtn(p).click();
  const review = await p.textContent('.summary');
  check('Review shows full summary', ['Sarah Johnson', '#2 Big John®', 'French (8")', 'No tomatoes', 'Extra mayo', 'Add cucumbers', 'Regular Jimmy Chips®', 'Classic Lemonade'].every(s => review.includes(s)), review);
  check('Review shows "None" for empty special instructions', /Special Instructions\s*None/.test(review));
  await shot(p, '05-review');
  await barBtn(p).click();
  await p.waitForSelector('.done h2');
  check('Confirmation screen', (await p.textContent('.done h2')) === 'Order Submitted!' && (await p.textContent('.done p')).includes('Thank you, Sarah! Your Jimmy John\'s order has been recorded.'));
  await shot(p, '06-done');
  const doc = store.get('orders/u_sarah');
  check('Order saved to shared store', doc && Object.keys(doc.entries).length === 1 && Object.values(doc.entries)[0].item === 'Big John®');

  // Return later: sees existing order, edits it -> still one order
  await p.reload(); await p.waitForTimeout(500);
  check('Returning guest sees their submitted order', (await p.locator('.mine-row').count()) === 1);
  await tap(p, '[data-act="edit-mine"]');
  await p.waitForSelector('.summary');
  await tap(p, '[data-act="goto"][data-step="3"]');
  await p.fill('#notes', 'Please make sure there is no mayo on the bread itself.');
  await barBtn(p).click();
  check('Edit shows Update Order', (await barBtn(p).textContent()) === 'Update Order');
  await barBtn(p).click();
  await p.waitForSelector('.done h2');
  check('Edit re-submits without duplicating', Object.keys(store.get('orders/u_sarah').entries).length === 1 && Object.values(store.get('orders/u_sarah').entries)[0].rev === 2);

  // Accidental duplicate: same name again from the same account replaces, not duplicates
  await tap(p, '[data-act="new-order"]');
  await guestOrder(p, { name: '  sarah   johnson ', item: 'pepe' });
  check('Duplicate name warning on review', (await p.locator('.notice.info').first().textContent()).includes('already has an order'));
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  const e = Object.values(store.get('orders/u_sarah').entries);
  check('Same-name resubmission replaces the order', e.length === 1 && e[0].item === 'The Pepe®', JSON.stringify(e.map(x => x.item)));
  // Rapid double tap on Submit creates only one entry
  await tap(p, '[data-act="new-order"]');
  await guestOrder(p, { name: 'Tom Johnson', item: 'turkeytom', mods: [['mayo', 'none']] });
  await barBtn(p).dblclick();
  await p.waitForSelector('.done h2');
  check('Double-tap Submit saves once (Sarah + Tom on one phone)', Object.keys(store.get('orders/u_sarah').entries).length === 2);
  check('No page errors (Sarah)', !sarah.errors.length, sarah.errors.join(' | '));
}

/* ---------- 2. Guest: Mike ---------- */
const mike = await openAs({ uid: 'u_mike', owner: false, level: 'interact' });
{
  const p = mike.page;
  await guestOrder(p, { name: 'Mike Smith', item: 'turkeytom', bread: 'wheat', mods: [['mayo', 'none']], extras: [['dessert', 'chocchip']] });
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  check('Second guest saved separately (no overwrite)', store.has('orders/u_mike') && Object.keys(store.get('orders/u_sarah').entries).length === 2);
  const seen = await p.evaluate(async () => { const db = await window.claude.use('db'); const s = await db.collection('orders').get(); return s.docs.map(d => d.id); });
  check('A guest cannot read other guests\' orders', JSON.stringify(seen) === '["u_mike"]', JSON.stringify(seen));
  const tamper = await p.evaluate(async () => { const db = await window.claude.use('db'); try { await db.doc('orders/u_sarah').set({ entries: {} }); return 'wrote'; } catch (e) { return e.code; } });
  check('A guest cannot change another guest\'s order', tamper === 'invalid_argument' && Object.keys(store.get('orders/u_sarah').entries).length === 2);
  const statusTamper = await p.evaluate(async () => { const db = await window.claude.use('db'); try { await db.doc('admin/status').set({ s: {} }); return 'wrote'; } catch (e) { return e.code; } });
  check('A guest cannot change order statuses', statusTamper === 'invalid_argument');
  check('No page errors (Mike)', !mike.errors.length, mike.errors.join(' | '));
}

/* ---------- 3. Viewer-only account (can't write) ---------- */
let veraClip = '';
const viewer = await openAs({ uid: 'u_view', owner: false, level: 'view' });
{
  const p = viewer.page;
  await p.waitForTimeout(300);
  check('Read-only account is warned up front', (await p.locator('.notice.warn').count()) === 1);
  await guestOrder(p, { name: 'Vera Viewer', item: 'veggie', mods: [['tomato', 'none']] });
  check('Read-only account gets Copy my order instead of Submit', (await barBtn(p).textContent()) === 'Copy my order');
  await barBtn(p).click();
  const clip = await p.evaluate(() => window.__clip.join('\n'));
  veraClip = clip;
  check('Copied order includes an order code for the host', /DF1\.[A-Za-z0-9_-]+/.test(clip));
  check('Copy my order produces a textable summary', clip.includes('Vera Viewer') && clip.includes('#6 The Veggie') && clip.includes('No tomatoes'), clip);
  check('Nothing written for read-only account', !store.has('orders/u_view'));
}

/* ---------- 4. Host dashboard ---------- */
const host = await openAs({ uid: 'u_host', owner: true, level: 'admin' }, { viewport: { width: 1360, height: 900 }, deviceScaleFactor: 1 });
{
  const p = host.page;
  await p.waitForTimeout(300);
  check('Host sees dashboard button on first screen', await p.isVisible('.host-card [data-act="open-admin"]'));
  await tap(p, '[data-act="open-admin"]');
  await p.waitForSelector('#total-orders');
  await p.waitForTimeout(400);
  check('Paste box is at the top of the dashboard', await p.evaluate(() => { const r = document.querySelector('#paste-text').getBoundingClientRect(); return r.top > 0 && r.bottom < window.innerHeight; }));
  check('Dashboard total = 3', (await p.textContent('#total-orders')) === '3', await p.textContent('#total-orders'));
  const rowsText = await p.locator('table.orders tbody tr').allTextContents();
  const mikeRow = rowsText.find(t => t.includes('Mike Smith')) || '';
  check('Row shows Mike correctly', ['#4', 'Turkey Tom®', 'Sliced Wheat', 'No mayo', 'Chocolate Chip Cookie', 'None', 'Submitted'].every(s => mikeRow.includes(s)), mikeRow);
  const headers = await p.locator('table.orders th').allTextContents();
  check('Table has required columns', ['Guest Name', 'Sandwich #', 'Sandwich Name', 'Bread', 'Customizations', 'Extras', 'Special Instructions', 'Submitted', 'Status'].every(h => headers.some(x => x.includes(h))));
  const sum = await p.textContent('#sandwich-summary');
  check('Sandwich summary counts', /#1The Pepe®\s*1/.test(sum) && /#4Turkey Tom®\s*2/.test(sum), sum);
  check('Customization summary counts', /No mayo\s*2/.test(await p.textContent('#mod-summary')));

  // live update: a new guest submits while the dashboard is open
  const lia = await openAs({ uid: 'u_lia', owner: false, level: 'interact' });
  await guestOrder(lia.page, { name: 'Lia Chen', item: 'bigjohn', bread: 'unwich', mods: [['tomato', 'none']], extras: [['chips', 'bbq']] });
  await barBtn(lia.page).click(); await lia.page.waitForSelector('.done h2');
  await p.waitForFunction(() => document.querySelector('#total-orders')?.textContent === '4', null, { timeout: 4000 }).catch(() => {});
  check('Dashboard updates live when a guest submits', (await p.textContent('#total-orders')) === '4');
  check('Live summary picks up new sandwich', /#2Big John®\s*1/.test(await p.textContent('#sandwich-summary')));
  await shot(p, '10-dashboard-desktop');

  // search / filter / sort
  await p.fill('#admin-search', 'mik');
  let names = await p.locator('table.orders tbody .guest').allTextContents();
  check('Search by guest name', JSON.stringify(names) === '["Mike Smith"]', JSON.stringify(names));
  check('Search box keeps focus while typing', await p.evaluate(() => document.activeElement.id === 'admin-search'));
  await p.fill('#admin-search', '');
  await p.selectOption('#admin-filter', 'turkeytom');
  names = await p.locator('table.orders tbody .guest').allTextContents();
  check('Filter by sandwich', JSON.stringify(names) === '["Mike Smith","Tom Johnson"]', JSON.stringify(names));
  await p.selectOption('#admin-filter', 'all');
  await p.selectOption('#admin-sort', 'name-desc');
  names = await p.locator('table.orders tbody .guest').allTextContents();
  check('Sort by guest name (Z–A)', JSON.stringify(names) === '["Tom Johnson","Sarah Johnson","Mike Smith","Lia Chen"]', JSON.stringify(names));
  await p.selectOption('#admin-sort', 'name-asc');

  // status
  const sarahRow = p.locator('table.orders tbody tr', { hasText: 'Sarah Johnson' });
  await sarahRow.locator('[data-val="Reviewed"]').click();
  await p.waitForTimeout(300);
  const mikeRowL = p.locator('table.orders tbody tr', { hasText: 'Mike Smith' });
  await mikeRowL.locator('[data-val="Ordered"]').click();
  await p.waitForTimeout(400);
  const st = store.get('admin/status');
  check('Status saved', st && Object.values(st.s).map(x => x.status).sort().join(',') === 'Ordered,Reviewed', JSON.stringify(st));
  await p.reload(); await p.waitForTimeout(300); await tap(p, '[data-act="open-admin"]'); await p.waitForTimeout(500);
  check('Status persists after reload', (await p.locator('table.orders tbody tr', { hasText: 'Sarah Johnson' }).locator('[aria-checked="true"]').textContent()) === 'Reviewed');

  // guest edits after review -> flagged
  await tap(sarah.page, '[data-act="new-order"]');
  await sarah.page.reload(); await sarah.page.waitForTimeout(400);
  const sarahEditBtn = sarah.page.locator('.mine-row', { hasText: 'Sarah Johnson' }).locator('[data-act="edit-mine"]');
  await sarahEditBtn.click();
  await sarah.page.waitForSelector('.summary');
  await tap(sarah.page, '[data-act="goto"][data-step="3"]');
  await tap(sarah.page, '.pill[data-grp="dessert"][data-val="oatmeal"]');
  await barBtn(sarah.page).click(); await barBtn(sarah.page).click(); await sarah.page.waitForSelector('.done h2');
  await p.waitForTimeout(500);
  check('Edits after review are flagged for the host', (await p.locator('table.orders tbody tr', { hasText: 'Sarah Johnson' }).textContent()).includes('Changed after reviewed'));

  // copy / export
  await tap(p, '[data-act="copy-all"]');
  const clip = await p.evaluate(() => window.__clip.at(-1));
  check('Copy All Orders text', clip.includes('Total orders: 4') && clip.includes('#4 Turkey Tom®: 2') && clip.includes('Mike Smith: Sliced Wheat; No mayo'), clip);
  await tap(p, '[data-act="export-csv"]');
  await p.waitForTimeout(200);
  const csv = await p.evaluate(() => window.__saved.find(s => s.filename.endsWith('.csv')));
  check('Export CSV', csv && csv.text.includes('"Guest Name","Sandwich #","Sandwich Name"') && csv.text.includes('"Mike Smith","#4","Turkey Tom®","Sliced Wheat","No mayo","Chocolate Chip Cookie","None"'), csv && csv.text.slice(0, 400));
  if (JSPDF) {
    await tap(p, '[data-act="export-pdf"]');
    await p.waitForFunction(() => window.__saved.some(s => s.filename.endsWith('.pdf')), null, { timeout: 8000 }).catch(() => {});
    const pdf = await p.evaluate(() => window.__saved.find(s => s.filename.endsWith('.pdf')));
    check('Printable PDF generated', pdf && pdf.head.startsWith('%PDF') && pdf.size > 2000, JSON.stringify(pdf));
  }

  // host enters an order for someone without a phone, then removes it
  await tap(p, '[data-act="host-add"]');
  await guestOrder(p, { name: 'Grandma Rose', item: 'veggie', extras: [['pickle', 'whole']] });
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  await tap(p, '[data-act="back-admin"]'); await p.waitForTimeout(400);
  check('Host-entered order appears', (await p.textContent('#total-orders')) === '5');
  await p.locator('table.orders tbody tr', { hasText: 'Grandma Rose' }).locator('[data-act="admin-del"]').click();
  await tap(p, '[data-act="modal-ok"]');
  await p.waitForTimeout(500);
  check('Host can remove an order', (await p.textContent('#total-orders')) === '4');
  // paste an order a guest texted (with order code)
  async function pasteOrder(text) {
    await p.fill('#paste-text', text);
    await tap(p, '[data-act="paste-fill"]');
  }
  await pasteOrder('Hey! here is mine:\n' + veraClip);
  await p.waitForSelector('.summary');
  let rv = await p.textContent('.summary');
  check('Pasted order (with code) fills in the review', ['Vera Viewer', '#6 The Veggie', 'No tomatoes'].every(x => rv.includes(x)), rv);
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  await tap(p, '[data-act="back-admin"]'); await p.waitForTimeout(400);
  check('Pasted order saved to dashboard', (await p.textContent('#total-orders')) === '5');

  // hand-typed text without a code
  await pasteOrder("Name: jo lee\nSandwich: #9 Italian Night Club\nBread: Sliced Wheat\nCustomizations: No onions, Add Jimmy Peppers, extra pickles please\nExtras: BBQ Jimmy Chips, Diet Coke\nSpecial Instructions: Cut in half");
  await p.waitForSelector('.summary');
  rv = await p.textContent('.summary');
  check('Hand-typed order is matched to the menu', ['jo lee', '#9 Italian Night Club®', 'Sliced Wheat', 'No onions', 'Add Jimmy Peppers®', 'BBQ Jimmy Chips®', 'Diet Coke®', 'Cut in half'].every(x => rv.includes(x)), rv);
  check('Unmatched requests are flagged and kept', (await p.textContent('.notice.warn')).includes('extra pickles please') && rv.includes('Also asked for: extra pickles please'));
  await barBtn(p).click(); await p.waitForSelector('.done h2');
  await tap(p, '[data-act="back-admin"]'); await p.waitForTimeout(400);
  check('Hand-typed order saved (name tidied)', (await p.textContent('#total-orders')) === '6' && (await p.locator('table.orders tbody .guest', { hasText: 'Jo Lee' }).count()) === 1);

  // text with no recognizable sandwich
  await pasteOrder('can I get whatever is good');
  check('Unrecognized paste shows an error and stays on dashboard', (await p.isVisible('#paste-err')) && (await p.locator('#total-orders').count()) === 1);
  check('No page errors (host)', !host.errors.length, host.errors.join(' | '));

  // mobile + dark dashboard screenshots
  const hostM = await openAs({ uid: 'u_host', owner: true, level: 'admin' }, { colorScheme: 'dark' });
  await tap(hostM.page, '[data-act="open-admin"]'); await hostM.page.waitForTimeout(500);
  check('Mobile dashboard uses cards', (await hostM.page.locator('.ocard').count()) === 6 && !(await hostM.page.locator('.table-wrap').isVisible()));
  const overflow = await hostM.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('No horizontal page scroll on phone', !overflow);
  await shot(hostM.page, '11-dashboard-mobile-dark');
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
