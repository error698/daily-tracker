import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, Download, Plus, GripVertical, Edit3, Check, X } from 'lucide-react'
import { HABIT_COLORS, HABIT_ICONS, TIME_SLOTS } from '../hooks/useHabits'

export default function Settings({ habits, settings, colorMap, iconMap, onBack, updateSettings, addHabit, updateHabit, deleteHabit }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [modalHabitId, setModalHabitId] = useState(null)
  
  const [formName, setFormName] = useState('')
  const [formIconId, setFormIconId] = useState(HABIT_ICONS[0].id)
  const [formColorId, setFormColorId] = useState(HABIT_COLORS[0].id)
  const [formTimeSlot, setFormTimeSlot] = useState('Any time')

  const openAddModal = () => {
    setModalMode('add')
    setModalHabitId(null)
    setFormName('')
    setFormIconId(HABIT_ICONS[0].id)
    setFormColorId(HABIT_COLORS[0].id)
    setFormTimeSlot('Any time')
    setModalOpen(true)
  }

  const openEditModal = (h) => {
    setModalMode('edit')
    setModalHabitId(h.id)
    setFormName(h.name)
    setFormIconId(h.icon || HABIT_ICONS[0].id)
    setFormColorId(h.colorId || HABIT_COLORS[0].id)
    setFormTimeSlot(h.timeSlot || 'Any time')
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!formName.trim()) return
    const habitData = {
      name: formName.trim(),
      icon: formIconId,
      colorId: formColorId,
      timeSlot: formTimeSlot,
    }
    if (modalMode === 'add') {
      addHabit(habitData)
    } else {
      updateHabit(modalHabitId, habitData)
    }
    setModalOpen(false)
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
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={styles.rowLabel}>{h.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{h.timeSlot}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                <IconBtn icon={<Edit3 size={14} />}  onClick={() => openEditModal(h)} label="Edit" />
                <IconBtn icon={<Trash2 size={14} />} onClick={() => deleteHabit(h.id)} label="Delete" danger />
              </div>
            </div>
          )
        })}
        <button style={styles.addRow} onClick={openAddModal}>
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

      {/* Habit Configuration Modal */}
      {modalOpen && (
        <div style={modalStyles.modalOverlay}>
          {/* Modal Container */}
          <div
            style={modalStyles.modalCard}
            className="animate-scaleIn"
          >
            <div style={modalStyles.modalHeader}>
              <h3 style={modalStyles.modalTitle}>
                {modalMode === 'add' ? 'Add new habit' : 'Edit habit'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={modalStyles.closeBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={modalStyles.modalBody}>
              <label style={modalStyles.label}>Name</label>
              <input
                style={modalStyles.input}
                placeholder="e.g. Meditate, Drink water"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                autoFocus
              />

              <label style={modalStyles.label}>Icon</label>
              <div style={modalStyles.iconGrid}>
                {HABIT_ICONS.map(ic => {
                  const isSelected = formIconId === ic.id
                  const colorObj = HABIT_COLORS.find(c => c.id === formColorId)
                  return (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setFormIconId(ic.id)}
                      style={{
                        ...modalStyles.iconBtn,
                        background: isSelected ? colorObj.bg : 'var(--surface-2)',
                        outline: isSelected ? `2px solid ${colorObj.fill}` : '2px solid transparent',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                      title={ic.label}
                    >
                      <span style={{ fontSize: 20 }}>{ic.emoji}</span>
                    </button>
                  )
                })}
              </div>

              <label style={modalStyles.label}>Color</label>
              <div style={modalStyles.colorRow}>
                {HABIT_COLORS.map(c => {
                  const isSelected = formColorId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormColorId(c.id)}
                      style={{
                        ...modalStyles.colorSwatch,
                        background: c.fill,
                        outline: isSelected ? `3px solid ${c.fill}` : '3px solid transparent',
                        outlineOffset: 3,
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                      title={c.label}
                    />
                  )
                })}
              </div>

              <label style={modalStyles.label}>Best time</label>
              <select
                style={modalStyles.select}
                value={formTimeSlot}
                onChange={e => setFormTimeSlot(e.target.value)}
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div style={modalStyles.modalFooter}>
              <button
                style={modalStyles.cancelBtn}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  ...modalStyles.saveBtn,
                  opacity: formName.trim() ? 1 : 0.5,
                  cursor: formName.trim() ? 'pointer' : 'not-allowed',
                }}
                disabled={!formName.trim()}
                onClick={handleSave}
              >
                {modalMode === 'add' ? 'Add habit' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
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
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
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

const modalStyles = {
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 200,
    animation: 'fadeIn 0.2s ease',
  },
  modalCard: {
    background: 'var(--surface)',
    borderRadius: 24,
    border: '0.5px solid var(--border)',
    padding: '28px 24px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 400,
    color: 'var(--text)',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: 'var(--surface-2)',
    border: '0.5px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-2)',
  },
  modalBody: {
    overflowY: 'auto',
    flex: 1,
    paddingRight: 4,
  },
  label: {
    fontSize: 12,
    color: 'var(--text-3)',
    marginBottom: 6,
    letterSpacing: '0.03em',
    display: 'block',
    marginTop: 14,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--surface-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  iconGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  colorRow: {
    display: 'flex',
    gap: 12,
    padding: '4px 0',
  },
  colorSwatch: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--surface-2)',
    border: '0.5px solid var(--border)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--text)',
    outline: 'none',
    cursor: 'pointer',
    marginBottom: 16,
  },
  modalFooter: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    background: 'var(--surface-2)',
    color: 'var(--text-2)',
    border: '0.5px solid var(--border)',
    textAlign: 'center',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
}
