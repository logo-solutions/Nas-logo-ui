# BDD Testing Suite

Comprehensive Behavior-Driven Development tests using Cucumber + Playwright.

## Setup

Tests are already configured. Just ensure:
- Dev server running: `npm run dev`
- Services accessible on 100.113.214.55:2283, 8010, 7700

## Running Tests

### All BDD Tests
```bash
npm run test:bdd
```

### API Tests Only
```bash
npm run test:bdd:api
```

Covers:
- ✅ Immich API returns 14 photos
- ✅ Paperless API returns 3463 documents  
- ✅ Meilisearch search functionality
- ✅ Photo thumbnail endpoint
- ✅ Invalid credentials rejection

### UI Tests Only
```bash
npm run test:bdd:ui
```

Covers:
- ✅ Dashboard displays service cards
- ✅ Settings credential configuration
- ✅ Photos page loads with pagination
- ✅ Documents page displays list
- ✅ Search functionality
- ✅ Theme switching persistence
- ✅ Sidebar navigation
- ✅ Error handling for unconfigured services
- ✅ Service health status indicators

### View HTML Report
```bash
npm run test:bdd:report
```

## Test Structure

### Feature Files
- `features/api.feature` — API integration tests (11 scenarios)
- `features/ui.feature` — UI behavior tests (10 scenarios)

### Step Definitions
- `features/steps/api.steps.ts` — API test implementations
- `features/steps/ui.steps.ts` — UI/Browser test implementations

## Test Scenarios

### API Tests
1. **Immich photos retrieval** — Fetch album with assets
2. **Paperless documents** — List and count documents
3. **Meilisearch health** — Check service and search capability
4. **Thumbnail endpoint** — Image download verification
5. **Auth failure** — Invalid credentials rejected

### UI Tests
1. **Dashboard** — Service cards visible
2. **Settings configuration** — Add and save credentials
3. **Photos page** — Load and paginate
4. **Documents page** — List and search
5. **Search functionality** — Execute queries
6. **Theme switcher** — Cycle and persist
7. **Navigation** — Sidebar and menu
8. **Error handling** — Unconfigured services
9. **Health status** — Service indicators
10. **Invalid credentials** — Error display

## Test Data

All tests use real credentials:
- **Immich API Key**: `yaspQn6sAuhFmH3Cjv6oH8E4x6V7PysRbGg3rx3SOwg`
- **Paperless Token**: `6127569d86244432e8d0a64c505375eb7883cedb`
- **Meilisearch Key**: `RuEpeN4LAI9O3K9TBA1gVqpLA2TEfz4nqhV1iVAfTNo`

Tests expect:
- 14 photos in first album
- 3463+ documents in Paperless
- Meilisearch accessible and searchable

## Debugging Tests

### Run with verbose output
```bash
cucumber-js --format progress-bar
```

### Run specific feature
```bash
cucumber-js features/api.feature
```

### Run specific scenario
```bash
cucumber-js --name "Immich API returns photos"
```

## CI/CD Integration

Copy test commands to your CI pipeline:

```yaml
test:
  script:
    - npm run type-check
    - npm run test:bdd:api
    - npm run test:bdd:ui
  artifacts:
    reports:
      - cucumber-report.json
```

## Known Issues

### UI Tests Require Running Dev Server
Playwright tests need the app running on http://100.113.214.55:5173

### Timeouts
If tests timeout:
1. Check dev server is running
2. Check network connectivity
3. Increase timeout in step definitions (default 5000ms)

### CORS Issues
If API tests fail with CORS:
- Tests run via Node.js (no CORS restriction)
- UI tests may have CORS if APIs don't allow cross-origin
- Add `Access-Control-Allow-Origin: *` to API config if needed

## Future Improvements

- [ ] Visual regression testing with Playwright
- [ ] Performance testing with Lighthouse
- [ ] Accessibility audit (axe)
- [ ] Load testing for concurrent users
- [ ] Mock API responses for unit tests
