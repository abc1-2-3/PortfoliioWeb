/**
 * SIGNAL 訪客計數器 — Cloudflare Worker
 *
 * 部署步驟：
 *  1. 安裝 Wrangler：npm install -g wrangler
 *  2. 登入：wrangler login
 *  3. 建立 KV namespace：wrangler kv:namespace create SIGNAL_KV
 *     → 把輸出的 id 填入下方 wrangler.toml
 *  4. 部署：wrangler deploy
 *  5. 把 workers.dev 網址填入 signal.html 的 WORKER_URL
 *
 * Rate limit：同一 IP 24h 只計一次（KV TTL = 86400s）
 * CORS：目前允許所有 origin，上線後可改成你的網域
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipKey = `ip_${ip}`;

    if (request.method === 'GET') {
      const count = parseInt(await env.SIGNAL_KV.get('total_visits') || '0');
      return new Response(JSON.stringify({ count }), { headers: CORS });
    }

    if (request.method === 'POST') {
      const already = await env.SIGNAL_KV.get(ipKey);
      let count = parseInt(await env.SIGNAL_KV.get('total_visits') || '0');

      if (!already) {
        count += 1;
        await Promise.all([
          env.SIGNAL_KV.put('total_visits', String(count)),
          env.SIGNAL_KV.put(ipKey, '1', { expirationTtl: 86400 }), // 24h
        ]);
      }

      return new Response(JSON.stringify({ count }), { headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
