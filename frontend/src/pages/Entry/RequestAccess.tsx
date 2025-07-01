import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { InlineWidget } from 'react-calendly'
import { Link } from 'react-router-dom'

export default function RequestAccess() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [showCalendly, setShowCalendly] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await emailjs.send(
        'service_7rh3qjn',
        'template_59ldwf6',
        {
          name: form.name,
          company: form.company,
          email: form.email,
          message: form.message,
          title: `Request Access – ${form.name} ${form.company}`,
        },
        'MHPTV_O7kDsMxWQ2c'
      )
      setSubmitted(true)
    } catch (error) {
      console.error('EmailJS error:', error)
    }
  }

  if (submitted) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Request Submitted</h1>
        <p>Thank you for your interest. We’ll review your request and get back to you shortly.</p>
        <Link to="/">
          <button className="mt-6 px-4 py-2 border border-gray-500 rounded hover:bg-gray-100">
            Return to Home
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Request Early Access to e-Weave</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
          <input
            required
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium">Company</label>
          <input
            required
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">Message (optional)</label>
          <textarea
            name="message"
            rows={4}
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us who you are and how you’d like to use e-Weave"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Submit Request
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Prefer a call instead?</h2>
        <button
          onClick={() => setShowCalendly(!showCalendly)}
          className="mt-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {showCalendly ? 'Hide Calendar' : 'Book an Introduction Call'}
        </button>

        {showCalendly && (
          <div className="mt-6">
            <InlineWidget
              url="https://calendly.com/e-weave-sftc-ltd/30min"
              styles={{ height: '700px' }}
            />
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link to="/">
          <button className="mt-4 px-4 py-2 border border-gray-500 rounded hover:bg-gray-100">
            Cancel
          </button>
        </Link>
      </div>
    </div>
  )
}
