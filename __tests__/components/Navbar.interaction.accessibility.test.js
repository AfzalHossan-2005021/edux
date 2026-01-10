/**
 * Interaction and accessibility tests for Navbar
 */
import React from 'react';

// Mock react-secure-storage to avoid canvas/browser fingerprinting in tests
jest.mock('react-secure-storage', () => ({
  getItem: jest.fn((key) => (key === 'u_id' ? '1' : key === 'u_name' ? 'Test User' : key === 'u_email' ? 'test@example.com' : null)),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '../../components/Navbar';
import { ThemeProvider } from '../../context/ThemeContext';

expect.extend(toHaveNoViolations);

describe('Navbar interactions & accessibility', () => {
  beforeEach(() => {
    // Mock secure local storage to simulate logged-in user
    jest.mocked = jest.fn();
    jest.spyOn(require('react-secure-storage'), 'getItem').mockImplementation((key) => {
      if (key === 'u_id') return '1';
      if (key === 'u_name') return 'Test User';
      if (key === 'u_email') return 'test@example.com';
      return null;
    });

    // Basic fetch mock for wishlist & courses
    global.fetch = jest.fn((url) =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
  });

  it('wishlist and user menu buttons toggle aria-expanded and menus have roles', async () => {
    const { container } = render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const wishlistBtn = screen.getByLabelText(/open wishlist/i);
    const userMenuBtn = screen.getByLabelText(/open user menu/i);

    // Buttons should be focusable
    wishlistBtn.focus();
    expect(document.activeElement).toBe(wishlistBtn);

    // Click wishlist to open
    fireEvent.click(wishlistBtn);
    expect(wishlistBtn).toHaveAttribute('aria-expanded', 'true');

    // The wishlist menu should be present and its internal list should have role="menu"
    const wishlistList = container.querySelector('#wishlist-dropdown [role="menu"]');
    expect(wishlistList).toBeInTheDocument();

    // Click user menu to open
    fireEvent.click(userMenuBtn);
    expect(userMenuBtn).toHaveAttribute('aria-expanded', 'true');

    const userList = container.querySelector('#user-dropdown [role="menu"]');
    expect(userList).toBeInTheDocument();

    // Press Escape should close menus if implemented (graceful if not)
    fireEvent.keyDown(window, { key: 'Escape' });

    // Run axe on the container
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('removing a wishlist item uses accessible button with label', async () => {
    // Render with one wishlist item wired into DOM via props by mocking Navbar's fetch response
    global.fetch = jest.fn((url) =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([{ c_id: 5, title: 'Course A' }]) })
    );

    const { container } = render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const wishlistBtn = screen.getByLabelText(/open wishlist/i);
    fireEvent.click(wishlistBtn);

    const removeBtn = await screen.findByLabelText(/remove course a from wishlist/i);
    expect(removeBtn).toBeInTheDocument();

    // Clicking remove should not cause a11y violations
    fireEvent.click(removeBtn);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
