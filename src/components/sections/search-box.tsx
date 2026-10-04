'use client';

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { Input } from '@/components/ui/input';
import { normalizeQuery } from '@/lib/url-state';

const DEBOUNCE_MS = 200;

interface SearchBoxProps {
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function SearchBox({ value, onChange, disabled = false }: SearchBoxProps) {
  const [draft, setDraft] = useState(value);
  const [emitted, setEmitted] = useState(value);
  const [seen, setSeen] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Adopt a value that changed from outside (e.g. "Clear filters"), but not the echo of what
  // this field just emitted: the URL holds the normalised text and would eat typed spaces.
  if (value !== seen) {
    setSeen(value);
    if (value !== normalizeQuery(emitted)) {
      setDraft(value);
      setEmitted(value);
    }
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  const emit = (next: string) => {
    setEmitted(next);
    onChange?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => emit(next), DEBOUNCE_MS);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    clearTimeout(timer.current);
    setDraft('');
    emit('');
  };

  return (
    <div>
      <label htmlFor="project-search" className="sr-only">
        Search projects
      </label>
      <Input
        id="project-search"
        type="search"
        placeholder="Search projects"
        autoComplete="off"
        value={draft}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
