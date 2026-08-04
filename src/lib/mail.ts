import nodemailer from 'nodemailer'

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'no-reply@stride.com'

  console.log(`[Email System] Preparing to send email to: ${to}`)
  console.log(`[Email System] Subject: ${subject}`)

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

      console.log(`[Email System] Email sent successfully. Message ID: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('[Email System] Failed to send email via SMTP:', error)
      return { success: false, error }
    }
  } else {
    console.log('[Email System] SMTP not configured. Printing email content to logs:')
    console.log('----------------------------------------------------')
    console.log(`TO: ${to}`)
    console.log(`SUBJECT: ${subject}`)
    console.log(`BODY:\n${html.replace(/<[^>]*>/g, ' ')}`)
    console.log('----------------------------------------------------')
    return { success: true, mocked: true }
  }
}
