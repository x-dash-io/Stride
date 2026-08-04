import { test, expect } from '@playwright/test'

test('admin can login and redirect to /admin', async ({ page }) => {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'admin@stride.co.ke')
  await page.fill('input[id="password"]', 'admin123')
  
  await page.click('button[type="submit"]')
  
  // Wait for redirect to admin dashboard
  await page.waitForURL('**/admin', { timeout: 10000 })
  
  expect(page.url()).toContain('/admin')
})
