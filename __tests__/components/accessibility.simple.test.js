import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../../components/Navbar';
import SearchBar from '../../components/SearchBar';
import SearchResultsList from '../../components/SearchResultsList';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock secure local storage
jest.mock('react-secure-storage', () => ({
  getItem: jest.fn((key) => (key === 'u_id' ? '1' : null)),
}));

// Basic fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
);

describe('Basic accessibility attributes', () => {
  it('Navbar should have wishlist and user menu buttons with ARIA', () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const wishlistBtn = screen.getByLabelText(/open wishlist/i);
    const userMenuBtn = screen.getByLabelText(/open user menu/i);

    expect(wishlistBtn).toBeInTheDocument();
    expect(userMenuBtn).toBeInTheDocument();
  });

  it('SearchBar input should have accessible label', () => {
    render(<SearchBar setResults={() => {}} allCourses={[]} />);
    const input = screen.getByLabelText(/search courses/i);
    expect(input).toBeInTheDocument();
  });

  it('SearchResultsList should expose a listbox and options', () => {
    const mockResults = [
      { c_id: 1, title: 'One' },
      { c_id: 2, title: 'Two' },
    ];
    render(<SearchResultsList results={mockResults} setResults={() => {}} />);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(2);
  });
});
