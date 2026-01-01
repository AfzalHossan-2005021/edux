/**
 * SearchBar Component Tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../../components/SearchBar';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockReset();
  });

  it('renders search input', () => {
    render(<SearchBar setResults={jest.fn()} />);
    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<SearchBar setResults={jest.fn()} />);
    const input = screen.getByPlaceholderText(/search/i);
    
    fireEvent.change(input, { target: { value: 'react' } });
    expect(input.value).toBe('react');
  });

  it('calls setResults with empty array when search is cleared', async () => {
    const mockSetResults = jest.fn();
    render(<SearchBar setResults={mockSetResults} />);
    
    const input = screen.getByPlaceholderText(/search/i);
    
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.change(input, { target: { value: '' } });
    
    await waitFor(() => {
      expect(mockSetResults).toHaveBeenCalledWith([]);
    });
  });

  it('fetches suggestions on input', async () => {
    const mockSetResults = jest.fn();
    const mockCourses = [
      { C_ID: 1, C_NAME: 'React Course' },
      { C_ID: 2, C_NAME: 'React Advanced' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCourses),
    });

    render(<SearchBar setResults={mockSetResults} />);
    const input = screen.getByPlaceholderText(/search/i);

    fireEvent.change(input, { target: { value: 'react' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
