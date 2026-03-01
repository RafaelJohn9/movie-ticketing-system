import { useState } from 'react'
import MUTCUEmblem from '../../components/ui/MUTCUEmblem'
import QRScanner from '../../components/admin/QRScanner'
import AttendanceTable from '../../components/admin/AttendanceTable'
import { useAdminAuth } from '../../lib/adminAuth'

const TABS = [
  { id: 'scanner',    label: '📷  QR Scanner' },
  { id: 'attendance', label: '📋  Attendance' },
]

export default function AdminDashboardPage() {
  const { signOut } = useAdminAuth()
  const [tab, setTab] = useState('scanner')

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Fixed background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 5% 10%, rgba(13,148,136,0.1) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 95% 90%, rgba(220,38,38,0.07) 0%, transparent 50%),
            #0B1D3A
          `
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-grid opacity-50" />

      {/* Admin navbar */}
      <nav className="sticky top-0 z-50 bg-navy/92 backdrop-blur-xl border-b border-teal-800/20">
        <div className="flex items-center justify-between h-16 px-4 sm:px-7 lg:px-10 max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <MUTCUEmblem size={30} />
            <div>
              <div className="font-syne font-extrabold text-sm text-white leading-none">Admin Portal</div>
              <div className="text-[0.58rem] text-teal-400 uppercase tracking-wide mt-0.5">MUTCU Film Premiere</div>
            </div>
          </div>

          {/* Tab strip — hidden on mobile, shown inline on desktop */}
          <div className="hidden sm:flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap',
                  tab === t.id
                    ? 'bg-teal-900/25 text-white border-teal-600/40'
                    : 'bg-transparent text-white/45 border-transparent hover:text-white hover:bg-white/5',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-white/40 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
          >
            Sign Out ↗
          </button>
        </div>
      </nav>

      {/* Mobile tab strip */}
      <div className="sm:hidden sticky top-16 z-40 bg-navy/95 backdrop-blur-xl border-b border-white/[0.06] flex">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 py-3 text-sm font-medium border-b-2 transition-all',
              tab === t.id
                ? 'text-teal-300 border-teal-500'
                : 'text-white/40 border-transparent',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-7 lg:px-10 py-6 pb-16 animate-fade-up">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-syne font-extrabold text-xl sm:text-2xl text-white">
            {tab === 'scanner' ? 'QR Ticket Scanner' : 'Attendance Register'}
          </h1>
          <p className="text-sm text-white/35 mt-1">
            {tab === 'scanner'
              ? 'Scan attendee QR codes to verify entry at the gate'
              : 'View and manage guest attendance for the film premiere'}
          </p>
        </div>

        {tab === 'scanner'    && <QRScanner />}
        {tab === 'attendance' && <AttendanceTable />}
      </main>
    </div>
  )
}
