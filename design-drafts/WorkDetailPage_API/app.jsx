/* global React, ReactDOM, ProjectX, ProjectMvc, ProjectSdk, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor */

const { useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "violet",
  "density": "default",
  "postLayout": "grid"
}/*EDITMODE-END*/;

/* ---------- Hero ---------- */
function Hero(){
  return (
    <header className="hero" data-screen-label="00 Hero">
      <div className="hero-mark">
        <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1 L13.6 10.4 L23 12 L13.6 13.6 L12 23 L10.4 13.6 L1 12 L10.4 10.4 Z"
                fill="url(#g)" />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfe4ff"/>
              <stop offset="100%" stopColor="#e8a3d4"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="hero-eyebrow">
        <span className="eyebrow"><span className="dot"></span>WORKS · COLLECTION  03</span>
        <span className="hero-crumbs">
          <a href="#">portfolio</a>
          <span className="sep">/</span>
          <span>works</span>
          <span className="sep">/</span>
          <span className="here">api &amp; sdk</span>
        </span>
      </div>

      <h1 className="h-display">
        Things without a face <em>·</em><br/>
        <span className="hero-zh">沒有畫面 的作品 們</span>
      </h1>

      <p className="hero-lead">
        三個跟後端 · <em>API / SDK</em> 有關的小作品。沒有漂亮的介面可以截圖,
        所以我把<span className="emp">流程、結構、程式碼</span>當作主角拿出來展示。
      </p>

      <div className="hero-meta">
        <div className="hero-meta-cell">
          <div className="meta-label">stack</div>
          <div className="meta-val">Python · C# · .NET</div>
        </div>
        <div className="hero-meta-cell">
          <div className="meta-label">type</div>
          <div className="meta-val">backend · automation</div>
        </div>
        <div className="hero-meta-cell">
          <div className="meta-label">period</div>
          <div className="meta-val">2024 — 2025</div>
        </div>
        <div className="hero-meta-cell">
          <div className="meta-label">code</div>
          <div className="meta-val">github · 私有 repo</div>
        </div>
      </div>

      <nav className="hero-nav">
        <a href="#x"><span className="num">01</span><span>Auto-Muse · X Tweet Bot</span></a>
        <a href="#mvc"><span className="num">02</span><span>MVC · Split &amp; Test</span></a>
        <a href="#sdk"><span className="num">03</span><span>Ordering · SDK Playground</span></a>
      </nav>
    </header>
  );
}

/* ---------- Footer ---------- */
function Foot(){
  return (
    <footer className="foot">
      <div className="foot-mark">✦</div>
      <div className="foot-text">
        <em>End of works · </em>
        thank you for scrolling all the way down.
      </div>
      <div className="foot-nav">
        <a href="#top">↑ back to top</a>
        <span>·</span>
        <a href="#">← all works</a>
      </div>
    </footer>
  );
}

/* ---------- App ---------- */
function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.setAttribute("data-density", t.density);
  }, [t.theme, t.density]);

  return (
    <>
      <div id="top"></div>
      <main className="page">
        <Hero/>

        <div className="divider" id="x"></div>
        <ProjectX layout={t.postLayout}/>

        <div className="divider" id="mvc"></div>
        <ProjectMvc/>

        <div className="divider" id="sdk"></div>
        <ProjectSdk/>

        <Foot/>
      </main>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio
            label="palette"
            value={t.theme}
            options={[
              { value:"violet", label:"Violet" },
              { value:"aurora", label:"Aurora" },
              { value:"dusk",   label:"Dusk" },
            ]}
            onChange={v => setTweak("theme", v)}
          />
        </TweakSection>

        <TweakSection label="Layout">
          <TweakRadio
            label="X post wall"
            value={t.postLayout}
            options={[
              { value:"grid",    label:"Grid" },
              { value:"list",    label:"List" },
              { value:"masonry", label:"Masonry" },
            ]}
            onChange={v => setTweak("postLayout", v)}
          />
          <TweakRadio
            label="density"
            value={t.density}
            options={[
              { value:"tight",   label:"Tight" },
              { value:"default", label:"Default" },
              { value:"cozy",    label:"Cozy" },
            ]}
            onChange={v => setTweak("density", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
