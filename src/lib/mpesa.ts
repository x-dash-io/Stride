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

/**
 * Validates and normalises a Kenyan mobile phone number to the E.164 format
 * required by Safaricom's M-Pesa API (e.g. 254712345678).
 *
 * Accepted inputs: 07xxxxxxxx, 01xxxxxxxx, +2547xxxxxxxx, 2547xxxxxxxx
 * Recognised prefixes (Safaricom 7xx, Airtel 7xx/1xx, Telkom 77x):
 *   Safaricom: 070x, 071x, 072x, 074x, 075x, 076x, 079x, 0111, 0110, 0115
 *   Airtel:    0730–0739, 0750–0756, 0780–0786, 0781, 0100, 0101, 0102
 *   Telkom:    0770–0779
 */
export function formatPhoneNumber(phone: string): string {
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '')

  // Normalise leading 0 → 254
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '254' + digits.slice(1)
  }

  // Normalise leading 254 or already-correct 12-digit number
  if (!digits.startsWith('254')) {
    digits = '254' + digits
  }

  // Must now be exactly 12 digits: 254 + 9-digit subscriber number
  if (digits.length !== 12) {
    throw new Error(
      `Invalid Kenyan phone number: "${phone}". ` +
      'Please use format 07XXXXXXXX or +2547XXXXXXXX.'
    )
  }

  // Validate subscriber number prefix (digits 4–6, i.e. positions 3-5 of the 12-char string)
  const prefix = digits.slice(3, 6) // e.g. '712'
  const twoDigit = digits.slice(3, 5) // e.g. '71'

  // Known valid prefixes (extend as Safaricom publishes new ranges)
  const validPrefixes = new Set([
    // Safaricom
    '700', '701', '702', '703', '704', '705', '706', '707', '708', '709',
    '710', '711', '712', '713', '714', '715', '716', '717', '718', '719',
    '720', '721', '722', '723', '724', '725', '726', '727', '728', '729',
    '740', '741', '742', '743', '744', '745', '746', '747', '748', '749',
    '757', '758', '759',
    '760', '761', '762', '763', '764', '765', '766', '767', '768', '769',
    '790', '791', '792', '793', '794', '795', '796', '797', '798', '799',
    '110', '111', '114', '115',
    // Airtel Kenya
    '730', '731', '732', '733', '734', '735', '736', '737', '738', '739',
    '750', '751', '752', '753', '754', '755', '756',
    '780', '781', '782', '783', '784', '785', '786',
    '100', '101', '102',
    // Telkom Kenya (T-Kash)
    '770', '771', '772', '773', '774', '775', '776', '777', '778', '779',
  ])

  if (!validPrefixes.has(prefix)) {
    throw new Error(
      `Phone number "${phone}" does not match a recognised Kenyan mobile prefix (${prefix}). ` +
      'Please use a valid Safaricom, Airtel, or Telkom number.'
    )
  }

  return digits
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
  return MPESA_WHITELIST_IPS.includes(ip)
}