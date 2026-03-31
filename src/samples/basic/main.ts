import '/src/shared.css'
import './style.css'
import { prepare, layout } from '@chenglou/pretext'

const textInput = document.getElementById('text-input') as HTMLTextAreaElement
const fontSelect = document.getElementById('font-select') as HTMLSelectElement
const widthSlider = document.getElementById('width-slider') as HTMLInputElement
const widthLabel = document.getElementById('width-label') as HTMLElement
const previewText = document.getElementById('preview-text') as HTMLDivElement
const statsEl = document.getElementById('stats') as HTMLDivElement
const benchBtn = document.getElementById('bench-btn') as HTMLButtonElement
const benchStats = document.getElementById('bench-stats') as HTMLDivElement

const LINE_HEIGHT = 24

function update(): void {
  const text = textInput.value
  const font = fontSelect.value
  const maxWidth = Number(widthSlider.value)

  widthLabel.textContent = `${maxWidth}px`

  // ── pretext 計測 ──
  const t0 = performance.now()
  const prepared = prepare(text, font)
  const prepareMs = performance.now() - t0

  const t1 = performance.now()
  const result = layout(prepared, maxWidth, LINE_HEIGHT)
  const layoutMs = performance.now() - t1

  // ── DOM プレビュー更新 ──
  previewText.style.width = `${maxWidth}px`
  previewText.style.font = font
  previewText.style.lineHeight = `${LINE_HEIGHT}px`
  previewText.textContent = text

  // ── DOM 実測（比較用） ──
  const domHeight = previewText.offsetHeight

  statsEl.innerHTML = `
    <div class="stat">
      <div class="stat-label">pretext 高さ</div>
      <div class="stat-value">${result.height}<span class="stat-unit">px</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">DOM 高さ</div>
      <div class="stat-value">${domHeight}<span class="stat-unit">px</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">行数</div>
      <div class="stat-value">${result.lineCount}<span class="stat-unit">行</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">prepare()</div>
      <div class="stat-value">${prepareMs.toFixed(2)}<span class="stat-unit">ms</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">layout()</div>
      <div class="stat-value">${layoutMs.toFixed(3)}<span class="stat-unit">ms</span></div>
    </div>
  `
}

benchBtn.addEventListener('click', () => {
  const text = textInput.value
  const font = fontSelect.value
  const maxWidth = Number(widthSlider.value)
  const COUNT = 500

  // prepare 500回
  const tp0 = performance.now()
  for (let i = 0; i < COUNT; i++) prepare(text, font)
  const prepareTotal = performance.now() - tp0

  // layout 500回（1回 prepareしてから）
  const prepared = prepare(text, font)
  const tl0 = performance.now()
  for (let i = 0; i < COUNT; i++) layout(prepared, maxWidth, LINE_HEIGHT)
  const layoutTotal = performance.now() - tl0

  // DOM offsetHeight 500回
  const td0 = performance.now()
  for (let i = 0; i < COUNT; i++) {
    previewText.textContent = text
    void previewText.offsetHeight // force reflow
  }
  const domTotal = performance.now() - td0

  benchStats.innerHTML = `
    <div class="stat">
      <div class="stat-label">prepare() ×${COUNT}</div>
      <div class="stat-value">${prepareTotal.toFixed(1)}<span class="stat-unit">ms</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">layout() ×${COUNT}</div>
      <div class="stat-value">${layoutTotal.toFixed(2)}<span class="stat-unit">ms</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">DOM reflow ×${COUNT}</div>
      <div class="stat-value">${domTotal.toFixed(1)}<span class="stat-unit">ms</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">layout 高速化</div>
      <div class="stat-value">${(domTotal / layoutTotal).toFixed(0)}<span class="stat-unit">×</span></div>
    </div>
  `
})

textInput.addEventListener('input', update)
fontSelect.addEventListener('change', update)
widthSlider.addEventListener('input', update)

document.fonts.ready.then(update)
update()
