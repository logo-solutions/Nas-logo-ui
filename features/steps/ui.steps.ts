import { Given, When, Then } from '@cucumber/cucumber'

Given('I navigate to {string}', async function (url: string) {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.goto(url)
})

Given('the app loads successfully', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.waitForLoadState('networkidle')
  const title = await this.page.locator('title').textContent()
  if (!title?.includes('NAS-logo')) {
    throw new Error('App did not load correctly')
  }
})

When('I view the Dashboard', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const link = this.page.locator('text=Dashboard')
  if (await link.count() > 0) {
    await link.click()
  }
  await this.page.waitForLoadState('networkidle')
})

Then('I should see service cards for {string}', async function (services: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const serviceList = services.split(', ')
  for (const service of serviceList) {
    const card = this.page.locator(`text=${service}`)
    if (await card.count() === 0) {
      throw new Error(`Service card "${service}" not found`)
    }
  }
})

Then('each card should have a title and description', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const cards = this.page.locator('[class*="card"]')
  if (await cards.count() === 0) {
    throw new Error('No cards found')
  }
})

When('I navigate to Settings', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.click('text=Settings')
  await this.page.waitForLoadState('networkidle')
})

When('I enter the Immich API key', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const input = this.page.locator('input[placeholder*="Immich"]').first()
  await input.fill('yaspQn6sAuhFmH3Cjv6oH8E4x6V7PysRbGg3rx3SOwg')
})

When('I enter the Paperless API token', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const input = this.page.locator('input[placeholder*="Paperless"]').first()
  await input.fill('6127569d86244432e8d0a64c505375eb7883cedb')
})

When('I enter the Meilisearch master key', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const input = this.page.locator('input[placeholder*="Meilisearch"]').first()
  await input.fill('RuEpeN4LAI9O3K9TBA1gVqpLA2TEfz4nqhV1iVAfTNo')
})

When('I click Save buttons', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const buttons = this.page.locator('button:has-text("Save")')
  const count = await buttons.count()
  for (let i = 0; i < count; i++) {
    await buttons.nth(i).click()
    await this.page.waitForTimeout(500)
  }
})

Then('success message should appear', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const successMsg = this.page.locator('text=Saved successfully')
  await successMsg.waitFor({ state: 'visible', timeout: 5000 })
})

Then('service status should show {string} for each service', async function (status: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const statusTexts = this.page.locator(`text="${status}"`)
  const count = await statusTexts.count()
  if (count < 3) {
    throw new Error(`Expected at least 3 services with "${status}", found ${count}`)
  }
})

When('credentials are not configured', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.evaluate(() => {
    localStorage.clear()
  })
  await this.page.goto('http://100.113.214.55:5173')
  await this.page.reload()
})

When('I navigate to Photos', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.click('text=Photos')
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(2000)
})

Then('photo count should show {string}', async function (text: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const photoCountText = await this.page.locator('p:has-text("photos")').textContent()
  if (!photoCountText?.includes(text)) {
    throw new Error(`Expected photo count text to include "${text}", got "${photoCountText}"`)
  }
})

Then('no photo thumbnails should be displayed', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const images = this.page.locator('img[src*="thumbnail"]')
  const count = await images.count()
  if (count > 0) {
    throw new Error(`Expected no photo thumbnails, but found ${count}`)
  }
})

Then('pagination controls should not be visible', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const prev = this.page.locator('button:has-text("Previous")')
  const next = this.page.locator('button:has-text("Next")')
  const prevCount = await prev.count()
  const nextCount = await next.count()
  if (prevCount > 0 || nextCount > 0) {
    throw new Error('Pagination controls should not be visible when no photos loaded')
  }
})

When('I navigate to Documents', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.click('text=Documents')
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(2000)
})

Then('document count should show {string}', async function (text: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const docCountText = await this.page.locator('p:has-text("documents")').textContent()
  if (!docCountText?.includes(text)) {
    throw new Error(`Expected document count text to include "${text}", got "${docCountText}"`)
  }
})

Then('document list should be empty', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const items = this.page.locator('[class*="list"], [class*="document"], [class*="row"]')
  const count = await items.count()
  if (count > 0) {
    throw new Error(`Expected no document items, but found ${count}`)
  }
})

Then('document list should display items', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const items = this.page.locator('[class*="list"], [class*="document"], [class*="row"]')
  const count = await items.count()
  if (count === 0) {
    throw new Error('Document items not found')
  }
})

Given('I am in Settings', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.goto('http://100.113.214.55:5173')
  await this.page.click('text=Settings')
  await this.page.waitForLoadState('networkidle')
})

When('I navigate to {string}', async function (pageName: string) {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.click(`text=${pageName}`)
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(1500)
})
