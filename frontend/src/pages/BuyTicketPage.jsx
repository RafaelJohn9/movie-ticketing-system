import { useState } from 'react'
import MUTCUEmblem from '../components/ui/MUTCUEmblem'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormField, { Input } from '../components/ui/FormField'
import Steps from '../components/ticket/Steps'
import TicketTypeSelector from '../components/ticket/TicketTypeSelector'
import OrderSummary from '../components/ticket/OrderSummary'
import ProcessingOverlay from '../components/ticket/ProcessingOverlay'
import TicketCard from '../components/ticket/TicketCard'
import { useTicketForm } from '../hooks/useTicketForm'
import { api } from '../lib/api'
import { validatePhone } from '../lib/validatePhone'
import { downloadTicketAsPNG } from '../lib/downloadTicket'

export default function BuyTicketPage() {
  const { form, update, reset } = useTicketForm()
  const [step, setStep]         = useState(0)     // 0=form, 1=processing, 2=success
  const [procStep, setProcStep] = useState(0)
  const [error, setError]       = useState('')
  const [result, setResult]     = useState(null)
  const [downloading, setDownloading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!form.full_name || !form.email || !form.phone_number) {
      setError('Please fill in all required fields.')
      return
    }
    const { valid, error: phoneError } = validatePhone(form.phone_number)
    if (!valid) { setError(phoneError); return }

    setStep(1)
    let ps = 0
    const interval = setInterval(() => {
      ps++
      if (ps < 4) setProcStep(ps)
    }, 6000)

    try {
      const data = await api.buyTicket(form)
      clearInterval(interval)
      if (data.detail) {
        setError(data.detail)
        setStep(0)
      } else {
        setResult(data)
        setStep(2)
      }
    } catch {
      clearInterval(interval)
      setError('Network error. Check your connection and try again.')
      setStep(0)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try { await downloadTicketAsPNG(result) }
    finally { setDownloading(false) }
  }

  const handleBuyAnother = () => {
    setStep(0); setResult(null); reset(); setProcStep(0)
  }

  // ── PROCESSING ──────────────────────────────────────────────────────────
  if (step === 1) {
    return <ProcessingOverlay phone={form.phone_number} currentStep={procStep} />
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (step === 2 && result) {
    return (
      <div className="animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-[860px] mx-auto">
          {/* Left */}
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <div className="text-[2.5rem] mb-2">🎉</div>
              <h2 className="font-syne font-extrabold text-[clamp(1.3rem,5vw,1.7rem)] mb-1.5">
                You're In!
              </h2>
              <p className="text-white/45 text-sm">
                Ticket confirmed. A copy has been sent to your email.
              </p>
            </div>

            <div className="h-[3px] rounded-full bg-gradient-to-r from-orange-500 via-teal-500 via-red-500 to-navy-light" />

            <Card className="!border-teal-700/25">
              <div className="font-syne font-bold text-[0.95rem] mb-3.5 text-teal-300">
                What's next?
              </div>
              {[
                { icon: '📧', title: 'Check your email',   desc: `Ticket sent to ${result.email || 'your email'}` },
                { icon: '💾', title: 'Download your ticket', desc: 'Save as PNG for offline access' },
                { icon: '📱', title: 'Show at the gate',   desc: 'Scan the QR code to enter' },
              ].map((item, i) => (
                <div key={i} className={`flex gap-3 items-start ${i < 2 ? 'mb-3.5' : ''}`}>
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-[0.85rem]">{item.title}</div>
                    <div className="text-[0.75rem] text-white/45 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </Card>

            <div className="flex gap-2.5 flex-wrap">
              <Button variant="download" onClick={handleDownload} loading={downloading} loadingText="Saving…" className="flex-1 min-w-[140px]">
                ⬇ Download PNG
              </Button>
              <Button variant="ghost" onClick={handleBuyAnother} className="flex-1 min-w-[140px]">
                Buy Another
              </Button>
            </div>
          </div>

          {/* Right — sticky ticket */}
          <div className="lg:sticky lg:top-[88px]">
            <TicketCard result={result} />
          </div>
        </div>
      </div>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up">
      <Steps current={0} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-7 items-start">
        {/* Form card */}
        <Card>
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <MUTCUEmblem size={34} />
            <div>
              <h1 className="font-syne font-bold text-xl leading-none mb-1">Purchase a Ticket</h1>
              <p className="text-[0.78rem] text-white/45">
                MUTCU Film Premiere · Murang'a University of Technology
              </p>
            </div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <TicketTypeSelector value={form.ticket_type} onChange={(v) => update('ticket_type', v)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FormField label="Full Name">
              <Input
                placeholder="Jane Wanjiku"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                autoComplete="name"
              />
            </FormField>

            <FormField label="Email Address">
              <Input
                type="email"
                placeholder="jane@mut.ac.ke"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
              />
            </FormField>
          </div>

          <FormField label="M-Pesa Phone Number" hint="Enter a valid M-Pesa number.">
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="0XXXXXXXXX"
              value={form.phone_number}
              onChange={(e) => update('phone_number', e.target.value)}
              autoComplete="tel"
            />
          </FormField>

          <Button variant="primary" full onClick={handleSubmit} className="mt-1">
            Pay with M-Pesa 🔒
          </Button>

          <p className="text-center text-[0.71rem] text-white/22 mt-3 leading-relaxed">
            All sales are final. Powered by Safaricom M-Pesa.
          </p>
        </Card>

        {/* Summary sidebar */}
        <div className="lg:sticky lg:top-[88px]">
          <OrderSummary form={form} />
        </div>
      </div>
    </div>
  )
}
