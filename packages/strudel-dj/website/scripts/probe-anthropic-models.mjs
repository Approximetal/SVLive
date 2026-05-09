/**
 * 读取 public/anthropic.provider.json，对列出的 model 各发一条最小 Messages 请求，
 * 用于探测当前令牌分组下哪些模型返回 200（不依赖浏览器）。
 *
 *   node scripts/probe-anthropic-models.mjs
 *   node scripts/probe-anthropic-models.mjs -- claude-sonnet-4-6 claude-opus-4-6
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfgPath = path.join(__dirname, '../public/anthropic.provider.json');

const DEFAULT_MODELS = [
  'claude-sonnet-4-5',
  'claude-sonnet-4-6',
  'claude-sonnet-4-6-thinking',
  'claude-sonnet-4-5-20250929',
  'claude-sonnet-4-5-20250929-thinking',
  'claude-sonnet-4-20250514',
  'claude-opus-4-7',
  'claude-opus-4-7-thinking',
  'claude-opus-4-7-low',
  'claude-opus-4-6',
  'claude-opus-4-6-thinking',
  'claude-opus-4-5-20251101',
  'claude-opus-4-5-20251101-thinking',
  'claude-opus-4-1-20250805',
  'claude-opus-4-20250514',
  'claude-haiku-4-5-20251001',
  'claude-haiku-4-5-20251001-thinking',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
];

function loadConfig() {
  if (!fs.existsSync(cfgPath)) {
    console.error('缺少文件:', cfgPath);
    console.error('请先复制 anthropic.provider.example.json 为 anthropic.provider.json 并填写。');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

async function probeOne(baseURL, token, model, useXApiKey) {
  const url = `${baseURL.replace(/\/$/, '')}/v1/messages`;
  const headers = {
    'content-type': 'application/json',
    'anthropic-version': '2023-06-01',
  };
  if (useXApiKey) headers['x-api-key'] = token;
  else headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 16,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    }),
  });
  const text = await res.text();
  let detail = '';
  try {
    const j = JSON.parse(text);
    detail = j.error?.message || j.error?.code || j.error?.type || (res.ok ? 'ok' : text.slice(0, 100));
  } catch {
    detail = text.slice(0, 100);
  }
  return {
    model,
    status: res.status,
    detail: String(detail).replace(/\s+/g, ' ').slice(0, 160),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function modelsFromArgv() {
  const dash = process.argv.indexOf('--');
  if (dash === -1 || process.argv.length <= dash + 1) return DEFAULT_MODELS;
  return process.argv.slice(dash + 1).map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const MODELS = modelsFromArgv();
  if (MODELS.length === 0) {
    console.error('在 -- 后至少传入一个 model id');
    process.exit(1);
  }

  const cfg = loadConfig();
  const baseURL = String(cfg.baseURL || '').trim();
  const token = String(cfg.authToken || cfg.apiKey || '').trim();
  if (!baseURL || !token) {
    console.error('anthropic.provider.json 需要 baseURL 与 authToken（或 apiKey）');
    process.exit(1);
  }

  // 先试一个模型，决定用 Bearer 还是 x-api-key
  const testModel = MODELS[0];
  let useXApiKey = false;
  let t1 = await probeOne(baseURL, token, testModel, false);
  if (t1.status === 401 || t1.status === 403) {
    const t2 = await probeOne(baseURL, token, testModel, true);
    if (t2.status === 200 || (t2.status !== 401 && t2.status !== 403)) {
      useXApiKey = true;
      console.log('鉴权: 使用 x-api-key（Bearer 被拒绝）\n');
    } else {
      console.log('鉴权: Bearer\n');
    }
  } else {
    console.log('鉴权: Authorization Bearer\n');
  }

  console.log('status\tmodel');
  console.log('------\t-----');

  const results = [];
  for (const model of MODELS) {
    const r = await probeOne(baseURL, token, model, useXApiKey);
    results.push(r);
    const mark = r.status === 200 ? '200' : String(r.status);
    console.log(`${mark}\t${model}`);
    if (r.status !== 200) console.log(`\t  ${r.detail}`);
    await sleep(350);
  }

  const ok = results.filter((x) => x.status === 200).map((x) => x.model);
  console.log('\n=== HTTP 200 的模型 (' + ok.length + ' / ' + MODELS.length + ') ===');
  if (ok.length === 0) console.log('（无）请检查令牌分组或模型广场。');
  else ok.forEach((m) => console.log(m));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
