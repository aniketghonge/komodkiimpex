import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, company, country, postalCode, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields: name, email, message' })
  }

  try {
    // mobile number intentionally null as requested
    const mobileno = null

    // Call Supabase RPC to create user query — use exact parameter names
    const { data, error } = await supabase.rpc('create_user_query', {
      p_name: name,
      p_email: email,
      p_mobile: mobileno,
      p_companyname: company || null,
      p_country: country || null,
      p_postalcode: postalCode || null,
      p_message: message
    })

    if (error) {
      console.error('Supabase RPC Error:', error)
      return res.status(500).json({ message: 'RPC failed', error })
    }

    console.log('create_user_query result:', data)

    // Send notification email if SMTP is configured
    const SMTP_HOST = process.env.SMTP_HOST
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
    const SMTP_USER = process.env.SMTP_USER
    const SMTP_PASS = process.env.SMTP_PASS
    const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER
    const TO_EMAIL = process.env.TO_EMAIL || SMTP_USER

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      let mailError: any = null
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        })

        // Verify SMTP connection early (helps find config/auth errors)
        try {
          await transporter.verify()
        } catch (verifyErr) {
          console.error('SMTP verify failed:', verifyErr)
          mailError = verifyErr
        }

        const subject = `New contact inquiry: ${name}`
        const html = `
          <h3>New contact inquiry</h3>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Company:</strong> ${escapeHtml(company || '—')}</p>
          <p><strong>Country:</strong> ${escapeHtml(country || '—')}</p>
          <p><strong>Postal Code:</strong> ${escapeHtml(postalCode || '—')}</p>
          <h4>Message</h4>
          <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
          <hr/>
          <p>Saved to DB at ${new Date().toISOString()}</p>
        `

        if (!mailError) {
          try {
            await transporter.sendMail({
              from: FROM_EMAIL,
              to: TO_EMAIL,
              replyTo: email,
              subject,
              html,
              text: `${name} (${email})\n\n${message}`
            })
          } catch (sendErr) {
            console.error('Failed to send notification email:', sendErr)
            mailError = sendErr
          }
        }

      } catch (mailErrOuter) {
        console.error('Unexpected mail error:', mailErrOuter)
        mailError = mailErrOuter
      }

      // If caller provided the correct debug token header, include mail error details in the response for debugging
      const debugToken = process.env.EMAIL_DEBUG_TOKEN
      const callerToken = String(req.headers['x-email-debug'] || '')
      if (mailError && debugToken && callerToken && debugToken === callerToken) {
        return res.status(500).json({ message: 'Query saved but mail failed', mailError: String(mailError) })
      }

      if (mailError) {
        // generic warning for production - do not expose internals
        console.warn('Email failed to send; check SMTP settings and SMTP provider logs')
      }
    }

    return res.status(200).json({ message: 'Query saved', data })
  } catch (err) {
    console.error('API error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

