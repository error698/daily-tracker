import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'streaks_habits'
const LOG_KEY     = 'streaks_log'
const SETTINGS_KEY = 'streaks_settings'

export const HABIT_COLORS = [
  { id: 'purple', fill: '#534AB7', bg: '#EEEDFE', label: 'Purple' },
  { id: 'teal',   fill: '#1D9E75', bg: '#E1F5EE', label: 'Teal'   },
  { id: 'coral',  fill: '#D85A30', bg: '#FAECE7', label: 'Coral'  },
  { id: 'pink',   fill: '#D4537E', bg: '#FBEAF0', label: 'Pink'   },
  { id: 'amber',  fill: '#BA7517', bg: '#FAEEDA', label: 'Amber'  },
]

export const HABIT_ICONS = [
  { id: 'run',      emoji: '🏃', label: 'Run'      },
  { id: 'book',     emoji: '📖', label: 'Read'     },
  { id: 'drop',     emoji: '💧', label: 'Hydrate'  },
  { id: 'pen',      emoji: '✏️', label: 'Write'    },
  { id: 'moon',     emoji: '🌙', label: 'Sleep'    },
  { id: 'heart',    emoji: '❤️', label: 'Health'   },
  { id: 'dumbbell', emoji: '🏋️', label: 'Gym'      },
  { id: 'leaf',     emoji: '🌿', label: 'Nature'   },
  { id: 'music',    emoji: '🎵', label: 'Music'    },
  { id: 'code',     emoji: '💻', label: 'Code'     },
  { id: 'food',     emoji: '🥗', label: 'Diet'     },
  { id: 'meditate', emoji: '🧘', label: 'Meditate' },
]

export const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening', 'Any time']

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function useHabits() {
  const [habits, setHabits]     = useState(() => loadJSON(STORAGE_KEY, []))
  const [log, setLog]           = useState(() => loadJSON(LOG_KEY, {}))
  const [settings, setSettings] = useState(() => loadJSON(SETTINGS_KEY, {
    reminderEnabled: true,
    reminderTime: '21:00',
    theme: 'system',
  }))

  useEffect(() => saveJSON(STORAGE_KEY, habits),  [habits])
  useEffect(() => saveJSON(LOG_KEY, log),          [log])
  useEffect(() => saveJSON(SETTINGS_KEY, settings),[settings])

  const addHabit = useCallback((habit) => {
    setHabits(h => [...h, {
      id:        crypto.randomUUID(),
      name:      habit.name,
      icon:      habit.icon  || HABIT_ICONS[0].id,
      colorId:   habit.colorId || HABIT_COLORS[0].id,
      timeSlot:  habit.timeSlot || 'Any time',
      createdAt: todayKey(),
    }])
  }, [])

  const updateHabit = useCallback((id, updates) => {
    setHabits(h => h.map(x => x.id === id ? { ...x, ...updates } : x))
  }, [])

  const deleteHabit = useCallback((id) => {
    setHabits(h => h.filter(x => x.id !== id))
  }, [])

  const reorderHabits = useCallback((from, to) => {
    setHabits(h => {
      const next = [...h]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }, [])

  const toggleComplete = useCallback((habitId, date) => {
    const key = dateKey(date)
    setLog(l => {
      const dayLog = l[key] || {}
      return { ...l, [key]: { ...dayLog, [habitId]: !dayLog[habitId] } }
    })
  }, [])

  const setNote = useCallback((habitId, date, note) => {
    const key = dateKey(date)
    setLog(l => {
      const dayLog = l[key] || {}
      return { ...l, [key]: { ...dayLog, [`${habitId}_note`]: note } }
    })
  }, [])

  const getDay = useCallback((date) => {
    return log[dateKey(date)] || {}
  }, [log])

  const getDayCompletion = useCallback((date) => {
    if (!habits.length) return { done: 0, total: 0, pct: 0 }
    const dayLog = log[dateKey(date)] || {}
    const done   = habits.filter(h => dayLog[h.id]).length
    return { done, total: habits.length, pct: Math.round(done / habits.length * 100) }
  }, [habits, log])

  const getStreak = useCallback(() => {
    if (!habits.length) return 0
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const { pct } = getDayCompletion(d)
      if (pct === 100) streak++
      else if (i > 0) break
    }
    return streak
  }, [getDayCompletion, habits])

  const getMonthStats = useCallback((year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let perfect = 0, totalPct = 0, counted = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      if (date > new Date()) break
      const { pct } = getDayCompletion(date)
      totalPct += pct
      counted++
      if (pct === 100) perfect++
    }
    return {
      perfectDays: perfect,
      avgPct: counted ? Math.round(totalPct / counted) : 0,
    }
  }, [getDayCompletion])

  const getBestStreak = useCallback(() => {
    if (!habits.length) return 0
    let best = 0, cur = 0
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const { pct } = getDayCompletion(d)
      if (pct === 100) { cur++; best = Math.max(best, cur) }
      else cur = 0
    }
    return best
  }, [getDayCompletion, habits])

  const updateSettings = useCallback((updates) => {
    setSettings(s => ({ ...s, ...updates }))
  }, [])

  return {
    habits,
    log,
    settings,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleComplete,
    setNote,
    getDay,
    getDayCompletion,
    getStreak,
    getBestStreak,
    getMonthStats,
    updateSettings,
    colorMap: Object.fromEntries(HABIT_COLORS.map(c => [c.id, c])),
    iconMap:  Object.fromEntries(HABIT_ICONS.map(i => [i.id, i])),
  }
}
