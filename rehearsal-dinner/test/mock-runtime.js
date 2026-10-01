// Test double for the claude.ai artifact runtime (window.claude.use) used by e2e.mjs.
// The page talks to it exactly like the real `db`, `user` and `downloads` capabilities.
// All storage lives in the Node test process (window.__db), so several browser
// contexts ("phones") share one store, like guests sharing one artifact.
(function () {
  const who = window.__WHO; // { uid, owner, level: 'view' | 'interact' | 'admin' }
  const call = (op, path, data) => window.__db(who, op, path, data === undefined ? null : JSON.parse(JSON.stringify(data)));
  const err = e => { const x = new Error(e.message); x.code = e.code; return x; };
  const wrap = async (op, path, data) => { const r = await call(op, path, data); if (r && r.error) throw err(r.error); return r; };
  const snapDoc = (path, r) => ({ id: path.split('/').pop(), exists: !!r.exists, data: () => r.data || undefined, metadata: { fromCache: false, hasPendingWrites: false } });

  function poll(fetcher, next) {
    let last = null, alive = true;
    const tick = async () => {
      if (!alive) return;
      try {
        const r = await fetcher();
        const key = JSON.stringify(r);
        if (key !== last) { last = key; next(r); }
      } catch (e) { /* ignore */ }
      if (alive) setTimeout(tick, 150);
    };
    tick();
    return () => { alive = false; };
  }

  function docRef(path) {
    return {
      id: path.split('/').pop(), path,
      get: async () => snapDoc(path, await wrap('get', path)),
      set: async d => { await wrap('set', path, d); },
      update: async d => { await wrap('update', path, d); },
      delete: async () => { await wrap('delete', path); },
      onSnapshot: (next) => poll(() => wrap('get', path), r => next(snapDoc(path, r))),
      collection: sub => colRef(path + '/' + sub)
    };
  }
  function colRef(path) {
    const toSnap = r => { const docs = r.docs.map(d => snapDoc(path + '/' + d.id, { exists: true, data: d.data })); return { docs, size: docs.length, empty: !docs.length, docChanges: () => [], metadata: {} }; };
    return {
      path,
      doc: id => docRef(path + '/' + (id || Math.random().toString(36).slice(2))),
      add: async d => { const ref = docRef(path + '/' + Math.random().toString(36).slice(2)); await ref.set(d); return ref; },
      get: async () => toSnap(await wrap('list', path)),
      onSnapshot: (next) => poll(() => wrap('list', path), r => next(toSnap(r)))
    };
  }
  const db = Object.freeze({ doc: docRef, collection: colRef });
  const user = Object.freeze({
    id: async () => who.uid,
    isOwner: async () => !!who.owner,
    canEdit: async () => !!who.owner || who.level === 'admin',
    can: async name => name === 'data.write' ? (who.owner || who.level !== 'view') : false,
    me: async () => ({ id: who.uid, name: '', email: null, isOwner: !!who.owner, canEdit: !!who.owner })
  });
  window.__saved = [];
  const downloads = Object.freeze({
    save: async ({ filename, data }) => {
      let text;
      if (data instanceof Blob) { const buf = await data.arrayBuffer(); text = new TextDecoder('latin1').decode(buf); }
      else text = String(data);
      window.__saved.push({ filename, size: text.length, head: text.slice(0, 8), text: filename.endsWith('.csv') ? text : '' });
      return { status: 'saved' };
    }
  });
  window.__clip = [];
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__clip.push(t); } }, configurable: true });
  const caps = { db, user, downloads };
  window.claude = Object.freeze({ use: name => new Promise(res => setTimeout(() => res(caps[name] || null), 40)) });
})();
