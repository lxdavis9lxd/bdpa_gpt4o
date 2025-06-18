# Playwright end-to-end test setup for BDPADrive
# 1. Install Playwright
yarn add -D @playwright/test
# or
npm install --save-dev @playwright/test

# 2. Install browsers
npx playwright install

# 3. Run tests
npx playwright test

# 4. To open the UI test runner (optional)
npx playwright test --ui

# Tests will be placed in the 'tests' directory.
