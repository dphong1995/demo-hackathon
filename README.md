# Talosix EDC Automated Testing Framework

This framework provides automated testing for the Talosix EDC application using Playwright. It follows best practices for web application testing with a focus on maintainability, reliability, and readability.

## Table of Contents

- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Page Objects](#page-objects)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Configuration

The testing framework uses a centralized configuration approach to make it easier to manage environment-specific settings.

### Environment Variables

Create a `.env` file in the project root directory with the following variables:
```
USERNAME=your-username
PASSWORD=your-password
DOMAIN=https://staging.study.talosix.com
```

### Configuration Files

- `test-config.ts`: Central configuration for all tests
- `playwright.config.ts`: Playwright-specific configuration

## Running Tests

### Running All Tests

```bash
npx playwright test
```

### Running Specific Tests

```bash
npx playwright test patient-management.test.ts
```

### Running Tests with UI Mode

```bash
npx playwright test --ui
```

### Running Tests with Different Configuration

```bash
# Run tests against a different environment
DOMAIN=https://other-environment.talosix.com npx playwright test

# Run tests with a different user
USERNAME=another-user@example.com PASSWORD=another-password npx playwright test
```

## Test Structure

The tests are organized as follows:

```
├── tests/
│   ├── pageObjects/
│   │   ├── talosix-page-objects.ts
│   │   ├── patientManagementPage.ts
│   ├── fixture/
│   ├── testData/
│   │   ├── test-config.ts
│   ├── patient-management.test.ts
│   ├── login.test.ts
│   ├── select-study.test.ts
│   ├── add-patient.test.ts
│   ├── README.md
├── playwright.config.ts
├── .env
├── package.json
└── README.md
```

## Page Objects

Page objects encapsulate the interaction with specific pages or components of the application. They provide a higher-level API for test scripts, improving maintainability and reusability.

### Key Page Objects

- `LoginPage`: Handles authentication operations
- `StudySelectionPage`: Manages study selection operations
- `PatientManagementPage`: Handles patient-related operations

### Example Usage

```javascript
import { LoginPage } from './pageObjects/talosix-page-objects';

test('Login test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage(config.baseUrl);
  await loginPage.login(config.credentials.username, config.credentials.password);
  // Add assertions here
});
```

## Best Practices

### Element Selection Priority

1. Use data-testid attributes: `page.locator('[data-testid="username"]')`
2. Use other data-* attributes: `page.locator('[data-role="submit"]')`
3. Use id attributes: `page.locator('#login-btn')`
4. Only as a last resort, use text-based selectors or generic CSS selectors

### Waiting for Elements

Always use explicit waits for loading indicators or network idle:

```javascript
// Wait for loading indicator to disappear
await page.locator('[data-testid="loading"]').waitFor({ state: 'hidden' });

// Wait for network idle
await page.waitForLoadState('networkidle');
```

### Error Handling

Implement try-catch blocks for critical operations:

```javascript
try {
  await someOperation();
} catch (error) {
  console.error('Operation failed:', error);
  await page.screenshot({ path: `failure-${Date.now()}.png` });
  throw error;
}
```

### Test Data Generation

Generate unique test data for each test run:

```javascript
import { v4 as uuidv4 } from 'uuid';

const email = `test.${uuidv4().substring(0, 8)}@example.com`;
```

## Troubleshooting

### Common Issues

1. **Test timeout issues**:
   - Increase timeout in playwright.config.ts
   - Check for loading indicators or network requests

2. **Element not found**:
   - Verify selectors with browser dev tools
   - Add explicit waits
   - Take screenshot at the point of failure for analysis

3. **Authentication failures**:
   - Check environment variables
   - Verify login workflow in the application
   - Use tracing for debugging: `npx playwright test --trace on`

### Debugging Tips

- Use `console.log()` to print values during test execution
- Add `page.pause()` to pause execution and inspect the state
- Use Playwright UI mode: `npx playwright test --ui`
- Enable traces: `npx playwright test --trace on`

### Getting Help

- Check Playwright documentation: https://playwright.dev/docs/intro
- Review existing tests for similar functionality
- Contact the QA team for specific application questions
