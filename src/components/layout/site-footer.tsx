import { ContactLink } from '@/components/sections/contact-link';

interface SiteFooterProps {
  name: string;
  email: string;
  linkedin: string;
  github: string;
  year: number;
}

const linkClass = 'underline underline-offset-4 hover:no-underline';

export function SiteFooter({ name, email, linkedin, github, year }: SiteFooterProps) {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li>
            <ContactLink email={email} />
          </li>
          <li>
            <a href={linkedin} rel="noopener noreferrer" className={linkClass}>
              LinkedIn
            </a>
          </li>
          <li>
            <a href={github} rel="noopener noreferrer" className={linkClass}>
              GitHub
            </a>
          </li>
          <li>
            <a href="/rss.xml" className={linkClass}>
              RSS
            </a>
          </li>
        </ul>
        <p className="text-muted-foreground">
          © {year} {name}
        </p>
      </div>
    </footer>
  );
}
