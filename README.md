# Playwright Automation Project

## Project Structure

```
/
├── .DS_Store
├── .env
├── .git/
├── .gitignore
├── .idea/
├── README.md
├── config/
├── fixtures/
├── login-recorded.js
├── node_modules/
├── package-lock.json
├── package.json
├── page-objects/
├── playwright-report/
├── playwright.config.ts
├── test-results/
├── tests/
│   ├── README.md
│   ├── auth/
│   ├── config/
│   ├── data-management-navigation.test.ts
│   ├── data-management.test.ts
│   ├── fixture-usage.test.ts
│   ├── fixture/
│   │   └── auth-fixture.ts
│   ├── fixtures/
│   ├── helper-usage.test.ts
│   ├── helpers/
│   │   └── talosix-helper.ts
│   ├── lantern/
│   ├── login.test.ts
│   ├── pageObjects/
│   │   ├── basePage.ts
│   │   ├── dataManagementPage.ts
│   │   ├── index.ts
│   │   ├── loginPage.ts
│   │   ├── navigationMenu.ts
│   │   ├── patientManagementPage.ts
│   │   ├── patientRegistrationForm.ts
│   │   ├── patientSummaryPage.ts
│   │   ├── studySelectionPage.ts
│   │   └── talosix-page-objects.ts
│   ├── pages/
│   ├── patient-count.test.ts
│   ├── patient-search.test.ts
│   ├── select-study.test.ts
│   └── testData/
└── utils/
```

This project is a Playwright automation testing framework for the Talosix EDC application. The structure follows best practices with separate directories for tests, page objects, fixtures, and utilities.
