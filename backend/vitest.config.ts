import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      TEST_DATABASE_URL: 'postgresql://localhost/blog_test',
      ADMIN_PASSWORD_HASH: '$2b$10$1NPoyCrYBYxS/1shvCy9o.tK.Ce7.cCJRCJpgWrkTUiXm/lUZ84u2',
      SESSION_SECRET: 'test-session-secret',
      NOTIFICATION_EMAIL: 'test@example.com',
      AI_REVIEW_ENABLED: 'true',
      AI_REVIEW_PROVIDER: 'gemini',
      GEMINI_API_KEY: 'test-api-key',
      AI_AUTO_APPROVE_ENABLED: 'true',
      AI_AUTO_APPROVE_THRESHOLD: '0.9',
    },
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    // Serial execution required: all test files share a single test database,
    // and afterEach teardown deletes all rows — parallel runs would corrupt each other's data
    maxWorkers: 1,
  },
});
