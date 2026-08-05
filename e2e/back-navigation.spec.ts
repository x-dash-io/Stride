import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD

test.describe('back navigation after login', () => {
  test('customer back navigation does not return to login page', async ({ page }) => {
    test.skip(!CUSTOMER_EMAIL || !CUSTOMER_PASSWORD, 'E2E_CUSTOMER_EMAIL/E2E_CUSTOMER_PASSWORD not set (seed accounts removed)')

    // Login as customer
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', CUSTOMER_EMAIL!)
    await page.fill('input[id="password"]', CUSTOMER_PASSWORD!)

    await page.click('button[type="submit"]')
    await page.waitForURL('**/products', { timeout: 10000 })

    // Navigate back - should NOT go to login page
    // Using router.replace() means login page is not in history
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Should NOT be on login page
    expect(page.url()).not.toContain('/auth/login')
    // May go to about:blank (no history) or stay on products
  })

  test('admin back navigation does not return to login page', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD not set (seed accounts removed)')

    // Login as admin
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', ADMIN_EMAIL!)
    await page.fill('input[id="password"]', ADMIN_PASSWORD!)

    await page.click('button[type="submit"]')
    await page.waitForURL('**/admin', { timeout: 10000 })

    // Navigate back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Should NOT be on login page
    expect(page.url()).not.toContain('/auth/login')
    // May go to about:blank (no history) or stay on admin
  })
})
