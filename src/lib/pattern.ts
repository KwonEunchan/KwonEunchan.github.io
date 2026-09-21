export const WIDTH = 160
export const HEIGHT = 120

export interface WaveLayer {
  key: string
  /** 파도 아래를 채우는 면 */
  fill: string
  /** 파도 윗선 */
  line: string
}

export interface Pattern {
  hue: number
  /** 층이 깊어질 때 색상이 움직이는 방향. 주황 계열은 노랑 쪽(탁한 색)으로 가지 않게 반대로 민다 */
  dir: 1 | -1
  layers: WaveLayer[]
}

const LAYERS = 5
const SAMPLES = 16
const MARGIN = 12
// 어울리는 색만 골라 쓴다 (노랑~연두 대역은 탁해 보여서 뺐다)
const HUES = [352, 8, 22, 150, 170, 188, 205, 222, 240, 258, 276, 296, 318, 336]

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h ^= h >>> 16
  h = Math.imul(h, 2246822507)
  h ^= h >>> 13
  h = Math.imul(h, 3266489909)
  h ^= h >>> 16
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const n = (value: number) => value.toFixed(1)

/** 점들을 부드러운 3차 베지어 곡선으로 잇는다 (Catmull-Rom) */
function smoothPath(points: Array<[number, number]>): string {
  let d = `M${n(points[0][0])} ${n(points[0][1])}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(p2[0])} ${n(p2[1])}`
  }
  return d
}

/**
 * 같은 seed에는 항상 같은 파장이 나온다. 서버와 브라우저의 결과가 어긋나지 않고,
 * 글을 고쳐도 모양이 바뀌지 않는다.
 * 겹겹의 파도는 위상이 조금씩 밀려서 하나의 물결처럼 이어져 보인다.
 */
export function createPattern(seed: string): Pattern {
  const rand = mulberry32(hashSeed(seed))
  const hue = (HUES[Math.floor(rand() * HUES.length)] + Math.floor(rand() * 13) - 6 + 360) % 360

  const flow = 0.8 + rand() * 0.9 // 전체 물결의 촘촘함
  const phase = rand() * Math.PI * 2
  const drift = 0.45 + rand() * 0.4 // 층마다 밀리는 정도
  const swell = 7 + rand() * 6 // 기본 높낮이

  const layers: WaveLayer[] = []
  for (let layer = 0; layer < LAYERS; layer += 1) {
    const base = 32 + layer * 17 + (rand() * 4 - 2)
    const a1 = swell * (0.8 + rand() * 0.5)
    const f1 = flow * (0.9 + rand() * 0.25)
    const p1 = phase + layer * drift + (rand() * 0.3 - 0.15)
    const a2 = a1 * (0.25 + rand() * 0.2)
    const f2 = f1 * (2 + rand() * 0.8)
    const p2 = rand() * Math.PI * 2

    const points: Array<[number, number]> = []
    for (let i = 0; i <= SAMPLES; i += 1) {
      const x = -MARGIN + ((WIDTH + MARGIN * 2) * i) / SAMPLES
      const t = x / WIDTH
      const y =
        base + a1 * Math.sin(Math.PI * 2 * f1 * t + p1) + a2 * Math.sin(Math.PI * 2 * f2 * t + p2)
      points.push([x, y])
    }

    const ridge = smoothPath(points)
    const last = points[points.length - 1]
    const first = points[0]
    layers.push({
      key: `w${layer}`,
      fill: `${ridge}L${n(last[0])} ${HEIGHT + 4}L${n(first[0])} ${HEIGHT + 4}Z`,
      line: ridge,
    })
  }
  return { hue, dir: hue < 75 ? -1 : 1, layers }
}
