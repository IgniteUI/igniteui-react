import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: 'vite.config.ts',
    optimizeDeps: {
      include: ['react/jsx-dev-runtime'],
    },
    test: {
      deps: {
        optimizer: {
          web: {
            enabled: true,
          },
        },
      },
      browser: {
        enabled: true,
        provider: 'playwright',
        headless: false,
        viewport: { height: 1000, width: 1000 },
        instances: [
          {
            browser: 'chromium',
            // https://vitest.dev/guide/browser/playwright.html#configuring-playwright
          },
        ],
      },
    },
  },
]);
