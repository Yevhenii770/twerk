'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function HeaderScrollClient({ user }: { user?: { role: string } | null }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(!isHome)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setScrolled(!isHome || window.scrollY > 60)
    const onScroll = () => setScrolled(!isHome || window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const top = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (top) window.scrollTo(0, -parseInt(top))
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    if (isHome) {
      e.preventDefault()
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <>
      <header className={`mk-header${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="header-logo">
          <Image src="/logo.png" alt="bounce lab" width={120} height={36} priority />
        </Link>

        <nav className="nav-links">
          <Link href="/#classes" onClick={scrollTo('classes')}>Classes</Link>
          <Link href="/#schedule" onClick={scrollTo('schedule')}>Schedule</Link>
          <Link href="/#pricing" onClick={scrollTo('pricing')}>Pricing</Link>
          <Link href="/#about" onClick={scrollTo('about')}>Studio</Link>
        </nav>

        <div className="header-right">
          {user && (
            <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-signin">
              Dashboard
            </Link>
          )}
          <Link href="/book" className="btn-book">Book a Class</Link>
        </div>

        <button
          className={`mk-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </header>

      <div className={`mk-mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link href="/#classes" onClick={scrollTo('classes')}>Classes</Link>
        <Link href="/#schedule" onClick={scrollTo('schedule')}>Schedule</Link>
        <Link href="/#pricing" onClick={scrollTo('pricing')}>Pricing</Link>
        <Link href="/#about" onClick={scrollTo('about')}>Studio</Link>
        {user && (
          <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={close}>
            Dashboard
          </Link>
        )}
        <Link href="/book" className="btn-book" onClick={close}>Book a Class</Link>
      </div>
    </>
  )
}
