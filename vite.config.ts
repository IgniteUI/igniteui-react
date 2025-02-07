import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    lib: {
      entry: {
        components: './src/components.ts',
        grids: './src/grids/index.ts',
        // TODO: disable hash entirely to skip entries?
        'template-renderer': './src/react-props.tsx',
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^react/, /^lit|^@lit/, /^@floating-ui/, /^igniteui/],
    },
  },
});
