import { test, expect } from '@playwright/test'

// urlType / filename repris de ui/src/pages/dev.vue
const cases = [
  { name: 'petstore', q: '?urlType=petstore' },
  { name: 'fulltest', q: '?urlType=example&filename=fulltest.json' },
  { name: 'api-docs yaml', q: '?urlType=example&filename=api-docs.yaml' },
  { name: 'recursive', q: '?urlType=example&filename=recusive.yaml' },
]

// timeout généreux : certains specs sont récupérés depuis une source externe
// (ex. petstore.swagger.io) qui peut être lente au premier chargement à froid.
const LOAD_TIMEOUT = 20_000

for (const c of cases) {
  test(`affiche la doc pour ${c.name}`, async ({ page }) => {
    await page.goto(`/openapi-viewer/${c.q}`)
    // la navigation latérale (liste des opérations) doit apparaître
    await expect(page.locator('.v-navigation-drawer')).toBeVisible({ timeout: LOAD_TIMEOUT })
    // au moins une opération rendue (lien dans le drawer)
    await expect(page.locator('.v-list-item').first()).toBeVisible({ timeout: LOAD_TIMEOUT })
  })
}

test('drawer à droite avec drawerLocation=right', async ({ page }) => {
  await page.goto('/openapi-viewer/?urlType=example&filename=fulltest.json&drawerLocation=right')
  const drawer = page.locator('.v-navigation-drawer')
  await expect(drawer).toBeVisible({ timeout: LOAD_TIMEOUT })
  // le drawer "right" est positionné à droite
  await expect(drawer).toHaveClass(/v-navigation-drawer--right/)
})

test('le formulaire de paramètres (vjsf) et le panneau de réponse se rendent', async ({ page }) => {
  await page.goto('/openapi-viewer/?urlType=petstore')
  await page.locator('.v-list-item').first().click({ timeout: LOAD_TIMEOUT })
  // au moins le contenu principal visible
  await expect(page.locator('.v-main')).toBeVisible()
})
