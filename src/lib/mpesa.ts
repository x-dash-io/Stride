import axios from 'axios'

const MPESA_BASE_URL = process.env.MPESA_ENVIRONMENT === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

const SHORTCODE = process.env.MPESA_SHORTCODE!
const PASSKEY = process.env.MPESA_PASSKEY!
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!
const CALLBACK_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')
  const response = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  })

  cachedToken = {
    token: response.data.access_token,
    expiresAt: Date.now() + 55 * 60 * 1000,
  }

  return cachedToken.token
}

function generatePassword(timestamp: string): string {
  const str = `${SHORTCODE}${PASSKEY}${timestamp}`
  return Buffer.from(str).toString('base64')
}

function generateTimestamp(): string {
  const now = new Date()
  return (
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')
  )
}

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1)
  if (!cleaned.startsWith('254')) cleaned = '254' + cleaned
  return cleaned
}

export interface StkPushRequest {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}

export interface StkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export async function initiateStkPush(params: StkPushRequest): Promise<StkPushResponse> {
  const token = await getAccessToken()
  const timestamp = generateTimestamp()
  const password = generatePassword(timestamp)
  const phone = formatPhoneNumber(params.phoneNumber)

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: params.amount,
    PartyA: phone,
    PartyB: SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: CALLBACK_URL,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  }

  const response = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })

  return response.data
}

export async function queryStkPush(checkoutRequestId: string) {
  const token = await getAccessToken()
  const timestamp = generateTimestamp()
  const password = generatePassword(timestamp)

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  }

  const response = await axios.post(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })

  return response.data
}

const MPESA_WHITELIST_IPS = [
  '196.201.214.200', '196.201.214.206', '196.201.213.114',
  '196.201.214.207', '196.201.214.208', '196.201.213.44',
  '196.201.212.127', '196.201.212.138', '196.201.212.129',
  '196.201.212.136', '196.201.212.74', '196.201.212.69',
]

export function verifyMpesaCallbackIp(ip: string): boolean {
  if (process.env.MPESA_SKIP_IP_VERIFICATION === 'true') return true
  return MPESA_WHITELIST_IPS.includes(ip)
}