/**
 * SIGNAL 訪客計數器 + 身份卡片投票 — Cloudflare Worker
 *
 * KV 儲存格式：
 *   total_visits      → 總訪客數（string）
 *   ip_<ip>           → 防重複 key，TTL 86400s
 *   mark_stargazer    → 仰望星空 投票數（string）
 *   mark_wanderer     → 漫遊者   投票數
 *   mark_dreamer      → 夢想家   投票數
 *   mark_traveler     → 旅人     投票數
 *   mark_resonator    → 共鳴者   投票數
 *
 * 部署步驟：
 *  1. 安裝 Wrangler：npm install -g wrangler
 *  2. 登入：wrangler login
 *  3. 建立 KV namespace：wrangler kv:namespace create SIGNAL_KV
 *     → 把輸出的 id 填入 wrangler.toml
 *  4. 部署：wrangler deploy
 *  5. 把 workers.dev 網址填入 signal.html 的 WORKER_URL
 */

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_MARKS = ['stargazer', 'wanderer', 'dreamer', 'traveler', 'resonator'];

async function getMarks(env) {
  const vals = await Promise.all(VALID_MARKS.map(m => env.SIGNAL_KV.get('mark_' + m)));
  const marks = {};
  VALID_MARKS.forEach((m, i) => { marks[m] = parseInt(vals[i] || '0'); });
  return marks;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const mark = url.searchParams.get('mark');
    const prev = url.searchParams.get('prev');

    /* ── GET：回傳總計數 + 各卡片計數 ── */
    if (request.method === 'GET') {
      const count = parseInt(await env.SIGNAL_KV.get('total_visits') || '0');
      const marks = await getMarks(env);
      return new Response(JSON.stringify({ count, marks }), { headers: CORS });
    }

    /* ── POST ── */
    if (request.method === 'POST') {

      /* 卡片投票：?mark=stargazer&prev=wanderer */
      if (mark && VALID_MARKS.includes(mark)) {
        // 換票：把前一張 -1（floor 0）
        if (prev && VALID_MARKS.includes(prev) && prev !== mark) {
          const prevCount = parseInt(await env.SIGNAL_KV.get('mark_' + prev) || '0');
          await env.SIGNAL_KV.put('mark_' + prev, String(Math.max(0, prevCount - 1)));
        }
        // 新卡 +1
        const cur = parseInt(await env.SIGNAL_KV.get('mark_' + mark) || '0');
        await env.SIGNAL_KV.put('mark_' + mark, String(cur + 1));

        const marks = await getMarks(env);
        return new Response(JSON.stringify({ marks }), { headers: CORS });
      }

      /* 訪客計次：同一 IP 24h 只算一次 */
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const ipKey = 'ip_' + ip;
      const already = await env.SIGNAL_KV.get(ipKey);
      let count = parseInt(await env.SIGNAL_KV.get('total_visits') || '0');

      if (!already) {
        count += 1;
        await Promise.all([
          env.SIGNAL_KV.put('total_visits', String(count)),
          env.SIGNAL_KV.put(ipKey, '1', { expirationTtl: 86400 }),
        ]);
      }

      return new Response(JSON.stringify({ count }), { headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};
