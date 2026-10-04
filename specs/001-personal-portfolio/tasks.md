---

description: "Task list for the Portfolio Personale feature"
---

# Tasks: Portfolio Personale

**Input**: Design documents from `specs/001-personal-portfolio/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/content-schemas.md](./contracts/content-schemas.md),
[contracts/ui-contracts.md](./contracts/ui-contracts.md), [quickstart.md](./quickstart.md)

**Tests**: inclusi. La constitution (Principio V) richiede Vitest + Playwright e coverage ≥ 80%,
e il brief del plan elenca test unit, di componente ed E2E. In ogni fase i test precedono
l'implementazione e devono fallire prima di essa.

**Organization**: task raggruppati per user story (US1 = US-01 della spec, …, US11 = US-11), così
ogni storia è implementabile e verificabile da sola.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: eseguibile in parallelo (file diversi, nessuna dipendenza da task incompleti)
- **[Story]**: user story di appartenenza (US1…US11)
- Ogni descrizione indica i file da creare o modificare

## Path Conventions

Single project alla radice del repository (vedi plan, "Source Code"): `src/`, `scripts/`,
`tests/`, `content/`, `docs/`, `public/`, `.github/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inizializzazione del progetto, tooling e configurazioni.

- [x] T001 Inizializza il repository git alla root (`git init -b main`) e crea `.gitignore` con `node_modules/`, `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`, `.lighthouseci/`, `next-env.d.ts`, `*.tsbuildinfo`, `public/cv.pdf`, `public/assets/`
- [x] T002 Crea `package.json` alla root (`"private": true`, `"version": "0.1.0"`, `"packageManager": "pnpm@10.<ultima>"`, `"engines": { "node": ">=24 <25" }`) e `.nvmrc` con `24`
- [x] T003 Installa le dipendenze con pnpm in `package.json`. Prod: next@16, react, react-dom, zod@4, gray-matter, yaml, fuse.js, react-markdown, remark-gfm, mdast-util-from-markdown, mdast-util-to-string, @vercel/analytics, radix-ui, class-variance-authority, clsx, tailwind-merge, lucide-react. Dev: typescript, @types/node, @types/react, @types/react-dom, tailwindcss@4, @tailwindcss/postcss, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, vitest, @vitest/coverage-v8, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, @playwright/test, @axe-core/playwright, @lhci/cli, serve, tsx, @react-pdf/renderer. Dichiara in `pnpm.onlyBuiltDependencies` solo i pacchetti segnalati da pnpm come "Ignored build scripts" e necessari (R-17)
- [x] T004 [P] Crea `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"moduleResolution": "bundler"`, `"jsx": "preserve"`, plugin `next`, alias `"@/*": ["./src/*"]`, `include` di `src`, `scripts`, `tests`, `next-env.d.ts`, `.next/types/**/*.ts`
- [x] T005 [P] Crea `next.config.ts` con `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: false`, `reactStrictMode: true`; commento che spiega perché gli header HTTP stanno in `vercel.json` (`headers()` non è supportato con l'export statico)
- [x] T006 [P] Configura Tailwind CSS v4: `postcss.config.mjs` con `@tailwindcss/postcss`; `src/app/globals.css` con `@import "tailwindcss"`, token di colore shadcn (contrasto ≥ 4.5:1), font stack di sistema (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), regola `@media (prefers-reduced-motion: reduce)` che disattiva transizioni e animazioni
- [x] T007 Inizializza shadcn/ui: `components.json` (alias `@/components`, `@/lib/utils`), `src/lib/utils.ts` con `cn()`, componenti `button`, `badge`, `input` in `src/components/ui/` (niente `checkbox`: quello di Radix genera attributi `style=` nell'HTML statico, vedi R5; aggiungere altri componenti solo quando servono) (dipende da T006)
- [x] T008 [P] Crea `eslint.config.mjs` (flat config, `eslint-config-next` core-web-vitals + typescript, regola `no-warning-comments: ["error", { "terms": ["todo", "fixme"], "location": "anywhere" }]`, ignora `out/`, `.next/`, `coverage/`), `prettier.config.mjs` con `prettier-plugin-tailwindcss` e `.prettierignore` che esclude `content/`, `specs/`, `.specify/`, `.factory/`, `out/`, `.next/`, `coverage/`, `pnpm-lock.yaml`
- [x] T009 [P] Crea `vitest.config.mts` con tre `projects`: `node` (`tests/unit/lib/**`, `tests/unit/scripts/**`, environment `node`), `app` (`tests/unit/app/**`, environment `node`, setup `tests/setup/app.ts`) e `dom` (`tests/unit/components/**`, environment `jsdom`, setup `tests/setup/dom.ts`); alias `@` → `src`; coverage provider `v8`, `include: ['src/**/*.{ts,tsx}', 'scripts/**/*.{ts,tsx}']`, `exclude: ['**/*.d.ts']` (tutto il codice TypeScript, Principio V), `thresholds` 80 su lines, branches, functions, statements. Crea `tests/setup/dom.ts` che importa `@testing-library/jest-dom/vitest` e `tests/setup/app.ts` con i mock di `next/navigation` (`usePathname`, `useSearchParams`, `useRouter`), di `@vercel/analytics/next` (componente che restituisce `null`) e di `@/lib/content` (`loadContent()` che carica `tests/fixtures/content/`)
- [x] T010 [P] Crea `playwright.config.ts` (`testDir: 'tests/e2e'`, `webServer: { command: 'pnpm serve', port: 3000, reuseExistingServer: !process.env.CI }`, progetti `desktop` (Desktop Chrome) e `mobile` (Pixel 7)) e `tests/e2e/fixtures.ts`: fixture `page` estesa che risponde 204 a `/_vercel/**`, registra con `addInitScript` gli eventi `securitypolicyviolation` e fa fallire il test se ce ne sono o se compaiono errori in console
- [x] T011 [P] Crea `lighthouserc.json`: `collect.staticDistDir: "./out"`, `collect.numberOfRuns: 3`, `collect.maxAutodiscoverUrls: 0` (tutte le pagine; il default è 5, R-19); `assert.assertions` con `categories:performance`, `categories:accessibility`, `categories:best-practices`, `categories:seo` a `["error", { "minScore": 0.95 }]`, `largest-contentful-paint` a `["error", { "maxNumericValue": 2500 }]`, `cumulative-layout-shift` a `["error", { "maxNumericValue": 0.1 }]`, `total-blocking-time` a `["error", { "maxNumericValue": 200 }]`; `upload.target: "filesystem"` (nessun upload esterno)
- [x] T012 Aggiungi gli script in `package.json` come da tabella "Script npm" del plan, **senza** il passo `tsx scripts/generate-cv.tsx` in `dev` e `build` (lo aggiunge T094): `dev`, `content:check`, `build` (`pnpm content:check && tsx scripts/sync-assets.ts && next build && tsx scripts/csp-hashes.ts`), `serve`, `lint`, `format`, `typecheck`, `test`, `test:e2e`, `lhci` (`mkdir -p out/_vercel/insights && touch out/_vercel/insights/script.js && lhci autorun`: lo stub vuoto evita il 404 dello script di Analytics fuori da Vercel, R-18; `out/` locale non viene mai deployato), `deps:check`
- [x] T013 [P] Crea `src/lib/site.ts` con le costanti `SITE_URL` (dominio `*.vercel.app` previsto, es. `https://francmarrara.vercel.app`, da confermare al primo deploy in T123), `REPO_URL` (`https://github.com/francmarrara/portfolio`, da confermare in T122), `SITE_NAME = 'Francesco Marrara'`
- [x] T014 [P] Crea `CHANGELOG.md` (formato Keep a Changelog, sezione `Unreleased`) e `README.md` con descrizione, requisiti (Node 24, pnpm 10) e comandi principali

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: contenuti validi, pipeline di validazione, layout globale, sicurezza e CI. Servono a
tutte le user story.

**⚠️ CRITICAL**: nessuna user story può iniziare prima che questa fase sia completa.

### Contenuti (R-08: oggi bloccano la build)

- [x] T015 [P] Aggiorna `content/about.md`: aggiungi `summary` (bio breve in inglese, vincolo `NonEmpty.max(300)`; scelta: variante A, 257 caratteri); aggiungi `spoken_languages` con `[{ name: Italian, level: native }, { name: English, level: professional }, { name: Spanish, level: basic }]` (vincolo `level: z.enum(['native', 'professional', 'intermediate', 'basic'])`, `.min(1)`); `availability` senza "consulting": "Full-time and happy at Avvale. Not currently looking for new opportunities."; togli dal body il numero fisso "7 years" (R-10). Testi confermati da Francesco
- [x] T016 [P] Aggiorna `content/skills.yaml`: imposta `highlight: true` su un numero di skill compreso tra 1 e 8 (regola X10). Scelta di Francesco (5 skill): Java, Spring Boot, Python, AWS, Agentic programming
- [x] T017 [P] Crea `content/how-i-use-ai.md`: frontmatter `title`, `description` (vincolo `NonEmpty.max(160)`), `spec_links` (ogni `path` deve rispettare `^(specs|\.specify)\/[\w./-]+$` ed esistere) con il solo `specs/001-personal-portfolio/spec.md` (scelta di Francesco: spec e clarifications); body in inglese che spiega il workflow constitution → specify → clarify → plan → tasks → analyze → implement, cosa hanno intercettato gli agenti, cosa resta umano, e gli strumenti usati (Spec Kit, Droid, Claude, GitHub Copilot, OpenCode). Testo scritto dall'agente su delega di Francesco
- [x] T018 [P] Crea il dataset di test `tests/fixtures/content/`: `about.md`, `career.yaml` (2 ruoli, uno con `end: null`, uno con `start` nel formato `YYYY-MM-DD`; tra i due, almeno una voce di `phases`, `progression`, `ai_work` e `notes`), `earlier-work.yaml` (5 voci, una con periodo `~2023 → present`), `skills.yaml` (8 categorie, 3 skill con `highlight: true`, una skill con `since: ~2023`), `technologies.yaml`, `projects/alpha.md` (featured) e `projects/beta.md` con le 8 sezioni, `how-i-use-ai.md` con `spec_links` verso file reali del repo, cartella `assets/` vuota (con `.gitkeep`)

### Libreria contenuti

- [x] T019 [P] Implementa `slugify()` in `src/lib/slug.ts` (minuscole, normalizzazione NFKD, rimozione di diacritici e punteggiatura, spazi e separatori → `-`, nessun `-` iniziale o finale) con test in `tests/unit/lib/slug.test.ts`
- [x] T020 Scrivi `tests/unit/lib/schemas.test.ts`: accetta i file di `tests/fixtures/content/` e di `content/`; rifiuta chiave sconosciuta, URL `http://`, `start: 2019-13`, `period` senza ` → `, `level` fuori enum, `summary` oltre 300 caratteri, `spoken_languages: []`, `cover` senza `cover_alt`, `description` oltre 160 caratteri, `year: "2024"` stringa
- [x] T021 Implementa `src/lib/schemas.ts` esattamente come [contracts/content-schemas.md](./contracts/content-schemas.md): primitive (`Slug`, `HttpsUrl` con `protocol: /^https$/`, `YearMonth`, `Period`, `AssetPath`, `SkillLevel`), `AboutFrontmatter` (`summary: NonEmpty.max(300)`, `spoken_languages` obbligatorio `.min(1)`), `CareerFile` (con `end ≥ start` e "provide tech or phases[].tech"), `EarlierWorkFile`, `SkillsFile` (8 categorie, ciascuna `.min(1)`, `highlight: z.boolean().optional()`), `TechnologiesFile`, `ProjectFrontmatter` (`year: z.int().min(2000)`, `repo`/`demo` `HttpsUrl.nullable()`, `cover_alt` obbligatorio se `cover`), `AiWorkflowFrontmatter`, `CASE_STUDY_SECTIONS`; tutti `strictObject`; tipi esportati con `z.infer`
- [x] T022 [P] Scrivi `tests/unit/lib/markdown.test.ts`: divisione in 8 sezioni con `id` = slug del titolo; errori per sezione mancante, vuota, fuori ordine, duplicata, H2 extra, H1 presente, testo prima del primo H2, HTML raw; `’` normalizzato in `'`; `toPlainText()` senza sintassi markdown
- [x] T023 Implementa `src/lib/markdown.ts` con `mdast-util-from-markdown` e `mdast-util-to-string`: `parseCaseStudy(body)` → `{ sections: CaseStudySection[] } | { errors: string[] }` secondo le 5 regole del body del contratto, e `toPlainText(markdown)` (dipende da T021 per `CASE_STUDY_SECTIONS`)
- [x] T024 [P] Scrivi `tests/unit/lib/cross-checks.test.ts`: un test per ciascuna regola X1–X10 con il messaggio d'errore atteso dal contratto
- [x] T025 Implementa `src/lib/cross-checks.ts` con le regole X1–X10: slug tecnologie esistenti (X1), `related_skill` esistente (X2), unicità di `Technology.slug` (X3), `Skill.name` (X4) e anchorId delle earlier work (X5), `Project.year` ≤ anno di build (X6), asset esistente e ≤ 300 KB (X7), `spec_links[].path` esistente nel repo (X8), file obbligatori presenti (X9), skill con `highlight: true` da 1 a 8 (X10)
- [x] T026 Scrivi `tests/unit/lib/content.test.ts`: caricamento completo di `tests/fixtures/content/`; più errori in file diversi aggregati in un solo `ContentValidationError` con il formato del contratto; `start: 2019-05-06` resta stringa (nessuna conversione in `Date`); caricamento di `content/` reale senza errori (dopo T015–T017)
- [x] T027 Implementa `src/lib/content.ts`: `loadContent({ contentDir, repoRoot })` con default `process.cwd()`; `gray-matter` con engine `yaml` (schema `core`) per il frontmatter, `yaml` per i file `.yaml`; applica schemi (T021), `parseCaseStudy` (T023) e cross-check (T025); slug progetto dal nome file; raccoglie tutti gli errori in `ContentValidationError` (`Content validation failed (N errors):` + una riga `<file> › <path>: <message>` per errore); memoizza il risultato per `contentDir`; esporta il tipo `Content`
- [x] T028 [P] Scrivi `tests/unit/lib/derive.test.ts`: `yearsOfExperience` (2019-05-06 → 2026-10-03 = 7; mese esatto; data senza giorno); `primaryStack` (solo `highlight: true`, ordine categorie + file); ordinamento ruoli per `start` decrescente e `techAll`; ordinamento earlier work (`present` = +∞, `~2023` = 2023, a parità `periodStart` decrescente); `earlierAnchorId` = `earlier-` + slug; ordinamento progetti (`year` decrescente, poi `title`); featured con fallback ai 3 più recenti
- [x] T029 Implementa `src/lib/derive.ts` con le funzioni di T028 più `techName(slug)` e `isCurrentRole(role)`
- [x] T030 Crea `scripts/validate-content.ts` (chiama `loadContent`, stampa `ContentValidationError` su stderr ed esce con codice 1) con test `tests/unit/scripts/validate-content.test.ts` (fixture valida → 0; fixture con sezione rimossa → 1 con il messaggio atteso)
- [x] T031 [P] Crea `scripts/sync-assets.ts` (svuota e ricopia `content/assets/` in `public/assets/`) con test `tests/unit/scripts/sync-assets.test.ts` su directory temporanea

### Layout globale, SEO di base, 404

- [x] T032 [P] Implementa `src/lib/seo.ts`: `buildMetadata({ title, description, path, type })` (title `"<Page> — Francesco Marrara"`, description ≤ 160 caratteri, canonical `SITE_URL + path`, Open Graph), `personJsonLd(profile, primaryStack)` (name, jobTitle, email, url, sameAs, knowsAbout), `techArticleJsonLd(project, profile)` (headline, description, author, datePublished = anno, keywords), `serializeJsonLd()` con escape di `<` in `\u003c`; test in `tests/unit/lib/seo.test.ts`
- [x] T033 [P] Crea `src/components/sections/json-ld.tsx` (`<script type="application/ld+json">`) e `src/components/sections/markdown-content.tsx` (`react-markdown` + `remark-gfm`, nessun `rehype-raw`, link esterni con `rel="noopener noreferrer"`) con test `tests/unit/components/json-ld.test.tsx` e `tests/unit/components/markdown-content.test.tsx` (HTML raw non renderizzato)
- [x] T034 [P] Crea `src/components/sections/contact-link.tsx` (link `mailto:` con l'indirizzo visibile in chiaro come testo del link) con test `tests/unit/components/contact-link.test.tsx`
- [x] T035 Crea `src/components/layout/skip-link.tsx` ("Skip to content" → `#content`), `src/components/layout/site-header.tsx` (nome → `/`; voci Projects, About, Skills → `/about#skills`, How I use AI; `aria-current="page"` sulla voce corrente tramite un piccolo client component `nav-links.tsx`), `src/components/layout/mobile-nav.tsx` (`<details>`/`<summary>`, funziona senza JS, visibile sotto 768px), `src/components/layout/site-footer.tsx` (ContactLink, LinkedIn, GitHub con `rel="noopener noreferrer"`, anno di build) con test `tests/unit/components/site-header.test.tsx` e `tests/unit/components/site-footer.test.tsx`
- [x] T036 Crea `src/app/layout.tsx` (`<html lang="en">`, `metadataBase: new URL(SITE_URL)`, SkipLink, SiteHeader, `<main id="content">`, SiteFooter, `<Analytics />` da `@vercel/analytics/next`; profilo letto con `loadContent()`) e `src/app/icon.svg`, con test `tests/unit/app/layout.test.tsx` (`renderToStaticMarkup`: `lang="en"`, skip link, header, `<main id="content">`, footer)
- [x] T037 [P] Crea `src/app/not-found.tsx` (messaggio, link a `/` e `/projects`) con test `tests/unit/app/not-found.test.tsx` ed E2E `tests/e2e/not-found.spec.ts`: `/nope` e `/projects/does-not-exist` rispondono 404 con la pagina custom (V14, FR-015)
- [x] T038 [P] Crea `src/app/api/health/route.ts` con `export const dynamic = 'force-static'` e `GET` che restituisce `Response.json({ status: 'ok' })`, con test `tests/unit/app/health.test.ts` (`GET()` → stato 200, corpo `{"status":"ok"}`)

### Sicurezza (Principio VII)

- [x] T039 [P] Crea `vercel.json` con gli header di [ui-contracts.md §7](./contracts/ui-contracts.md) su `/(.*)` (HSTS `max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, CSP di base `frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests`) e, su `/api/health`, `Content-Type: application/json; charset=utf-8` e `Cache-Control: no-store`
- [x] T040 [P] Scrivi `tests/unit/scripts/csp-hashes.test.ts`: su HTML di esempio calcola lo SHA-256 base64 corretto di ogni `<script>` inline senza `src`; ignora `type="application/ld+json"`; include gli hash degli `<style>` inline in `style-src`; inserisce il `<meta http-equiv="Content-Security-Policy">` come primo figlio di `<head>`; fallisce se trova attributi `style=`; è idempotente (seconda esecuzione senza duplicati)
- [x] T041 Implementa `scripts/csp-hashes.ts`: per ogni `out/**/*.html` applica la policy di [ui-contracts.md §8](./contracts/ui-contracts.md) (`default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self' 'sha256-…'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'none'`, con gli hash di `style-src` solo se la pagina ha `<style>` inline), senza nuove dipendenze (estrazione con regex; gli script inline di Next.js non contengono `</script>`); exit 1 con elenco dei file solo in caso di attributi `style=`
- [x] T042 [P] Scrivi `docs/security.md`: policy header + meta e motivazione di ogni direttiva, procedura per aggiungere un'eccezione (es. `style-src-attr 'unsafe-inline'`), nota sulla Vercel Toolbar nei preview (R-14), corrispondenza con l'OWASP Top 10, verifica V17

### Manutenibilità e CI (Principio VIII)

- [x] T043 [P] Crea `docs/dependencies.md` con una riga per ogni pacchetto di `package.json` (colonne: pacchetto, tipo prod/dev, versione revisionata, data di review ISO, motivo, note)
- [x] T044 [P] Scrivi `tests/unit/scripts/check-dependency-registry.test.ts`: pacchetto mancante → errore; data non ISO → errore; review più vecchia di 12 mesi → warning, exit 0; registro completo → exit 0
- [x] T045 Implementa `scripts/check-dependency-registry.ts` (legge `package.json` e la tabella di `docs/dependencies.md`; non confronta le versioni, così le PR di Dependabot non rompono la CI)
- [x] T046 [P] Crea `.github/workflows/ci.yml` su `pull_request` e `push` a `main`, `permissions: contents: read`, Node da `.nvmrc`, `pnpm/action-setup` + cache: install `--frozen-lockfile`, `deps:check`, `lint`, `typecheck`, `test` (artifact `coverage/`), `build`, `playwright install --with-deps chromium` + `test:e2e` (artifact `playwright-report/` se fallisce), `lhci`
- [x] T047 [P] Crea `.github/dependabot.yml` (ecosistemi `npm` e `github-actions`, settimanale) e `.github/pull_request_template.md` (self-review sui Principi I–VIII, checklist OWASP Top 10, README e CHANGELOG aggiornati se cambia il comportamento, nessun TODO né codice commentato, nessun testo che offra servizi a pagamento)

**Checkpoint**: `pnpm content:check`, `pnpm test` e `pnpm build` passano; `out/` contiene layout,
`404.html` e `api/health`; ogni HTML ha il `<meta>` CSP.

---

## Phase 3: User Story 1 - Profilo leggibile in 5 secondi (Priority: P1) 🎯 MVP

**Goal**: la home mostra nome, ruolo, anni di esperienza, bio breve, stack principale, progetti
featured, le 4 earlier work più recenti e il contatto (FR-001).

**Independent Test**: build + serve, `/` a 360×740: nome, ruolo, anni e stack principale visibili
senza scroll (quickstart V1).

### Tests for User Story 1

- [x] T048 [P] [US1] Scrivi `tests/unit/components/hero.test.tsx`: nome, titolo, `"<N>+ years of experience"` con N verificato fissando la data con `vi.setSystemTime`, `summary`, badge dello stack principale (solo skill `highlight: true`, massimo 8), ContactLink; avatar (`alt=""`, 96×96) se `avatar` è presente, altrimenti iniziali con `aria-hidden`
- [x] T049 [P] [US1] Scrivi `tests/unit/components/project-card.test.tsx` e `tests/unit/components/featured-projects.test.tsx`: card con titolo, sottotitolo, anno, stack e link `/projects/<slug>`; cover solo se `cover` è presente, con `alt` = `cover_alt` e contenitore `aspect-video`; elenco dei featured; fallback ai 3 progetti più recenti se nessuno è featured
- [x] T050 [P] [US1] Scrivi `tests/unit/components/earlier-work-list.test.tsx`: in home al massimo 4 voci nell'ordine di `derive.ts`; link "See all" a `/projects#earlier-work`; link delle voci a `/projects#earlier-<slug>`; con meno di 4 voci le mostra tutte e mantiene "See all"
- [x] T051 [P] [US1] Scrivi `tests/e2e/home.spec.ts`: a 360×740 i bounding box di nome, ruolo, anni di esperienza e stack principale sono dentro il viewport iniziale; sezioni featured ed earlier work presenti; un solo `<h1>` (V1)

### Implementation for User Story 1

- [x] T052 [P] [US1] Crea `src/components/sections/tech-badge-list.tsx`: badge con il nome mostrato di ogni tecnologia (da `technologies.yaml`), prop `linkToFilter` (default `false`, usata da US4)
- [x] T053 [P] [US1] Crea `src/components/sections/hero.tsx` (avatar 96×96 da `/assets/<avatar>` accanto al nome, non sopra, oppure iniziali; h1 nome, ruolo, `"<N>+ years of experience"`, `summary`, stack principale con `Badge`, ContactLink); layout mobile-first che entra nel viewport a 360×740
- [x] T054 [US1] Crea `src/components/sections/project-card.tsx` (cover opzionale da `/assets/<cover>` con `alt` = `cover_alt`, `aspect-video`, `loading="lazy"`) e `src/components/sections/featured-projects.tsx` (usano TechBadgeList di T052)
- [x] T055 [US1] Crea `src/components/sections/earlier-work-list.tsx` (props `items`, `limit`, `variant: 'compact' | 'full'`; nella variante `full` ogni voce ha `id="earlier-<slug>"`; usa TechBadgeList)
- [x] T056 [US1] Crea `src/app/page.tsx`: carica i dati con `loadContent()`, compone Hero, FeaturedProjects, EarlierWorkList (`limit` 4, compact); metadata con titolo `"Francesco Marrara — Senior Software Engineer"` e description = `summary` troncato a 160; JSON-LD `Person`; test `tests/unit/app/home-page.test.tsx` (`renderToStaticMarkup`: sezioni presenti, metadata)

**Checkpoint**: la home è completa e verificabile da sola.

---

## Phase 4: User Story 2 - Timeline di carriera (Priority: P1)

**Goal**: in `/about` la timeline mostra i ruoli in ordine cronologico inverso, espandibili con
mouse, touch e tastiera (FR-002); la pagina contiene anche bio lunga e lingue parlate (FR-007).

**Independent Test**: `/about#career` con sola tastiera: ordine corretto, espansione con
Enter/Space, ruolo corrente aperto e marcato "present"; con JavaScript disattivato i ruoli si
aprono lo stesso (V2).

### Tests for User Story 2

- [x] T057 [P] [US2] Scrivi `tests/unit/components/career-role.test.tsx`: `<details>` con `<summary>` che mostra azienda, ruolo e periodo; `open` solo sul ruolo corrente, che mostra "present"; il dettaglio è nel DOM anche da chiuso e mostra `summary`, `responsibilities`, `achievements`, `phases` (`label`, `period`, `client_sector`, `tech`), `progression` (`title`, `focus`), `ai_work`, `notes` e `techAll`, ciascuno solo se presente
- [x] T058 [P] [US2] Scrivi `tests/unit/components/career-timeline.test.tsx` (ordine per `start` decrescente) e `tests/unit/components/spoken-languages.test.tsx` (nome e livello come testo)
- [x] T059 [P] [US2] Scrivi `tests/e2e/about.spec.ts` (parte carriera): navigazione da tastiera, ordine dei ruoli, espansione e chiusura con Enter e Space, bio lunga e lingue visibili; con `javaScriptEnabled: false` i ruoli si aprono con click e tastiera (V2)

### Implementation for User Story 2

- [x] T060 [P] [US2] Crea `src/components/sections/career-role.tsx` (Server Component, `<details>`/`<summary>` nativi, nessun `'use client'`, focus visibile sul `<summary>`; campi del dettaglio come in T057)
- [x] T061 [P] [US2] Crea `src/components/sections/spoken-languages.tsx` (lista `name` + livello leggibile, es. "Native", "Professional", "Basic")
- [x] T062 [US2] Crea `src/components/sections/career-timeline.tsx` (ordina con `derive.ts`, renderizza CareerRole)
- [x] T063 [US2] Crea `src/app/about/page.tsx`: bio lunga (body di `about.md` con MarkdownContent), `availability`, SpokenLanguages, sezione `id="career"` con CareerTimeline; metadata; JSON-LD `Person`; test `tests/unit/app/about-page.test.tsx` (`renderToStaticMarkup`: bio lunga, lingue, `#career`)

**Checkpoint**: `/about` con timeline funzionante, indipendente dalla home.

---

## Phase 5: User Story 3 - Case study approfonditi (Priority: P1)

**Goal**: ogni progetto ha una pagina con header e le 8 sezioni in ordine, con indice interno
(FR-003).

**Independent Test**: aprire ogni `/projects/<slug>` e verificare presenza e ordine delle 8
sezioni e funzionamento dell'indice (V3).

### Tests for User Story 3

- [x] T064 [P] [US3] Scrivi `tests/unit/components/case-study.test.tsx`: header (title in h1, subtitle, year, role, sector, stack, cover con `alt` = `cover_alt` solo se `cover` è presente) e 8 sezioni in h2, in ordine, con `id` = slug del titolo
- [x] T065 [P] [US3] Scrivi `tests/unit/components/case-study-toc.test.tsx`: `<nav aria-label="Case study sections">` con 8 link alle ancore
- [x] T066 [P] [US3] Scrivi `tests/e2e/case-study.spec.ts`: per ogni progetto di `content/projects/` le 8 sezioni sono in ordine e i link dell'indice portano all'ancora (V3)

### Implementation for User Story 3

- [x] T067 [P] [US3] Crea `src/components/sections/case-study-toc.tsx`
- [x] T068 [P] [US3] Crea `src/components/sections/case-study.tsx` (header con cover opzionale in contenitore `aspect-video` + CaseStudyToc + sezioni renderizzate con MarkdownContent)
- [x] T069 [US3] Crea `src/app/projects/[slug]/page.tsx`: `generateStaticParams()` dagli slug di `loadContent()`, `export const dynamicParams = false`, `params` atteso come `Promise` (Next.js 16), `generateMetadata` (description = subtitle, `og:type` article), JSON-LD `TechArticle`; test `tests/unit/app/project-page.test.tsx` (`generateStaticParams()` con gli slug delle fixture, `generateMetadata()`, `renderToStaticMarkup(await Page({ params: Promise.resolve({ slug }) }))`)

**Checkpoint**: tutte le pagine dei case study sono generate in `out/projects/`.

---

## Phase 6: User Story 4 - Stack e repository per progetto (Priority: P1)

**Goal**: nella pagina del progetto lo stack porta all'elenco filtrato e i link a repository e
demo compaiono solo se valorizzati (US-04).

**Independent Test**: sui due progetti attuali (`repo: null`, `demo: null`) nessun link vuoto o
rotto; click su una tecnologia → `/projects?tech=<slug>`.

### Tests for User Story 4

- [x] T070 [P] [US4] Scrivi `tests/unit/components/project-links.test.tsx` (`repo`/`demo` `null` → niente; valorizzati → "View repository"/"View demo" con `rel="noopener noreferrer"`) e `tests/unit/components/tech-badge-list.test.tsx` (con `linkToFilter` ogni badge è un link a `/projects?tech=<slug>` con slug codificato)

### Implementation for User Story 4

- [x] T071 [US4] Crea `src/components/sections/project-links.tsx` (icone `lucide-react` con `aria-hidden`, testo esplicito)
- [x] T072 [US4] Aggiorna `src/components/sections/tech-badge-list.tsx` (link con `linkToFilter`) e `src/components/sections/case-study.tsx` (stack con `linkToFilter`, ProjectLinks nell'header) (dipende da T052, T068)
- [x] T073 [US4] Estendi `tests/e2e/case-study.spec.ts`: nessun link repo/demo per i progetti con valori `null`; click su un badge dello stack → URL `/projects?tech=<slug>`

**Checkpoint**: US3 + US4 complete; i link dello stack funzionano anche prima di US5 (arrivano su
`/projects`).

---

## Phase 7: User Story 5 - Filtro e ricerca progetti (Priority: P1)

**Goal**: `/projects` elenca case study ed earlier work con filtro per tecnologia (OR), ricerca
testuale, stato nell'URL e funzionamento senza JavaScript (FR-004, FR-005).

**Independent Test**: scenari V6–V9 di [quickstart.md](./quickstart.md).

### Tests for User Story 5

- [x] T074 [P] [US5] Scrivi `tests/unit/lib/url-state.test.ts`: round-trip parse/serialize; `tech` deduplicato e ordinato alfabeticamente; slug sconosciuti scartati; parametri estranei scartati; `q` con `trim`, spazi multipli ridotti a uno, "max 100 caratteri", meno di 2 caratteri → ricerca disattivata; stato vuoto → `/projects`
- [x] T075 [P] [US5] Scrivi `tests/unit/lib/search.test.ts`: `buildSearchItems` produce i campi della tabella `SearchItem` (summary del case study = Context in testo semplice "troncato a 280 caratteri"); opzioni del filtro solo per tecnologie usate, raggruppate per categoria con conteggi; filtro OR; ricerca case-insensitive e parziale; parola presente solo oltre i primi 100 caratteri trovata; risultato = filtro ∩ ricerca; ordinamenti di [ui-contracts.md §4](./contracts/ui-contracts.md); nessun risultato
- [x] T076 [P] [US5] Scrivi `tests/unit/components/project-explorer.test.tsx`, `tests/unit/components/tech-filter.test.tsx`, `tests/unit/components/search-box.test.tsx` (mock di `next/navigation`): selezione → lista filtrata e `router.replace` con URL normalizzato e `{ scroll: false }`; contatore `aria-live="polite"` "Showing N of M items"; stato vuoto con "No projects match your filters." e "Clear filters"; Escape svuota la ricerca; debounce di 200 ms; stato `disabled`; l'HTML renderizzato di TechFilter non contiene attributi `style=`
- [x] T077 [P] [US5] Scrivi `tests/e2e/projects-filter.spec.ts`: `java` + `claude` → voci con almeno una delle due e URL `?tech=claude,java`; URL condiviso riapre lo stesso stato; `?tech=unknown` viene ignorato (V6, V8). Test `inp` nel progetto mobile: con CPU rallentata 4× (CDP `Emulation.setCPUThrottlingRate`) e un `PerformanceObserver` di tipo `event` (`durationThreshold: 16`), ogni interazione con filtro e ricerca dura meno di 200 ms (V19, NFR-003)
- [x] T078 [P] [US5] Scrivi `tests/e2e/projects-search.spec.ts`: `q=cloud` combinato con un filtro; ricerca senza risultati → messaggio e "Clear filters" che riporta a `/projects` (V7)
- [x] T079 [P] [US5] Scrivi `tests/e2e/projects-no-js.spec.ts` con `javaScriptEnabled: false`: elenco completo, controlli `disabled`, `/projects#earlier-b2b-data-platform` raggiunge la voce (V9)

### Implementation for User Story 5

- [x] T080 [P] [US5] Implementa `src/lib/url-state.ts` (`parseProjectsQuery`, `serializeProjectsQuery`) secondo [ui-contracts.md §3](./contracts/ui-contracts.md)
- [x] T081 [P] [US5] Implementa `src/lib/search.ts`: `buildSearchItems(content)`, `buildFilterOptions(items, technologies)`, `applyTechFilter` (OR), `FUSE_OPTIONS` con `keys` pesate (title 3, subtitle 2, stackNames 2, sector 1, role 1, summary 1, body 0.5), `threshold: 0.35`, `ignoreLocation: true`, `minMatchCharLength: 2`, `searchItems(items, query, techSet)`
- [x] T082 [P] [US5] Crea `src/components/sections/tech-filter.tsx` (`'use client'`, `<fieldset>`/`<legend>` per categoria, `<input type="checkbox">` nativi con Tailwind e conteggio, prop `disabled`; niente `Checkbox` di Radix, vedi R-05)
- [x] T083 [P] [US5] Crea `src/components/sections/search-box.tsx` (`'use client'`, `<input type="search">` con label, Escape svuota, debounce 200 ms, prop `disabled`)
- [x] T084 [US5] Crea `src/components/sections/project-list.tsx` (renderizzabile lato server: card dei case study + sezione `id="earlier-work"` con EarlierWorkList `variant="full"`), usato sia dal fallback sia da ProjectExplorer
- [x] T085 [US5] Crea `src/components/sections/project-explorer.tsx` (`'use client'`: `useSearchParams`, indice Fuse in `useMemo`, TechFilter + SearchBox + ProjectList filtrata, contatore e stato vuoto, `router.replace(url, { scroll: false })`)
- [x] T086 [US5] Crea `src/app/projects/page.tsx`: `<Suspense>` con fallback = TechFilter e SearchBox `disabled` con le stesse dimensioni + ProjectList completa; dentro, ProjectExplorer con i `SearchItem` passati come props; metadata; test `tests/unit/app/projects-page.test.tsx` (`renderToStaticMarkup`: elenco completo e sezione `#earlier-work`)

**Checkpoint**: le user story P1 da US1 a US5 sono complete; manca solo US6 (skill).

---

## Phase 8: User Story 6 - Skill categorizzate (Priority: P1)

**Goal**: sezione `#skills` in `/about` con le 8 categorie, livello come testo e link
all'elenco filtrato per le skill collegate a tecnologie usate (US-06).

**Independent Test**: confrontare la sezione con `content/skills.yaml`; click su una skill
collegata → `/projects?tech=<slug>`.

### Tests for User Story 6

- [x] T087 [P] [US6] Aggiungi a `tests/unit/lib/derive.test.ts` i casi di `techSlugsForSkill(skillName, technologies, usedSlugs)` (restituisce solo slug con `related_skill` uguale e usati da almeno una voce)
- [x] T088 [P] [US6] Scrivi `tests/unit/components/skills-grid.test.tsx`: 8 categorie nell'ordine del file, livello come testo ("Expert", "Intermediate"…), link a `/projects?tech=<slug>` solo per skill con tecnologia usata

### Implementation for User Story 6

- [x] T089 [US6] Aggiungi `techSlugsForSkill` a `src/lib/derive.ts` e crea `src/components/sections/skills-grid.tsx`
- [x] T090 [US6] Aggiungi la sezione `id="skills"` con SkillsGrid in `src/app/about/page.tsx` ed estendi `tests/e2e/about.spec.ts`: la voce di menu "Skills" porta a `/about#skills` e la sezione mostra tutte le categorie (dipende da T063)

**Checkpoint**: tutte le user story P1 complete.

---

## Phase 9: User Story 7 - CV in PDF (Priority: P2)

**Goal**: `/cv.pdf` generato a ogni build da profilo, carriera, earlier work, skill e lingue,
scaricabile da home, `/about` e header (FR-006).

**Independent Test**: scenari V10 e V11 di [quickstart.md](./quickstart.md).

### Tests for User Story 7

- [x] T091 [P] [US7] Aggiungi `unpdf` come devDependency (e riga in `docs/dependencies.md`) e scrivi `tests/unit/scripts/generate-cv.test.tsx`: render da `tests/fixtures/content/` in un buffer che inizia con `%PDF-`; il testo estratto contiene nome, primo ruolo, una fase, una voce di progression, una di `ai_work` e una di `notes`, una voce di earlier work, una skill, le lingue parlate e il carattere `→`
- [x] T092 [P] [US7] Scrivi `tests/e2e/cv-download.spec.ts`: il link "Download CV" in `/`, in `/about` e nell'header scarica `Francesco-Marrara-CV.pdf`, il file inizia con `%PDF-` ed è più grande di 0 byte (V10)

### Implementation for User Story 7

- [x] T093 [P] [US7] Aggiungi i font `scripts/cv/fonts/Inter-Regular.ttf`, `scripts/cv/fonts/Inter-SemiBold.ttf` e la licenza `scripts/cv/fonts/OFL.txt` dalla release ufficiale di Inter (https://github.com/rsms/inter)
- [x] T094 [US7] Crea `scripts/cv/styles.ts`, `scripts/cv/cv-document.tsx` (`Font.register` con i TTF di T093; layout A4 a una colonna; sezioni nell'ordine Header · Profile (`summary`) · Experience (`role`, `company`, periodo, `location`, `summary`, `responsibilities`/`achievements`, `phases` con `label`, `period` e `client_sector`, `progression`, `ai_work`, `notes`, `techAll`) · Earlier work · Skills · Languages; metadata `title`, `author`, `subject`) e `scripts/generate-cv.tsx` (`loadContent()` → `renderToFile('public/cv.pdf')`, exit 1 in caso di errore); aggiungi `tsx scripts/generate-cv.tsx` a `dev` e `build` in `package.json`, dopo `sync-assets` e prima di `next build`
- [x] T095 [P] [US7] Crea `src/components/sections/cv-download-link.tsx` (`href="/cv.pdf"`, `download="Francesco-Marrara-CV.pdf"`) con test `tests/unit/components/cv-download-link.test.tsx`
- [x] T096 [US7] Aggiungi CvDownloadLink in `src/components/sections/hero.tsx`, `src/app/about/page.tsx` e alla navigazione in `src/components/layout/site-header.tsx` e `src/components/layout/mobile-nav.tsx` (voce "Download CV")
- [x] T097 [US7] Aggiungi in `vercel.json` per `/cv.pdf`: `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="Francesco-Marrara-CV.pdf"`

**Checkpoint**: il CV si rigenera a ogni build e riflette `content/`.

---

## Phase 10: User Story 8 - Contatto via email (Priority: P2)

**Goal**: link `mailto:` con indirizzo leggibile in home, `/about` e footer (FR-009).

**Independent Test**: scenario V12 di [quickstart.md](./quickstart.md).

### Tests for User Story 8

- [x] T098 [P] [US8] Scrivi `tests/e2e/contact.spec.ts`: in `/`, `/about` e nel footer esiste un link `mailto:<email>` e l'indirizzo è visibile come testo (V12)

### Implementation for User Story 8

- [x] T099 [US8] Aggiungi una sezione "Contact" con ContactLink in `src/app/about/page.tsx` e verifica che `src/components/sections/hero.tsx` e `src/components/layout/site-footer.tsx` usino ContactLink (dipende da T063)

**Checkpoint**: contatto disponibile nei tre punti richiesti.

---

## Phase 11: User Story 9 - Pagina "How I use AI" (Priority: P2)

**Goal**: `/how-i-use-ai` spiega il workflow Spec Kit e linka gli artefatti versionati
(FR-008); il README documenta l'uso degli agenti (Principio IV).

**Independent Test**: scenario V13 di [quickstart.md](./quickstart.md).

### Tests for User Story 9

- [x] T100 [P] [US9] Scrivi `tests/unit/components/spec-links.test.tsx` (ogni link punta a `REPO_URL/blob/main/<path>` con l'etichetta del contenuto)
- [x] T101 [P] [US9] Scrivi `tests/e2e/how-i-use-ai.spec.ts`: titolo e body renderizzati; ogni `spec_links[].path` è un file esistente nel repo (controllo con `fs` nel test) e il relativo `href` ha il formato atteso (V13)

### Implementation for User Story 9

- [x] T102 [P] [US9] Crea `src/components/sections/spec-links.tsx`
- [x] T103 [US9] Crea `src/app/how-i-use-ai/page.tsx` (body con MarkdownContent, SpecLinks, metadata con `description` del frontmatter) con test `tests/unit/app/how-i-use-ai-page.test.tsx` (`renderToStaticMarkup`: body e link agli artefatti)
- [x] T104 [US9] Aggiungi la sezione "Built with AI agents" in `README.md`: come sono stati usati Spec Kit e Droid/Claude, link a `specs/` e a `/how-i-use-ai`

**Checkpoint**: tutte le user story P1 e P2 complete (definizione di done della v1, salvo Polish).

---

## Phase 12: User Story 10 - Feed RSS dei case study (Priority: P3)

**Goal**: `/rss.xml` statico con un item per case study (FR-011).

**Independent Test**: il feed passa il W3C Feed Validator e contiene tutti i case study (V15).

### Tests for User Story 10

- [x] T105 [P] [US10] Scrivi `tests/unit/lib/rss.test.ts`: `<channel>` con title, link, description, `language` `en`, `atom:link rel="self"`; un item per progetto ordinato per anno decrescente; `guid` = URL; `pubDate` RFC 822 del 1° gennaio dell'anno; escape XML di `& < > " '`

### Implementation for User Story 10

- [x] T106 [US10] Implementa `src/lib/rss.ts` (`buildRss(content, siteUrl)` → stringa XML RSS 2.0)
- [x] T107 [US10] Crea `src/app/rss.xml/route.ts` (`dynamic = 'force-static'`, `GET` con `buildRss`) con test `tests/unit/app/rss-route.test.ts` (`GET()` → XML con un `<item>` per progetto delle fixture); aggiungi in `vercel.json` `Content-Type: application/rss+xml; charset=utf-8` per `/rss.xml`; aggiungi `alternates.types['application/rss+xml']` ai metadata di `src/app/layout.tsx` e il link RSS in `src/components/layout/site-footer.tsx`
- [x] T108 [US10] Scrivi `tests/e2e/seo-files.spec.ts` (parte RSS): `/rss.xml` risponde 200 e contiene un `<item>` per ogni file di `content/projects/`

**Checkpoint**: feed disponibile e linkato.

---

## Phase 13: User Story 11 - Sito in inglese e italiano (Priority: P3)

**Goal**: nessuno per la v1. La constitution v2.0.0 prevede contenuti per l'utente solo in
inglese (vedi spec, Assunzioni).

- [ ] T109 [US11] Non implementare nella v1. Se Francesco vuole il bilingue: proporre un emendamento della regola "Lingua" in `.specify/memory/constitution.md` con `/speckit-constitution`, poi aprire una feature separata con `/speckit-specify`

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: SEO, verifiche trasversali di accessibilità, link, sicurezza e performance,
documentazione e primo deploy.

- [x] T110 [P] Crea `src/app/sitemap.ts` (tutte le route pubbliche, incluso ogni `/projects/<slug>`, URL assoluti da `SITE_URL`) e `src/app/robots.ts` (`User-agent: *`, `Allow: /`, `Sitemap: <SITE_URL>/sitemap.xml`), entrambi con `dynamic = 'force-static'` (FR-010), con test `tests/unit/app/sitemap-robots.test.ts` (valori restituiti da `sitemap()` e `robots()`)
- [x] T111 Estendi `tests/e2e/seo-files.spec.ts`: sitemap con tutte le route; robots con la riga `Sitemap`; `/api/health` con body `{"status":"ok"}`; JSON-LD `Person` su `/` e `/about` e `TechArticle` su ogni case study, parsabili come JSON; `<link rel="canonical">` = `SITE_URL` + path (V15, V16) (dipende da T108, T110)
- [x] T112 [P] Scrivi `tests/e2e/a11y.spec.ts`: `@axe-core/playwright` con tag `wcag2a`, `wcag2aa`, `wcag21aa` su ogni URL della sitemap, in entrambi i progetti Playwright: zero violazioni (V18)
- [x] T113 [P] Scrivi `tests/e2e/links.spec.ts`: per ogni URL della sitemap ogni `a[href^="/"]` risponde 200; per i link con frammento (`#…`, es. `/projects#earlier-…`, `/about#skills`, indice del case study) la pagina di destinazione contiene un elemento con quell'`id` (V20, SC-008, FR-005)
- [x] T114 [P] Scrivi `tests/e2e/security.spec.ts`: su ogni route il `<meta http-equiv="Content-Security-Policy">` è il primo figlio di `<head>`, `script-src` non contiene `'unsafe-inline'` né `'unsafe-eval'`, nessun evento `securitypolicyviolation`
- [x] T115 [P] Scrivi `tests/e2e/navigation.spec.ts`: ogni voce di menu su desktop e mobile; menu mobile con JavaScript disattivato (`<details>`); `aria-current` sulla pagina corrente; lo skip link è il primo elemento focusabile e porta a `#content`; a viewport 360×740, su ogni URL della sitemap `document.documentElement.scrollWidth` ≤ 360, cioè nessuno scroll orizzontale (NFR-006)
- [x] T116 Esegui `pnpm build && pnpm lhci` e correggi fino a soddisfare tutte le asserzioni di `lighthouserc.json` (4 categorie ≥ 0.95, LCP, CLS, TBT) su ogni pagina; esegui `pnpm test:e2e --grep inp`; controlla che il JavaScript iniziale per route resti nel budget indicativo di 150 KB gzip (V19)
- [x] T117 Esegui `pnpm test` e porta la coverage di `src/**` e `scripts/**` (esclusi solo i `.d.ts`, vedi `vitest.config.mts`) ad almeno 80% su lines, branches, functions e statements
- [x] T118 [P] Completa `README.md`: architettura, modello dei contenuti, come aggiornare il CV (`content/career.yaml` → commit → rebuild), script, CI, deploy, link a `docs/security.md`, `docs/dependencies.md` e alla constitution
- [x] T119 [P] Aggiorna `CHANGELOG.md` con la voce `1.0.0`, porta `version` a `1.0.0` in `package.json` e allinea versioni e date di review in `docs/dependencies.md`
- [x] T120 Rimuovi il commento "Sync Impact Report" in testa a `.specify/memory/constitution.md` prima del primo commit
- [x] T121 Esegui la pipeline completa di [quickstart.md](./quickstart.md) (`deps:check`, `lint`, `typecheck`, `test`, `build`, `test:e2e`, `lhci`) e la self-review del template `.github/pull_request_template.md`
- [ ] T122 (Manuale, Francesco) Crea il repository GitHub pubblico, fai il push, importa il progetto in Vercel Hobby (preset Next.js, build command `pnpm build`), abilita Web Analytics, disattiva la Vercel Toolbar (R-14) e attiva la branch protection su `main` con CI obbligatoria, seguendo `specs/001-personal-portfolio/quickstart.md`; conferma `REPO_URL` in `src/lib/site.ts`
- [ ] T123 Dopo il primo deploy imposta `SITE_URL` in `src/lib/site.ts` sul dominio assegnato e verifica V16, V17, V21, V22 e `X-Robots-Tag: noindex` sui preview (sezione "Verifiche da fare una sola volta" di `specs/001-personal-portfolio/quickstart.md`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: nessuna dipendenza. T001 → T002 → T003 → T012 in sequenza (stesso
  `package.json`); il resto in parallelo dopo T003.
- **Foundational (Phase 2)**: dipende da Setup; blocca tutte le user story.
  Catena interna: T020 → T021 → T023 → T025 → T027 → T029 → T030; T035 → T036; T040 → T041;
  T044 → T045. T015–T017 devono essere completati prima di T026 (caricamento di `content/` reale).
- **User Stories (Phase 3–13)**: dipendono da Foundational.
- **Polish (Phase 14)**: dipende dalle user story incluse nel rilascio (P1 + P2 per la v1).

### User Story Dependencies

| Story | Dipende da | Motivo |
|---|---|---|
| US1 | Foundational | — |
| US2 | Foundational | crea `src/app/about/page.tsx` |
| US3 | Foundational | — |
| US4 | US1 (T052), US3 (T068) | modifica `tech-badge-list.tsx` e `case-study.tsx` |
| US5 | US1 (T054, T055) | `project-list.tsx` riusa card ed EarlierWorkList |
| US6 | US2 (T063) | aggiunge `#skills` a `/about` |
| US7 | US1 (T053), US2 (T063) | aggiunge il CV a hero e `/about` |
| US8 | US2 (T063) | aggiunge il contatto a `/about` |
| US9 | Foundational | — |
| US10 | Foundational | — |
| US11 | — | rinviata (constitution) |

### Within Each User Story

- Test prima dell'implementazione: devono fallire prima di essa.
- Librerie (`src/lib/`) prima dei componenti, componenti prima delle pagine.
- File condivisi tra storie (`src/app/about/page.tsx`, `vercel.json`, `hero.tsx`,
  `site-header.tsx`, `tests/e2e/about.spec.ts`, `tests/e2e/case-study.spec.ts`,
  `tests/e2e/seo-files.spec.ts`) si modificano in sequenza, nell'ordine dei task.

### Parallel Opportunities

- Setup: T004–T011, T013, T014 in parallelo dopo T003.
- Foundational: i contenuti (T015–T018), i test (T022, T024, T028, T040, T044) e i file
  indipendenti (T019, T031–T034, T037–T039, T042, T043, T046, T047).
- Dopo Foundational: US1, US2, US3, US9 e US10 possono procedere in parallelo; US4 e US5 dopo
  US1 (+US3 per US4); US6, US7 e US8 dopo US2.

---

## Parallel Example: User Story 1

```bash
# Test di US1 insieme:
Task: "Scrivi tests/unit/components/hero.test.tsx"
Task: "Scrivi tests/unit/components/project-card.test.tsx e featured-projects.test.tsx"
Task: "Scrivi tests/unit/components/earlier-work-list.test.tsx"
Task: "Scrivi tests/e2e/home.spec.ts"

# Componenti indipendenti di US1 insieme:
Task: "Crea src/components/sections/tech-badge-list.tsx"
Task: "Crea src/components/sections/hero.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Scrivi tests/unit/components/career-role.test.tsx"
Task: "Scrivi tests/unit/components/career-timeline.test.tsx e spoken-languages.test.tsx"
Task: "Scrivi tests/e2e/about.spec.ts (parte carriera)"
Task: "Crea src/components/sections/career-role.tsx"
Task: "Crea src/components/sections/spoken-languages.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Scrivi tests/unit/components/case-study.test.tsx"
Task: "Scrivi tests/unit/components/case-study-toc.test.tsx"
Task: "Scrivi tests/e2e/case-study.spec.ts"
Task: "Crea src/components/sections/case-study-toc.tsx"
Task: "Crea src/components/sections/case-study.tsx"
```

## Parallel Example: User Story 5

```bash
Task: "Scrivi tests/unit/lib/url-state.test.ts"
Task: "Scrivi tests/unit/lib/search.test.ts"
Task: "Scrivi i test di componente di project-explorer, tech-filter, search-box"
Task: "Scrivi tests/e2e/projects-filter.spec.ts, projects-search.spec.ts, projects-no-js.spec.ts"
Task: "Implementa src/lib/url-state.ts"
Task: "Implementa src/lib/search.ts"
Task: "Crea src/components/sections/tech-filter.tsx"
Task: "Crea src/components/sections/search-box.tsx"
```

## Parallel Example: User Story 7

```bash
Task: "Scrivi tests/unit/scripts/generate-cv.test.tsx"
Task: "Scrivi tests/e2e/cv-download.spec.ts"
Task: "Aggiungi i font Inter in scripts/cv/fonts/"
Task: "Crea src/components/sections/cv-download-link.tsx"
```

## Parallel Example: Stories after Foundational

```bash
Task: "Phase 3 — US1 home"
Task: "Phase 4 — US2 career timeline in /about"
Task: "Phase 5 — US3 case study pages"
Task: "Phase 11 — US9 /how-i-use-ai"
Task: "Phase 12 — US10 RSS"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup.
2. Phase 2: Foundational (contenuti aggiornati, validazione, layout, sicurezza, CI).
3. Phase 3: US1.
4. **STOP and VALIDATE**: scenario V1, `pnpm build`, `pnpm test:e2e --grep home`.
5. Deploy di preview per una prima verifica di header e CSP sulla piattaforma reale (V16, V17).

### Incremental Delivery

1. Setup + Foundational → base pronta.
2. US1 → home (MVP, solo preview).
3. US3 + US4 → case study con stack e link (i link della home smettono di andare in 404).
4. US5 → `/projects` con filtro e ricerca.
5. US2 + US6 → `/about` con timeline e skill. **Tutte le P1 complete**.
6. US7, US8, US9 → CV, contatto, "How I use AI". **Definizione di done della v1** (P1 + P2).
7. Phase 14 → Polish, primo deploy di produzione.
8. US10 (RSS) in una release successiva o insieme alla v1 se il tempo lo permette; US11 rinviata.

### Parallel Team Strategy

Con più agenti o sviluppatori, dopo Foundational:

- Agente A: US1 → US5
- Agente B: US2 → US6 → US8
- Agente C: US3 → US4 (dopo T052 di US1)
- Agente D: US9 → US10 → US7 (dopo T053 e T063)

---

## Notes

- [P] = file diversi, nessuna dipendenza da task incompleti.
- Le etichette [USn] corrispondono agli identificativi US-0n della spec.
- I testi in `content/` (T015–T017) sono contenuti personali: vanno confermati da Francesco prima
  del merge.
- Commit dopo ogni task o gruppo logico; preview Vercel su ogni PR.
- Nessun TODO né codice commentato nei commit su `main` (ESLint `no-warning-comments`).
