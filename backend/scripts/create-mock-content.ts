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
const MOCK_RESOURCES: Array<{
  type: string;
  name: string;
  source: { name: string; url: string };
}> = [
  {
    type: 'text',
    name: 'example-article',
    source: { name: 'yagni', url: 'https://martinfowler.com/bliki/Yagni.html' },
  },
  {
    type: 'text',
    name: 'example-article-2',
    source: { name: 'example', url: 'https://example.com/article' },
  },
  {
    type: 'document',
    name: 'sample-pdf',
    source: {
      name: 'dummy-pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  },
  {
    type: 'text',
    name: 'mock-resource-dynamic-1',
    source: { name: 'mock-source-1', url: 'https://example.com/resource/1' },
  },
  {
    type: 'document',
    name: 'mock-resource-dynamic-2',
    source: { name: 'mock-source-2', url: 'https://example.com/resource/2' },
  },
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
      console.log(`[POST] ${payload.name} -> ${res.statusCode}`);
      if (res.bodyText) {
        console.log('  response:', res.bodyText);
      }
    } catch (err: any) {
      console.error(
        `[ERROR] creating ${payload.name}:`,
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
