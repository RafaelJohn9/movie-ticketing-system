import MUTCUEmblem from '../ui/MUTCUEmblem'
import Card from '../ui/Card'

const STEPS = [
  'Validating your details',
  'Sending M-Pesa STK Push',
  'Awaiting payment confirmation',
  'Generating your ticket',
]

export default function ProcessingOverlay({ phone, currentStep }) {
  return (
    <div className="max-w-[480px] mx-auto">
      <Card className="animate-fade-up">
        <div className="text-center py-8 px-4">
          <div className="flex justify-center mb-5">
            <MUTCUEmblem size={42} />
          </div>

          <div className="w-[60px] h-[60px] rounded-full border-[3px] border-teal-700/20 border-t-teal-300 animate-spin mx-auto mb-6" />

          <h2 className="font-syne font-bold text-xl mb-2">Processing Payment</h2>
          <p className="text-white/45 text-sm leading-relaxed">
            Check your phone — an M-Pesa prompt was sent to{' '}
            <strong className="text-teal-300">{phone}</strong>. Enter your PIN to continue.
          </p>

          <ul className="mt-5 max-w-[230px] mx-auto text-left space-y-0">
            {STEPS.map((s, i) => {
              const done   = i < currentStep
              const active = i === currentStep
              return (
                <li
                  key={s}
                  className={[
                    'flex items-center gap-2.5 py-1.5 text-[0.82rem]',
                    done   ? 'text-teal-300' : '',
                    active ? 'text-white'    : '',
                    !done && !active ? 'text-white/45' : '',
                  ].join(' ')}
                >
                  <span className="w-3.5 text-center shrink-0">
                    {done ? '✓' : active ? '›' : '·'}
                  </span>
                  {s}
                </li>
              )
            })}
          </ul>

          <p className="text-[0.72rem] text-white/22 mt-5 leading-relaxed">
            This may take up to 40 seconds. Do not close this page.
          </p>
        </div>
      </Card>
    </div>
  )
}
