import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('admin login', () => {
  test.beforeEach(() => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD not set (seed accounts removed)')
  })

  test('admin can login and redirect to /admin', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')

    await page.fill('input[id="email"]', ADMIN_EMAIL!)
    await page.fill('input[id="password"]', ADMIN_PASSWORD!)

    await page.click('button[type="submit"]')

    // Wait for redirect to admin dashboard
    await page.waitForURL('**/admin', { timeout: 10000 })

    expect(page.url()).toContain('/admin')
  })
})
