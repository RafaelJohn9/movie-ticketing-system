import { forwardRef } from 'react'

export default function FormField({ label, hint, className = '', children }) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-[0.75rem] font-semibold text-white/50 uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      {children}
      {hint && (
        <p className="mt-1.5 text-[0.72rem] text-white/25 leading-relaxed">{hint}</p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[
        'w-full px-3.5 py-3 rounded-xl text-base text-white',
        'bg-white/5 border border-white/10 outline-none',
        'placeholder:text-white/22',
        'focus:border-teal-500 focus:bg-teal-900/10 focus:ring-2 focus:ring-teal-500/20',
        'transition-all duration-150',
        className,
      ].join(' ')}
      {...props}
    />
  )
})
