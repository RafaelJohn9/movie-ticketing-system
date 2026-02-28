const STEPS = ['Details', 'Payment', 'Ticket']

export default function Steps({ current }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1.5 relative step-connector last:after:hidden">
            <div
              className={[
                'w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold z-10 border-2 transition-all duration-250',
                done   ? 'border-orange-500 bg-orange-900/20 text-orange-300'   : '',
                active ? 'border-teal-500 bg-teal-900/20 text-teal-300'         : '',
                !done && !active ? 'border-white/10 bg-white/5 text-white/25'   : '',
              ].join(' ')}
            >
              {done ? '✓' : i + 1}
            </div>
            <div
              className={[
                'text-[0.67rem] font-medium',
                active ? 'text-white' : done ? 'text-white/40' : 'text-white/25',
              ].join(' ')}
            >
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
