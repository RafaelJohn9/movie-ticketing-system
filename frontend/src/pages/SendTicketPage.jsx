import { useState } from 'react'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormField, { Input } from '../components/ui/FormField'
import { api } from '../lib/api'

export default function SendTicketPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handleSend = async () => {
    setError(''); setSuccess('')
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    try {
      const data = await api.sendTicket({ email })
      if (data.message) setSuccess(data.message)
      else if (data.detail) setError(data.detail)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-[460px] mx-auto">
      <Card>
        <div className="w-[62px] h-[62px] rounded-[17px] bg-gradient-to-br from-teal-900/30 to-teal-900/10 border border-teal-700/30 flex items-center justify-center text-[1.75rem] mb-5">
          📧
        </div>
        <h1 className="font-syne font-bold text-xl mb-1">Resend My Ticket</h1>
        <p className="text-[0.84rem] text-white/45 mb-5 leading-relaxed">
          Didn't receive your ticket email? Enter your registered address and we'll resend it instantly.
        </p>

        {error   && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {!success && (
          <>
            <FormField
              label="Registered Email Address"
              hint="Must match the email used when you purchased the ticket."
            >
              <Input
                type="email"
                placeholder="jane@mut.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                autoComplete="email"
              />
            </FormField>
            <Button variant="teal" full onClick={handleSend} loading={loading} loadingText="Sending…">
              Resend My Ticket →
            </Button>
          </>
        )}

        {success && (
          <Button variant="ghost" full className="mt-2.5" onClick={() => { setSuccess(''); setEmail('') }}>
            Resend to Another Email
          </Button>
        )}
      </Card>

      <Card className="mt-3 !border-orange-700/20">
        <div className="font-syne font-semibold text-[0.87rem] mb-1.5 text-orange-300">
          Need further help?
        </div>
        <p className="text-[0.81rem] text-white/45 leading-[1.7]">
          If your M-Pesa was deducted but no ticket arrived, contact the MUTCU team
          with your phone number and M-Pesa confirmation message.
        </p>
      </Card>
    </div>
  )
}
