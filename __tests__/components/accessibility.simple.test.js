import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';
import SearchResultsList from '../../components/SearchResultsList';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext'; // added for components that use useAuth

// Mock secure local storage
jest.mock('react-secure-storage', () => ({
  getItem: jest.fn((key) => (key === 'u_id' ? '1' : null)),
}));

// Basic fetch mock that includes headers for JSON parsing used by api helpers
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

describe('Basic accessibility attributes', () => {
  it('Navbar should have wishlist and user menu buttons with ARIA', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
          </ThemeProvider>
        </AuthProvider>
      );
      // allow effects to run
      await Promise.resolve();
    });

    // Wait for auth to resolve and the navbar to update to logged-in state
    const wishlistBtn = await screen.findByLabelText(/wishlist/i);
    const userMenuBtn = await screen.findByLabelText(/account|open user menu/i);

    expect(wishlistBtn).toBeInTheDocument();
    expect(userMenuBtn).toBeInTheDocument();
  });

  it('SearchBar input should have accessible label', async () => {
    await act(async () => {
      render(<SearchBar setResults={() => {}} allCourses={[]} />);
      await Promise.resolve();
    });
    const input = screen.getByLabelText(/search courses/i);
    expect(input).toBeInTheDocument();
  });

  it('SearchResultsList should expose a listbox and options', async () => {
    const mockResults = [
      { c_id: 1, title: 'One' },
      { c_id: 2, title: 'Two' },
    ];
    await act(async () => {
      render(<SearchResultsList results={mockResults} setResults={() => {}} />);
      await Promise.resolve();
    });

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);
  });
});
