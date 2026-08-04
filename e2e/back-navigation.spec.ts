import { test, expect } from '@playwright/test'

test('back navigation after login does not return to login page', async ({ page }) => {
  // Login as customer
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'customer@stride.co.ke')
  await page.fill('input[id="password"]', 'customer123')
  
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

test('admin back navigation after login does not return to login page', async ({ page }) => {
  // Login as admin
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'admin@stride.co.ke')
  await page.fill('input[id="password"]', 'admin123')
  
  await page.click('button[type="submit"]')
  await page.waitForURL('**/admin', { timeout: 10000 })
  
  // Navigate back
  await page.goBack()
  await page.waitForLoadState('networkidle')
  
  // Should NOT be on login page
  expect(page.url()).not.toContain('/auth/login')
  // May go to about:blank (no history) or stay on admin
})
