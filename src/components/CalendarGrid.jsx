import { useMemo } from 'react'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

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
      <div style={styles.grid}>
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
                opacity: isFuture ? 0.35 : 1,
                background: isSelected
                  ? 'var(--accent-bg)'
                  : isToday
                  ? 'var(--surface-2)'
                  : 'var(--surface)',
                outline: isToday
                  ? '1.5px solid var(--accent)'
                  : isSelected
                  ? '2px solid var(--accent)'
                  : '0.5px solid var(--border)',
              }}
            >
              <span style={{
                ...styles.dateNum,
                color: isToday || isSelected ? 'var(--accent)' : 'var(--text-2)',
                fontWeight: isToday ? 500 : 400,
              }}>
                {date.getDate()}
              </span>

              {/* Completion ring for perfect days */}
              {isPerfect && (
                <div style={styles.perfectRing} />
              )}

              {/* Dots */}
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

  const dateKey = d => d.toISOString().slice(0, 10)

  return (
    <div style={styles.wrapper}>
      <div style={styles.grid}>
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
                opacity: isFuture ? 0.3 : 1,
                background: isSelected
                  ? 'var(--accent-bg)'
                  : isToday
                  ? 'var(--surface-2)'
                  : 'var(--surface)',
                outline: isSelected
                  ? '2px solid var(--accent)'
                  : isToday
                  ? '1.5px solid var(--accent)'
                  : '0.5px solid var(--border)',
              }}
            >
              <span style={{
                ...styles.dateNum,
                color: isToday || isSelected ? 'var(--accent)' : 'var(--text-2)',
                fontWeight: isToday ? 500 : 400,
              }}>
                {date.getDate()}
              </span>

              {habits.length > 0 && !isFuture && (
                <div style={styles.dots}>
                  {dotHabits.map(h => {
                    const c   = colorMap[h.colorId]
                    const done = dayLog[h.id]
                    return (
                      <span
                        key={h.id}
                        style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: c?.fill || '#888',
                          opacity: done ? 1 : 0.2,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  wrapper: { padding: '0 12px 4px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 4,
  },
  dayLabel: {
    fontSize: 10, color: 'var(--text-3)',
    textAlign: 'center', padding: '4px 0 6px',
    fontWeight: 500, letterSpacing: '0.05em',
  },
  cell: {
    borderRadius: 8, padding: '5px 3px 5px',
    minHeight: 50, display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    gap: 3, border: 'none',
    transition: 'background 0.12s, outline 0.12s',
    position: 'relative',
  },
  dateNum: { fontSize: 11, lineHeight: 1 },
  dots: { display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 28 },
  perfectRing: {
    position: 'absolute', top: 3, right: 3,
    width: 6, height: 6, borderRadius: '50%',
    background: 'var(--accent)',
  },
}
