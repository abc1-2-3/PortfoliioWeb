/**
 * SIGNAL 訪客計數器 + 身份卡片投票 — Cloudflare Worker
 *
 * KV 格式：
 *   visitor_count          → 總訪客數
 *   visitor_ip:<ip>:<date> → 防重複，TTL 86400s
 *   mark:stargazer         → 仰望星空 票數
 *   mark:wanderer          → 漫遊者   票數
 *   mark:dreamer           → 夢想家   票數
 *   mark:traveler          → 旅人     票數
 *   mark:resonator         → 共鳴者   票數
 *
 * ★ 換票邏輯：用前端 localStorage 記錄的 ?prev= 參數
 *    不用 KV 存 ip_mark（KV 讀取有延遲，快速點擊會讀到舊值導致累加）
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const kv = env.SIGNAL_KV;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const today = new Date().toISOString().slice(0, 10);
    const markIds = ['stargazer', 'wanderer', 'dreamer', 'traveler', 'resonator'];

    /* ── 身份卡片 ── */
    if (url.searchParams.has('marks') || url.searchParams.has('mark')) {
      if (request.method === 'POST') {
        const newMark = url.searchParams.get('mark');
        const prevMark = url.searchParams.get('prev'); // 前端 localStorage 記的上次選擇

        if (newMark && markIds.includes(newMark)) {
          if (prevMark === newMark) {
            // 同一張卡重複點 → 不做任何事（刷新後再點同一張也不會累加）
          } else {
            // 換票：扣前一張
            if (prevMark && markIds.includes(prevMark)) {
              const pv = parseInt(await kv.get('mark:' + prevMark) || '0');
              await kv.put('mark:' + prevMark, String(Math.max(0, pv - 1)));
            }
            // 加新選的
            const cv = parseInt(await kv.get('mark:' + newMark) || '0');
            await kv.put('mark:' + newMark, String(cv + 1));
          }
        }
      }

      // GET 或 POST 完都回傳最新計數
      const marks = {};
      for (const id of markIds) {
        marks[id] = parseInt(await kv.get('mark:' + id) || '0');
      }
      return new Response(JSON.stringify({ marks }), { headers: cors });
    }

    /* ── 訪客計數（同一 IP 當天只算一次）── */
    if (request.method === 'POST') {
      const ipKey = `visitor_ip:${ip}:${today}`;
      const already = await kv.get(ipKey);
      if (!already) {
        await kv.put(ipKey, '1', { expirationTtl: 86400 });
        const cur = parseInt(await kv.get('visitor_count') || '0');
        await kv.put('visitor_count', String(cur + 1));
      }
    }

    const count = parseInt(await kv.get('visitor_count') || '0');
    return new Response(JSON.stringify({ count }), { headers: cors });
  },
};
