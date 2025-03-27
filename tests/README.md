# Talosix EDC Test Suite

This directory contains automated tests for the Talosix EDC application using the Playwright testing framework.

## Directory Structure

- **pageObjects/**: Contains Page Object Models that encapsulate interactions with specific pages
- **fixture/**: Contains test fixtures that handle common setup and teardown operations
- **testData/**: Contains test configuration and test data generators

## Available Tests

- **login.test.ts**: Tests authentication functionality
- **select-study.test.ts**: Tests study selection functionality
- **patient-management.test.ts**: Tests patient management functionality
- **add-patient.test.ts**: Tests adding a new patient to the system

## Running Tests

To run all tests:

```bash
npx playwright test
```

To run a specific test:

```bash
npx playwright test patient-management.test.ts
```

To run tests with UI mode:

```bash
npx playwright test --ui
```

## Test Configuration

Tests read configuration from the `.env` file in the project root:

```
USERNAME=talosix.qa+amxdo@gmail.com
PASSWORD=T@losix91
DOMAIN=https://staging.study.talosix.com
```

## Best Practices

### Element Selection Priority

1. Use data-testid attributes: `page.locator('[data-testid="username"]')`
2. Use other data-* attributes: `page.locator('[data-role="submit"]')`
3. Use id attributes: `page.locator('#login-btn')`
4. As a last resort, use text-based selectors or generic CSS selectors

### Adding New Tests

1. Use the existing page objects when possible
2. Create new page objects for new pages or components as needed
3. Use the study fixture for tests that require authentication and study selection
4. Add explicit waits for loading indicators or network idle
5. Implement proper error handling with try-catch blocks
6. Generate dynamic test data to avoid conflicts between test runs

## Debugging Failed Tests

- Check the screenshots in the test-results directory
- Use the trace viewer: `npx playwright show-trace test-results/trace.zip`
- Run the test with the debug flag: `npx playwright test --debug`
