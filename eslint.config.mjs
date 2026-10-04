import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
    },
  },
  {
    ignores: [
      'out/',
      '.next/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '.lighthouseci/',
      '.lhci-dist/',
    ],
  },
];

export default config;
