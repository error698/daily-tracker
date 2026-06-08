import { useState, useEffect } from 'react'
import { X, ChevronLeft, Check } from 'lucide-react'

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate()
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

let confettiTimeout = null

export default function DailySheet({
  date, habits, log, colorMap, iconMap,
  onToggle, onClose
}) {
  const [prevPct, setPrevPct] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const today    = new Date()
  const isPast   = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isToday  = isSameDay(date, today)
  const dateKey  = date.toISOString().slice(0, 10)
  const dayLog   = log[dateKey] || {}

  const done  = habits.filter(h => dayLog[h.id]).length
  const total = habits.length
  const pct   = total ? Math.round(done / total * 100) : 0

  useEffect(() => {
    if (pct === 100 && prevPct < 100 && total > 0) {
      setShowConfetti(true)
      clearTimeout(confettiTimeout)
      confettiTimeout = setTimeout(() => setShowConfetti(false), 2000)
    }
    setPrevPct(pct)
  }, [pct])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 40,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div
        style={styles.sheet}
        className="animate-slideUp"
      >
        {/* Header */}
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <ChevronLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <p style={styles.dateLabel}>{formatDate(date)}</p>
            {isToday && <p style={styles.todayBadge}>Today</p>}
            {isPast  && <p style={styles.pastBadge}>Past day</p>}
          </div>
          <span style={styles.pctText}>{pct}%</span>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: `${pct}%`,
            background: pct === 100 ? '#1D9E75' : 'var(--accent)',
          }} />
        </div>
        <p style={styles.progressSub}>{done} of {total} habits done</p>

        {/* Confetti */}
        {showConfetti && (
          <div style={styles.confettiWrap} aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{
                ...styles.confettiPiece,
                left: `${(i * 8.5) % 100}%`,
                background: ['#534AB7','#1D9E75','#D85A30','#D4537E','#BA7517'][i % 5],
                animationDelay: `${i * 0.07}s`,
                width:  `${6 + (i % 3) * 2}px`,
                height: `${6 + (i % 4) * 2}px`,
                borderRadius: i % 2 ? '50%' : 2,
              }} />
            ))}
          </div>
        )}

        {/* Habit rows */}
        <div style={styles.habitList}>
          {habits.length === 0 && (
            <p style={{ color: 'var(--text-3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
              No habits yet. Add some in Settings.
            </p>
          )}
          {habits.map((h, i) => {
            const color   = colorMap[h.colorId]
            const icon    = iconMap[h.id] || iconMap[h.icon]
            const checked = !!dayLog[h.id]
            const iconDef = Object.values(iconMap).find(ic => ic.id === h.icon) || { emoji: '●' }

            return (
              <button
                key={h.id}
                onClick={() => onToggle(h.id, date)}
                style={{
                  ...styles.habitRow,
                  animationDelay: `${i * 0.05}s`,
                }}
                className="animate-fadeIn"
                aria-pressed={checked}
              >
                <div style={{
                  ...styles.habitIconWrap,
                  background: color?.bg || '#f0f0f0',
                }}>
                  <span style={{ fontSize: 18 }}>{iconDef.emoji}</span>
                </div>
                <div style={styles.habitInfo}>
                  <p style={{
                    ...styles.habitName,
                    textDecoration: checked ? 'line-through' : 'none',
                    color: checked ? 'var(--text-3)' : 'var(--text)',
                  }}>{h.name}</p>
                  <p style={styles.habitSub}>{h.timeSlot}</p>
                </div>
                <div style={{
                  ...styles.checkCircle,
                  background: checked ? (color?.fill || 'var(--accent)') : 'transparent',
                  border: `1.5px solid ${checked ? (color?.fill || 'var(--accent)') : 'var(--border-2)'}`,
                  animation: checked ? 'checkPop 0.3s ease' : 'none',
                }}>
                  {checked && <Check size={13} color="#fff" strokeWidth={3} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

const styles = {
  sheet: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    bottom: 0,
    background: 'var(--surface)',
    borderRadius: '20px 20px 0 0',
    border: '0.5px solid var(--border)',
    borderBottom: 'none',
    zIndex: 50,
    maxHeight: '80dvh',
    overflowY: 'auto',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '16px 16px 10px',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--surface-2)',
    border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-2)', flexShrink: 0,
    marginTop: 2,
  },
  dateLabel: { fontSize: 16, fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 },
  todayBadge: { fontSize: 11, color: 'var(--accent)', marginTop: 3, fontWeight: 500 },
  pastBadge:  { fontSize: 11, color: 'var(--text-3)', marginTop: 3 },
  pctText: { fontSize: 22, fontWeight: 500, color: 'var(--accent)', fontFamily: 'var(--font-display)' },
  progressTrack: { height: 3, background: 'var(--surface-2)', margin: '0 16px' },
  progressFill:  { height: '100%', borderRadius: 2, transition: 'width 0.4s ease, background 0.3s' },
  progressSub:   { fontSize: 11, color: 'var(--text-3)', padding: '4px 16px 12px', textAlign: 'right' },
  habitList:  { padding: '0 16px 24px' },
  habitRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '11px 0',
    background: 'none', border: 'none',
    borderBottom: '0.5px solid var(--border)',
    cursor: 'pointer', textAlign: 'left',
  },
  habitIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  habitInfo: { flex: 1, minWidth: 0 },
  habitName: { fontSize: 14, lineHeight: 1.3, transition: 'color 0.2s, text-decoration 0.2s' },
  habitSub:  { fontSize: 11, color: 'var(--text-3)', marginTop: 2 },
  checkCircle: {
    width: 28, height: 28, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.2s, border-color 0.2s',
  },
  confettiWrap: {
    position: 'relative', height: 0, overflow: 'visible',
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute', top: -8,
    animation: 'confettiFall 1.2s ease-in forwards',
  },
}
