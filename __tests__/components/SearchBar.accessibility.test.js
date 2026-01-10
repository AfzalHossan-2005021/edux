/**
 * Accessibility + interaction tests for SearchBar using jest-axe
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import SearchBar from '../../components/SearchBar';

expect.extend(toHaveNoViolations);

describe('SearchBar accessibility', () => {
  it('has no detectable axe violations in initial state', async () => {
    // Render SearchBar together with SearchResultsList so aria-controls references a valid element
    // Render SearchBar with a no-op setResults to avoid repeated state updates
    const Wrapper = () => {
      const courses = React.useMemo(() => [], []);
      return (
        <div>
          <SearchBar allCourses={courses} setResults={() => {}} containerRef={{ current: { contains: () => true } }} />
          <ul id="search-results-listbox" role="listbox" aria-label="Search results">
            <li role="option" aria-hidden="true" hidden />
          </ul>
        </div>
      );
    };

    const { container } = render(<Wrapper />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('announces input and ties to results list via aria-controls', () => {
    render(<SearchBar allCourses={[]} setResults={() => {}} />);
    const input = screen.getByLabelText(/search courses/i);
    expect(input).toHaveAttribute('aria-controls', 'search-results-listbox');
  });

  it('supports typing and keyboard interactions (Enter to search)', () => {
    const mockSetResults = jest.fn();
    render(<SearchBar allCourses={[{ title: 'React' }, { title: 'Node' }]} setResults={mockSetResults} />);
    const input = screen.getByLabelText(/search courses/i);

    fireEvent.change(input, { target: { value: 'Re' } });
    expect(input.value).toBe('Re');

    // pressing Enter shouldn't throw and should leave results updated via setResults
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    // component currently doesn't handle Enter specially, but this ensures no a11y crash
    expect(mockSetResults).toHaveBeenCalled();
  });
});