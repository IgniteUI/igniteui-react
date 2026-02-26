import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: 'esnext',
    lib: {
      entry: {
        components: './src/components.ts',
        extras: './src/extras/index.tsx',
        grids: './src/grids.ts',
        'grid-lite': './src/grid-lite.ts',
        'dock-manager': './src/dock-manager.ts',
        // disable hash:
        'template-renderer': './src/react-props.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        /^react/,
        /^lit|^@lit/,
        /^@floating-ui/,
        /^igniteui/,
        /^@infragistics\/igniteui/,
        /^marked/,
        /^shiki/,
        /^dompurify/,
      ],
    },
  },
  optimizeDeps: {
    include: ['react/jsx-dev-runtime'],
  },
  plugins: [tsconfigPaths()],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
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
