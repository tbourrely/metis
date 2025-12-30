#!/usr/bin/env node
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Usage: node scripts/force-refresh-content.js
// Environment:
//  API_BASE - base url (default http://localhost:3000)
//  AUTH_TOKEN - bearer token if needed

const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const PER_PAGE = 50;

function getJson(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options = {
      method: 'GET',
      hostname: url.hostname,
      port: url.port ? Number(url.port) : isHttps ? 443 : 80,
      path: url.pathname + (url.search || ''),
      headers: {
        'Accept': 'application/json',
        ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
      },
    };

    const req = lib.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : null;
          resolve({ statusCode: res.statusCode || 0, body: parsed });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

function postJson(urlStr, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = body ? JSON.stringify(body) : '';
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const options = {
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

    const req = lib.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 0, bodyText: raw });
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('API_BASE=', API_BASE);
  let page = 1;
  let totalPages = 1;
  let processed = 0;
  try {
    do {
      const url = `${API_BASE}/v1/resources?page=${page}&perPage=${PER_PAGE}`;
      console.log('Fetching page', page, '->', url);
      const res = await getJson(url);
      if (res.statusCode < 200 || res.statusCode >= 300) {
        console.error('Failed to fetch resources page', page, res.statusCode);
        process.exit(1);
      }
      const body = res.body;
      if (!body || !Array.isArray(body.items)) {
        console.error('Unexpected response for resources:', body);
        process.exit(1);
      }

      totalPages = body.meta?.totalPages || 1;
      console.log(`Page ${page}/${totalPages} - items: ${body.items.length}`);

      for (const item of body.items) {
        const id = item.id || item._id || item.id;
        if (!id) {
          console.warn('Skipping item without id', item);
          continue;
        }
        processed += 1;
        const target = `${API_BASE}/v1/resources/${id}/refresh-content`;
        try {
          const r = await postJson(target, {});
          console.log(`[${processed}] POST ${target} -> ${r.statusCode}`);
        } catch (err) {
          console.error(`[${processed}] Failed to POST refresh for ${id}:`, err.message || err);
        }
      }

      page += 1;
    } while (page <= totalPages);

    console.log('Done. Processed', processed, 'resources.');
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  }
}

run();
