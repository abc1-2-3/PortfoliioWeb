/* global React, CodeBlock, SectionHeader */

/* ---------- snowflake → date ---------- */
function snowflakeToDate(id){
  // Twitter epoch: 2010-11-04T01:42:54.657Z
  try {
    const ms = Number(BigInt(id) >> 22n) + 1288834974657;
    return new Date(ms);
  } catch (e){
    return new Date();
  }
}
function fmtTs(d){
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ---------- Pipeline diagram ---------- */
function Pipeline(){
  const steps = [
    { n:"01", k:"prompt",   en:"Prompt",        zh:"主題種子",   note:"從編號 txt 抽選詠唱咒語" },
    { n:"02", k:"text",     en:"Gemini · Text", zh:"生成文案",   note:"模型寫出 1–2 句推文" },
    { n:"03", k:"image",    en:"Gemini · Image",zh:"生成圖片",   note:"用文案作為 prompt 產圖" },
    { n:"04", k:"compose",  en:"Compose",       zh:"組裝推文",   note:"圖 + 文 + tag 打包" },
    { n:"05", k:"schedule", en:"Schedule",      zh:"排程",       note:"每 6 小時跑一次" },
    { n:"06", k:"post",     en:"Post → X",      zh:"自動發佈",   note:"X API v2 · OAuth1" },
  ];
  return (
    <div className="pipeline">
      {steps.map((s, i) => (
        <React.Fragment key={s.k}>
          <div className="step" data-k={s.k}>
            <div className="step-num">{s.n}</div>
            <div className="step-en">{s.en}</div>
            <div className="step-zh">{s.zh}</div>
            <div className="step-note">{s.note}</div>
          </div>
          {i < steps.length - 1 && (
            <div className="step-arrow" aria-hidden="true">
              <svg viewBox="0 0 40 12" width="40" height="12">
                <path d="M0 6 H34 M28 1 L34 6 L28 11" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ---------- Tweet preview card (ORIGINAL design, not X UI) ---------- */
function PostCard({ post, layout }){
  const { id, url, text, img, views, likes, accent } = post;
  const ts = fmtTs(snowflakeToDate(id));
  const [imgError, setImgError] = React.useState(false);
  return (
    <article className={"post post-" + layout} style={{"--accent": accent}}>
      <div className="post-frame">
        <header className="post-head">
          <div className="post-orb"></div>
          <div className="post-id">
            <div className="post-name">wuyan4411 <span className="post-tail">❄</span></div>
            <div className="post-meta">
              <span>@wuyan4411</span>
              <span className="dot-sep">·</span>
              <span className="ts">{ts}</span>
            </div>
          </div>
          <div className="post-badge">
            <span className="post-badge-dot"></span>AUTO
          </div>
        </header>

        <p className="post-text">{text}</p>

        <div className="post-image" aria-label="AI generated image">
          <div className="post-image-tag">gemini-2.0-flash</div>
          {!imgError && img ? (
            <img className="post-image-real" src={img} alt={text}
                 onError={() => setImgError(true)} loading="lazy" />
          ) : (
            <div className="post-image-inner">
              <div className="ph-stripes"></div>
              <div className="ph-label">image · couldn't load</div>
            </div>
          )}
        </div>

        <footer className="post-stats">
          <span className="post-numbers">
            <b>{views}</b> views <span className="dot-sep">·</span> <b>{likes}</b> likes
          </span>
          <a className="post-view" href={url} target="_blank" rel="noreferrer">
            view on X ↗
          </a>
        </footer>
      </div>
    </article>
  );
}

/* ---------- Status strip ---------- */
function StatusStrip(){
  return (
    <div className="status-strip">
      <div className="status-cell">
        <div className="status-label">schedule</div>
        <div className="status-value mono">every 6h</div>
        <div className="status-sub">一日 4 推 · schedule lib</div>
      </div>
      <div className="status-cell">
        <div className="status-label">prompts</div>
        <div className="status-value mono">txt · 編號</div>
        <div className="status-sub">詠唱咒語 · 可疊加</div>
      </div>
      <div className="status-cell">
        <div className="status-label">cost</div>
        <div className="status-value mono">free tier</div>
        <div className="status-sub">壓在免費額度內運作</div>
      </div>
      <div className="status-cell">
        <div className="status-label">stack</div>
        <div className="status-value mono">3 files</div>
        <div className="status-sub">main + 2 test scripts</div>
      </div>
    </div>
  );
}

/* ---------- Code: orchestration ---------- */
const X_CODE = `
import json, schedule, time
from generator import generate_text, generate_image
from poster    import post_to_x

with open("config.json", "r") as f:
    cfg = json.load(f)

# ✦ 每六小時跑一次:抽詠唱咒語 → Gemini 生文 → Gemini 生圖 → 發推
def run_once():
    spell = pick_spell()                       # 從編號 txt 抽選 prompt
    text  = generate_text(spell, cfg)          # Gemini text
    image = generate_image(text, cfg)          # Gemini image
    post_to_x(text=text, image=image, cfg=cfg) # X API v2

schedule.every(6).hours.do(run_once)
while True:
    schedule.run_pending()
    time.sleep(30)
`;

/* ---------- Real posts ---------- */
const POSTS = [
  { id:"1986010692282183939",
    url:"https://x.com/wuyan4411/status/1986010692282183939",
    text:"自由的代價是選擇,而選擇的代價是遺憾。",
    img:"https://pbs.twimg.com/media/G4-6MIhbAAAV5F8?format=jpg&name=small",
    views:18, likes:0, accent:"oklch(0.78 0.16 340)" },
  { id:"1985648330110878127",
    url:"https://x.com/wuyan4411/status/1985648330110878127",
    text:"真理是一面鏡子,每個人只能看到自己想要的倒影。",
    img:"https://pbs.twimg.com/media/G45wnvFbQAAvSNh?format=jpg&name=small",
    views:26, likes:0, accent:"oklch(0.86 0.09 230)" },
  { id:"1949409541176938801",
    url:"https://x.com/wuyan4411/status/1949409541176938801",
    text:"知識的擴散速度,趕不上愚蠢的自我複製。",
    img:"https://pbs.twimg.com/media/Gw2xoaWbkAEINex?format=jpg&name=small",
    views:37, likes:2, accent:"oklch(0.78 0.16 290)" },
  { id:"1949318920961450022",
    url:"https://x.com/wuyan4411/status/1949318920961450022",
    text:"當愛意擴散成習慣,厭倦便開始萌芽。",
    img:"https://pbs.twimg.com/media/Gw1fN6ZbcAA2yL_?format=jpg&name=small",
    views:38, likes:1, accent:"oklch(0.88 0.13 95)" },
  { id:"1948594177123778608",
    url:"https://x.com/wuyan4411/status/1948594177123778608",
    text:"宇宙在膨脹,我的絕望也在等比級數地擴散。",
    img:"https://pbs.twimg.com/media/GwrMENEaoAAO-Mf?format=jpg&name=small",
    views:27, likes:0, accent:"oklch(0.78 0.13 200)" },
  { id:"1940712208708915373",
    url:"https://x.com/wuyan4411/status/1940712208708915373",
    text:"世界末日那天,我終於可以不用回覆那些沒完沒了的群組訊息了。",
    img:"https://pbs.twimg.com/media/Gu7LdTQXkAAOjLO?format=jpg&name=small",
    views:32, likes:2, accent:"oklch(0.82 0.14 320)" },
];

/* ---------- Notes ---------- */
const NOTES = [
  { n:"01", t:"壓在免費額度內",
    d:"頻率設 6 小時 + 模型選 gemini-2.0-flash,單月 API 成本 = 0。"},
  { n:"02", t:"詠唱咒語編號化",
    d:"prompt 切成編號 txt,可以自由疊加組合,內容不會重複又能維持風格。"},
  { n:"03", t:"圖文一致性",
    d:"先生文,再把同一段文字餵給生圖模型 — 比兩邊各自亂跑穩很多。"},
];

/* ---------- Section ---------- */
function ProjectX({ layout = "grid" }){
  return (
    <section className="project project-x">
      <SectionHeader
        index={1}
        en="Auto-Muse · X Tweet Bot"
        zh="自動推文機器人"
        summary="一支 Python 小程式串接 Gemini 的文字 / 圖片 API:先讓 Gemini 寫出一句文案,再把同一段文字餵給生圖模型,組成圖文後透過 X API v2 自動發送,並用 schedule 每 6 小時跑一次。所有 prompt 都用編號 txt 切割,寫成『詠唱咒語』可以自由疊加。"
        tags={["Python", "Gemini API", "X API v2", "schedule", "OAuth1", "config.json"]}
      />

      <div className="repo-link-row">
        <a className="repo-link" href="https://github.com/abc1-2-3/Auto_X_Post" target="_blank" rel="noreferrer">
          <span className="repo-mark">↗</span>
          <span className="repo-path">github.com/abc1-2-3/<b>Auto_X_Post</b></span>
          <span className="repo-meta">Python · 5 commits · public</span>
        </a>
      </div>

      <Pipeline />

      <StatusStrip />

      <div className="post-wall-head">
        <h3 className="px-h3">
          Selected Runs <span className="px-h3-em">· 6 則自動推文 · ❄ via gemini-2.0-flash</span>
        </h3>
        <span className="px-hint">點 view on X ↗ 看原推文</span>
      </div>

      <div className={"post-wall layout-" + layout}>
        {POSTS.map(p => (
          <PostCard key={p.id} post={p} layout={layout} />
        ))}
      </div>

      <div className="notes-wrap">
        <div className="notes-head">
          <span className="eyebrow"><span className="dot"></span>NOTES · 三件學到的事</span>
        </div>
        <div className="notes-grid">
          {NOTES.map(n => (
            <div key={n.n} className="note-card">
              <div className="note-num">{n.n}</div>
              <div className="note-t">{n.t}</div>
              <div className="note-d">{n.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-code-wrap">
        <div className="px-code-head">
          <span className="eyebrow"><span className="dot"></span>ORCHESTRATION</span>
          <span className="px-code-sub">把整條 pipeline 串起來的入口</span>
        </div>
        <CodeBlock code={X_CODE} lang="python" file="main.py" showLineNumbers={true}/>
      </div>
    </section>
  );
}

window.ProjectX = ProjectX;
