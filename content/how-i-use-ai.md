---
title: How I use AI
description: How this site was built with spec-driven development, GitHub Spec Kit and AI coding agents, and which decisions stayed with me.
spec_links:
  - label: Feature specification, including the clarification session
    path: specs/001-personal-portfolio/spec.md
---

This site has no AI features. There is no chatbot and no generated content. The AI is in how the
site was built, not in what it does. I use the same approach at work, where I am leading my
team's move from traditional to agentic programming
([case study](/projects/agentic-ai-transition)).

## The workflow

I built the site with [GitHub Spec Kit](https://github.com/github/spec-kit), a spec-driven
workflow where every step produces a document that is versioned in the repository. An AI agent
does most of the writing. I review every step and make the decisions.

1. **Constitution.** Eight principles the project cannot break: static and simple, zero cost,
   content before aesthetics, agentic AI as the development method, tests with 80% coverage,
   Lighthouse 95+ and WCAG 2.1 AA on every page, a strict Content Security Policy, and code that
   is still easy to maintain years from now.
2. **Specify.** The feature specification: user stories, functional requirements, edge cases and
   measurable success criteria. It describes what the site does, not how.
3. **Clarify.** The agent asks targeted questions about gaps in the specification. Four answers
   changed it: the home page shows the skills I mark as highlighted, the site is a professional
   profile and offers no services, the short bio has its own field, and spoken languages are
   required.
4. **Plan.** Research against official documentation, then the technical design: data model,
   content schemas, routes, security headers, build pipeline and test strategy.
5. **Tasks.** The plan becomes an ordered task list, grouped by user story, with tests written
   before the code.
6. **Analyze.** A consistency check across specification, plan and tasks before writing code.
7. **Implement.** The agent works through the tasks one at a time. Every change goes through
   lint, type checks, tests and a pull request with a preview deploy.

## What the agents caught

Most of the value came from problems found on paper, before any code existed:

- The planned framework version would have lost security support within weeks, so I amended
  the constitution and moved to the next long-term support release.
- Security headers configured in the framework are silently ignored in a static export. They
  moved to the hosting configuration, and the Content Security Policy uses per-page hashes
  instead of `unsafe-inline`.
- A CV generated after the build would have shipped an outdated PDF. It is now generated before
  the build, from the same data as the site.
- The analysis step flagged a coverage rule that excluded the pages (the constitution asks for
  all TypeScript code), a UI component that would have broken the security policy, and a
  career timeline that only worked with JavaScript enabled.

## What stays human

The agent proposes and I decide. I chose the framework version, the scope, what the home page
highlights and every piece of text on this site. When the agent and the constitution disagree,
the constitution wins, and changing it requires a written reason and a new version.

## Tools

- **GitHub Spec Kit** for the spec-driven workflow and its templates.
- **Droid** by Factory as the agent that runs the workflow in this repository.
- **Claude** by Anthropic, the models behind most of the agentic work I do.
- **GitHub Copilot** and [**OpenCode**](https://opencode.ai) as part of my everyday toolbox.

The specification below is the real document used to build this site.
