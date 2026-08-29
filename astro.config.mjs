import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync(new URL('./site.config.json', import.meta.url), 'utf8'));

export default defineConfig({
  site: `https://${site.client.domain}`,
  output: 'static',
  compressHTML: true,
  // One request for the CSS beats a round trip on a landing page. The stylesheet
  // is small enough that inlining it wins every time.
  // `format: 'file'` emits /thanks.html instead of /thanks/index.html, which Cloudflare
  // serves at /thanks directly — no redirect hop on the way to the thank-you page.
  build: { inlineStylesheets: 'always', format: 'file' },
  trailingSlash: 'never',
  vite: { plugins: [tailwindcss()] },
});
