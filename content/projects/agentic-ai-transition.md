---
title: From Standard to Agentic Programming
subtitle: Introducing AI-assisted engineering practices in a delivery team
year: 2024
role: Senior Software Engineer — initiative lead
sector: Internal — Engineering practices
stack: [claude, github-copilot, spec-kit, mcp, prompt-engineering]
featured: true
repo: null
demo: null
---

## Context

AI coding assistants had become available to the team, but adoption was
inconsistent. Some engineers used them as autocomplete, others avoided them
entirely, and nobody had a shared way of working. The potential was obvious,
the practice wasn't.

## Problem

Tooling alone doesn't change a team's workflow. Without shared conventions,
AI-assisted development risks producing inconsistent output, wasted tokens,
and — worse — a false sense of productivity. The team needed structure,
not just access to tools.

## Solution

Led a bottom-up initiative to introduce a structured, spec-driven approach
to AI-assisted development across the team.

- **Custom skills for Claude and GitHub Copilot**, generated through an
  internal framework, to encode project-specific conventions and reduce
  prompt variance across engineers.
- **Spec-driven development with Spec Kit** as the standard workflow for
  new features: specification first, plan second, tasks third, code last —
  with the AI assisting at every stage rather than replacing the process.
- **Internal presentations and hands-on sessions** to onboard colleagues
  progressively, showing real examples rather than abstract benefits.
- **Personal experimentation** on real work, to bring back concrete
  experience instead of theoretical recommendations.

## My role

Leading the initiative: defining the approach, producing the shared skills,
running the onboarding sessions, and acting as the reference point for
questions and feedback. Still a hands-on engineer — the initiative is
built on direct practice, not on coordination alone.

## Technical decisions

- **Spec Kit as the backbone**: turns ad-hoc prompting into a repeatable
  process with artifacts (spec, plan, tasks) that survive the session.
- **Skills over raw prompts**: encapsulate conventions so the whole team
  benefits from each engineer's improvements.
- **Progressive onboarding**: start with one workflow, prove value, expand —
  rather than mandating a full methodology in one shot.
- **Bottom-up adoption**: build credibility through results before asking
  for formal support.

## Trade-offs

- Accepted slower initial velocity while engineers learn the new workflow —
  the investment pays back only if the practice sticks.
- Chose to standardize on a small set of tools rather than let everyone pick
  their favorite, to keep shared practices coherent.
- Prioritized practices over tooling: tools will change, the workflow
  mindset is what stays.

## Impact

- A shared, documented approach to AI-assisted development exists in the
  team, where before there was none.
- Colleagues are adopting Spec Kit as part of their day-to-day workflow.
- Reduced variance in AI output by encoding conventions into reusable skills.
- Positioned the team to evaluate new AI tooling against a known baseline
  instead of from scratch.

## What I'd do differently

Define success metrics from the start — velocity, review turnaround, defect
rate — so the impact is measurable, not just felt. That's the next step:
turning a working practice into a demonstrably better one.
