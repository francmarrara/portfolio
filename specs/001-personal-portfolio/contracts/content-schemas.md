# Contract: Content Schemas

**Feature**: [spec.md](../spec.md) | **Model**: [data-model.md](../data-model.md) |
**Implementazione**: `src/lib/schemas.ts` (Zod 4)

Questo è il contratto tra `content/` e il codice. Qualsiasi file che non lo rispetta fa fallire
`pnpm build` (FR-003, FR-013). Gli schemi sotto sono normativi: l'implementazione può
riorganizzarli in più file, ma non allentarli senza aggiornare questo contratto.

## Regole generali

- Parser: `yaml` (YAML 1.2, schema `core`) per `.yaml` e per il frontmatter (engine di
  `gray-matter`). Nessuna conversione automatica in `Date`.
- Tutti gli oggetti sono `strictObject`: chiavi sconosciute = errore.
- Stringhe: `trim()` e non vuote, salvo dove indicato.
- URL esterni: solo `https`.
- Il percorso di ogni file è parte del messaggio d'errore.

## Primitive

```ts
import { z } from 'zod';

export const NonEmpty = z.string().trim().min(1);

export const Slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case (a-z, 0-9, -)');

export const HttpsUrl = z.url({ protocol: /^https$/ });

// "2019-05" or "2019-05-06"
export const YearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/, 'expected YYYY-MM or YYYY-MM-DD');

// "2019 → 2020", "2022-07 → ~2023", "~2024 → present"
const POINT = String.raw`~?\d{4}(?:-(?:0[1-9]|1[0-2]))?`;
export const Period = z
  .string()
  .regex(new RegExp(`^${POINT} → (?:${POINT}|present)$`), 'expected "<start> → <end|present>"');

// Relative to content/assets/. Existence and size (≤ 300 KB) are checked in the cross-file pass.
export const AssetPath = z
  .string()
  .regex(/^[a-z0-9][a-z0-9/_-]*\.(webp|avif|png|jpe?g|svg)$/, 'unsupported asset path or format');

export const SkillLevel = z.enum(['expert', 'advanced', 'intermediate', 'basic']);
```

## `content/about.md` (frontmatter + body)

```ts
export const AboutFrontmatter = z.strictObject({
  name: NonEmpty,
  title: NonEmpty,
  location: NonEmpty,
  email: z.email(),
  links: z.strictObject({ linkedin: HttpsUrl, github: HttpsUrl }),
  summary: NonEmpty.max(300), // short bio: home hero, CV, meta description
  availability: NonEmpty.optional(),
  avatar: AssetPath.optional(),
  spoken_languages: z
    .array(
      z.strictObject({
        name: NonEmpty,
        level: z.enum(['native', 'professional', 'intermediate', 'basic']),
      }),
    )
    .min(1),
});
```

Body: markdown non vuoto = bio lunga (/about).

## `content/career.yaml`

```ts
const Phase = z.strictObject({
  label: NonEmpty,
  period: Period,
  client_sector: NonEmpty,
  tech: z.array(Slug).min(1),
});

const Progression = z.strictObject({ title: NonEmpty, focus: NonEmpty });

export const CareerRole = z
  .strictObject({
    role: NonEmpty,
    company: NonEmpty,
    company_url: HttpsUrl.optional(),
    start: YearMonth,
    end: YearMonth.nullable(),
    location: NonEmpty,
    type: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
    summary: NonEmpty,
    responsibilities: z.array(NonEmpty).min(1).optional(),
    achievements: z.array(NonEmpty).min(1).optional(),
    phases: z.array(Phase).min(1).optional(),
    progression: z.array(Progression).min(1).optional(),
    tech: z.array(Slug).min(1).optional(),
    ai_work: z.array(NonEmpty).min(1).optional(),
    notes: z.array(NonEmpty).min(1).optional(),
  })
  .superRefine((r, ctx) => {
    // "2022-07" is normalised to "2022-07-01" before comparing.
    if (r.end !== null && toIsoDay(r.end) < toIsoDay(r.start)) {
      ctx.addIssue({ code: 'custom', path: ['end'], message: 'end must not precede start' });
    }
    if (!r.tech && !r.phases) {
      ctx.addIssue({ code: 'custom', path: ['tech'], message: 'provide tech or phases[].tech' });
    }
  });

export const CareerFile = z.array(CareerRole).min(1);
```

## `content/earlier-work.yaml`

```ts
export const EarlierWork = z.strictObject({
  title: NonEmpty,
  company: NonEmpty,
  period: Period,
  sector: NonEmpty,
  role: NonEmpty,
  summary: NonEmpty,
  stack: z.array(Slug).min(1),
});

export const EarlierWorkFile = z.array(EarlierWork);
```

## `content/skills.yaml`

```ts
const Skill = z.strictObject({
  name: NonEmpty,
  level: SkillLevel,
  since: z.union([z.int().min(1990).max(2100), z.string().regex(/^~?\d{4}$/)]).optional(),
  period: Period.optional(),
  versions: NonEmpty.optional(),
  notes: NonEmpty.optional(),
  services: z.array(NonEmpty).min(1).optional(),
  highlight: z.boolean().optional(), // shown in the home "main stack"; 1–8 overall (rule X10)
});

const Category = z.array(Skill).min(1);

// Key order is the display order.
export const SkillsFile = z.strictObject({
  languages: Category,
  frameworks: Category,
  cloud: Category,
  databases: Category,
  devops: Category,
  messaging: Category,
  ai: Category,
  testing: Category,
});
```

## `content/technologies.yaml`

```ts
export const Technology = z.strictObject({
  slug: Slug,
  name: NonEmpty,
  category: z.enum([
    'language', 'framework', 'database', 'cloud', 'devops', 'messaging', 'ai', 'testing',
  ]),
  related_skill: NonEmpty.nullable(),
});

export const TechnologiesFile = z.array(Technology).min(1);
```

## `content/projects/<slug>.md`

Il nome del file (senza `.md`) deve soddisfare `Slug`.

```ts
export const ProjectFrontmatter = z
  .strictObject({
    title: NonEmpty,
    subtitle: NonEmpty,
    year: z.int().min(2000), // upper bound (build year) checked in the cross-file pass
    role: NonEmpty,
    sector: NonEmpty,
    stack: z.array(Slug).min(1),
    featured: z.boolean(),
    repo: HttpsUrl.nullable(),
    demo: HttpsUrl.nullable(),
    cover: AssetPath.optional(),
    cover_alt: NonEmpty.optional(),
  })
  .superRefine((p, ctx) => {
    if (p.cover && !p.cover_alt) {
      ctx.addIssue({ code: 'custom', path: ['cover_alt'], message: 'required when cover is set' });
    }
  });

export const CASE_STUDY_SECTIONS = [
  'Context',
  'Problem',
  'Solution',
  'My role',
  'Technical decisions',
  'Trade-offs',
  'Impact',
  "What I'd do differently",
] as const;
```

**Regole del body** (verificate sull'albero mdast, non con regex):

1. Nessun heading H1 (il titolo della pagina viene da `title`).
2. Gli H2 sono esattamente `CASE_STUDY_SECTIONS`, in quest'ordine, senza duplicati né extra. Il
   confronto normalizza gli apostrofi tipografici (`’` → `'`) e gli spazi.
3. Ogni sezione contiene testo non vuoto (`mdast-util-to-string(...).trim().length > 0`) prima
   dell'H2 successivo. Gli H3+ sono ammessi dentro una sezione.
4. Il contenuto prima del primo H2 deve essere vuoto.
5. HTML raw nel markdown: errore (non viene mai renderizzato).

## `content/how-i-use-ai.md` *(nuovo)*

```ts
export const AiWorkflowFrontmatter = z.strictObject({
  title: NonEmpty,
  description: NonEmpty.max(160),
  spec_links: z
    .array(
      z.strictObject({
        label: NonEmpty,
        // Repo-relative path, e.g. "specs/001-personal-portfolio/spec.md"
        path: z.string().regex(/^(specs|\.specify)\/[\w./-]+$/, 'must point inside specs/ or .specify/'),
      }),
    )
    .min(1),
});
```

Body: markdown non vuoto.

## Regole tra file (secondo passaggio)

| ID | Regola | Messaggio d'errore |
|---|---|---|
| X1 | Ogni slug in `projects/*.stack`, `earlier-work[].stack`, `career[].tech`, `career[].phases[].tech` esiste in `technologies.yaml` | `content/projects/foo.md › stack[2]: unknown technology "kotlin"` |
| X2 | Ogni `related_skill` non nullo è uno `Skill.name` | `content/technologies.yaml › [5].related_skill: no skill named "Node"` |
| X3 | `Technology.slug` unico | `… › [7].slug: duplicate "mysql"` |
| X4 | `Skill.name` unico in tutte le categorie | `content/skills.yaml › devops[1].name: duplicate "Docker"` |
| X5 | `EarlierWork` anchorId (`earlier-` + slug del titolo) unico | `content/earlier-work.yaml › [3].title: anchor "earlier-x" already used by [1]` |
| X6 | `Project.year` ≤ anno di build | `content/projects/foo.md › year: 2031 is in the future` |
| X7 | Ogni `AssetPath` esiste in `content/assets/` ed è ≤ 300 KB | `content/about.md › avatar: file not found` |
| X8 | Ogni `spec_links[].path` esiste nel repo | `content/how-i-use-ai.md › spec_links[0].path: not found` |
| X9 | I file di contenuto obbligatori esistono (`about.md`, `career.yaml`, `skills.yaml`, `technologies.yaml`, `earlier-work.yaml`, `how-i-use-ai.md`) | `content/how-i-use-ai.md: missing required file` |
| X10 | Le skill con `highlight: true` sono da 1 a 8 in tutto il file | `content/skills.yaml › highlight: 11 skills highlighted, expected 1–8` |

## Formato degli errori

`loadContent(contentDir)` raccoglie **tutti** gli errori di schema, body e regole tra file, poi
lancia un `ContentValidationError` con un errore per riga:

```text
Content validation failed (3 errors):
  content/career.yaml › [0].start: expected YYYY-MM or YYYY-MM-DD
  content/projects/mobility-services-backend.md › section "Trade-offs": missing
  content/projects/agentic-ai-transition.md › stack[4]: unknown technology "prompt-eng"
```

`scripts/validate-content.ts` stampa il messaggio su stderr ed esce con codice 1. La stessa
funzione viene chiamata dalle pagine durante `next build`, quindi la validazione non si può
saltare.

## Stato rispetto ai contenuti attuali

Verifica manuale del 2026-10-03 sui file in `content/`:

- Tutti i campi presenti rispettano gli schemi. Tutti gli slug citati esistono in
  `technologies.yaml` e tutti i `related_skill` non nulli corrispondono a una skill.
- Entrambi i progetti hanno le 8 sezioni nell'ordine corretto.

Modifiche ai contenuti necessarie prima che la build possa passare:

- **Manca `content/how-i-use-ai.md`** (X9).
- **`about.md`**: mancano `summary` (bio breve, ≤ 300 caratteri) e `spoken_languages`. Valori
  forniti in `/speckit-clarify`: Italian `native`, English `professional`, Spanish `basic`.
- **`skills.yaml`**: nessuna skill ha `highlight: true` (X10).
