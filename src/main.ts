import './style.css';

const samples = [
  {
    href: './samples/basic/',
    title: '基本的な高さ計算',
    desc: 'prepare() + layout() でDOMに触れずにテキスト高さを計測。リフローゼロの純粋な算術計算。',
    api: 'prepare · layout',
  },
  {
    href: './samples/canvas/',
    title: 'Canvas テキスト描画',
    desc: 'prepareWithSegments() + layoutWithLines() でCanvasに正確な折り返しテキストを描画。',
    api: 'prepareWithSegments · layoutWithLines',
  },
  {
    href: './samples/chat/',
    title: 'チャットバブル',
    desc: 'walkLineRanges() でバブル幅を最小化(shrink-wrap)。無駄なスペースをゼロにするチャットUI。',
    api: 'walkLineRanges',
  },
  {
    href: './samples/multilingual/',
    title: '多言語レイアウト',
    desc: '日本語・Arabic・絵文字・英語が混在するテキストの正確な折り返し。Intl.Segmenter対応。',
    api: 'prepare · layout · setLocale',
  },
];

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="hero">
  <div class="hero-inner">
    <div class="hero-badge">@chenglou/pretext</div>
    <h1>テキストレイアウト<br>サンプル集</h1>
    <p class="hero-sub">DOMリフローなし・純粋JS・全言語対応のテキスト計測ライブラリ</p>
  </div>
</div>
<main class="grid-section">
  <div class="samples-grid">
    ${samples
      .map(
        (s) => `
      <a href="${s.href}" class="sample-card">
        <div class="sample-api">${s.api}</div>
        <h2>${s.title}</h2>
        <p>${s.desc}</p>
        <span class="sample-arrow">→</span>
      </a>`
      )
      .join('')}
  </div>
  <footer>
    <a href="https://github.com/chenglou/pretext" target="_blank" rel="noopener">GitHub</a>
    ·
    <a href="https://chenglou.me/pretext/" target="_blank" rel="noopener">公式デモ</a>
  </footer>
</main>
`;
