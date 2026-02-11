import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

/**
 * Header Component - Glassmorphic Navigation
 * 
 * Features:
 * - Fixed position with glassmorphic background
 * - Logo: Komodki Impex neon logo
 * - Navigation with animated gradient underlines
 * - Responsive hamburger menu for mobile
 * - Orange gradient CTA "Get Quote" button
 */
export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '#services' },
    { label: 'Products', href: '#products' },
    { label: 'Packaging', href: '#packaging' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      if (router.pathname !== '/') {
        router.push('/').then(() => {
          setTimeout(() => {
            const element = document.getElementById(href.replace('#', ''))
            element?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        })
      } else {
        const element = document.getElementById(href.replace('#', ''))
        element?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
    setIsOpen(false)
  }

  return (
    <header className="fixed w-full top-0 z-50 px-4 md:px-8 m-0 p-0">
      <div className="relative flex items-center justify-center max-w-full gap-0">
        {/* Logo (left) - aligned with header */}
        <Link href="/" className="flex items-center flex-shrink-0 pt-2 md:pt-3">
          <img
            src="https://jgtsotoxfqbptrwtzkjc.supabase.co/storage/v1/object/public/Komodkiimpex/logo/komodki.png"
            alt="Komodki Impex Logo"
            className="h-8 md:h-16 w-auto"
          />
        </Link>

        {/* Centered, narrower header bar */}
        <div className="glass w-full md:max-w-3xl mx-auto flex-grow">
          <nav className="relative flex items-center justify-between md:justify-center px-3 md:px-6 py-2">
            {/* Desktop Navigation - centered */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="nav-link text-gray-800 font-medium hover:text-orange-600"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Mobile Menu Button (inside bar, right) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden ml-auto p-1 hover:bg-white/50 rounded-lg transition-colors duration-300"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-gray-800" />
              ) : (
                <Menu className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </nav>

          {/* Mobile Navigation Menu */}
          {isOpen && (
            <div className="md:hidden border-t border-white/20 px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="block nav-link text-gray-800 font-medium py-2 hover:text-orange-600 w-full text-left"
                >
                  {link.label}
                </button>
              ))}
              <button onClick={() => handleNavClick('#contact')} className="btn btn-orange w-full mt-4 rounded-full py-3">Get Quote</button>
            </div>
          )}
        </div>

        {/* Get Quote outside header bar (right) */}
        <div className="flex-shrink-0 hidden md:block">
          <button onClick={() => handleNavClick('#contact')} className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold shadow-lg whitespace-nowrap">
            Get Quote
          </button>
        </div>
      </div>
    </header>
  )
}