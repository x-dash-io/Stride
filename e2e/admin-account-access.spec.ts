import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD

test.describe('role-based account access', () => {
  test('admin cannot access /account - redirects to /admin', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD not set (seed accounts removed)')

    // Login as admin
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', ADMIN_EMAIL!)
    await page.fill('input[id="password"]', ADMIN_PASSWORD!)

    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin', { timeout: 10000 })

    // Wait for session to be fully established
    await page.waitForTimeout(1000)

    // Try to access /account
    await page.goto('/account')
    await page.waitForLoadState('networkidle')

    // Should redirect to /admin
    expect(page.url()).toContain('/admin')
  })

  test('customer can access /account', async ({ page }) => {
    test.skip(!CUSTOMER_EMAIL || !CUSTOMER_PASSWORD, 'E2E_CUSTOMER_EMAIL/E2E_CUSTOMER_PASSWORD not set (seed accounts removed)')

    // Login as customer
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', CUSTOMER_EMAIL!)
    await page.fill('input[id="password"]', CUSTOMER_PASSWORD!)

    await page.click('button[type="submit"]')
    await page.waitForURL('**/products', { timeout: 10000 })

    // Wait for session to be fully established
    await page.waitForTimeout(1000)

    // Try to access /account
    await page.goto('/account')
    await page.waitForLoadState('networkidle')

    // Should be on /account
    expect(page.url()).toContain('/account')
    expect(page.url()).not.toContain('/admin')
  })
})
