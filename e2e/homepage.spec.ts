import { test, expect } from '@playwright/test'

test('homepage loads and shows products', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})

test('navigation links work', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /products/i }).first().click()
  await expect(page).toHaveURL(/\/products/)
})
