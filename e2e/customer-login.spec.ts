import { test, expect } from '@playwright/test'

const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD

test.describe('customer login', () => {
  test.beforeEach(() => {
    test.skip(!CUSTOMER_EMAIL || !CUSTOMER_PASSWORD, 'E2E_CUSTOMER_EMAIL/E2E_CUSTOMER_PASSWORD not set (seed accounts removed)')
  })

  test('customer login redirects to /products', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', CUSTOMER_EMAIL!)
    await page.fill('input[id="password"]', CUSTOMER_PASSWORD!)

    await page.click('button[type="submit"]')

    // Wait for redirect to products page
    await page.waitForURL('**/products', { timeout: 10000 })

    expect(page.url()).toContain('/products')
  })

  test('customer login with callbackUrl redirects to callbackUrl', async ({ page }) => {
    await page.goto('/auth/login?callbackUrl=/cart/checkout')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', CUSTOMER_EMAIL!)
    await page.fill('input[id="password"]', CUSTOMER_PASSWORD!)

    await page.click('button[type="submit"]')

    // Wait for redirect to callbackUrl
    await page.waitForURL('**/cart/checkout', { timeout: 10000 })

    expect(page.url()).toContain('/cart/checkout')
  })
})
