/* global React, CodeBlock, Tabs, SectionHeader */

const ENDPOINTS = [
  {
    id:"login",
    method:"POST",
    path:"/api/auth/login",
    group:"Auth",
    title:"登入取得 JWT",
    zh:"用帳號密碼換 access token + refresh token",
    auth:false,
    req:`{
  "username": "alice",
  "password": "p@ssw0rd!"
}`,
    res:`{
  "access_token": "eyJhbGciOiJI...gQfL",
  "refresh_token": "rt_8f3a...",
  "expires_in": 3600,
  "token_type": "Bearer"
}`,
    curl:`curl -X POST https://api.example.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"alice","password":"p@ssw0rd!"}'`,
  },
  {
    id:"me",
    method:"GET",
    path:"/api/auth/me",
    group:"Auth",
    title:"驗證 token + 取得使用者",
    zh:"middleware 解 JWT,失敗回 401",
    auth:true,
    req:`(無 body) — Header:
Authorization: Bearer <access_token>`,
    res:`{
  "user_id": 42,
  "username": "alice",
  "role": "member",
  "issued_at": 1737000000
}`,
    curl:`curl https://api.example.com/api/auth/me \\
  -H "Authorization: Bearer $TOKEN"`,
  },
  {
    id:"upload",
    method:"POST",
    path:"/api/files",
    group:"Files",
    title:"上傳檔案到公共空間",
    zh:"multipart/form-data;回傳可直接取用的 url",
    auth:true,
    req:`Content-Type: multipart/form-data

field "file":   (binary)
field "folder": "menu-photos"`,
    res:`{
  "file_id": "f_29a1b3",
  "url": "https://cdn.example.com/menu-photos/29a1b3.jpg",
  "size": 184320,
  "mime": "image/jpeg"
}`,
    curl:`curl -X POST https://api.example.com/api/files \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "folder=menu-photos" \\
  -F "file=@./latte.jpg"`,
  },
  {
    id:"menu",
    method:"GET",
    path:"/api/menu",
    group:"Menu",
    title:"取得菜單 · 多種排序",
    zh:"支援 sort=price | popularity | newest",
    auth:false,
    req:`Query:
  ?sort=popularity
  &category=drink
  &page=1
  &size=20`,
    res:`{
  "items": [
    { "id": "m_01", "name": "玫瑰拿鐵", "price": 160, "popularity": 412 },
    { "id": "m_02", "name": "雲朵奶茶", "price": 140, "popularity": 388 }
  ],
  "page": 1,
  "total": 56
}`,
    curl:`curl "https://api.example.com/api/menu?sort=popularity&category=drink"`,
  },
  {
    id:"create-order",
    method:"POST",
    path:"/api/orders",
    group:"Order",
    title:"建立新訂單",
    zh:"驗證 JWT;檢查庫存後落單,回傳訂單編號",
    auth:true,
    req:`{
  "items": [
    { "menu_id": "m_01", "qty": 2, "notes": "少冰" },
    { "menu_id": "m_05", "qty": 1 }
  ],
  "pickup_at": "2025-11-20T15:30:00+08:00"
}`,
    res:`{
  "order_id": "o_7c2a91",
  "status": "pending",
  "total": 460,
  "created_at": "2025-11-20T11:02:18+08:00"
}`,
    curl:`curl -X POST https://api.example.com/api/orders \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d @order.json`,
  },
  {
    id:"list-orders",
    method:"GET",
    path:"/api/orders",
    group:"Order",
    title:"查詢自己的訂單",
    zh:"依登入者 user_id 篩選;支援狀態過濾",
    auth:true,
    req:`Query:
  ?status=pending
  &sort=created_desc`,
    res:`{
  "orders": [
    { "order_id": "o_7c2a91", "status": "pending", "total": 460 },
    { "order_id": "o_7b88e0", "status": "done",    "total": 220 }
  ]
}`,
    curl:`curl "https://api.example.com/api/orders?status=pending" \\
  -H "Authorization: Bearer $TOKEN"`,
  },
];

function MethodBadge({ method }){
  return <span className={"mb mb-" + method.toLowerCase()}>{method}</span>;
}

function JwtFlow(){
  const nodes = [
    { k:"client", t:"Client",   d:"前端 / SDK" },
    { k:"login",  t:"POST /login",   d:"傳帳密" },
    { k:"server", t:"Auth Service", d:"驗證 + 簽發 token" },
    { k:"token",  t:"JWT",   d:"access + refresh" },
    { k:"api",    t:"Protected API",  d:"middleware 驗 token" },
  ];
  return (
    <div className="jwt-flow">
      {nodes.map((n, i) => (
        <React.Fragment key={n.k}>
          <div className={"jwt-node n-" + n.k}>
            <div className="jwt-t">{n.t}</div>
            <div className="jwt-d">{n.d}</div>
          </div>
          {i < nodes.length - 1 && (
            <div className="jwt-arrow" aria-hidden="true">
              <svg viewBox="0 0 30 10" width="30" height="10">
                <path d="M0 5 H24 M20 1 L24 5 L20 9" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ProjectSdk(){
  const [selId, setSelId] = React.useState(ENDPOINTS[0].id);
  const [tab, setTab] = React.useState("req");
  const sel = ENDPOINTS.find(e => e.id === selId);

  return (
    <section className="project project-sdk">
      <SectionHeader
        index={3}
        en="Ordering · SDK Playground"
        zh="點餐系統練習 SDK"
        summary="練習一支完整的點餐後端 SDK:帳號密碼登入 → 換發 JWT,帶 token 操作上傳、菜單查詢、訂單建立等保護端點;點下方任一 endpoint 看 request / response / cURL 範例。"
        tags={[".NET", "Web API", "JWT", "Swagger", "multipart upload", "Refresh Token"]}
      />

      <div className="repo-link-row">
        <a className="repo-link" href="https://github.com/abc1-2-3/Meals" target="_blank" rel="noreferrer">
          <span className="repo-mark">↗</span>
          <span className="repo-path">github.com/abc1-2-3/<b>Meals</b></span>
          <span className="repo-meta">C# · Meals + TestMeals · 6 commits · public</span>
        </a>
      </div>

      <JwtFlow />

      <div className="sdk-grid">
        <aside className="sdk-list">
          <div className="sdk-list-head">
            <span className="eyebrow"><span className="dot"></span>ENDPOINTS · {ENDPOINTS.length}</span>
          </div>
          {["Auth","Files","Menu","Order"].map(group => (
            <div key={group} className="sdk-group">
              <div className="sdk-group-h">{group}</div>
              {ENDPOINTS.filter(e => e.group === group).map(e => (
                <button
                  key={e.id}
                  className={"sdk-row " + (selId === e.id ? "on" : "")}
                  onClick={() => { setSelId(e.id); setTab("req"); }}>
                  <MethodBadge method={e.method} />
                  <span className="sdk-path">{e.path}</span>
                  {e.auth && <span className="sdk-lock" title="需要 JWT">🔒</span>}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className="sdk-detail">
          <div className="sdk-detail-head">
            <div className="sdk-detail-row">
              <MethodBadge method={sel.method} />
              <span className="sdk-detail-path">{sel.path}</span>
              {sel.auth && <span className="tag glow">JWT required</span>}
            </div>
            <h3 className="sdk-detail-title">{sel.title}</h3>
            <p className="sdk-detail-zh">{sel.zh}</p>
          </div>

          <div className="sdk-detail-tabs">
            <Tabs
              items={[
                { value:"req", label:"Request" },
                { value:"res", label:"Response" },
                { value:"curl", label:"cURL" },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>

          {tab === "req"  && <CodeBlock code={sel.req}  lang={sel.method === "GET" ? "http" : "json"} file="request" />}
          {tab === "res"  && <CodeBlock code={sel.res}  lang="json" file="200 OK" />}
          {tab === "curl" && <CodeBlock code={sel.curl} lang="js"   file="shell" />}
        </div>
      </div>
    </section>
  );
}

window.ProjectSdk = ProjectSdk;
