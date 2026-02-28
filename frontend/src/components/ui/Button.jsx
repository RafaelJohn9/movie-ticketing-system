import Spinner from './Spinner'

const VARIANTS = {
  primary:  'bg-gradient-to-br from-red-700 to-red-500 text-white shadow-[0_4px_18px_rgba(220,38,38,0.32)] hover:shadow-[0_6px_22px_rgba(220,38,38,0.4)] hover:-translate-y-px',
  teal:     'bg-gradient-to-br from-teal-700 to-teal-500 text-white shadow-[0_4px_16px_rgba(13,148,136,0.28)] hover:shadow-[0_6px_22px_rgba(13,148,136,0.38)] hover:-translate-y-px',
  ghost:    'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white',
  download: 'bg-gradient-to-br from-navy-mid to-navy-light text-white border border-teal-600/40 shadow-[0_4px_16px_rgba(13,148,136,0.18)] hover:border-teal-500/70 hover:shadow-[0_6px_22px_rgba(13,148,136,0.28)] hover:-translate-y-px',
}

export default function Button({
  variant = 'primary',
  loading = false,
  loadingText = 'Loading…',
  disabled = false,
  full = false,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2',
        'px-6 py-3.5 rounded-full font-semibold text-[0.95rem] leading-none',
        'transition-all duration-200 cursor-pointer border-none',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        full ? 'w-full' : '',
        VARIANTS[variant] || VARIANTS.primary,
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={18} />
          {loadingText}
        </>
      ) : children}
    </button>
  )
}
