import { test, expect } from '@playwright/test'

test('admin cannot access /account - redirects to /admin', async ({ page }) => {
  // Login as admin
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'admin@stride.co.ke')
  await page.fill('input[id="password"]', 'admin123')
  
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
  // Login as customer
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'customer@stride.co.ke')
  await page.fill('input[id="password"]', 'customer123')
  
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
