import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

export default function ReminderBanner({ habits, log, settings, onCheckIn }) {
  const [dismissed, setDismissed] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const today     = new Date()
    const todayKey  = today.toISOString().slice(0, 10)
    const dayLog    = log[todayKey] || {}
    const remaining = habits.filter(h => !dayLog[h.id]).length
    const hour      = today.getHours()
    const [rh]      = (settings.reminderTime || '21:00').split(':').map(Number)
    const isEvening = hour >= rh

    const lastDismiss = sessionStorage.getItem('banner_dismissed_day')
    if (lastDismiss === todayKey) { setShow(false); return }

    setShow(remaining > 0 && isEvening && settings.reminderEnabled && !dismissed)
  }, [habits, log, settings, dismissed])

  const handleDismiss = () => {
    const todayKey = new Date().toISOString().slice(0, 10)
    sessionStorage.setItem('banner_dismissed_day', todayKey)
    setDismissed(true)
    setShow(false)
  }

  if (!show) return null

  const today    = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const dayLog   = log[todayKey] || {}
  const remaining = habits.filter(h => !dayLog[h.id]).length

  return (
    <div style={styles.banner} className="animate-slideUp" role="alert">
      <Bell size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
      <div style={styles.text}>
        <strong style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>
          {remaining} habit{remaining > 1 ? 's' : ''} left today
        </strong>
        <span style={{ fontSize: 11, color: 'var(--accent-text)', opacity: 0.8 }}>
          Evening check-in reminder
        </span>
      </div>
      <button style={styles.cta} onClick={onCheckIn}>Check in</button>
      <button style={styles.close} onClick={handleDismiss} aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  )
}

const styles = {
  banner: {
    margin: '0 12px 12px',
    background: 'var(--accent-bg)',
    border: '0.5px solid var(--purple-200, #AFA9EC)',
    borderRadius: 12, padding: '10px 12px',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  text: { flex: 1, color: 'var(--accent-text)' },
  cta: {
    fontSize: 12, color: 'var(--accent)', fontWeight: 500,
    padding: '5px 11px',
    border: '0.5px solid var(--accent)',
    borderRadius: 7, background: 'var(--surface)',
    cursor: 'pointer', whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  close: {
    color: 'var(--accent)', background: 'none', border: 'none',
    cursor: 'pointer', padding: 2, flexShrink: 0,
    display: 'flex', alignItems: 'center',
  },
}
