import { HEIGHT, WIDTH, createPattern } from '@/lib/pattern'

export default function Thumbnail({ seed }: { seed: string }) {
  const { hue, dir, layers } = createPattern(seed)

  return (
    <div className="thumb" style={{ ['--hue' as string]: hue, ['--dir' as string]: dir }} aria-hidden="true">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        {layers.map((layer, index) => (
          <g key={layer.key} className={`w w${index}`}>
            <path className="w__fill" d={layer.fill} />
            <path className="w__line" d={layer.line} />
          </g>
        ))}
      </svg>
    </div>
  )
}
