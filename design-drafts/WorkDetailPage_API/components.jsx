/* global React */
const { useState, useEffect, useRef } = React;

/* ---------- naive syntax highlighter ---------- */
// Tokens we color: keywords, strings, comments, numbers, decorators.
// Languages handled: python, csharp, js/ts, http, json — single regex per kind.

const KW = {
  python: /\b(def|class|return|import|from|as|if|elif|else|for|while|in|not|and|or|with|try|except|finally|raise|yield|lambda|async|await|pass|True|False|None|self)\b/g,
  csharp: /\b(public|private|protected|internal|class|interface|namespace|using|return|if|else|for|foreach|while|new|var|static|readonly|async|await|task|void|string|int|bool|true|false|null|this|override|virtual|abstract|sealed|switch|case|break|throw|try|catch|finally|in|out|ref)\b/g,
  js:     /\b(const|let|var|function|return|if|else|for|while|class|extends|new|async|await|import|from|export|default|true|false|null|undefined|this|try|catch|finally|throw)\b/g,
};

function escapeHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlight(code, lang){
  if (lang === 'http' || lang === 'json'){
    let s = escapeHtml(code);
    // strings
    s = s.replace(/"([^"\\]|\\.)*"/g, m => `<span class="str">${m}</span>`);
    // numbers
    s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
    if (lang === 'http'){
      s = s.replace(/^(GET|POST|PUT|PATCH|DELETE)\b/gm, '<span class="kw">$1</span>');
      s = s.replace(/^([A-Za-z-]+):/gm, '<span class="fn">$1</span>:');
    }
    return s;
  }

  let s = escapeHtml(code);

  // comments first (so we don't recolor inside)
  if (lang === 'python'){
    s = s.replace(/(#[^\n]*)/g, '<span class="com">$1</span>');
  } else {
    s = s.replace(/(\/\/[^\n]*)/g, '<span class="com">$1</span>');
    s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="com">$1</span>');
  }

  // strings
  s = s.replace(/("([^"\\]|\\.)*")|('([^'\\]|\\.)*')|(`([^`\\]|\\.)*`)/g, m => {
    // skip if already inside span
    if (m.includes('class="com"')) return m;
    return `<span class="str">${m}</span>`;
  });

  // decorators / attributes
  if (lang === 'python') s = s.replace(/(^|\n)(\s*)(@\w+)/g, '$1$2<span class="dec">$3</span>');
  if (lang === 'csharp') s = s.replace(/(\[[A-Za-z][\w.]*(\([^\)]*\))?\])/g, '<span class="dec">$1</span>');

  // keywords
  const kw = KW[lang];
  if (kw){
    s = s.replace(kw, m => `<span class="kw">${m}</span>`);
  }

  // numbers
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');

  return s;
}

function CodeBlock({ code, lang = 'python', file, showLineNumbers = false }){
  const [copied, setCopied] = useState(false);
  const trimmed = code.replace(/^\n/, '').replace(/\s+$/, '');
  const html = highlight(trimmed, lang);
  const lines = html.split('\n');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };

  return (
    <div className="code">
      <div className="code-head">
        {file && <span className="file">{file}</span>}
        <span className="lang">{lang}</span>
        <button className={"copy-btn " + (copied ? "ok" : "")} onClick={onCopy}>
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre className="code-body"><code dangerouslySetInnerHTML={{ __html:
        showLineNumbers
          ? lines.map((l, i) => `<span class="ln">${String(i+1).padStart(2,' ')}</span>${l}`).join('\n')
          : html
      }}/></pre>
    </div>
  );
}

/* ---------- tabs ---------- */
function Tabs({ items, value, onChange }){
  return (
    <div className="tabs" role="tablist">
      {items.map(it => (
        <button key={it.value}
          role="tab"
          aria-selected={value === it.value}
          className={value === it.value ? "on" : ""}
          onClick={() => onChange(it.value)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- section header ---------- */
function SectionHeader({ index, en, zh, summary, tags }){
  return (
    <header style={{ display:"grid", gap:18, marginBottom:36 }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:14, flexWrap:"wrap" }}>
        <span className="eyebrow">
          <span className="dot"></span>
          PROJECT · {String(index).padStart(2,'0')}
        </span>
        {tags && tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      <h2 className="h-sec" data-screen-label={`Project ${index} ${en}`}>
        {en} <em>· {zh}</em>
      </h2>
      {summary && <p className="lead" style={{ marginTop:4 }}>{summary}</p>}
    </header>
  );
}

/* ---------- glyph (decorative SVG, simple shapes only) ---------- */
function SparkleMark({ size = 18, color = "currentColor" }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
            fill={color} opacity="0.9"/>
    </svg>
  );
}

/* ---------- export ---------- */
Object.assign(window, { CodeBlock, Tabs, SectionHeader, SparkleMark, highlight });
