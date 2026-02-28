import MUTCUEmblem from '../ui/MUTCUEmblem'

export default function Footer() {
  return (
    <footer className="text-center py-5 lg:py-7 px-4 border-t border-white/[0.07] text-[0.75rem] text-white/20">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <MUTCUEmblem size={20} />
        <span className="font-syne font-bold text-[0.8rem] text-white/30">MUTCU Tickets</span>
      </div>
      <div>© {new Date().getFullYear()} Murang'a University of Technology Christian Union · Film Premiere</div>
      <div className="mt-1 text-white/15">Powered by Safaricom M-Pesa</div>
    </footer>
  )
}
