import { defineConfig } from 'vitest/config';

export default async () => {
  return defineConfig({
    test: {
      clearMocks: true,
      silent: true, // we disable console log because we have some test that are expected to throw errors
      outputFile: {
        junit: 'junit.xml',
      },
      coverage: {
        reporter: ['json'],
        provider: 'istanbul',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.test.{ts,tsx}',
          // Root files only combine existing functions. We can apply functional tests, but not unit tests here
          'src/{index,resolvers,schema,rest-routes}.ts',
          // Schema definition has no functions
          'src/**/*.schema.{ts,tsx}',
          // Database migrations have no business logic to test
          'src/database/**/*.{ts,tsx}',
          // Types have no business logic to test
          'src/types/**/*.{ts,tsx}',
        ],
      },
    },
  });
};
