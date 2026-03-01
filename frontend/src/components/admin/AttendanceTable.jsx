import { useState, useEffect, useCallback } from 'react'
import Card from '../ui/Card'
import Spinner from '../ui/Spinner'
import { adminApi } from '../../lib/api'

const TICKET_CHIP = {
  Regular: 'bg-teal-900/25 text-teal-300 border-teal-700/30',
  VIP:     'bg-orange-900/25 text-orange-300 border-orange-700/30',
  Group:   'bg-red-900/25 text-red-400 border-red-700/30',
}

const PAYMENT_CHIP = {
  completed: 'bg-teal-900/20 text-teal-400',
  pending:   'bg-yellow-900/20 text-yellow-400',
  failed:    'bg-red-900/20 text-red-400',
}

export default function AttendanceTable() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [toggling, setToggling] = useState(null)  // userId being toggled
  const [search, setSearch]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.listAttendance()
      if (Array.isArray(data)) setUsers(data)
      else setError(data?.detail || 'Failed to load attendance.')
    } catch {
      setError('Network error loading attendance list.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleAttendance = async (user) => {
    setToggling(user.id)
    try {
      await adminApi.updateAttendance(user.id, !user.has_attended)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, has_attended: !u.has_attended, attended_at: !u.has_attended ? new Date().toISOString() : null }
            : u
        )
      )
    } catch (e) {
      console.error('Toggle failed', e)
    } finally {
      setToggling(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone_number.includes(q)
    )
  })

  const stats = {
    total:    users.length,
    attended: users.filter((u) => u.has_attended).length,
    paid:     users.filter((u) => u.payment_status === 'completed').length,
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Registrations" value={stats.total} color="teal" />
        <StatCard label="Attended" value={stats.attended} color="orange" />
        <StatCard label="Paid" value={stats.paid} color="green" />
      </div>

      <Card>
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3.5 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 outline-none placeholder:text-white/25 focus:border-teal-500/60 focus:bg-teal-900/10 transition-all"
          />
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? <Spinner size={14} /> : '↻'} Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {loading && !users.length ? (
          <div className="flex items-center justify-center py-16 gap-3 text-white/40 text-sm">
            <Spinner size={20} /> Loading attendance…
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                    {['Attendee', 'Phone', 'Ticket', 'Payment', 'Attended', 'Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-semibold text-white/35 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-white/25 text-sm">
                        {search ? 'No results match your search.' : 'No registrations yet.'}
                      </td>
                    </tr>
                  ) : filtered.map((user, i) => (
                    <tr
                      key={user.id}
                      className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{user.full_name}</div>
                        <div className="text-[0.72rem] text-white/35 mt-0.5 truncate max-w-[180px]">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-white/60 font-mono text-xs whitespace-nowrap">
                        {user.phone_number}
                      </td>
                      <td className="px-4 py-3">
                        {user.ticket_type ? (
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide border ${TICKET_CHIP[user.ticket_type] || 'bg-white/10 text-white/50 border-white/10'}`}>
                            {user.ticket_type}
                          </span>
                        ) : <span className="text-white/25 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wide ${PAYMENT_CHIP[user.payment_status] || 'bg-white/10 text-white/40'}`}>
                          {user.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.has_attended ? 'bg-teal-400' : 'bg-white/20'}`} />
                          <span className={user.has_attended ? 'text-teal-300 text-xs' : 'text-white/35 text-xs'}>
                            {user.has_attended ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {user.attended_at && (
                          <div className="text-[0.65rem] text-white/25 mt-0.5">
                            {new Date(user.attended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAttendance(user)}
                          disabled={toggling === user.id}
                          className={[
                            'px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold transition-all border',
                            'disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5',
                            user.has_attended
                              ? 'bg-red-900/20 border-red-700/30 text-red-400 hover:bg-red-900/35'
                              : 'bg-teal-900/20 border-teal-700/30 text-teal-300 hover:bg-teal-900/35',
                          ].join(' ')}
                        >
                          {toggling === user.id ? <Spinner size={12} /> : null}
                          {user.has_attended ? 'Unmark' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-2.5">
              {filtered.map((user) => (
                <div key={user.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <div className="font-medium text-sm">{user.full_name}</div>
                      <div className="text-[0.72rem] text-white/35 truncate">{user.email}</div>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${user.has_attended ? 'bg-teal-900/25 text-teal-300' : 'bg-white/5 text-white/30'}`}>
                      {user.has_attended ? 'Attended' : 'Absent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-white/40 mb-3">
                    <span>{user.phone_number}</span>
                    {user.ticket_type && <span>· {user.ticket_type}</span>}
                    <span>· {user.payment_status}</span>
                  </div>
                  <button
                    onClick={() => toggleAttendance(user)}
                    disabled={toggling === user.id}
                    className={[
                      'w-full py-2 rounded-lg text-xs font-semibold border transition-all',
                      user.has_attended
                        ? 'bg-red-900/20 border-red-700/30 text-red-400'
                        : 'bg-teal-900/20 border-teal-700/30 text-teal-300',
                    ].join(' ')}
                  >
                    {user.has_attended ? 'Unmark Attendance' : 'Mark as Present'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 text-[0.7rem] text-white/25 text-right">
              Showing {filtered.length} of {users.length} registrations
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    teal:   'from-teal-900/20 to-teal-900/5 border-teal-700/20 text-teal-300',
    orange: 'from-orange-900/20 to-orange-900/5 border-orange-700/20 text-orange-300',
    green:  'from-emerald-900/20 to-emerald-900/5 border-emerald-700/20 text-emerald-300',
  }
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <div className="font-syne font-extrabold text-2xl">{value}</div>
      <div className="text-[0.7rem] text-white/35 mt-0.5 leading-snug">{label}</div>
    </div>
  )
}
