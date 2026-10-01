// Netlify Function serving /api/* for the Dressed & Fed page.
// Orders live in a Netlify Blobs store. Set HOST_PASSCODE in
// Site configuration → Environment variables to unlock the host dashboard.
import { getStore } from '@netlify/blobs';
import { createApi } from '../../lib/api-core.mjs';

const api = createApi({
  store: () => getStore({ name: 'dressed-and-fed-orders', consistency: 'strong' }),
  passcode: () => (globalThis.Netlify?.env?.get('HOST_PASSCODE') ?? process.env.HOST_PASSCODE ?? '').trim()
});

export default req => api(req);

export const config = { path: '/api/*' };
