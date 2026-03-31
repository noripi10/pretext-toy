import '/src/shared.css';
import './style.css';
import { prepare, layout } from '@chenglou/pretext';

const widthSlider = document.getElementById('width-slider') as HTMLInputElement;
const widthLabel = document.getElementById('width-label') as HTMLElement;
const blocksEl = document.getElementById('blocks') as HTMLDivElement;
const statsEl = document.getElementById('stats') as HTMLDivElement;

const FONT = '16px system-ui, sans-serif';
const LINE_HEIGHT = 26;

const SAMPLES: Array<{ lang: string; flag: string; text: string }> = [
  {
    lang: '日本語',
    flag: '🇯🇵',
    text: '吾輩は猫である。名前はまだない。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。',
  },
  {
    lang: 'English',
    flag: '🇬🇧',
    text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!',
  },
  {
    lang: 'Arabic (RTL)',
    flag: '🇸🇦',
    text: 'الخط العربي هو نظام كتابة يُستخدم لكتابة اللغة العربية وعدد من اللغات الأخرى. يُكتب من اليمين إلى اليسار، وله أشكال متعددة تعتمد على موضع الحرف في الكلمة.',
  },
  {
    lang: 'Thai',
    flag: '🇹🇭',
    text: 'ภาษาไทยเป็นภาษาราชการของประเทศไทย มีการใช้อักษรไทยในการเขียน ซึ่งมีลักษณะพิเศษที่ไม่มีช่องว่างระหว่างคำ การแบ่งคำต้องอาศัยการวิเคราะห์ทางภาษาศาสตร์',
  },
  {
    lang: '中文 (繁體)',
    flag: '🇹🇼',
    text: '漢字是中文書寫系統的基本單位，每個漢字通常代表一個音節和一個語素。中文書寫系統已有數千年的歷史，是世界上最古老的書寫系統之一。',
  },
  {
    lang: 'Mixed + Emoji',
    flag: '🌍',
    text: 'Hello! こんにちは 🌸 مرحبا สวัสดี 你好 — This text mixes English, Japanese, Arabic, Thai, Chinese, and emoji 🎉🚀✨ all in one paragraph!',
  },
];

// 全サンプルを事前 prepare
const prepared = SAMPLES.map((s) => prepare(s.text, FONT));

function render(): void {
  const maxWidth = Number(widthSlider.value);
  widthLabel.textContent = `${maxWidth}px`;

  const t0 = performance.now();
  const results = prepared.map((p) => layout(p, maxWidth, LINE_HEIGHT)); // LINE_HEIGHTが1行の高さ
  const totalMs = performance.now() - t0;

  // lang-previewのheightはpadding分(16px)高さを追加
  blocksEl.innerHTML = SAMPLES.map((s, i) => {
    const r = results[i]!;
    return `
      <div class="lang-card">
        <div class="lang-header">
          <span class="lang-flag">${s.flag}</span>
          <span class="lang-name">${s.lang}</span>
          <span class="lang-stat">${r.lineCount}行 / ${r.height}px</span>
        </div>
        <div class="lang-preview" style="width:${maxWidth}px;height:${r.height + 16}px;font:${FONT};line-height:${LINE_HEIGHT}px;">
          ${s.text}
        </div>
      </div>`;
  }).join('');

  const totalLines = results.reduce((sum, r) => sum + r.lineCount, 0);

  statsEl.innerHTML = `
    <div class="stat">
      <div class="stat-label">言語数</div>
      <div class="stat-value">${SAMPLES.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">合計行数</div>
      <div class="stat-value">${totalLines}<span class="stat-unit">行</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">layout() 合計</div>
      <div class="stat-value">${totalMs.toFixed(3)}<span class="stat-unit">ms</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">1言語あたり</div>
      <div class="stat-value">${(totalMs / SAMPLES.length).toFixed(4)}<span class="stat-unit">ms</span></div>
    </div>
  `;
}

widthSlider.addEventListener('input', render);
document.fonts.ready.then(render);
render();
