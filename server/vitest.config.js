import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    globals: true,
    fileParallelism: false, // Ensure DB tests do not conflict
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test_jwt_secret',
      ADMIN_SECRET: 'test_admin_secret',
    },
  },
});
