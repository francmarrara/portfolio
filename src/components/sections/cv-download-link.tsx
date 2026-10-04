import { Download } from 'lucide-react';
import type { VariantProps } from 'class-variance-authority';

import { buttonVariants } from '@/components/ui/button';
import { CV_FILENAME, CV_PATH } from '@/lib/site';

export function CvDownloadLink({
  variant = 'default',
}: {
  variant?: VariantProps<typeof buttonVariants>['variant'];
}) {
  return (
    <a href={CV_PATH} download={CV_FILENAME} className={buttonVariants({ variant })}>
      <Download aria-hidden="true" />
      Download CV
    </a>
  );
}
