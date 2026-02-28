import MUTCUEmblem from '../components/ui/MUTCUEmblem'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { TICKET_TYPES } from '../lib/constants'

export default function HomePage({ navigate }) {
  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <div className="text-center pt-9 pb-6 sm:pt-12 sm:pb-8 lg:pt-[72px] lg:pb-[52px]">
        <div className="flex justify-center mb-4">
          <div className="p-2.5 rounded-full bg-teal-900/15 border border-teal-700/30 shadow-[0_0_28px_rgba(13,148,136,0.14)] leading-none">
            <MUTCUEmblem size={60} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/15 border border-teal-700/35 text-[0.72rem] font-semibold text-teal-300 uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_6px_#14b8a8] animate-glow" />
          MUTCU · Film Premiere Event
        </div>

        <h1 className="font-syne font-extrabold text-[clamp(1.9rem,7.5vw,4.4rem)] leading-[1.1] text-white tracking-tight mb-3.5">
          Lights. Camera.<br />
          <span className="text-orange-400">MUTCU</span>{' '}
          <span className="text-teal-300">in Action.</span>
        </h1>

        <p className="text-[clamp(0.875rem,2.4vw,1rem)] text-white/45 max-w-[480px] mx-auto leading-[1.75]">
          Secure your seat for the official Murang'a University of Technology Christian Union
          student film premiere — a night of God-given talent, vision, and creativity on the big screen.
        </p>

        <div className="flex flex-wrap gap-2 justify-center my-5">
          {[
            ['🎬', 'MUTCU Film'],
            ['📍', 'MUT Assembly Hall'],
            ['🗓', '9th March'],
            ['⏱', '7pm-10pm'],
          ].map(([icon, text]) => (
            <div
              key={text}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[0.75rem] text-white/50 whitespace-nowrap"
            >
              {icon} <strong className="text-white">{text}</strong>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="primary" onClick={() => navigate('buy')}>
            Get My Ticket →
          </Button>
          <Button variant="ghost" onClick={() => navigate('send')}>
            Resend My Ticket
          </Button>
        </div>
      </div>

      {/* About card */}
      <Card className="mb-3.5 !bg-gradient-to-br from-teal-900/15 to-navy/60 !border-teal-700/25">
        <div className="flex items-start gap-3.5 flex-wrap sm:flex-nowrap">
          <MUTCUEmblem size={46} />
          <div className="min-w-0">
            <div className="text-[0.67rem] font-bold uppercase tracking-wider text-orange-400 mb-1.5">
              About the Film
            </div>
            <h2 className="font-syne font-bold text-[clamp(0.95rem,3vw,1.2rem)] mb-2">
              A Story Rooted in Faith & Purpose
            </h2>
            <p className="text-[0.85rem] text-white/45 leading-[1.75]">
              This premiere celebrates creativity gifted by God and nurtured at Murang'a University.
              Written, shot, and produced entirely by MUTCU students — come witness your fellow
              believers tell a story that matters. Support the vision. Experience the calling.
            </p>
          </div>
        </div>
      </Card>

      {/* Ticket types */}
      <div>
        <div className="font-syne font-bold text-[0.76rem] text-white/40 uppercase tracking-wide mb-2.5">
          Choose Your Ticket
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TICKET_TYPES.map((t) => (
            <Card
              key={t.value}
              className="!p-4 sm:!p-[17px] cursor-pointer hover:border-teal-700/40 transition-colors"
              onClick={() => navigate('buy')}
            >
              <span className={`inline-block text-[0.62rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-2 border ${t.badgeClass}`}>
                {t.label}
              </span>
              <div className="font-syne font-bold text-xl text-teal-300 mb-1">{t.price}</div>
              <div className="text-[0.75rem] text-white/45">{t.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
