import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CareerRole } from '@/components/sections/career-role';
import type { CareerRole as Role, Technology } from '@/lib/schemas';

const technologies: Technology[] = [
  { slug: 'java', name: 'Java', category: 'language', related_skill: 'Java' },
  { slug: 'python', name: 'Python', category: 'language', related_skill: 'Python' },
  { slug: 'aws', name: 'AWS', category: 'cloud', related_skill: 'AWS' },
];

const current: Role = {
  role: 'Senior Software Engineer',
  company: 'Acme Corp',
  company_url: 'https://acme.example.com',
  start: '2022-07',
  end: null,
  location: 'Remote',
  type: 'Full-time',
  summary: 'Leads a small team and delivers backend systems.',
  responsibilities: ['Technical mentoring', 'Code review'],
  achievements: ['Cut the release time in half'],
  phases: [
    {
      label: 'Phase one — Java',
      period: '2022-07 → ~2023',
      client_sector: 'Energy',
      tech: ['java'],
    },
    {
      label: 'Phase two — Python',
      period: '~2023 → present',
      client_sector: 'Automotive',
      tech: ['python', 'aws'],
    },
  ],
  ai_work: ['Leads the move to agentic programming'],
};

const past: Role = {
  role: 'Software Engineer',
  company: 'Legacy Ltd',
  start: '2019-05-06',
  end: '2022-07',
  location: 'Cosenza, Italy',
  type: 'Full-time',
  summary: 'Worked on a data platform.',
  progression: [
    { title: 'Junior Software Engineer', focus: 'Java backend' },
    { title: 'Software Engineer', focus: 'Registry services' },
  ],
  tech: ['java'],
  notes: ['ClickHouse used for analytics'],
};

describe('CareerRole', () => {
  it('uses a native details element with company, role and period in the summary', () => {
    const { container } = render(<CareerRole role={current} technologies={technologies} />);

    const summary = container.querySelector('details > summary');
    expect(summary).not.toBeNull();
    expect(summary).toHaveTextContent('Acme Corp');
    expect(summary).toHaveTextContent('Senior Software Engineer');
    expect(summary).toHaveTextContent('Jul 2022 – present');
  });

  it('is open only for the current role', () => {
    const { container: open } = render(<CareerRole role={current} technologies={technologies} />);
    const { container: closed } = render(<CareerRole role={past} technologies={technologies} />);

    expect(open.querySelector('details')).toHaveAttribute('open');
    expect(closed.querySelector('details')).not.toHaveAttribute('open');
  });

  it('shows the end date of a past role instead of "present"', () => {
    const { container } = render(<CareerRole role={past} technologies={technologies} />);

    const summary = container.querySelector('summary');
    expect(summary).toHaveTextContent('May 2019 – Jul 2022');
    expect(summary).not.toHaveTextContent('present');
  });

  it('keeps the whole detail in the DOM even when closed', () => {
    render(<CareerRole role={past} technologies={technologies} />);

    expect(screen.getByText('Worked on a data platform.')).toBeInTheDocument();
    expect(screen.getByText('ClickHouse used for analytics')).toBeInTheDocument();
  });

  it('shows summary, responsibilities, achievements, phases and ai work', () => {
    render(<CareerRole role={current} technologies={technologies} />);

    expect(screen.getByText('Leads a small team and delivers backend systems.')).toBeVisible();
    expect(screen.getByText('Technical mentoring')).toBeInTheDocument();
    expect(screen.getByText('Code review')).toBeInTheDocument();
    expect(screen.getByText('Cut the release time in half')).toBeInTheDocument();
    expect(screen.getByText('Leads the move to agentic programming')).toBeInTheDocument();

    const phases = screen.getByRole('list', { name: 'Phases' });
    const items = [...phases.querySelectorAll(':scope > li')];
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Phase one — Java');
    expect(items[0]).toHaveTextContent('2022-07 → ~2023');
    expect(items[0]).toHaveTextContent('Energy');
    expect(items[0]).toHaveTextContent('Java');
    expect(items[1]).toHaveTextContent('Python');
    expect(items[1]).toHaveTextContent('AWS');
  });

  it('shows progression and notes for a role that has them', () => {
    render(<CareerRole role={past} technologies={technologies} />);

    const progression = screen.getByRole('list', { name: 'Progression' });
    expect(progression).toHaveTextContent('Junior Software Engineer');
    expect(progression).toHaveTextContent('Java backend');
    expect(progression).toHaveTextContent('Registry services');
  });

  it('lists every technology of the role once', () => {
    render(<CareerRole role={current} technologies={technologies} />);

    const tech = screen.getByRole('list', { name: 'Technologies' });
    expect(
      within(tech)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Java', 'Python', 'AWS']);
  });

  it('omits the optional blocks that are absent', () => {
    render(<CareerRole role={past} technologies={technologies} />);

    for (const label of ['Responsibilities', 'Achievements', 'Phases', 'AI work']) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });

  it('links the company when a URL is given', () => {
    render(<CareerRole role={current} technologies={technologies} />);

    expect(screen.getByRole('link', { name: /Acme Corp website/ })).toHaveAttribute(
      'href',
      'https://acme.example.com',
    );
  });
});
