import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CareerTimeline } from '@/components/sections/career-timeline';
import type { CareerRole, Technology } from '@/lib/schemas';

const technologies: Technology[] = [
  { slug: 'java', name: 'Java', category: 'language', related_skill: 'Java' },
];

const role = (company: string, start: string, end: string | null): CareerRole => ({
  role: 'Engineer',
  company,
  start,
  end,
  location: 'Remote',
  type: 'Full-time',
  summary: `Summary at ${company}`,
  tech: ['java'],
});

describe('CareerTimeline', () => {
  it('orders the roles by start date, newest first', () => {
    const { container } = render(
      <CareerTimeline
        career={[
          role('Oldest', '2015-01', '2017-01'),
          role('Newest', '2022-07', null),
          role('Middle', '2018-03-15', '2022-07'),
        ]}
        technologies={technologies}
      />,
    );

    const companies = [...container.querySelectorAll('summary')].map((summary) =>
      ['Newest', 'Middle', 'Oldest'].find((name) => summary.textContent?.includes(name)),
    );
    expect(companies).toEqual(['Newest', 'Middle', 'Oldest']);
  });

  it('renders one details element per role', () => {
    const { container } = render(
      <CareerTimeline
        career={[role('A', '2015-01', '2017-01'), role('B', '2018-01', null)]}
        technologies={technologies}
      />,
    );

    expect(container.querySelectorAll('details')).toHaveLength(2);
  });
});
