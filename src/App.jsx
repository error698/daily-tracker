import { useState } from 'react'
import { ChevronLeft, ChevronRight, Settings as SettingsIcon } from 'lucide-react'
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

export default function App() {
  const {
    habits, log, settings,
    addHabit, updateHabit, deleteHabit, reorderHabits,
    toggleComplete, getStreak, getBestStreak, getMonthStats,
    updateSettings,
    colorMap, iconMap,
    getDayCompletion,
  } = useHabits()

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
  calendarWrap: { flex: 1, paddingTop: 8 },
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
}
