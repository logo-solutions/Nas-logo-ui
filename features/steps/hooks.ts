import { Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from '@playwright/test'

setDefaultTimeout(30000)

Before(async function () {
  // Only initialize browser for UI tests
  const scenario = this.pickle.name
  const isUITest = scenario.includes('photo') || scenario.includes('document') ||
      scenario.includes('Dashboard') || scenario.includes('Settings') ||
      scenario.includes('theme') || scenario.includes('Navigation') ||
      scenario.includes('Search') || scenario.includes('Sidebar') ||
      scenario.includes('Error') || scenario.includes('Health')

  if (isUITest) {
    try {
      const browser = await chromium.launch()
      const context = await browser.newContext()
      const page = await context.newPage()
      this.browser = browser
      this.context = context
      this.page = page
    } catch (e) {
      console.error('Failed to launch browser:', e)
    }
  }
})

After(async function () {
  // Cleanup browser only if it was initialized
  if (this.page) {
    try {
      await this.context?.close()
      await this.browser?.close()
    } catch (e) {
      console.error('Failed to close browser:', e)
    }
  }
})
