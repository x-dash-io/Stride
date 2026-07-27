import { test, expect } from '@playwright/test'

test('login page loads', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
})

test('can navigate to register from login', async ({ page }) => {
  await page.goto('/auth/login')
  await page.getByText(/create account/i).click()
  await expect(page).toHaveURL(/\/auth\/register/)
})
