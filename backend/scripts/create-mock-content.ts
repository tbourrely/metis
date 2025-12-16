/*
  Self-contained script to create mock resources by calling POST /v1/resources on the API.
  Usage (from repo root):
    node -r ts-node/register scripts/create-mock-content.ts
  Environment variables:
    BASE_URL - base url of the API (default: http://localhost:3000)
    COUNT    - number of resources to create (default: 5)
*/

import http from 'http';
import https from 'https';
import { URL } from 'url';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const COUNT = Number(process.env.COUNT || 5);

// Using MOCK_RESOURCES array below.

// Edit this array to provide concrete/mock resources to post to the API.
// Each entry must match the RequestDTO shape: { type, name, source: { name, url } }
const MOCK_RESOURCES: Array<{ url: string }> = [
  {
    url: 'https://martinfowler.com/bliki/Yagni.html',
  },
  {
    url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf',
  },
  {
    url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf',
  },
  {
    url: 'https://rfd.shared.oxide.computer/rfd/0576?utm_source=substack&utm_medium=email',
  },
  {
    url: 'https://obie.medium.com/what-happens-when-the-coding-becomes-the-least-interesting-part-of-the-work-ab10c213c660',
  },
  { url: 'https://livebook.manning.com/book/secure-by-design/chapter-9' },
];

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
  const target = new URL('/v1/resources', BASE_URL).toString();
  console.log(`Creating ${COUNT} mock resources against ${target}`);

  const resourcesToCreate = MOCK_RESOURCES.slice(0, COUNT);

  for (let i = 0; i < resourcesToCreate.length; i++) {
    const payload = resourcesToCreate[i];

    try {
      const res = await postJson(target, payload);
      console.log(`[POST] ${payload.url} -> ${res.statusCode}`);
      if (res.bodyText) {
        console.log('  response:', res.bodyText);
      }
    } catch (err: any) {
      console.error(
        `[ERROR] creating ${payload.url}:`,
        err && err.message ? err.message : err,
      );
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
