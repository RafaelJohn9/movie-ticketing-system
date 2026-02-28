export default function MUTCUEmblem({ size = 40 }) {
  const id = `e${size}${Math.random().toString(36).slice(2, 6)}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <clipPath id={`tl${id}`}><rect x="0" y="0" width="50" height="50" /></clipPath>
      <clipPath id={`tr${id}`}><rect x="50" y="0" width="50" height="50" /></clipPath>
      <clipPath id={`bl${id}`}><rect x="0" y="50" width="50" height="50" /></clipPath>
      <clipPath id={`br${id}`}><rect x="50" y="50" width="50" height="50" /></clipPath>
      <circle cx="50" cy="50" r="47" fill="#E8710A" clipPath={`url(#tl${id})`} />
      <circle cx="50" cy="50" r="47" fill="#0D9488" clipPath={`url(#tr${id})`} />
      <circle cx="50" cy="50" r="47" fill="#0B1D3A" clipPath={`url(#bl${id})`} />
      <circle cx="50" cy="50" r="47" fill="#DC2626" clipPath={`url(#br${id})`} />
      <line x1="50" y1="3" x2="50" y2="97" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <line x1="3" y1="50" x2="97" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="47" stroke="#0D9488" strokeWidth="3" fill="none" />
    </svg>
  )
}
