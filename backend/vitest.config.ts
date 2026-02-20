import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      TEST_DATABASE_URL: 'postgresql://localhost/blog_test',
      ADMIN_PASSWORD_HASH: '$2b$10$1NPoyCrYBYxS/1shvCy9o.tK.Ce7.cCJRCJpgWrkTUiXm/lUZ84u2',
      SESSION_SECRET: 'test-session-secret',
    },
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
});
