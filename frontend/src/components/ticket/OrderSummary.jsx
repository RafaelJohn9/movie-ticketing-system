import MUTCUEmblem from '../ui/MUTCUEmblem'
import Card from '../ui/Card'
import { TICKET_TYPES } from '../../lib/constants'

export default function OrderSummary({ form }) {
  const ticket = TICKET_TYPES.find((t) => t.value === form.ticket_type) || TICKET_TYPES[0]

  return (
    <Card className="!bg-gradient-to-br from-teal-900/10 to-navy/60 !border-teal-700/25">
      <div className="flex items-center gap-2.5 mb-5">
        <MUTCUEmblem size={28} />
        <div>
          <div className="font-syne font-bold text-[0.9rem]">Order Summary</div>
          <div className="text-[0.7rem] text-white/45">MUTCU Film Premiere</div>
        </div>
      </div>

      <div className="bg-white/[0.04] rounded-xl p-3.5 mb-3.5">
        <div className="flex justify-between items-start gap-2">
          <div>
            <div className="font-syne font-bold text-[0.95rem]">{ticket.label} Ticket</div>
            <div className="text-[0.75rem] text-white/45 mt-0.5">{ticket.desc}</div>
          </div>
          <div className="font-syne font-extrabold text-lg text-teal-300 whitespace-nowrap">{ticket.price}</div>
        </div>
      </div>

      {form.full_name && (
        <SummaryField label="Attendee" value={form.full_name} />
      )}
      {form.email && (
        <SummaryField label="Email" value={form.email} className="break-all" />
      )}
      {form.phone_number && (
        <SummaryField label="M-Pesa Number" value={form.phone_number} />
      )}

      <div className="border-t border-white/[0.07] pt-3 flex justify-between items-center mt-1">
        <div className="text-[0.8rem] text-white/45">Total</div>
        <div className="font-syne font-extrabold text-xl text-white">{ticket.price}</div>
      </div>

      <div className="mt-3.5 px-3 py-2.5 bg-teal-900/10 border border-teal-700/20 rounded-lg text-[0.72rem] text-white/40 leading-relaxed">
        🔒 Secured by Safaricom M-Pesa. All sales are final.
      </div>
    </Card>
  )
}

function SummaryField({ label, value, className = '' }) {
  return (
    <div className="mb-2.5">
      <div className="text-[0.67rem] text-white/40 uppercase tracking-wide mb-0.5">{label}</div>
      <div className={`text-[0.88rem] font-medium ${className}`}>{value}</div>
    </div>
  )
}
