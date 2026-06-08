import { useState } from 'react'
import { HABIT_COLORS, HABIT_ICONS, TIME_SLOTS } from '../hooks/useHabits'

const STEPS = ['Welcome', 'First habit', 'Reminder']

export default function Onboarding({ onComplete, addHabit, updateSettings }) {
  const [step, setStep]       = useState(0)
  const [name, setName]       = useState('')
  const [iconId, setIconId]   = useState(HABIT_ICONS[0].id)
  const [colorId, setColorId] = useState(HABIT_COLORS[0].id)
  const [timeSlot, setTimeSlot] = useState('Any time')
  const [reminderTime, setReminderTime] = useState('21:00')
  const [reminderOn, setReminderOn]     = useState(true)

  const nextStep = () => setStep(s => s + 1)

  const handleAddHabit = () => {
    if (!name.trim()) return
    addHabit({ name: name.trim(), icon: iconId, colorId, timeSlot })
    nextStep()
  }

  const handleFinish = () => {
    updateSettings({ reminderEnabled: reminderOn, reminderTime })
    onComplete()
  }

  const color = HABIT_COLORS.find(c => c.id === colorId)

  return (
    <div style={styles.overlay}>
      <div style={styles.card} className="animate-scaleIn">
        {/* Progress */}
        <div style={styles.progressTrack}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              ...styles.progressSeg,
              background: i <= step ? 'var(--accent)' : 'var(--border-2)',
            }} />
          ))}
        </div>
        <p style={styles.stepLabel}>{STEPS[step]}</p>

        {step === 0 && (
          <div className="animate-fadeIn" style={styles.content}>
            <div style={styles.logoMark}>
              <span style={{ fontSize: 36 }}>✦</span>
            </div>
            <h1 style={styles.displayTitle}>Build habits<br /><em>that stick.</em></h1>
            <p style={styles.sub}>Track daily habits on a calendar, see your streaks, and get reminded every evening.</p>
            <button style={styles.primaryBtn} onClick={nextStep}>
              Get started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeIn" style={styles.content}>
            <h2 style={styles.title}>Your first habit</h2>
            <p style={styles.sub}>You can add more later.</p>

            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              placeholder="e.g. Morning run"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleAddHabit()}
              autoFocus
            />

            <label style={styles.label}>Icon</label>
            <div style={styles.iconGrid}>
              {HABIT_ICONS.map(ic => (
                <button
                  key={ic.id}
                  onClick={() => setIconId(ic.id)}
                  style={{
                    ...styles.iconBtn,
                    background: iconId === ic.id ? color.bg : 'var(--surface-2)',
                    outline: iconId === ic.id ? `2px solid ${color.fill}` : '2px solid transparent',
                  }}
                  title={ic.label}
                >
                  <span style={{ fontSize: 20 }}>{ic.emoji}</span>
                </button>
              ))}
            </div>

            <label style={styles.label}>Color</label>
            <div style={styles.colorRow}>
              {HABIT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  style={{
                    ...styles.colorSwatch,
                    background: c.fill,
                    outline: colorId === c.id ? `3px solid ${c.fill}` : '3px solid transparent',
                    outlineOffset: 3,
                  }}
                  title={c.label}
                />
              ))}
            </div>

            <label style={styles.label}>Best time</label>
            <select style={styles.select} value={timeSlot} onChange={e => setTimeSlot(e.target.value)}>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <button
              style={{ ...styles.primaryBtn, opacity: name.trim() ? 1 : 0.4 }}
              onClick={handleAddHabit}
              disabled={!name.trim()}
            >
              Add habit →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn" style={styles.content}>
            <h2 style={styles.title}>Evening reminder</h2>
            <p style={styles.sub}>Get nudged if you haven't checked in by the evening.</p>

            <div style={styles.toggleRow}>
              <span style={{ fontSize: 14, color: 'var(--text-2)' }}>Enable reminder</span>
              <button
                onClick={() => setReminderOn(o => !o)}
                style={{
                  ...styles.toggle,
                  background: reminderOn ? 'var(--accent)' : 'var(--border-2)',
                }}
              >
                <div style={{
                  ...styles.toggleThumb,
                  transform: reminderOn ? 'translateX(16px)' : 'translateX(0)',
                }} />
              </button>
            </div>

            {reminderOn && (
              <div className="animate-fadeIn">
                <label style={styles.label}>Reminder time</label>
                <input
                  type="time"
                  style={styles.input}
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                />
              </div>
            )}

            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.5 }}>
              Reminders show as in-app banners. Browser notifications require permission — you can grant it later in Settings.
            </p>

            <button style={{ ...styles.primaryBtn, marginTop: 24 }} onClick={handleFinish}>
              Start tracking ✦
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 100,
  },
  card: {
    background: 'var(--surface)',
    borderRadius: 24,
    border: '0.5px solid var(--border)',
    padding: '28px 28px 32px',
    width: '100%', maxWidth: 420,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  },
  progressTrack: { display: 'flex', gap: 6, marginBottom: 6 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2, transition: 'background 0.3s' },
  stepLabel: { fontSize: 11, color: 'var(--text-3)', marginBottom: 24, letterSpacing: '0.04em' },
  content: { display: 'flex', flexDirection: 'column' },
  logoMark: { fontSize: 36, color: 'var(--accent)', marginBottom: 16 },
  displayTitle: {
    fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 400,
    lineHeight: 1.15, marginBottom: 12, color: 'var(--text)',
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400,
    marginBottom: 6, color: 'var(--text)',
  },
  sub: { fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 },
  label: { fontSize: 12, color: 'var(--text-3)', marginBottom: 6, letterSpacing: '0.03em' },
  input: {
    width: '100%', padding: '10px 14px',
    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
    borderRadius: 10, fontSize: 14, color: 'var(--text)',
    marginBottom: 18, outline: 'none',
    transition: 'border-color 0.15s',
  },
  select: {
    width: '100%', padding: '10px 14px',
    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
    borderRadius: 10, fontSize: 14, color: 'var(--text)',
    marginBottom: 24, outline: 'none', appearance: 'none',
    cursor: 'pointer',
  },
  iconGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  iconBtn: {
    width: 42, height: 42, borderRadius: 10, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  colorRow: { display: 'flex', gap: 10, marginBottom: 18 },
  colorSwatch: {
    width: 26, height: 26, borderRadius: '50%', border: 'none',
    cursor: 'pointer', transition: 'outline-offset 0.15s',
  },
  primaryBtn: {
    padding: '12px 20px', background: 'var(--accent)', color: '#fff',
    borderRadius: 12, fontSize: 15, fontWeight: 500,
    border: 'none', cursor: 'pointer', marginTop: 8,
    transition: 'opacity 0.15s, transform 0.1s',
  },
  toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  toggle: {
    width: 40, height: 24, borderRadius: 12, border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
    padding: 0,
  },
  toggleThumb: {
    width: 18, height: 18, borderRadius: '50%', background: '#fff',
    position: 'absolute', top: 3, left: 3,
    transition: 'transform 0.2s', pointerEvents: 'none',
  },
}
