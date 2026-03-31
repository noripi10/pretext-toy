import '/src/shared.css'
import './style.css'
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

const widthSlider = document.getElementById('width-slider') as HTMLInputElement
const widthLabel = document.getElementById('width-label') as HTMLElement
const chatEl = document.getElementById('chat') as HTMLDivElement
const statsEl = document.getElementById('stats') as HTMLDivElement

const FONT = '15px system-ui, sans-serif'
const H_PADDING = 24 // bubble左右padding合計
const MAX_WIDTH_RATIO = 0.72

const MESSAGES: Array<{ text: string; side: 'left' | 'right' }> = [
  { side: 'left', text: 'こんにちは！今日の調子はどうですか？' },
  { side: 'right', text: 'とても良いです、ありがとう！' },
  { side: 'left', text: 'それは良かった。今日は天気も最高ですね。' },
  { side: 'right', text: 'そうですね。散歩でもしようかな。' },
  { side: 'left', text: 'ぜひ！近くの公園はとても気持ちいいですよ。桜もまだ咲いています。' },
  { side: 'right', text: 'OK 👍' },
  { side: 'left', text: 'By the way, have you tried the new @chenglou/pretext library? It measures text without DOM reflow — super fast!' },
  { side: 'right', text: 'Yes! walkLineRanges() is perfect for shrink-wrapping chat bubbles. No more wasted horizontal space.' },
  { side: 'left', text: 'Exactly. And it handles Japanese, Arabic, emoji — everything just works. 🎉' },
  { side: 'right', text: '素晴らしい！' },
]

// 事前に全メッセージを prepare しておく
const prepared = MESSAGES.map((m) => prepareWithSegments(m.text, FONT))

function getShrinkWidth(index: number, maxWidth: number): number {
  let tightest = 0
  walkLineRanges(prepared[index]!, maxWidth - H_PADDING, (line) => {
    if (line.width > tightest) tightest = line.width
  })
  return Math.ceil(tightest) + H_PADDING
}

function render(): void {
  const chatWidth = Number(widthSlider.value)
  widthLabel.textContent = `${chatWidth}px`

  const bubbleMaxWidth = Math.round(chatWidth * MAX_WIDTH_RATIO)
  const t0 = performance.now()

  const shrinkWidths = MESSAGES.map((_, i) => getShrinkWidth(i, bubbleMaxWidth))
  const layoutMs = performance.now() - t0

  // チャット幅をCSS変数で指定
  chatEl.style.setProperty('--chat-width', `${chatWidth}px`)
  chatEl.style.setProperty('--bubble-max-width', `${bubbleMaxWidth}px`)

  // DOM を構築 (差分更新の代わりにシンプルに全更新)
  chatEl.innerHTML = MESSAGES.map((msg, i) => {
    const side = msg.side
    const shrinkW = shrinkWidths[i]!
    return `
      <div class="row row--${side}">
        <div class="bubble-pair">
          <div class="bubble bubble--css bubble--${side}">${msg.text}</div>
          <div class="bubble bubble--shrink bubble--${side}" style="width:${shrinkW}px">${msg.text}</div>
        </div>
      </div>`
  }).join('')

  // 無駄ピクセル計算
  let totalWasted = 0
  MESSAGES.forEach((_, i) => {
    totalWasted += bubbleMaxWidth - shrinkWidths[i]!
  })

  statsEl.innerHTML = `
    <div class="stat">
      <div class="stat-label">バブル数</div>
      <div class="stat-value">${MESSAGES.length}</div>
    </div>
    <div class="stat">
      <div class="stat-label">layout 合計</div>
      <div class="stat-value">${layoutMs.toFixed(2)}<span class="stat-unit">ms</span></div>
    </div>
    <div class="stat">
      <div class="stat-label">節約ピクセル合計</div>
      <div class="stat-value">${totalWasted}<span class="stat-unit">px</span></div>
    </div>
  `
}

widthSlider.addEventListener('input', render)
document.fonts.ready.then(render)
render()
