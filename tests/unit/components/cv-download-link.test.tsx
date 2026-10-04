import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CvDownloadLink } from '@/components/sections/cv-download-link';

describe('CvDownloadLink', () => {
  it('downloads the generated CV with a fixed file name', () => {
    render(<CvDownloadLink />);

    const link = screen.getByRole('link', { name: 'Download CV' });
    expect(link).toHaveAttribute('href', '/cv.pdf');
    expect(link).toHaveAttribute('download', 'Francesco-Marrara-CV.pdf');
  });

  it('hides the decorative icon from assistive technology', () => {
    const { container } = render(<CvDownloadLink />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts a variant for secondary placements', () => {
    render(<CvDownloadLink variant="outline" />);

    expect(screen.getByRole('link', { name: 'Download CV' })).toHaveClass('border');
  });
});
