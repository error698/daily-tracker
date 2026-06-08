import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Settings as SettingsIcon, Check } from 'lucide-react'
import { useHabits } from './hooks/useHabits'
import { CalendarGridWithLog } from './components/CalendarGrid'
import DailySheet from './components/DailySheet'
import Onboarding from './components/Onboarding'
import SettingsScreen from './components/Settings'
import ReminderBanner from './components/ReminderBanner'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const MOTIVATIONAL_QUOTES = [
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "It is not what we do once in a while that shapes our lives. It's what we do consistently.", author: "Tony Robbins" }
]

export default function App() {
  const {
    habits, log, settings,
    addHabit, updateHabit, deleteHabit, reorderHabits,
    toggleComplete, getStreak, getBestStreak, getMonthStats,
    updateSettings,
    colorMap, iconMap,
    getDayCompletion,
  } = useHabits()

  const todayLocalKey = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  const [welcomeQuote] = useState(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
    return MOTIVATIONAL_QUOTES[idx]
  })
  const [showWelcome, setShowWelcome] = useState(() => habits.length > 0)

  useEffect(() => {
    const theme = settings?.theme || 'system'
    const root = document.documentElement

    const applyTheme = () => {
      let isDark = false
      if (theme === 'dark') {
        isDark = true
      } else if (theme === 'light') {
        isDark = false
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }

      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme()

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme()
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [settings?.theme])

  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  const [screen, setScreen]       = useState(habits.length === 0 ? 'onboard' : 'dashboard')

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0);  setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const streak      = getStreak()
  const bestStreak  = getBestStreak()
  const monthStats  = getMonthStats(viewYear, viewMonth)

  const weeklyProgress = useMemo(() => {
    const today = new Date()
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const { pct } = getDayCompletion(d)
      result.push({
        date: d,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2), // 'Mo', 'Tu', etc.
        pct: pct || 0
      })
    }
    return result
  }, [getDayCompletion, habits, log])

  if (screen === 'onboard') {
    return (
      <Onboarding
        onComplete={() => setScreen('dashboard')}
        addHabit={addHabit}
        updateSettings={updateSettings}
      />
    )
  }

  if (screen === 'settings') {
    return (
      <div className="app-container">
        <div className="settings-container">
          <SettingsScreen
            habits={habits}
            settings={settings}
            colorMap={colorMap}
            iconMap={iconMap}
            onBack={() => setScreen('dashboard')}
            updateSettings={updateSettings}
            addHabit={addHabit}
            updateHabit={updateHabit}
            deleteHabit={deleteHabit}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <div className="sidebar-panel">
        {/* Top bar */}
        <header style={styles.topBar}>
          <div style={styles.monthNav}>
            <button onClick={prevMonth} style={styles.navBtn} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <h1 style={styles.monthTitle}>
              {MONTH_NAMES[viewMonth]} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{viewYear}</span>
            </h1>
            <button onClick={nextMonth} style={styles.navBtn} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={() => setScreen('settings')}
            style={styles.settingsBtn}
            aria-label="Settings"
          >
            <SettingsIcon size={17} />
          </button>
        </header>

        {/* Reminder banner */}
        <ReminderBanner
          habits={habits}
          log={log}
          settings={settings}
          onCheckIn={() => setSelectedDate(new Date())}
        />

        {/* Stats strip */}
        <div style={styles.statsStrip}>
          <Stat label="Streak" value={`${streak}d`} accent />
          <div style={styles.statDivider} />
          <Stat label="Best" value={`${bestStreak}d`} />
          <div style={styles.statDivider} />
          <Stat label="Month" value={`${monthStats.avgPct}%`} />
          <div style={styles.statDivider} />
          <Stat label="Perfect days" value={monthStats.perfectDays} />
        </div>

        {/* Habit legend */}
        {habits.length > 0 && (
          <div style={styles.legend}>
            {habits.map(h => {
              const c = colorMap[h.colorId]
              const iconDef = Object.values(iconMap).find(ic => ic.id === h.icon) || { emoji: '●' }
              return (
                <div key={h.id} style={styles.legendItem}>
                  <span style={{ ...styles.legendDot, background: c?.fill }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{iconDef.emoji} {h.name}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Weekly Progress Section */}
        {habits.length > 0 && (
          <div style={styles.progressSection}>
            <p style={styles.sectionTitle}>Weekly Progress</p>
            <div style={styles.graphContainer}>
              {weeklyProgress.map((day, idx) => (
                <div key={idx} style={styles.graphColumn}>
                  <div style={styles.barTrack}>
                    <div style={{
                      ...styles.barFill,
                      height: `${day.pct}%`,
                      background: day.pct === 100 ? '#1D9E75' : 'var(--accent)',
                    }} title={`${day.pct}% completed`} />
                  </div>
                  <span style={styles.graphLabel}>{day.dayLabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Habits Check-in List */}
        {habits.length > 0 && (
          <div style={styles.checkinSection}>
            <p style={styles.sectionTitle}>Today's Habits</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {habits.map(h => {
                const color   = colorMap[h.colorId]
                const iconDef = Object.values(iconMap).find(ic => ic.id === h.icon) || { emoji: '●' }
                const isDone  = !!(log[todayLocalKey] || {})[h.id]

                return (
                  <button
                    key={h.id}
                    onClick={() => toggleComplete(h.id, new Date())}
                    style={styles.checkinRow}
                    aria-pressed={isDone}
                  >
                    <div style={{ ...styles.checkinDot, background: color?.bg }}>
                      <span style={{ fontSize: 14 }}>{iconDef.emoji}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span style={{
                        ...styles.checkinLabel,
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? 'var(--text-3)' : 'var(--text)',
                      }}>
                        {h.name}
                      </span>
                      <span style={styles.checkinSub}>{h.timeSlot}</span>
                    </div>
                    <div style={{
                      ...styles.checkinBox,
                      background: isDone ? (color?.fill || 'var(--accent)') : 'transparent',
                      border: `1.5px solid ${isDone ? (color?.fill || 'var(--accent)') : 'var(--border-2)'}`,
                    }}>
                      {isDone && <Check size={10} color="#fff" strokeWidth={3} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Calendar Panel */}
      <div className="main-panel">
        {/* Calendar */}
        <div style={styles.calendarWrap}>
          <CalendarGridWithLog
            year={viewYear}
            month={viewMonth}
            habits={habits}
            log={log}
            colorMap={colorMap}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            getDayCompletion={getDayCompletion}
          />
        </div>

        {/* Empty state */}
        {habits.length === 0 && (
          <div style={styles.emptyState}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-2)', marginBottom: 8 }}>
              No habits yet
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 20 }}>
              Add your first habit in Settings to start tracking.
            </p>
            <button style={styles.addHabitBtn} onClick={() => setScreen('settings')}>
              Go to Settings
            </button>
          </div>
        )}
      </div>

      {/* Daily sheet */}
      {selectedDate && (
        <DailySheet
          date={selectedDate}
          habits={habits}
          log={log}
          colorMap={colorMap}
          iconMap={iconMap}
          onToggle={toggleComplete}
          onClose={() => setSelectedDate(null)}
        />
      )}
      {/* Welcome Splash Screen */}
      {showWelcome && (
        <div style={styles.welcomeOverlay}>
          <div style={styles.welcomeCard} className="animate-scaleIn">
            <div style={styles.welcomeEmoji}>✦</div>
            <h2 style={styles.welcomeTitle}>Welcome back!</h2>
            <p style={styles.welcomeSubtitle}>Here's your daily push to keep going:</p>
            
            <div style={styles.quoteBox}>
              <p style={styles.quoteText}>“{welcomeQuote.text}”</p>
              <p style={styles.quoteAuthor}>— {welcomeQuote.author}</p>
            </div>

            <button style={styles.welcomeBtn} onClick={() => setShowWelcome(false)}>
              Let's track habits 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3, letterSpacing: '0.03em' }}>{label}</p>
      <p style={{
        fontSize: 18, fontWeight: 500,
        fontFamily: 'var(--font-display)',
        color: accent ? 'var(--accent)' : 'var(--text)',
      }}>{value}</p>
    </div>
  )
}

const styles = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--surface)',
    position: 'relative',
  },
  topBar: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 16px 12px',
    borderBottom: '0.5px solid var(--border)',
  },
  monthNav: { display: 'flex', alignItems: 'center', gap: 8 },
  monthTitle: {
    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400,
    color: 'var(--text)', minWidth: 170, textAlign: 'center',
  },
  navBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-2)',
  },
  settingsBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-2)',
  },
  calendarWrap: { flex: 1, paddingTop: 8, display: 'flex', flexDirection: 'column' },
  legend: {
    display: 'flex', flexWrap: 'wrap', gap: '6px 14px',
    padding: '8px 16px 4px',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  statsStrip: {
    display: 'flex', alignItems: 'center',
    padding: '14px 16px',
    borderTop: '0.5px solid var(--border)',
    background: 'var(--surface)',
  },
  statDivider: {
    width: 1, height: 28,
    background: 'var(--border)',
    margin: '0 4px',
  },
  emptyState: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', textAlign: 'center',
  },
  addHabitBtn: {
    padding: '10px 20px',
    background: 'var(--accent)', color: '#fff',
    borderRadius: 10, fontSize: 14, fontWeight: 500,
    border: 'none', cursor: 'pointer',
  },
  progressSection: {
    padding: '24px 16px',
    borderTop: '0.5px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 10,
    color: 'var(--text-3)',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    fontWeight: 500,
    marginBottom: 4,
  },
  graphContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    background: 'var(--surface-2)',
    borderRadius: 12,
    padding: '16px 12px 10px',
    height: 130,
  },
  graphColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    gap: 8,
  },
  barTrack: {
    width: 12,
    height: 80,
    background: 'var(--graph-track)',
    borderRadius: 6,
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  graphLabel: {
    fontSize: 10,
    color: 'var(--text-3)',
    fontWeight: 500,
  },
  checkinSection: {
    padding: '16px 16px 24px',
    borderTop: '0.5px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flex: 1,
    overflowY: 'auto',
  },
  checkinRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    background: 'var(--surface-2)',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s, transform 0.1s',
  },
  checkinDot: {
    width: 28,
    height: 28,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkinLabel: {
    fontSize: 13,
    color: 'var(--text)',
    flex: 1,
    fontWeight: 500,
    lineHeight: 1.2,
    transition: 'all 0.15s',
  },
  checkinSub: {
    fontSize: 10,
    color: 'var(--text-3)',
    marginTop: 2,
  },
  checkinBox: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  welcomeOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    animation: 'fadeIn 0.25s ease',
  },
  welcomeCard: {
    background: 'var(--surface)',
    borderRadius: 24,
    border: '0.5px solid var(--border)',
    padding: '36px 28px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 42,
    color: 'var(--accent)',
    marginBottom: 16,
    animation: 'pulse 2s infinite',
  },
  welcomeTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 400,
    color: 'var(--text)',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'var(--text-3)',
    marginBottom: 24,
  },
  quoteBox: {
    background: 'var(--surface-2)',
    borderRadius: 16,
    padding: '20px 24px',
    marginBottom: 28,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 1.5,
    color: 'var(--text)',
  },
  quoteAuthor: {
    fontSize: 12,
    color: 'var(--text-3)',
    fontWeight: 500,
    textAlign: 'right',
  },
  welcomeBtn: {
    padding: '14px 28px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.15s',
  },
}
