import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ProjectPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from '@/app/projects/[slug]/page';
import { SITE_URL } from '@/lib/site';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe('Project page', () => {
  it('generates one static page per project and rejects unknown slugs', () => {
    expect(
      generateStaticParams()
        .map((entry) => entry.slug)
        .sort(),
    ).toEqual(['alpha', 'beta']);
    expect(dynamicParams).toBe(false);
  });

  it('renders the case study and the TechArticle JSON-LD', async () => {
    const html = renderToStaticMarkup(await ProjectPage(params('alpha')));

    expect(html).toMatch(/<h1[^>]*>Alpha Platform<\/h1>/);
    expect(html).toContain('"@type":"TechArticle"');
    expect(html.match(/<h2/g)).toHaveLength(8);
  });

  it('uses the subtitle as description and article as og:type', async () => {
    const metadata = await generateMetadata(params('alpha'));

    expect(metadata.title).toBe('Alpha Platform — Francesco Marrara');
    expect(metadata.description).toBe('A cloud-native backend for an energy company');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/projects/alpha`);
    expect(metadata.openGraph).toMatchObject({ type: 'article' });
  });
});
