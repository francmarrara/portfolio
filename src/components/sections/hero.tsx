import { ContactLink } from '@/components/sections/contact-link';
import { CvDownloadLink } from '@/components/sections/cv-download-link';
import { Badge } from '@/components/ui/badge';
import { primaryStack, yearsOfExperience } from '@/lib/derive';
import type { CareerRole, Profile, SkillsFile } from '@/lib/schemas';

const MAX_STACK = 8;

function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}

interface HeroProps {
  profile: Profile;
  career: CareerRole[];
  skills: SkillsFile;
}

export function Hero({ profile, career, skills }: HeroProps) {
  const years = yearsOfExperience(career);
  const stack = primaryStack(skills).slice(0, MAX_STACK);

  return (
    <section className="py-6 sm:py-10">
      <div className="flex items-center gap-4">
        {profile.avatar ? (
          // Plain <img>: next/image adds an inline style attribute, which the page CSP forbids.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/assets/${profile.avatar}`}
            alt=""
            width={96}
            height={96}
            className="size-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-24 shrink-0 items-center justify-center rounded-full bg-secondary text-3xl font-semibold text-secondary-foreground"
          >
            {initials(profile.name)}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{profile.name}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{profile.title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium">{years}+ years of experience</p>
      <p className="mt-3 max-w-prose text-base leading-relaxed">{profile.summary}</p>
      <ul aria-label="Main stack" className="mt-4 flex flex-wrap gap-2">
        {stack.map((skill) => (
          <li key={skill.name}>
            <Badge variant="secondary">{skill.name}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <CvDownloadLink />
        <ContactLink email={profile.email} />
      </div>
    </section>
  );
}
