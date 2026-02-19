import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      TEST_DATABASE_URL: 'postgresql://localhost/blog_test',
    },
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
});
