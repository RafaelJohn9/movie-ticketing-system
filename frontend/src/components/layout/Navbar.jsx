import { useState } from 'react'
import MUTCUEmblem from '../ui/MUTCUEmblem'
import { NAV_ITEMS } from '../../lib/constants'

export default function Navbar({ page, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (id) => {
    navigate(id)
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-navy/92 backdrop-blur-xl border-b border-teal-800/20">
      <div className="flex items-center justify-between h-[60px] sm:h-16 lg:h-[68px] px-4 sm:px-7 lg:px-13">
        {/* Brand */}
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-0 min-w-0 shrink-0"
        >
          <MUTCUEmblem size={32} />
          <div className="flex flex-col leading-tight">
            <span className="font-syne font-extrabold text-[0.95rem] sm:text-base text-white whitespace-nowrap">
              MUTCU Tickets
            </span>
            <span className="text-[0.58rem] sm:text-[0.62rem] font-medium text-teal-400 uppercase tracking-wide whitespace-nowrap">
              Murang'a University of Technology
            </span>
          </div>
        </button>

        {/* Desktop nav links */}
        <div className="hidden lg:flex gap-1 shrink-0 ml-6">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={[
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border whitespace-nowrap',
                page === n.id
                  ? 'bg-teal-900/25 text-white border-teal-600/40'
                  : 'bg-transparent text-white/50 border-transparent hover:text-white hover:bg-teal-900/15',
              ].join(' ')}
            >
              {n.label}
            </button>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="lg:hidden flex flex-col justify-center gap-1.5 p-2 bg-transparent border-none cursor-pointer"
        >
          <span
            className="block w-[22px] h-0.5 bg-white/75 rounded-sm transition-all duration-200"
            style={menuOpen ? { transform: 'rotate(45deg) translate(5px,5px)' } : {}}
          />
          <span
            className="block w-[22px] h-0.5 bg-white/75 rounded-sm transition-all duration-200"
            style={menuOpen ? { opacity: 0 } : {}}
          />
          <span
            className="block w-[22px] h-0.5 bg-white/75 rounded-sm transition-all duration-200"
            style={menuOpen ? { transform: 'rotate(-45deg) translate(5px,-5px)' } : {}}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden flex flex-col gap-0.5 absolute left-0 right-0 bg-navy/97 backdrop-blur-xl border-b border-teal-800/20 px-3 pb-3 pt-2.5 z-40">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={[
                'block w-full px-4 py-3 rounded-lg text-left text-base font-medium transition-all duration-150 border-none',
                page === n.id
                  ? 'bg-teal-900/20 text-teal-300'
                  : 'bg-transparent text-white/65 hover:bg-teal-900/15 hover:text-white',
              ].join(' ')}
            >
              {n.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
