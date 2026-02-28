export default function Spinner({ size = 18 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-white/25 border-t-white animate-spin shrink-0 block"
    />
  )
}
