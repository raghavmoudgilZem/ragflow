import path from "path";
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@legacy': path.resolve(__dirname, './src/legacy'),
      'react-transition-group/TransitionGroupContext': path.resolve(__dirname, 'node_modules/react-transition-group/cjs/TransitionGroupContext.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    server: {
      deps: {
        inline: [/@mui\/material/, /react-transition-group/],
      },
    },
    coverage: {
      provider: 'v8',
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/shared/api/generated/**',
        'scripts/**',
        'src/**/*.stories.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});