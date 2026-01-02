/**
 * Accessibility tests for Navbar component using jest-axe if available
 */
import React from 'react';
import { render } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock secure local storage
jest.mock('react-secure-storage', () => ({
  getItem: jest.fn(() => null),
}));

// Provide a basic fetch mock that returns empty lists for API calls
global.fetch = jest.fn((url) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

// This test will run only if jest-axe is installed; otherwise it will be skipped gracefully.
let axeAvailable = true;
try {
  require.resolve('jest-axe');
} catch (e) {
  axeAvailable = false;
  console.warn('jest-axe not installed — skipping Navbar accessibility axe test.');
}

(axeAvailable ? test : test.skip)('Navbar should have no detectable accessibility violations', async () => {
  const { container } = render(
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  );
  const { axe, toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
