import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: 'src/utils/test-helpers/setup.ts',
  },
});
