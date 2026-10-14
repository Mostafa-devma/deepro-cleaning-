// DeepPro admin API (Vercel serverless function at /api/admin).
// Saves admin edits as one commit to the GitHub repo; Vercel then redeploys the site.
// Required Vercel environment variables:
//   ADMIN_PASSWORD  the password typed on /admin
//   GITHUB_TOKEN    fine-grained token with "Contents: Read and write" on the repo
// Optional: GITHUB_REPO (default Mostafa-devma/deepro-cleaning-), GITHUB_BRANCH (default main)
const crypto = require('crypto');

const REPO = process.env.GITHUB_REPO || 'Mostafa-devma/deepro-cleaning-';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const SAFE_PATH = /^(js\/catalog-data\.js|catalog-data\.json|catalog-[a-z0-9-]+\.html|assets\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif|avif))$/;

function sameSecret(a, b) {
  const h = s => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'deeppro-admin',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`GitHub ${res.status}: ${data.message || res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return res.status(500).json({ code: 'not_configured', error: 'ADMIN_PASSWORD and GITHUB_TOKEN must be set in Vercel' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  // ignore stray spaces around the password (easy to add when copying it into Vercel or the form)
  const typed = String(body.password || '').trim();
  if (!typed || !sameSecret(typed, process.env.ADMIN_PASSWORD.trim())) {
    await new Promise(r => setTimeout(r, 800)); // slow down guessing
    return res.status(401).json({ code: 'bad_password', error: 'Wrong password' });
  }

  try {
    switch (body.action) {
      case 'check':
        return res.json({ ok: true });

      // latest catalog + image list straight from GitHub (newer than the deployed copy right after a save)
      case 'load': {
        const file = await gh(`/contents/js/catalog-data.js?ref=${BRANCH}`);
        const text = Buffer.from(file.content, 'base64').toString('utf8');
        let assets = [];
        try {
          const list = await gh(`/contents/assets?ref=${BRANCH}`);
          assets = list.filter(f => f.type === 'file').map(f => 'assets/' + f.name);
        } catch (e) { /* no assets folder yet */ }
        return res.json({ text, assets });
      }

      // one image per call keeps each request under Vercel's 4.5 MB body limit
      case 'blob': {
        if (typeof body.base64 !== 'string' || !body.base64) return res.status(400).json({ error: 'base64 missing' });
        const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: body.base64, encoding: 'base64' }) });
        return res.json({ sha: blob.sha });
      }

      // files: [{path, content}] text files, or [{path, sha}] uploaded blobs; deletes: [path]
      case 'commit': {
        const files = Array.isArray(body.files) ? body.files : [];
        const deletes = Array.isArray(body.deletes) ? body.deletes : [];
        for (const f of files) if (!SAFE_PATH.test(f.path)) return res.status(400).json({ error: 'Not allowed: ' + f.path });
        for (const p of deletes) if (!/^catalog-[a-z0-9-]+\.html$/.test(p)) return res.status(400).json({ error: 'Not allowed: ' + p });

        const ref = await gh(`/git/ref/heads/${BRANCH}`);
        const parent = await gh(`/git/commits/${ref.object.sha}`);
        const existing = new Set((await gh(`/git/trees/${parent.tree.sha}?recursive=1`)).tree.map(t => t.path));
        const tree = [
          ...files.map(f => f.sha
            ? { path: f.path, mode: '100644', type: 'blob', sha: f.sha }
            : { path: f.path, mode: '100644', type: 'blob', content: String(f.content) }),
          ...deletes.filter(p => existing.has(p)).map(p => ({ path: p, mode: '100644', type: 'blob', sha: null })),
        ];
        if (!tree.length) return res.json({ ok: true, unchanged: true });
        const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree }) });
        const commit = await gh('/git/commits', {
          method: 'POST',
          body: JSON.stringify({ message: String(body.message || 'Update catalog from admin').slice(0, 200), tree: newTree.sha, parents: [ref.object.sha] }),
        });
        await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
        return res.json({ ok: true, commit: commit.sha });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    const code = err.status === 401 || err.status === 403 ? 'github_auth' : err.status === 404 ? 'github_repo' : 'github_error';
    return res.status(502).json({ code, error: err.message });
  }
};
