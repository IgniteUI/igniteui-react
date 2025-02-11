import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    lib: {
      entry: {
        components: './src/components.ts',
        grids: './src/grids.ts',
        // disable hash:
        'template-renderer': './src/react-props.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^react/, /^lit|^@lit/, /^@floating-ui/, /^igniteui/, /^@infragistics\/igniteui/],
    },
  },
  optimizeDeps: {
    include: ['react/jsx-dev-runtime'],
  },
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      viewport: { height: 1000, width: 1000 },
      instances: [
        {
          browser: 'chromium',
          // https://vitest.dev/guide/browser/playwright.html#configuring-playwright
        },
      ],
    },
    reporters: process.env.CI
      ? ['default', ['junit', { suiteName: 'React Wrappers tests' }]]
      : ['default'],
    outputFile: {
      junit: './test-report/junit-report.xml',
    },
    coverage: {
      reporter: ['cobertura', 'html'],
      include: ['src/**'],
      exclude: ['src/components/**', 'src/grids/**', 'src/dock-manager/**', 'src/vite-env.d.ts'],
    },
  },
});
