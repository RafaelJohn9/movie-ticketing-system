import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import BuyTicketPage from './pages/BuyTicketPage'
import SendTicketPage from './pages/SendTicketPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import { AdminAuthProvider, useAdminAuth } from './lib/adminAuth'

const PUBLIC_PAGES = {
  home: HomePage,
  buy:  BuyTicketPage,
  send: SendTicketPage,
}

/** Strip the GH Pages repo prefix, then return the bare path segment */
function getInitialPage() {
  const path = window.location.pathname
    .replace(/^\/movie-ticketing-system/, '')  // strip repo prefix
    .replace(/^\//, '')                         // strip leading slash
    .split('/')[0]                              // first segment only
  if (path === 'admin') return 'admin'
  return path || 'home'
}

function AppInner() {
  const { isAdmin } = useAdminAuth()
  const [page, setPage] = useState(getInitialPage)

  const navigate = (id) => {
    setPage(id)
    // Update URL without triggering a server round-trip
    const base = '/movie-ticketing-system'
    const path = id === 'home' ? base + '/' : base + '/' + id
    window.history.pushState(null, '', path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Admin route ────────────────────────────────────────────────────────
  if (page === 'admin') {
    if (!isAdmin) return <AdminLoginPage onSuccess={() => setPage('admin')} />
    return <AdminDashboardPage onNavigate={navigate} />
  }

  // ── Public routes ──────────────────────────────────────────────────────
  const PageComponent = PUBLIC_PAGES[page] || HomePage

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-navy bg-mesh bg-grid" aria-hidden="true" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar page={page} navigate={navigate} />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-7 lg:px-[52px] py-6 sm:py-8 lg:py-[52px] pb-14 sm:pb-16 lg:pb-20">
          <PageComponent navigate={navigate} />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AppInner />
    </AdminAuthProvider>
  )
}
