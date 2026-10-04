# Portfolio — Francesco Marrara

Static personal portfolio for Francesco Marrara, Senior Software Engineer: profile, career
timeline, case studies with filter and search, a generated PDF CV, and an RSS feed. Content lives
in `content/` and is validated at build time: an invalid file fails the build.

## Architecture

- **Static export.** Next.js 16 (App Router) with `output: 'export'`. The build produces plain
  files in `out/`. There is no server, database or runtime API.
- **Content in git.** Everything the site shows comes from `content/`, read and validated at build
  time with Zod (strict schemas, cross-file checks). A broken file fails the build.
- **Hosting.** Vercel Hobby through the GitHub integration, at 0 EUR a month. Security headers
  live in `vercel.json`. A per-page Content-Security-Policy `<meta>` with script hashes is written
  by `scripts/csp-hashes.ts` after `next build`.
- **Client JavaScript is minimal.** Pages are server-rendered at build time. Only `/projects`
  hydrates a client component (filter and search with Fuse.js). With JavaScript disabled the page
  still lists every project.
- **Generated files.** `public/cv.pdf` (from `content/`, by `scripts/generate-cv.tsx`),
  `/rss.xml`, `/sitemap.xml` and `/robots.txt`. Generated files are not committed.

```text
content/        source of truth: career, skills, technologies, projects, about, how-i-use-ai
src/app/        routes (/, /about, /projects, /projects/[slug], /how-i-use-ai, rss.xml, sitemap, robots)
src/components/ layout, sections and UI primitives
src/lib/        schemas, content loader, derived data, search, URL state, SEO, RSS
scripts/        content validation, asset sync, CV generation, CSP hashes, dependency registry check
tests/          unit and component tests (Vitest) and end-to-end tests (Playwright)
specs/          Spec Kit artifacts: spec, plan, research, data model, contracts, tasks
docs/           security notes and the dependency registry
```

## Content model

| File                        | Content                                                                    |
| --------------------------- | -------------------------------------------------------------------------- |
| `content/about.md`          | Profile (name, contact, links, spoken languages) in frontmatter, plus text |
| `content/career.yaml`       | Career roles, most recent first                                            |
| `content/skills.yaml`       | Skills grouped by category, with levels                                    |
| `content/technologies.yaml` | Technology catalog, referenced by slug everywhere else                     |
| `content/earlier-work.yaml` | Earlier projects shown in compact form                                     |
| `content/projects/*.md`     | One case study per file: frontmatter plus fixed sections                   |
| `content/how-i-use-ai.md`   | Text of the How I use AI page                                              |
| `content/assets/`           | Images, copied to `public/` by `scripts/sync-assets.ts`                    |

Schemas are in `src/lib/schemas.ts`; the contracts are described in
[`specs/001-personal-portfolio/contracts/content-schemas.md`](specs/001-personal-portfolio/contracts/content-schemas.md).
Run `pnpm content:check` to validate content without a full build.

### Add a case study

1. Create `content/projects/<slug>.md` with the frontmatter fields and all required sections.
2. Use only technology slugs that exist in `content/technologies.yaml`.
3. Run `pnpm content:check`, then `pnpm build`.

## Update the CV

The PDF CV is generated from the same data as the site. Nothing is edited by hand.

1. Edit `content/career.yaml` (and `content/skills.yaml` if needed).
2. Run `pnpm content:check`.
3. Commit and push. Vercel rebuilds the site, and `pnpm build` regenerates `public/cv.pdf`.

To preview locally: `pnpm build && pnpm serve`, then open http://localhost:3000/cv.pdf.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:
`deps:check`, `lint`, `typecheck`, `test` (coverage threshold 80%), `build`, `test:e2e` and `lhci`
(Lighthouse score of at least 0.95 in every category, plus LCP, CLS and TBT budgets). Dependabot
opens weekly dependency updates.

## Deploy

1. Create a public GitHub repository and push `main`.
2. Import the repository in Vercel (Hobby plan, Next.js preset, build command `pnpm build`).
3. Enable Vercel Web Analytics and turn off the Vercel Toolbar.
4. Protect `main` with a required CI check.
5. Set `SITE_URL` and `REPO_URL` in `src/lib/site.ts` to the real values.

The detailed one-time checks are in
[`specs/001-personal-portfolio/quickstart.md`](specs/001-personal-portfolio/quickstart.md).

## Documentation

- [Constitution](.specify/memory/constitution.md): principles and constraints (in Italian)
- [Security](docs/security.md): headers, CSP, threat notes
- [Dependency registry](docs/dependencies.md): every dependency with its review date
- [Changelog](CHANGELOG.md)

## Requirements

- Node.js 24 (`nvm use` reads `.nvmrc`)
- pnpm 10 (enabled through Corepack: `corepack enable`)

## Main commands

| Command              | What it does                                                               |
| -------------------- | -------------------------------------------------------------------------- |
| `pnpm install`       | Install dependencies                                                       |
| `pnpm dev`           | Start the development server                                               |
| `pnpm content:check` | Validate everything in `content/`                                          |
| `pnpm build`         | Validate content, build the static site in `out/`, add per-page CSP hashes |
| `pnpm serve`         | Serve `out/` on http://localhost:3000                                      |
| `pnpm lint`          | ESLint and Prettier                                                        |
| `pnpm typecheck`     | TypeScript in strict mode                                                  |
| `pnpm test`          | Unit and component tests with coverage (threshold 80%)                     |
| `pnpm test:e2e`      | Playwright end-to-end tests against `out/`                                 |
| `pnpm lhci`          | Lighthouse CI against `out/`                                               |
| `pnpm deps:check`    | Check that every dependency is in `docs/dependencies.md`                   |

## Built with AI agents

The site was built with [GitHub Spec Kit](https://github.com/github/spec-kit) and an AI coding
agent (Factory Droid, with Claude as the model). The workflow is spec-driven: each step
produces a document that is versioned in this repository.

1. **Constitution** (`.specify/memory/constitution.md`): the principles the project cannot break.
2. **Specification and clarification** (`specs/001-personal-portfolio/spec.md`).
3. **Plan, research and contracts** (`plan.md`, `research.md`, `data-model.md`, `contracts/`).
4. **Tasks** (`tasks.md`), cross-checked against the other documents before any code is written.
5. **Implementation**, test first, one user story at a time.

The agent writes most of the code. I decide what to build, review every artifact and approve every
exception to the constitution. The full story, including what the agent got wrong, is on the
[How I use AI](content/how-i-use-ai.md) page of the site (`/how-i-use-ai`). All artifacts live in
[`specs/`](specs/).
