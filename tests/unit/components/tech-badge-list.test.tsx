import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TechBadgeList } from '@/components/sections/tech-badge-list';
import type { Technology } from '@/lib/schemas';

const technologies: Technology[] = [
  { slug: 'java', name: 'Java', category: 'language', related_skill: 'Java' },
  { slug: 'spring-boot', name: 'Spring Boot', category: 'framework', related_skill: 'Spring Boot' },
];

describe('TechBadgeList', () => {
  it('shows the display name of each technology', () => {
    render(<TechBadgeList slugs={['java', 'spring-boot']} technologies={technologies} />);

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Java',
      'Spring Boot',
    ]);
  });

  it('falls back to the slug when the technology is unknown', () => {
    render(<TechBadgeList slugs={['cobol']} technologies={technologies} />);

    expect(screen.getByText('cobol')).toBeInTheDocument();
  });

  it('does not render links by default', () => {
    render(<TechBadgeList slugs={['java']} technologies={technologies} />);

    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links each badge to the filtered projects list with linkToFilter', () => {
    render(<TechBadgeList slugs={['spring-boot']} technologies={technologies} linkToFilter />);

    expect(screen.getByRole('link', { name: 'Spring Boot' })).toHaveAttribute(
      'href',
      '/projects?tech=spring-boot',
    );
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<TechBadgeList slugs={[]} technologies={technologies} />);

    expect(container).toBeEmptyDOMElement();
  });
});
