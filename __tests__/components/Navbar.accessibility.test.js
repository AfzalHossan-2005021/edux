/**
 * Accessibility tests for Navbar component using jest-axe if available
 */
import React from 'react';
import { render } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext'; // Add this import

// Mock secure local storage
jest.mock('react-secure-storage', () => ({
  getItem: jest.fn(() => null),
}));

// Provide a basic fetch mock that returns sensible responses for API calls
global.fetch = jest.fn((url) => {
  if (typeof url === 'string' && url.includes('/api/me')) {
    return Promise.resolve({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ success: true, user: { u_id: '1', name: 'Test User' } }),
    });
  }

  return Promise.resolve({
    ok: true,
    headers: { get: () => 'application/json' },
    json: () => Promise.resolve([]),
  });
});

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
    <AuthProvider>
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    </AuthProvider>
  );
  const { axe, toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});