'use client'

import { TEMPLATES, type PostTemplate } from '@/lib/templates'
import { cx } from '@/lib/utils'

interface Props {
  current?: string
  onPick: (template: PostTemplate) => void
  onBlank?: () => void
}

export default function TemplatePicker({ current, onPick, onBlank }: Props) {
  return (
    <div className="picker">
      <ul className="picker__list">
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={cx('picker__card', current === t.id && 'is-active')}
              onClick={() => onPick(t)}
            >
              <span className="picker__name">{t.name}</span>
              <span className="picker__summary">{t.summary}</span>
              <ol className="picker__sections">
                {t.sections.map((s) => (
                  <li key={s.heading}>{s.heading}</li>
                ))}
              </ol>
            </button>
          </li>
        ))}
      </ul>
      {onBlank && (
        <button type="button" className="text-link picker__blank" onClick={onBlank}>
          빈 문서
        </button>
      )}
    </div>
  )
}
