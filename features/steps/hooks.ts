import { setDefaultTimeout, Before, After, setWorldConstructor } from '@cucumber/cucumber'
import { chromium, Browser, Page } from 'playwright'

setDefaultTimeout(30000)

interface CustomWorld {
  browser?: Browser
  page?: Page
}

setWorldConstructor(function(this: CustomWorld) {})

Before(async function(this: CustomWorld) {
  this.browser = await chromium.launch()
  const context = await this.browser.newContext()
  this.page = await context.newPage()
})

After(async function(this: CustomWorld) {
  if (this.page) await this.page.close()
  if (this.browser) await this.browser.close()
})
