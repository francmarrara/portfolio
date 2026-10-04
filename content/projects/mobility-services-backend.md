---
title: Mobility Services Backend
subtitle: Cloud-native backend for a major European energy company
year: 2024
role: Senior Software Engineer
sector: Energy — Mobility & Fuels
stack: [python, fastapi, aws, dynamodb, mysql, docker, github-actions]
featured: true
repo: null
demo: null
---

## Context

A major European energy company needed to modernize the backend supporting its
mobility and fuels services. The existing landscape was built around legacy
systems that were hard to evolve and didn't scale with the pace of new product
initiatives.

## Problem

New business requirements were arriving faster than the existing platform could
absorb them. The legacy backend made it costly to introduce new capabilities,
and there was no clean separation between old and new concerns — every change
risked impacting the existing services still in production.

## Solution

Introduced a set of new services alongside the existing legacy platform, rather
than attempting a full rewrite. The new components were built in Python with
FastAPI on AWS, exposing internal APIs consumed by the mobile app and other
internal systems. This "strangler" approach allowed the team to deliver new
functionality without disrupting the systems the business depended on daily.

## My role

Software engineer on the delivery team. Contributed across the stack —
service implementation, API design, data modeling and integration with
internal systems — working closely with the rest of the team and the client.

## Technical decisions

- **Python + FastAPI** for new services: async-native, automatic OpenAPI
  generation, Pydantic-based validation, fast iteration cycle.
- **Polyglot persistence** — different storage engines chosen based on access
  patterns rather than one-size-fits-all.
- **Containerized services on AWS**: predictable runtime behavior and a
  deployment model consistent with the rest of the platform.
- **Incremental delivery alongside legacy**: reduce risk, keep the business
  running, prove the new approach on real traffic before expanding.

## Trade-offs

- Accepted the operational overhead of running new and legacy systems in
  parallel, in exchange for zero disruption to the business.
- Chose managed AWS services to reduce operational burden, accepting some
  degree of vendor lock-in.
- Kept the initial scope narrow to ship faster, deferring some capabilities
  to subsequent iterations.

## Impact

- New features could be delivered without touching the legacy core.
- Established a reusable backend pattern for subsequent initiatives in the
  same product area.
- Improved separation of concerns between old and new components, reducing
  the blast radius of changes.

## What I'd do differently

Nothing I'd fundamentally change. The incremental approach was the right call
for the context — a full rewrite would have been riskier and slower to deliver
value.
