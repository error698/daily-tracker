import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Download, Plus, GripVertical, Edit3, Check, X } from 'lucide-react'
import { HABIT_COLORS, HABIT_ICONS, TIME_SLOTS } from '../hooks/useHabits'

export default function Settings({ habits, settings, colorMap, iconMap, onBack, updateSettings, addHabit, updateHabit, deleteHabit }) {
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const startEdit = (h) => {
    setEditingId(h.id)
    setEditName(h.name)
  }

  const commitEdit = (id) => {
    if (editName.trim()) updateHabit(id, { name: editName.trim() })
    setEditingId(null)
  }

  const exportCSV = () => {
    const rows = [['Date', ...habits.map(h => h.name)]]
    const log = JSON.parse(localStorage.getItem('streaks_log') || '{}')
    Object.entries(log).sort().forEach(([date, dayLog]) => {
      rows.push([date, ...habits.map(h => dayLog[h.id] ? '1' : '0')])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'streaks_export.csv'
    a.click()
  }

  const clearData = () => {
    if (window.confirm('Clear all habit history? This cannot be undone.')) {
      localStorage.removeItem('streaks_log')
      window.location.reload()
    }
  }

  return (
    <div style={styles.wrapper} className="animate-fadeIn">
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn} aria-label="Back">
          <ChevronLeft size={18} />
        </button>
        <h2 style={styles.title}>Settings</h2>
      </div>

      <div style={styles.content}>
        {/* Habits section */}
        <SectionHead label="Habits" />
        {habits.map(h => {
          const color   = colorMap[h.colorId]
          const iconDef = Object.values(iconMap).find(ic => ic.id === h.icon) || { emoji: '●' }
          return (
            <div key={h.id} style={styles.row}>
              <div style={{ ...styles.habitDot, background: color?.bg }}>
                <span style={{ fontSize: 15 }}>{iconDef.emoji}</span>
              </div>
              {editingId === h.id ? (
                <input
                  style={styles.inlineInput}
                  value={editName}
                  autoFocus
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitEdit(h.id); if (e.key === 'Escape') setEditingId(null) }}
                />
              ) : (
                <span style={styles.rowLabel}>{h.name}</span>
              )}
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                {editingId === h.id ? (
                  <>
                    <IconBtn icon={<Check size={14} />} onClick={() => commitEdit(h.id)} label="Save" />
                    <IconBtn icon={<X size={14} />}     onClick={() => setEditingId(null)} label="Cancel" />
                  </>
                ) : (
                  <>
                    <IconBtn icon={<Edit3 size={14} />}  onClick={() => startEdit(h)} label="Edit" />
                    <IconBtn icon={<Trash2 size={14} />} onClick={() => deleteHabit(h.id)} label="Delete" danger />
                  </>
                )}
              </div>
            </div>
          )
        })}
        <button style={styles.addRow} onClick={() => {
          const name = window.prompt('New habit name:')
          if (name?.trim()) addHabit({ name: name.trim() })
        }}>
          <Plus size={15} color="var(--accent)" />
          <span style={{ fontSize: 13, color: 'var(--accent)' }}>Add habit</span>
        </button>

        {/* Reminders section */}
        <SectionHead label="Reminders" />
        <div style={styles.row}>
          <span style={styles.rowLabel}>Evening reminder</span>
          <Toggle
            value={settings.reminderEnabled}
            onChange={v => updateSettings({ reminderEnabled: v })}
          />
        </div>
        {settings.reminderEnabled && (
          <div style={styles.row}>
            <span style={styles.rowLabel}>Reminder time</span>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={e => updateSettings({ reminderTime: e.target.value })}
              style={styles.timeInput}
            />
          </div>
        )}

        {/* Appearance section */}
        <SectionHead label="Appearance" />
        <div style={styles.row}>
          <span style={styles.rowLabel}>Theme</span>
          <select
            value={settings.theme || 'system'}
            onChange={e => updateSettings({ theme: e.target.value })}
            style={styles.select}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Data section */}
        <SectionHead label="Data" />
        <button style={styles.row} onClick={exportCSV}>
          <Download size={15} color="var(--text-2)" />
          <span style={styles.rowLabel}>Export as CSV</span>
          <ChevronRight size={15} color="var(--text-3)" style={{ marginLeft: 'auto' }} />
        </button>
        <button style={{ ...styles.row, cursor: 'pointer' }} onClick={clearData}>
          <Trash2 size={15} color="#D85A30" />
          <span style={{ ...styles.rowLabel, color: '#D85A30' }}>Clear all history</span>
        </button>
      </div>
    </div>
  )
}

function SectionHead({ label }) {
  return (
    <p style={{
      fontSize: 10, color: 'var(--text-3)',
      letterSpacing: '0.07em', textTransform: 'uppercase',
      margin: '20px 0 8px', fontWeight: 500,
    }}>{label}</p>
  )
}

function IconBtn({ icon, onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 28, height: 28, borderRadius: 7,
        background: 'var(--surface-2)',
        border: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? '#D85A30' : 'var(--text-2)',
      }}
    >
      {icon}
    </button>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 24, borderRadius: 12,
        background: value ? 'var(--accent)' : 'var(--border-2)',
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background 0.2s',
        padding: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: 3,
        transition: 'transform 0.2s',
        transform: value ? 'translateX(16px)' : 'translateX(0)',
      }} />
    </button>
  )
}

const styles = {
  wrapper: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px 10px',
    borderBottom: '0.5px solid var(--border)',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: 'var(--surface-2)', border: '0.5px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--text-2)',
  },
  title: {
    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400,
    color: 'var(--text)',
  },
  content: { flex: 1, overflowY: 'auto', padding: '0 16px 32px' },
  row: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px',
    background: 'var(--surface-2)',
    borderRadius: 8, marginBottom: 4,
    border: 'none', width: '100%', cursor: 'default',
    textAlign: 'left',
  },
  rowLabel: { fontSize: 14, color: 'var(--text)', flex: 1 },
  habitDot: {
    width: 32, height: 32, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  addRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 12px', width: '100%',
    background: 'var(--accent-bg)',
    border: '0.5px dashed var(--accent)',
    borderRadius: 8, cursor: 'pointer', marginTop: 4,
  },
  inlineInput: {
    flex: 1, padding: '4px 8px',
    background: 'var(--surface)', border: '0.5px solid var(--accent)',
    borderRadius: 6, fontSize: 14, color: 'var(--text)', outline: 'none',
  },
  timeInput: {
    padding: '4px 8px', background: 'var(--surface)',
    border: '0.5px solid var(--border)', borderRadius: 6,
    fontSize: 13, color: 'var(--text)', outline: 'none',
    marginLeft: 'auto',
  },
  select: {
    padding: '4px 8px', background: 'var(--surface)',
    border: '0.5px solid var(--border)', borderRadius: 6,
    fontSize: 13, color: 'var(--text)', outline: 'none',
    marginLeft: 'auto', cursor: 'pointer',
  },
}
