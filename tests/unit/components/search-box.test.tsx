import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchBox } from '@/components/sections/search-box';

describe('SearchBox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is a labelled search input', () => {
    render(<SearchBox value="" onChange={vi.fn()} />);

    const input = screen.getByRole('searchbox', { name: 'Search projects' });
    expect(input).toHaveAttribute('type', 'search');
  });

  it('shows the current value', () => {
    render(<SearchBox value="cloud" onChange={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('cloud');
  });

  it('notifies the change once, 200 ms after the last keystroke', () => {
    const onChange = vi.fn();
    render(<SearchBox value="" onChange={onChange} />);
    const input = screen.getByRole('searchbox');

    fireEvent.change(input, { target: { value: 'cl' } });
    act(() => vi.advanceTimersByTime(150));
    fireEvent.change(input, { target: { value: 'cloud' } });
    act(() => vi.advanceTimersByTime(199));
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('cloud');
  });

  it('empties the field and notifies immediately on Escape', () => {
    const onChange = vi.fn();
    render(<SearchBox value="cloud" onChange={onChange} />);
    const input = screen.getByRole('searchbox');

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input).toHaveValue('');
    expect(onChange).toHaveBeenCalledWith('');
    act(() => vi.advanceTimersByTime(500));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('follows the value when it changes from outside', () => {
    const { rerender } = render(<SearchBox value="cloud" onChange={vi.fn()} />);

    rerender(<SearchBox value="" onChange={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('can be disabled', () => {
    render(<SearchBox value="" disabled />);

    expect(screen.getByRole('searchbox')).toBeDisabled();
  });
});
