import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { URL } from 'url';

// Usage: ts-node scripts/create-from-json.ts [path-to-json]
// Defaults to unread_articles.json in current working directory

const DEFAULT_JSON = path.resolve(process.cwd(), 'unread_articles.json');
const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

function postJson(
  urlStr: string,
  body: any,
): Promise<{ statusCode: number; bodyText: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = JSON.stringify(body);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options: any = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port ? Number(url.port) : isHttps ? 443 : 80,
      path: url.pathname + (url.search || ''),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
      },
    };

    const req = lib.request(options, (res: any) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => (raw += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 0, bodyText: raw });
      });
    });

    req.on('error', (err: Error) => reject(err));
    req.write(data);
    req.end();
  });
}

async function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_JSON;
  if (!fs.existsSync(inputPath)) {
    console.error('JSON file not found:', inputPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Invalid JSON:', err);
    process.exit(1);
  }

  // Expecting an array of articles similar to unread_articles.json
  if (!Array.isArray(data)) {
    console.error('Expected JSON array at root');
    process.exit(1);
  }

  // Sort oldest first by created_at / published_at if available
  data.sort((a: any, b: any) => {
    const aDate = new Date(a.created_at || a.published_at || a.publishedAt || a.updated_at || 0).getTime();
    const bDate = new Date(b.created_at || b.published_at || b.publishedAt || b.updated_at || 0).getTime();
    return aDate - bDate;
  });

  console.log(`Total resources to import: ${data.length}`);

  let processed = 0;
  for (const item of data) {
    const remaining = data.length - processed;
    console.log(`Remaining to import: ${remaining}`);

    try {
      const urlValue = item.url || item.given_url || item.givenUrl;
      if (!urlValue) {
        console.warn('Skipping item without url:', item);
        processed += 1;
        continue;
      }

      const target = `${API_BASE}/v1/resources`;
      const res = await postJson(target, { url: urlValue });
      console.log(`[POST] ${urlValue} -> ${res.statusCode}`);
      if (res.bodyText) console.log('  response:', res.bodyText);
    } catch (err: any) {
      console.error('Failed to create resource:', err.message || err);
    }

    processed += 1;
  }
}


main().catch((e) => {
  console.error(e);
  process.exit(1);
});
