import { useState } from 'react'
import MUTCUEmblem from '../../components/ui/MUTCUEmblem'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FormField, { Input } from '../../components/ui/FormField'
import { adminApi } from '../../lib/api'
import { useAdminAuth } from '../../lib/adminAuth'

export default function AdminLoginPage({ onSuccess }) {
  const { signIn } = useAdminAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await adminApi.login(form)
      // 204 → null; any error shape → has detail
      if (res && res.detail) {
        setError(res.detail)
      } else {
        signIn()
        onSuccess()
      }
    } catch (e) {
      setError(e?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(13,148,136,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 45% at 80% 80%, rgba(220,38,38,0.08) 0%, transparent 55%),
            #0B1D3A
          `
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-60" />

      <div className="relative z-10 w-full max-w-[400px] animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-teal-900/15 border border-teal-700/30 shadow-[0_0_32px_rgba(13,148,136,0.15)] leading-none">
              <MUTCUEmblem size={48} />
            </div>
          </div>
          <h1 className="font-syne font-extrabold text-2xl text-white mb-1">Admin Portal</h1>
          <p className="text-sm text-white/40">MUTCU Film Premiere · Staff Access</p>
        </div>

        <Card className="!border-teal-700/20">
          {/* Subtle top accent bar */}
          <div className="h-[2px] rounded-full bg-gradient-to-r from-teal-600/60 via-orange-500/40 to-red-600/30 -mt-1 mb-5" />

          {error && <Alert type="error">{error}</Alert>}

          <FormField label="Email Address">
            <Input
              type="email"
              placeholder="admin@mut.ac.ke"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoComplete="email"
              autoFocus
            />
          </FormField>

          <FormField label="Password" className="mb-5">
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
          </FormField>

          <Button variant="teal" full onClick={handleLogin} loading={loading} loadingText="Signing in…">
            Sign In →
          </Button>

          <p className="text-center text-[0.68rem] text-white/20 mt-4 leading-relaxed">
            Restricted access. Authorised personnel only.
          </p>
        </Card>

        <p className="text-center mt-5 text-[0.72rem] text-white/20">
          🔒 Session secured via M-Pesa event system
        </p>
      </div>
    </div>
  )
}
