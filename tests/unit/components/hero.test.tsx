import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Hero } from '@/components/sections/hero';
import type { CareerRole, Profile, SkillsFile } from '@/lib/schemas';

const profile: Profile = {
  name: 'Test Person',
  title: 'Senior Software Engineer',
  location: 'Rome, Italy',
  email: 'test.person@example.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/test-person',
    github: 'https://github.com/test-person',
  },
  summary: 'Backend engineer working with Java and Python on AWS.',
  spoken_languages: [{ name: 'English', level: 'professional' }],
  body: 'Long bio.',
};

const role = (start: string): CareerRole => ({
  role: 'Engineer',
  company: 'Acme',
  start,
  end: null,
  location: 'Rome',
  type: 'Full-time',
  summary: 'Work.',
  tech: ['java'],
});

const skill = (name: string, highlight?: boolean) => ({
  name,
  level: 'expert' as const,
  ...(highlight ? { highlight } : {}),
});

const skills: SkillsFile = {
  languages: [skill('Java', true), skill('Kotlin')],
  frameworks: [skill('Spring Boot', true)],
  cloud: [skill('AWS', true)],
  databases: [skill('MySQL')],
  devops: [skill('Docker')],
  messaging: [skill('Kafka')],
  ai: [skill('Agentic programming', true)],
  testing: [skill('JUnit')],
};

const careerFrom = (start: string) => [role('2022-07'), role(start)];

describe('Hero', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the name as the only h1, then the title and the summary', () => {
    render(<Hero profile={profile} career={careerFrom('2019-05-06')} skills={skills} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Test Person' })).toBeInTheDocument();
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText(profile.summary)).toBeInTheDocument();
  });

  it('shows the years of experience rounded down from the oldest role', () => {
    render(<Hero profile={profile} career={careerFrom('2019-05-06')} skills={skills} />);
    expect(screen.getByText('7+ years of experience')).toBeInTheDocument();
  });

  it('does not round up a few days before the anniversary', () => {
    render(<Hero profile={profile} career={careerFrom('2019-06-20')} skills={skills} />);
    expect(screen.getByText('6+ years of experience')).toBeInTheDocument();
  });

  it('lists only the highlighted skills as the main stack', () => {
    render(<Hero profile={profile} career={careerFrom('2019-05-06')} skills={skills} />);

    const stack = screen.getByRole('list', { name: 'Main stack' });
    expect(
      within(stack)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Java', 'Spring Boot', 'AWS', 'Agentic programming']);
  });

  it('shows at most 8 stack badges', () => {
    const many: SkillsFile = {
      ...skills,
      languages: Array.from({ length: 10 }, (_, index) => skill(`Lang ${index}`, true)),
    };
    render(<Hero profile={profile} career={careerFrom('2019-05-06')} skills={many} />);

    const stack = screen.getByRole('list', { name: 'Main stack' });
    expect(within(stack).getAllByRole('listitem')).toHaveLength(8);
  });

  it('shows the email contact link', () => {
    render(<Hero profile={profile} career={careerFrom('2019-05-06')} skills={skills} />);

    expect(screen.getByRole('link', { name: /test\.person@example\.com/ })).toHaveAttribute(
      'href',
      'mailto:test.person@example.com',
    );
  });

  it('offers the CV download', () => {
    render(<Hero profile={profile} career={careerFrom('2019-05-06')} skills={skills} />);

    expect(screen.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv.pdf');
  });

  it('shows a decorative 96x96 avatar next to the name when present', () => {
    const { container } = render(
      <Hero
        profile={{ ...profile, avatar: 'avatar.webp' }}
        career={careerFrom('2019-05-06')}
        skills={skills}
      />,
    );

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', '/assets/avatar.webp');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('width', '96');
    expect(image).toHaveAttribute('height', '96');
  });

  it('falls back to hidden initials without an avatar', () => {
    const { container } = render(
      <Hero profile={profile} career={careerFrom('2019-05-06')} skills={skills} />,
    );

    expect(container.querySelector('img')).toBeNull();
    const initials = container.querySelector('[aria-hidden="true"]:not(svg)');
    expect(initials).toHaveTextContent('TP');
  });
});
