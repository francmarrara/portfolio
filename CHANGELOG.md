# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-03

### Added

- Project scaffolding: Next.js 16 static export, TypeScript strict, Tailwind CSS v4, Vitest,
  Playwright and Lighthouse CI configuration.
- Content layer in `content/` with strict Zod schemas, cross-file checks and build-time validation.
- Home page with hero, featured projects and earlier work.
- About page with career timeline, skills grid, spoken languages and contact section.
- Case study pages at `/projects/[slug]` with table of contents and project links.
- `/projects` with technology filter and fuzzy search, state kept in the URL, working without
  JavaScript.
- PDF CV generated at build time from `content/` (`/cv.pdf`) with a download link.
- `/how-i-use-ai` page describing the Spec Kit workflow.
- RSS feed (`/rss.xml`), `sitemap.xml`, `robots.txt`, Open Graph and JSON-LD metadata.
- Security headers in `vercel.json` and per-page Content-Security-Policy hashes.
- CI workflow (dependency registry, lint, typecheck, tests, build, E2E, Lighthouse CI),
  Dependabot, pull request template, `docs/security.md` and `docs/dependencies.md`.
