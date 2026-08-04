import nodemailer from 'nodemailer'

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const emailjsService = process.env.EMAILJS_SERVICE_ID
  const emailjsTemplate = process.env.EMAILJS_TEMPLATE_ID
  const emailjsPublic = process.env.EMAILJS_PUBLIC_KEY
  const emailjsPrivate = process.env.EMAILJS_PRIVATE_KEY

  console.log(`[Email System] Preparing to send email to: ${to}`)
  console.log(`[Email System] Subject: ${subject}`)

  // Try EmailJS first if configured
  if (emailjsService && emailjsTemplate && emailjsPublic && emailjsPrivate) {
    try {
      console.log(`[Email System] Sending via EmailJS...`)
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: emailjsService,
          template_id: emailjsTemplate,
          user_id: emailjsPublic,
          accessToken: emailjsPrivate,
          template_params: {
            to_email: to,
            subject: subject,
            message_html: html,
          },
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`EmailJS responded with status ${res.status}: ${errText}`)
      }

      console.log(`[Email System] Email sent successfully via EmailJS.`)
      return { success: true }
    } catch (error) {
      console.error('[Email System] Failed to send email via EmailJS:', error)
      // Fall through to SMTP if SMTP is configured
    }
  }

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'no-reply@stride.com'

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      })

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      })

      console.log(`[Email System] Email sent successfully via SMTP. Message ID: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('[Email System] Failed to send email via SMTP:', error)
      return { success: false, error }
    }
  } else {
    console.log('[Email System] No email provider configured. Printing email content to logs:')
    console.log('----------------------------------------------------')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`BODY:\n${html.replace(/<[^>]*>/g, ' ')}`)
    console.log('----------------------------------------------------')
    return { success: true, mocked: true }
  }
}
