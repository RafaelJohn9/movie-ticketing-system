export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={[
        'bg-white/[0.035] border border-white/[0.07] rounded-2xl',
        'backdrop-blur-xl shadow-[0_4px_24px_rgba(11,29,58,0.45)]',
        'p-5 sm:p-6 lg:p-7',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
