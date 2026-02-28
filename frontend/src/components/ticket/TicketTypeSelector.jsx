import { TICKET_TYPES } from '../../lib/constants'

export default function TicketTypeSelector({ value, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-[0.75rem] font-semibold text-white/50 uppercase tracking-wide mb-2.5">
        Select Ticket Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {TICKET_TYPES.map((t) => {
          const selected = value === t.value
          return (
            <button
              key={t.value}
              onClick={() => onChange(t.value)}
              className={[
                'relative text-left rounded-2xl p-4 border-2 cursor-pointer transition-all duration-200',
                'bg-transparent w-full',
                selected
                  ? 'border-teal-500 bg-teal-900/15'
                  : 'border-white/[0.07] bg-white/[0.025] hover:border-white/20',
              ].join(' ')}
            >
              {selected && (
                <span className="absolute top-2.5 right-3 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-[0.65rem] font-bold">
                  ✓
                </span>
              )}
              <span className={`inline-block text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-1.5 ${t.badgeClass}`}>
                {t.label}
              </span>
              <div className="font-syne font-bold text-xl text-teal-300 leading-none mb-1">
                {t.price}
              </div>
              <div className="text-[0.74rem] text-white/45 leading-snug">{t.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
