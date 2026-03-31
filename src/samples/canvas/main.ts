import '/src/shared.css'
import { prepareWithSegments, layoutNextLine, type LayoutCursor } from '@chenglou/pretext'

const textInput = document.getElementById('text-input') as HTMLTextAreaElement
const fontSizeSlider = document.getElementById('font-size-slider') as HTMLInputElement
const fontSizeLabel = document.getElementById('font-size-label') as HTMLElement
const lineHeightSlider = document.getElementById('line-height-slider') as HTMLInputElement
const lineHeightLabel = document.getElementById('line-height-label') as HTMLElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const statsEl = document.getElementById('stats') as HTMLDivElement

const ctx = canvas.getContext('2d')!

// 障害物の円 (canvas上の座標)
type Circle = { cx: number; cy: number; r: number; label: string }

function getObstacles(width: number, height: number): Circle[] {
  return [
    { cx: width * 0.72, cy: height * 0.28, r: height * 0.18, label: 'pretext' },
    { cx: width * 0.25, cy: height * 0.7, r: height * 0.14, label: '🦊' },
  ]
}

// ある y バンドで障害物円が占める x 区間を返す
function getCircleBlockedRange(
  circle: Circle,
  lineTop: number,
  lineBottom: number,
  padding: number,
): { left: number; right: number } | null {
  const midY = (lineTop + lineBottom) / 2
  const dy = Math.abs(midY - circle.cy)
  const effectiveR = circle.r + padding
  if (dy >= effectiveR) return null
  const halfWidth = Math.sqrt(effectiveR * effectiveR - dy * dy)
  return { left: circle.cx - halfWidth, right: circle.cx + halfWidth }
}

function render(): void {
  const fontSize = Number(fontSizeSlider.value)
  const lineHeight = Number(lineHeightSlider.value)
  fontSizeLabel.textContent = `${fontSize}px`
  lineHeightLabel.textContent = `${lineHeight}px`

  const font = `${fontSize}px system-ui, sans-serif`
  const text = textInput.value.trim()
  if (!text) return

  // canvas サイズ設定
  const dpr = window.devicePixelRatio || 1
  const cssWidth = Math.min(852, document.querySelector('.page')!.clientWidth - 2)
  const cssHeight = Math.round(cssWidth * 0.55)
  canvas.width = cssWidth * dpr
  canvas.height = cssHeight * dpr
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`
  ctx.scale(dpr, dpr)

  // 背景
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  ctx.fillStyle = isDark ? '#1f2028' : '#f9f8fc'
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  const obstacles = getObstacles(cssWidth, cssHeight)

  // 障害物を描画
  for (const obs of obstacles) {
    ctx.beginPath()
    ctx.arc(obs.cx, obs.cy, obs.r, 0, Math.PI * 2)
    ctx.fillStyle = isDark ? 'rgba(192,132,252,0.15)' : 'rgba(170,59,255,0.08)'
    ctx.fill()
    ctx.strokeStyle = isDark ? 'rgba(192,132,252,0.5)' : 'rgba(170,59,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillStyle = isDark ? '#c084fc' : '#aa3bff'
    ctx.font = `bold ${Math.round(obs.r * 0.28)}px system-ui`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(obs.label, obs.cx, obs.cy)
  }

  // テキスト描画
  const GUTTER = 24
  const PADDING = 6

  const t0 = performance.now()
  const prepared = prepareWithSegments(text, font)
  const prepareMs = performance.now() - t0

  ctx.fillStyle = isDark ? '#f3f4f6' : '#08060d'
  ctx.font = font
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
  let lineTop = GUTTER
  let lineCount = 0
  let t1 = performance.now()

  while (lineTop + lineHeight <= cssHeight - GUTTER) {
    const bandTop = lineTop
    const bandBottom = lineTop + lineHeight

    // 障害物を避けたスロットを計算
    type Slot = { left: number; right: number }
    let slots: Slot[] = [{ left: GUTTER, right: cssWidth - GUTTER }]

    for (const obs of obstacles) {
      const blocked = getCircleBlockedRange(obs, bandTop, bandBottom, PADDING)
      if (blocked === null) continue

      const next: Slot[] = []
      for (const slot of slots) {
        if (blocked.right <= slot.left || blocked.left >= slot.right) {
          next.push(slot)
        } else {
          if (blocked.left > slot.left + 20) next.push({ left: slot.left, right: blocked.left })
          if (blocked.right < slot.right - 20) next.push({ left: blocked.right, right: slot.right })
        }
      }
      slots = next
    }

    if (slots.length === 0) {
      lineTop += lineHeight
      continue
    }

    // 最も幅の広いスロットを選ぶ
    let best = slots[0]!
    for (const s of slots) {
      if (s.right - s.left > best.right - best.left) best = s
    }

    const width = best.right - best.left
    if (width < fontSize * 3) {
      lineTop += lineHeight
      continue
    }

    const line = layoutNextLine(prepared, cursor, width)
    if (line === null) break

    ctx.fillText(line.text, best.left, lineTop)
    cursor = line.end
    lineTop += lineHeight
    lineCount++
  }

  const layoutMs = performance.now() - t1

  statsEl.innerHTML = `
    <div class="stat">
      <div class="stat-label">描画行数</div>
      <div class="stat-value">${lineCount}<span class="stat-unit">行</span></div>
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

textInput.addEventListener('input', render)
fontSizeSlider.addEventListener('input', render)
lineHeightSlider.addEventListener('input', render)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render)
window.addEventListener('resize', render)
document.fonts.ready.then(render)
render()
