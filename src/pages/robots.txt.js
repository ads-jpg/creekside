import site from '../lib/config.js';

/*
  Paid landing pages are normally kept out of search so they do not compete with the
  client's own website. Flip seo.noindex in site.config.json to change this.
*/
export function GET() {
  const body = site.seo.noindex
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : [
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: https://${site.client.domain}/sitemap.xml`,
        '',
      ].join('\n');

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
