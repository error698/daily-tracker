import { useMemo } from 'react'
import { HABIT_ICONS } from '../hooks/useHabits'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const iconMap = Object.fromEntries(HABIT_ICONS.map(i => [i.id, i]))

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth() &&
         a.getDate()     === b.getDate()
}

export default function CalendarGrid({
  year, month, habits, getDayCompletion, colorMap, selectedDate, onSelectDate
}) {
  const today = new Date()

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(new Date(year, month, d))
    return result
  }, [year, month])

  return (
    <div style={styles.wrapper}>
      {/* Day labels */}
      <div style={{ ...styles.grid, gridTemplateRows: `auto repeat(${Math.ceil(cells.length / 7)}, 1fr)` }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={styles.dayLabel}>{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />

          const isFuture   = date > today && !isSameDay(date, today)
          const isToday    = isSameDay(date, today)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const { done, total, pct } = getDayCompletion(date)
          const isPerfect  = total > 0 && pct === 100

          const dotHabits  = habits.slice(0, 4)

          return (
            <button
              key={date.getDate()}
              onClick={() => !isFuture && onSelectDate(date)}
              aria-label={`${date.toDateString()}, ${done} of ${total} habits done`}
              style={{
                ...styles.cell,
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.55 : 1,
                background: isSelected
                  ? 'var(--accent-bg)'
                  : isToday
                  ? 'var(--surface-2)'
                  : 'var(--surface)',
                outline: isToday
                  ? '1.5px solid #FA6E4F'
                  : isSelected
                  ? '2px solid var(--accent)'
                  : '1px solid var(--border)',
              }}
            >
              <div style={styles.dateNumWrap}>
                <span style={{
                  ...styles.dateNum,
                  color: isToday ? '#FA6E4F' : (isSelected ? 'var(--accent)' : 'var(--text-2)'),
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {date.getDate()}
                </span>
                {/* Completion ring for perfect days */}
                {isPerfect && (
                  <div style={styles.perfectRing} />
                )}
              </div>

              <div style={styles.dotsWrap}>
                {total > 0 && !isFuture && (
                  <div style={styles.dots}>
                    {dotHabits.map(h => {
                      const c = colorMap[h.colorId]
                      const log = done > 0
                      const dayLog = {}
                      return (
                        <DotForHabit
                          key={h.id}
                          habitId={h.id}
                          color={c}
                          date={date}
                          getDayCompletion={getDayCompletion}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DotForHabit({ habitId, color, date, getDayCompletion }) {
  return null
}

export function CalendarGridWithLog({
  year, month, habits, log, colorMap, selectedDate, onSelectDate, getDayCompletion
}) {
  const today = new Date()

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const result = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(new Date(year, month, d))
    return result
  }, [year, month])

  const dateKey = d => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.grid, gridTemplateRows: `auto repeat(${Math.ceil(cells.length / 7)}, 1fr)` }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={styles.dayLabel}>{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />

          const isFuture   = date > today && !isSameDay(date, today)
          const isToday    = isSameDay(date, today)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const dayLog     = log[dateKey(date)] || {}
          const dotHabits  = habits.slice(0, 4)

          return (
            <button
              key={date.getDate()}
              onClick={() => !isFuture && onSelectDate(date)}
              aria-label={date.toDateString()}
              style={{
                ...styles.cell,
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.55 : 1,
                background: isSelected
                  ? 'var(--accent-bg)'
                  : isToday
                  ? 'var(--surface-2)'
                  : 'var(--surface)',
                outline: isSelected
                  ? '2px solid var(--accent)'
                  : isToday
                  ? '1.5px solid #FA6E4F'
                  : '1px solid var(--border)',
              }}
            >
              <div style={styles.dateNumWrap}>
                <span style={{
                  ...styles.dateNum,
                  color: isToday ? '#FA6E4F' : (isSelected ? 'var(--accent)' : 'var(--text-2)'),
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {date.getDate()}
                </span>
              </div>

              <div style={styles.dotsWrap}>
                {habits.length > 0 && !isFuture && (
                  <div style={styles.dots}>
                    {dotHabits.map(h => {
                      const done = dayLog[h.id]
                      const iconDef = iconMap[h.icon] || { emoji: '●' }
                      const color = colorMap[h.colorId]
                      return (
                        <span
                          key={h.id}
                          style={{
                            fontSize: 13,
                            opacity: done ? 1 : 0.15,
                            filter: done ? 'none' : 'grayscale(100%)',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: done ? color?.bg : 'transparent',
                            outline: done ? `1.5px solid ${color?.fill}` : 'none',
                            flexShrink: 0,
                          }}
                        >
                          {iconDef.emoji}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  wrapper: { padding: '0 12px 12px', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 6,
    flex: 1,
  },
  dayLabel: {
    fontSize: 11, color: 'var(--text-3)',
    textAlign: 'center', padding: '4px 0 8px',
    fontWeight: 500, letterSpacing: '0.05em',
  },
  cell: {
    borderRadius: 8, padding: '4px',
    display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    justifyContent: 'space-between',
    border: 'none',
    transition: 'background 0.12s, outline 0.12s',
    position: 'relative',
    height: '100%',
  },
  dateNumWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dotsWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 20,
  },
  dateNum: { fontSize: 22, lineHeight: 1 },
  dots: {
    display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 44,
  },
  perfectRing: {
    position: 'absolute', top: 4, right: 4,
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--accent)',
  },
}
