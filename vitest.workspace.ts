import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: 'vite.config.ts',
    optimizeDeps: {
      include: ['react/jsx-dev-runtime'],
    },
    test: {
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
        viewport: { height: 1000, width: 1000 },
        // https://playwright.dev
        providerOptions: {},
      },
    },
  },
]);
