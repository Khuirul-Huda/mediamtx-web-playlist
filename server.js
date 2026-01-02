import path from 'path';
import fs from 'fs';

const root = process.cwd();
const port = Number(process.env.PORT || 8123);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

Bun.serve({
  port,
  async fetch(req) {
    try {
      const url = new URL(req.url);
      let pathname = decodeURIComponent(url.pathname || '/');

      // Default to index.html for root
      if (pathname === '/') pathname = '/index.html';

      // Resolve and prevent path traversal
      const fsPath = path.join(root, pathname);
      const resolved = path.resolve(fsPath);
      if (!resolved.startsWith(root)) {
        return new Response('Forbidden', { status: 403 });
      }

      // If directory, try index.html
      if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        const indexPath = path.join(resolved, 'index.html');
        if (fs.existsSync(indexPath)) {
          const headers = {
            'Content-Type': contentType(indexPath),
            'Access-Control-Allow-Origin': '*'
          };
          return new Response(Bun.file(indexPath), { status: 200, headers });
        }
        return new Response('Directory access is forbidden', { status: 403 });
      }

      if (!fs.existsSync(resolved)) {
        return new Response('Not Found', { status: 404 });
      }

      const headers = {
        'Content-Type': contentType(resolved),
        // Allow cross-origin requests (useful during testing). Remove or restrict in production if needed.
        'Access-Control-Allow-Origin': '*'
      };

      return new Response(Bun.file(resolved), { status: 200, headers });
    } catch (err) {
      console.error('Server error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
});

console.log(`Serving ${root} at http://localhost:${port}`);
