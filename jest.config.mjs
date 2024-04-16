/** @type {import('jest').Config} */
const config = {
  verbose: true,
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/*.spec.js'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
};

export default config;
