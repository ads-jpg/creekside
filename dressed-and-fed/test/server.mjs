// Local stand-in for Netlify: serves public/ and runs the same API code against
// Netlify Blobs' own local server. Usage: HOST_PASSCODE=secret node test/server.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { getStore } from '@netlify/blobs';
import { BlobsServer } from '@netlify/blobs/server';
import { createApi } from '../lib/api-core.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function startServer({ port = 0, passcode = process.env.HOST_PASSCODE || '' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dnf-blobs-'));
  const blobs = new BlobsServer({ directory: dir, token: 'local-token' });
  const { port: blobsPort } = await blobs.start();
  const edge = `http://localhost:${blobsPort}`;
  const api = createApi({
    store: () => getStore({ name: 'dressed-and-fed-orders', siteID: 'local-site', token: 'local-token', edgeURL: edge, uncachedEdgeURL: edge, consistency: 'strong' }),
    passcode: () => passcode
  });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const response = await api(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const full = path.join(root, 'public', path.normalize(file).replace(/^(\.\.[/\\])+/, ''));
    if (!full.startsWith(path.join(root, 'public')) || !fs.existsSync(full)) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'content-type': full.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    fs.createReadStream(full).pipe(res);
  });
  await new Promise(r => server.listen(port, r));
  return {
    url: `http://localhost:${server.address().port}`,
    async stop() { server.close(); await blobs.stop(); fs.rmSync(dir, { recursive: true, force: true }); }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const s = await startServer({ port: Number(process.argv[2]) || 8888 });
  console.log(`Dressed & Fed running at ${s.url}  (host passcode: ${process.env.HOST_PASSCODE ? 'set' : 'NOT SET'})`);
}
