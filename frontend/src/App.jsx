import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import BuyTicketPage from './pages/BuyTicketPage'
import SendTicketPage from './pages/SendTicketPage'

const PAGES = {
  home: HomePage,
  buy:  BuyTicketPage,
  send: SendTicketPage,
}

export default function App() {
  const [page, setPage] = useState('home')

  const navigate = (id) => {
    setPage(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const PageComponent = PAGES[page] || HomePage

  return (
    <>
      {/* Mesh background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-navy bg-mesh bg-grid"
        aria-hidden="true"
      />

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
