import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    lib: {
      entry: {
        components: './src/components/index.ts',
        'dock-manager': './src/dock-manager/index.ts',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^react/, /^lit|^@lit/, /^@floating-ui/, /^igniteui/],
    },
  },
});
