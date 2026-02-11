import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    postalCode: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Call server API that saves the query; mobile number will be null by default
      const payload = {
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        country: formData.country || null,
        postalCode: formData.postalCode || null,
        message: formData.message
      }

      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      console.log('Query API response:', json)
      if (!res.ok) {
        console.error('Query API error:', json)
        throw new Error(json.message || 'Failed to send query')
      }

      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        country: '',
        postalCode: '',
        message: '',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to send message. Please try again later.')
    }
  }

  return (
    <section id="contact" className="py-24 bg-white bg-surface relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-600 font-medium text-sm mb-4">Contact Us</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">Get In Touch</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white bg-surface p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  required
                />
              </div>
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all mb-6"
              />
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code / ZIP"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all mb-6"
                required
              />
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
                {submitted && <span className="text-green-600 font-semibold">Message sent successfully!</span>}
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Email */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <Mail className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                <p className="text-gray-600">info@komodkiimpex.com</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <Phone className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                <p className="text-gray-600">+919833964347</p>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <MapPin className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                <p className="text-gray-600">Shivneri C-2, Ashok Nager,<br />Dahisar (East), Mumbai - 400068,<br />Maharashtra, India.</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-4">Business Hours</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                <p>Sat: 10:00 AM - 4:00 PM</p>
                <p>Sun: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}