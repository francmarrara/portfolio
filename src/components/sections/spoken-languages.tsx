import type { Profile } from '@/lib/schemas';

type Language = Profile['spoken_languages'][number];

const LEVELS: Record<Language['level'], string> = {
  native: 'Native',
  professional: 'Professional',
  intermediate: 'Intermediate',
  basic: 'Basic',
};

export function SpokenLanguages({ languages }: { languages: Language[] }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-1">
      {languages.map((language) => (
        <li key={language.name}>
          <span className="font-medium">{language.name}</span>: {LEVELS[language.level]}
        </li>
      ))}
    </ul>
  );
}
