import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { useRouter } from 'next/router'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const router = useRouter()

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      if (router.pathname !== '/') {
        router.push('/').then(() => {
          setTimeout(() => {
            const el = document.getElementById(href.replace('#', ''))
            el?.scrollIntoView({ behavior: 'smooth' })
          }, 120)
        })
      } else {
        const el = document.getElementById(href.replace('#', ''))
        el?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      router.push(href)
    }
  }

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Grid */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Komodki Impex</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner in global trade and export solutions. Connecting businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><button onClick={() => handleNavClick('#home')} className="nav-quick-link hover:text-orange-400 transition-colors">Home</button></li>
              <li><button onClick={() => handleNavClick('#services')} className="nav-quick-link hover:text-orange-400 transition-colors">Services</button></li>
              <li><button onClick={() => handleNavClick('#products')} className="nav-quick-link hover:text-orange-400 transition-colors">Products</button></li>
              <li><button onClick={() => handleNavClick('#about')} className="nav-quick-link hover:text-orange-400 transition-colors">About</button></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Export Solutions</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Logistics</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                info@komodkiimpex.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Business Street, Trade City
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 py-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Komodki Impex. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-orange-500/50">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-orange-500/50">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-orange-500/50">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-orange-500/50">
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}