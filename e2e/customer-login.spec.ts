import { test, expect } from '@playwright/test'

test('customer login redirects to /products', async ({ page }) => {
  await page.goto('/auth/login')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'customer@stride.co.ke')
  await page.fill('input[id="password"]', 'customer123')
  
  await page.click('button[type="submit"]')
  
  // Wait for redirect to products page
  await page.waitForURL('**/products', { timeout: 10000 })
  
  expect(page.url()).toContain('/products')
})

test('customer login with callbackUrl redirects to callbackUrl', async ({ page }) => {
  await page.goto('/auth/login?callbackUrl=/cart/checkout')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[id="email"]', 'customer@stride.co.ke')
  await page.fill('input[id="password"]', 'customer123')
  
  await page.click('button[type="submit"]')
  
  // Wait for redirect to callbackUrl
  await page.waitForURL('**/cart/checkout', { timeout: 10000 })
  
  expect(page.url()).toContain('/cart/checkout')
})
