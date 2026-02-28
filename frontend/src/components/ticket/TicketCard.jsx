import MUTCUEmblem from '../ui/MUTCUEmblem'
import { TICKET_CHIP_CLASSES, TICKET_TYPES } from '../../lib/constants'

export default function TicketCard({ result }) {
  const typeVal  = result.ticket_type || 'Regular'
  const chipCls  = TICKET_CHIP_CLASSES[typeVal] || TICKET_CHIP_CLASSES.Regular
  const typeLabel = TICKET_TYPES.find((t) => t.value === typeVal)?.label || typeVal

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.035] backdrop-blur-xl shadow-[0_4px_24px_rgba(11,29,58,0.45)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-light to-teal-700/40 border-b border-teal-700/25 px-5 py-6 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2.5">
          <MUTCUEmblem size={32} />
          <div className="text-left">
            <div className="font-syne font-extrabold text-[0.85rem] leading-tight">MUTCU</div>
            <div className="text-[0.58rem] text-white/50 tracking-wide">FILM PREMIERE</div>
          </div>
        </div>
        <h2 className="font-syne font-bold text-[1.05rem] mb-0.5">Event Pass</h2>
        <p className="text-[0.74rem] text-white/55">Present this QR code at the entrance gate</p>
      </div>

      {/* Perforation */}
      <div className="relative h-[22px] bg-navy/60 flex items-center ticket-perf overflow-hidden">
        <div className="flex-1 border-t-2 border-dashed border-teal-800/25 mx-3.5" />
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <TicketField label="Attendee" value={result.full_name} />
          <TicketField label="Phone" value={result.phone_number} />
        </div>

        <div className="mb-4">
          <div className="text-[0.63rem] font-semibold text-white/28 uppercase tracking-wide mb-1.5">
            Ticket Class
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-[0.68rem] font-bold tracking-wide uppercase border ${chipCls}`}>
            {typeLabel}
          </span>
        </div>

        {result.qr_image && (
          <div className="bg-white rounded-xl p-3 flex items-center justify-center mt-4">
            <img
              src={`data:image/png;base64,${result.qr_image}`}
              alt="Entry QR Code"
              className="block w-full max-w-[140px] h-auto"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function TicketField({ label, value }) {
  return (
    <div>
      <div className="text-[0.63rem] font-semibold text-white/28 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-[0.88rem] font-medium text-white break-words">{value}</div>
    </div>
  )
}
