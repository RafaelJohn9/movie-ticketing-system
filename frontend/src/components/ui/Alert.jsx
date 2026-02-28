const VARIANTS = {
  error:   'bg-red-900/20 border border-red-500/30 text-red-300',
  success: 'bg-teal-900/20 border border-teal-500/30 text-teal-300',
  info:    'bg-orange-900/20 border border-orange-500/30 text-orange-300',
}

const ICONS = { error: '✕', success: '✓', info: '!' }

export default function Alert({ type = 'info', children }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm mb-5 leading-relaxed ${VARIANTS[type]}`}>
      <span className="font-bold shrink-0">{ICONS[type]}</span>
      <span>{children}</span>
    </div>
  )
}
