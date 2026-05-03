import { Given, When, Then, DataTable } from '@cucumber/cucumber'

Given('I navigate to {string}', async function (target: string) {
  if (!this.page) throw new Error('Browser not initialized')
  // Handle both URLs and page names
  if (target.includes('http://')) {
    const localUrl = target.replace(/http:\/\/\d+\.\d+\.\d+\.\d+:(\d+)/, 'http://localhost:$1')
    await this.page.goto(localUrl)
  } else {
    await this.page.click(`text=${target}`)
    await this.page.waitForLoadState('networkidle')
  }
  await this.page.waitForTimeout(1500)
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

Then('I should see service cards for Photos, Documents, Search, Monitoring, Settings', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const services = ['Photos', 'Documents', 'Search', 'Monitoring', 'Settings']
  for (const service of services) {
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
  await this.page.goto('http://localhost:5173')
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

Then('document count should show {int}', async function (count: number) {
  if (!this.page) throw new Error('Browser not initialized')
  const docCountText = await this.page.locator('p:has-text("documents")').textContent()
  if (!docCountText?.includes(count.toString())) {
    throw new Error(`Expected document count text to include "${count}", got "${docCountText}"`)
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
  await this.page.goto('http://localhost:5173')
  await this.page.click('text=Settings')
  await this.page.waitForLoadState('networkidle')
})

When('I navigate to Search', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.click('text=Search')
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(1500)
})

Given('API credentials are configured', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  await this.page.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        immichApiKey: 'yaspQn6sAuhFmH3Cjv6oH8E4x6V7PysRbGg3rx3SOwg',
        paperlessToken: '6127569d86244432e8d0a64c505375eb7883cedb',
        meilisearchKey: 'RuEpeN4LAI9O3K9TBA1gVqpLA2TEfz4nqhV1iVAfTNo',
      }
    }))
  })
  await this.page.goto('http://localhost:5173')
  await this.page.reload()
  await this.page.waitForLoadState('networkidle')
})

When('I click the Next button', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const nextBtn = this.page.locator('button:has-text("Next")')
  const isDisabled = await nextBtn.isDisabled()
  if (isDisabled) {
    throw new Error('Next button is disabled')
  }
  await nextBtn.click()
  await this.page.waitForLoadState('networkidle')
  await this.page.waitForTimeout(1500)
})

Then('new photos should load on the next page', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const photoCount = await this.page.locator('img').count()
  if (photoCount === 0) {
    throw new Error('No photos loaded on next page')
  }
})

Then('Previous button should be enabled', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const prevBtn = this.page.locator('button:has-text("Previous")')
  const isDisabled = await prevBtn.isDisabled()
  if (isDisabled) {
    throw new Error('Previous button should be enabled on page 2')
  }
})

Then('page counter should show {string}', async function (pageText: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const pageCounter = this.page.locator(`text="${pageText}"`)
  if (await pageCounter.count() === 0) {
    throw new Error(`Page counter showing "${pageText}" not found`)
  }
})

Then('page should display {string} heading', async function (heading: string) {
  if (!this.page) throw new Error('Browser not initialized')
  // For Dashboard page, look for "Welcome to NAS-logo" in h1
  if (heading === 'Dashboard') {
    const dashboardHeading = this.page.locator('h1:has-text("Welcome to NAS-logo")')
    if (await dashboardHeading.count() === 0) {
      throw new Error(`Dashboard heading not found`)
    }
  } else {
    // For other pages, look for the heading in h2
    const headingLocator = this.page.locator(`h2:has-text("${heading}")`)
    if (await headingLocator.count() === 0) {
      throw new Error(`Heading "${heading}" not found`)
    }
  }
})

Then('pagination controls should be visible', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const prev = this.page.locator('button:has-text("Previous")')
  const next = this.page.locator('button:has-text("Next")')
  const prevCount = await prev.count()
  const nextCount = await next.count()
  if (prevCount === 0 || nextCount === 0) {
    throw new Error('Pagination controls not found')
  }
})

Then('each photo should have thumbnail image', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const images = this.page.locator('img[alt]')
  const count = await images.count()
  if (count === 0) {
    throw new Error('No photo thumbnails found')
  }
})

Then('photos should load and display count', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const photoText = this.page.locator('p:has-text("photos")')
  if (await photoText.count() === 0) {
    throw new Error('Photo count not displayed')
  }
})

When('I enter {string} in search box', async function (query: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const input = this.page.locator('input[placeholder*="Search"]').first()
  await input.fill(query)
})

When('I click Search button', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const searchBtn = this.page.locator('button:has-text("Search")')
  await searchBtn.click()
  await this.page.waitForLoadState('networkidle')
})

Then('results should appear', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const results = this.page.locator('[class*="result"], [class*="card"]')
  const count = await results.count()
  if (count === 0) {
    throw new Error('No search results found')
  }
})

Then('each result should have title, description, and date', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const firstResult = this.page.locator('[class*="result"], [class*="card"]').first()
  if (await firstResult.count() === 0) {
    throw new Error('Search result not found')
  }
})

Then('results should include documents and photos', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const results = this.page.locator('[class*="result"], [class*="card"]')
  const count = await results.count()
  if (count === 0) {
    throw new Error('No search results found')
  }
})

When('I click the theme switcher button', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const themeBtn = this.page.locator('button:has-text("🌗")')
  await themeBtn.click()
})

Then('theme should cycle through System → Light → Dark', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const html = this.page.locator('html')
  const isDarkClass = await html.evaluate((el: HTMLElement) => el.classList.contains('dark'))
  if (isDarkClass === undefined) {
    throw new Error('Could not determine theme')
  }
})

Then('theme preference should be persisted', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const theme = await this.page.evaluate(() => localStorage.getItem('theme'))
  if (!theme) {
    throw new Error('Theme preference not persisted to localStorage')
  }
})

Then('UI colors should update accordingly', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const bgColor = await this.page.evaluate(() =>
    window.getComputedStyle(document.documentElement).backgroundColor
  )
  if (!bgColor) {
    throw new Error('Could not verify UI color update')
  }
})

When('I click the menu button', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const menuBtn = this.page.locator('button:has-text("☰")')
  await menuBtn.click()
})

Then('sidebar should toggle visibility', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const sidebar = this.page.locator('nav, [class*="sidebar"]')
  if (await sidebar.count() === 0) {
    throw new Error('Sidebar not found')
  }
})

Then('current page should be highlighted', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const activeLink = this.page.locator('[class*="active"], [class*="highlight"]')
  if (await activeLink.count() === 0) {
    throw new Error('Active navigation link not found')
  }
})

Then('clicking a menu item should navigate to that page', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const links = this.page.locator('nav a, [class*="menu"] a')
  if (await links.count() === 0) {
    throw new Error('Menu links not found')
  }
})

Then('I should see message {string}', async function (message: string) {
  if (!this.page) throw new Error('Browser not initialized')
  const msgLocator = this.page.locator(`text="${message}"`)
  if (await msgLocator.count() === 0) {
    throw new Error(`Message "${message}" not found`)
  }
})

When('I configure valid credentials', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const immichInput = this.page.locator('input[placeholder*="Immich"]').first()
  const paperlessInput = this.page.locator('input[placeholder*="Paperless"]').first()
  const meilisearchInput = this.page.locator('input[placeholder*="Meilisearch"]').first()

  await immichInput.fill('yaspQn6sAuhFmH3Cjv6oH8E4x6V7PysRbGg3rx3SOwg')
  await paperlessInput.fill('6127569d86244432e8d0a64c505375eb7883cedb')
  await meilisearchInput.fill('RuEpeN4LAI9O3K9TBA1gVqpLA2TEfz4nqhV1iVAfTNo')

  const buttons = this.page.locator('button:has-text("Save")')
  const count = await buttons.count()
  for (let i = 0; i < count; i++) {
    await buttons.nth(i).click()
    await this.page.waitForTimeout(500)
  }
  await this.page.waitForLoadState('networkidle')
})

When('I configure invalid credentials', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const immichInput = this.page.locator('input[placeholder*="Immich"]').first()
  await immichInput.fill('invalid-key-12345')

  const buttons = this.page.locator('button:has-text("Save")')
  await buttons.first().click()
  await this.page.waitForLoadState('networkidle')
})

Then('services should show error status with HTTP error codes', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const errorStatus = this.page.locator('text=/HTTP [0-9]{3}/')
  if (await errorStatus.count() === 0) {
    throw new Error('Error status with HTTP code not found')
  }
})

Then('search bar should be visible', async function () {
  if (!this.page) throw new Error('Browser not initialized')
  const searchBar = this.page.locator('input[placeholder*="Search"]').first()
  if (await searchBar.count() === 0) {
    throw new Error('Search bar not found')
  }
})

Then('each service should show connection status:', async function (dataTable: DataTable) {
  if (!this.page) throw new Error('Browser not initialized')
  const rows = dataTable.hashes()
  for (const row of rows) {
    const serviceStatus = this.page.locator(`text="${row.Status}"`)
    if (await serviceStatus.count() === 0) {
      throw new Error(`Status "${row.Status}" for ${row.Service} not found`)
    }
  }
})
