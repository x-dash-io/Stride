import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  beforeSend(event, hint) {
    // Filter out errors from localhost
    if (event.request?.url?.includes('localhost')) {
      return null
    }
    return event
  },
  
  beforeSendTransaction(transaction) {
    // Filter out transactions from localhost
    if (transaction.request?.url?.includes('localhost')) {
      return null
    }
    return transaction
  },
})