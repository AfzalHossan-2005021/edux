/**
 * Accessibility tests for Navbar component using jest-axe
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '../../../components/Navbar';

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

expect.extend(toHaveNoViolations);

test('Navbar should have no detectable accessibility violations', async () => {
  const { container } = render(<Navbar />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
