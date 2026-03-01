import { useState, useRef, useEffect, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Card from '../ui/Card'
import Spinner from '../ui/Spinner'
import { Input } from '../ui/FormField'
import { adminApi } from '../../lib/api'

const STATUS = { idle: 'idle', success: 'success', error: 'error', already: 'already' }

const FEEDBACK = {
  idle:    { emoji: '🎫', text: 'Awaiting scan…',                          color: 'border-white/10 bg-white/[0.02]',        textColor: 'text-white/30'   },
  success: { emoji: '✅', text: 'Ticket verified — attendee marked!',       color: 'border-teal-500/60 bg-teal-900/10',      textColor: 'text-teal-300'   },
  error:   { emoji: '❌', text: 'Invalid QR code — ticket not found.',      color: 'border-red-500/60 bg-red-900/10',        textColor: 'text-red-300'    },
  already: { emoji: '⚠️', text: 'Already scanned — duplicate entry!',       color: 'border-orange-500/60 bg-orange-900/10', textColor: 'text-orange-300' },
}

const SCANNER_ELEMENT_ID = 'qr-reader'

export default function QRScanner() {
  const [mode, setMode]         = useState('camera')   // 'camera' | 'manual'
  const [scanning, setScanning] = useState(false)
  const [camError, setCamError] = useState('')
  const [token, setToken]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [status, setStatus]     = useState(STATUS.idle)
  const [message, setMessage]   = useState('')
  const [scanned, setScanned]   = useState([])
  const [lastName, setLastName] = useState('')

  const scannerRef  = useRef(null)   // Html5Qrcode instance
  const processingRef = useRef(false) // debounce guard
  const inputRef    = useRef(null)

  // ── Process a decoded token ──────────────────────────────────────────────
  const processToken = useCallback(async (rawToken) => {
    const t = rawToken.trim()
    if (!t || processingRef.current) return
    processingRef.current = true

    setLoading(true)
    setStatus(STATUS.idle)
    setLastName('')

    try {
      await adminApi.scanTicket(t)
      setStatus(STATUS.success)
      setMessage('Ticket verified ✓ — attendee marked as attended.')
      setScanned((prev) => [{ token: t.slice(0, 8) + '…', ok: true, ts: now() }, ...prev.slice(0, 19)])
    } catch (err) {
      const detail = (err?.detail || '').toLowerCase()
      if (detail.includes('already')) {
        setStatus(STATUS.already)
        setMessage('This QR code has already been scanned.')
      } else if (detail.includes('not found') || detail.includes('does not exist')) {
        setStatus(STATUS.error)
        setMessage('Invalid QR token — ticket not found.')
      } else {
        setStatus(STATUS.error)
        setMessage(err?.detail || 'Scan failed. Please try again.')
      }
      setScanned((prev) => [{ token: t.slice(0, 8) + '…', ok: false, ts: now() }, ...prev.slice(0, 19)])
    } finally {
      setLoading(false)
      // Allow re-scanning after 2.5 s so the result stays visible
      setTimeout(() => { processingRef.current = false }, 2500)
    }
  }, [])

  // ── Start camera scanner ─────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCamError('')
    setScanning(true)
    setStatus(STATUS.idle)

    try {
      const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },   // rear camera on mobile
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        (decodedText) => {
          processToken(decodedText)
        },
        () => { /* ignore ongoing scan errors */ }
      )
    } catch (err) {
      setScanning(false)
      if (err?.toString().includes('Permission')) {
        setCamError('Camera permission denied. Please allow camera access and try again.')
      } else {
        setCamError('Could not start camera. Try manual input instead.')
      }
    }
  }, [processToken])

  // ── Stop camera scanner ──────────────────────────────────────────────────
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ignore */ }
      try { scannerRef.current.clear() }     catch { /* ignore */ }
      scannerRef.current = null
    }
    setScanning(false)
  }, [])

  // ── Switch mode ──────────────────────────────────────────────────────────
  const switchMode = async (next) => {
    if (next === mode) return
    if (mode === 'camera') await stopCamera()
    setMode(next)
    setStatus(STATUS.idle)
    setToken('')
  }

  // Auto-start camera when mode === 'camera'
  useEffect(() => {
    if (mode === 'camera') startCamera()
    return () => { stopCamera() }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => { stopCamera() }, [stopCamera])

  const resetStatus = () => {
    setStatus(STATUS.idle)
    setToken('')
    setMessage('')
    if (mode === 'manual') inputRef.current?.focus()
  }

  const fb = FEEDBACK[status]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
      {/* Main scanner card */}
      <Card>
        {/* Header + mode toggle */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-900/25 border border-teal-700/30 flex items-center justify-center text-xl shrink-0">
              📷
            </div>
            <div>
              <h2 className="font-syne font-bold text-lg leading-none">QR Ticket Scanner</h2>
              <p className="text-xs text-white/40 mt-0.5">Scan or enter token to verify entry</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            {[
              { id: 'camera', label: '📷 Camera' },
              { id: 'manual', label: '⌨️ Manual' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={[
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  mode === m.id
                    ? 'bg-teal-600/30 text-teal-200 border border-teal-600/40'
                    : 'text-white/40 hover:text-white/70',
                ].join(' ')}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CAMERA MODE ── */}
        {mode === 'camera' && (
          <div className="space-y-4">
            {camError ? (
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
                {camError}
              </div>
            ) : null}

            {/* Scanner viewport — html5-qrcode mounts into this div */}
            <div className="relative overflow-hidden rounded-2xl bg-black border border-white/10">
              <div id={SCANNER_ELEMENT_ID} className="w-full" />

              {/* Overlay frame corners when scanning */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-[240px] h-[240px]">
                    {/* Corner brackets */}
                    {[
                      'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
                      'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
                      'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
                      'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-7 h-7 border-teal-400 ${cls}`} />
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state before camera initialises */}
              {!scanning && !camError && (
                <div className="flex flex-col items-center justify-center h-52 gap-3 text-white/40">
                  <Spinner size={28} />
                  <span className="text-sm">Starting camera…</span>
                </div>
              )}
            </div>

            {scanning && (
              <p className="text-center text-xs text-white/30">
                Point camera at a QR code — it will scan automatically
              </p>
            )}
          </div>
        )}

        {/* ── MANUAL MODE ── */}
        {mode === 'manual' && (
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <Input
                ref={inputRef}
                placeholder="Paste QR token here…"
                value={token}
                onChange={(e) => { setToken(e.target.value); setStatus(STATUS.idle) }}
                onKeyDown={(e) => e.key === 'Enter' && processToken(token)}
                className="flex-1"
                autoFocus
              />
              <button
                onClick={() => processToken(token)}
                disabled={!token.trim() || loading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-teal-600/25 border border-teal-600/40 text-teal-200 hover:bg-teal-600/35 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
              >
                {loading ? <Spinner size={16} /> : null}
                Scan
              </button>
            </div>
          </div>
        )}

        {/* ── Result feedback (both modes) ── */}
        <div className={`mt-4 rounded-2xl border-2 flex flex-col items-center justify-center py-7 transition-all duration-300 ${fb.color}`}>
          <div className={`text-4xl mb-2 transition-transform duration-300 ${status === STATUS.success ? 'scale-125' : ''}`}>
            {loading ? '' : fb.emoji}
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Spinner size={16} /> Verifying ticket…
            </div>
          ) : (
            <p className={`text-sm font-medium text-center px-6 ${fb.textColor}`}>
              {status === STATUS.idle ? fb.text : message}
            </p>
          )}
        </div>

        {status !== STATUS.idle && !loading && (
          <button
            onClick={resetStatus}
            className="mt-2.5 w-full text-center text-xs text-white/25 hover:text-white/50 transition-colors py-1"
          >
            ↩ {mode === 'camera' ? 'Continue scanning' : 'Scan another ticket'}
          </button>
        )}
      </Card>

      {/* Session history sidebar */}
      <Card className="!p-4">
        <h3 className="font-syne font-bold text-xs mb-3 text-white/50 uppercase tracking-wide">
          Session History
        </h3>
        {scanned.length === 0 ? (
          <p className="text-xs text-white/25 text-center py-8">No scans yet</p>
        ) : (
          <>
            <div className="flex gap-3 mb-3 text-xs">
              <span className="text-teal-400 font-semibold">
                ✓ {scanned.filter((s) => s.ok).length} valid
              </span>
              <span className="text-red-400 font-semibold">
                ✕ {scanned.filter((s) => !s.ok).length} failed
              </span>
            </div>
            <ul className="space-y-1.5 max-h-[420px] overflow-y-auto">
              {scanned.map((s, i) => (
                <li
                  key={i}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs ${
                    s.ok ? 'bg-teal-900/15 text-teal-300' : 'bg-red-900/15 text-red-400'
                  }`}
                >
                  <span className="font-mono truncate">{s.token}</span>
                  <span className="shrink-0 flex items-center gap-1.5">
                    <span>{s.ok ? '✓' : '✕'}</span>
                    <span className="text-white/20">{s.ts}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

