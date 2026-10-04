# Quickstart: validazione del Portfolio Personale

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Guida per verificare end-to-end che l'implementazione rispetti spec e contratti. Non contiene
codice di implementazione: i comandi sotto presuppongono gli script definiti in `package.json`
(vedi plan, sezione "Script npm").

## Prerequisiti

- Node.js 24 LTS (`nvm use`, legge `.nvmrc`)
- pnpm 10 tramite Corepack: `corepack enable`
- Browser per Playwright: `pnpm exec playwright install --with-deps chromium`
- Nessuna variabile d'ambiente, nessun account oltre a GitHub e Vercel

## Setup

```bash
pnpm install --frozen-lockfile
pnpm content:check        # valida content/ (contracts/content-schemas.md)
pnpm dev                  # http://localhost:3000 (genera anche public/cv.pdf)
```

## Pipeline completa in locale (stessa sequenza della CI)

```bash
pnpm deps:check           # registro dipendenze (docs/dependencies.md)
pnpm lint                 # ESLint + Prettier
pnpm typecheck            # next typegen + tsc --noEmit
pnpm test                 # Vitest + coverage (soglia 80%)
pnpm build                # validazione → asset → CV → next build → CSP hash → out/
pnpm test:e2e             # Playwright su out/ servito da `serve`
pnpm lhci                 # Lighthouse CI su tutte le pagine di out/ (≥ 0.95 su 4 categorie, LCP/CLS/TBT)
```

Esito atteso: tutti i comandi escono con codice 0.

## Scenari di validazione

| # | Verifica | Come | Esito atteso | Copre |
|---|---|---|---|---|
| V1 | Profilo in prima schermata | `pnpm build && pnpm serve`, apri `/` con viewport 360×740 | Nome, ruolo, "7+ years of experience" (o il valore calcolato), stack principale visibili senza scroll | US-01, FR-001, SC-001 |
| V2 | Timeline | `/about#career`, solo tastiera (Tab, Enter) | Ruoli in ordine inverso; ogni ruolo si espande/chiude; ruolo corrente aperto e marcato "present" | US-02, FR-002 |
| V3 | Case study | `/projects/mobility-services-backend` | 8 sezioni in ordine, indice funzionante, nessun link repo/demo (valori `null`) | US-03, US-04, FR-003 |
| V4 | Build fallita su sezione mancante | Rinomina `## Trade-offs` in un progetto, `pnpm content:check` | Exit code 1, messaggio con file e `section "Trade-offs": missing`. Ripristina il file | FR-003, SC-007 |
| V5 | Build fallita su schema | Imposta `year: "2024"` (stringa) o uno slug inesistente in `stack`, `pnpm build` | Exit code 1, messaggio con file, campo e motivo | FR-013, SC-007 |
| V6 | Filtro OR | `/projects`, seleziona `java` e `claude` | Voci con almeno una delle due; URL `?tech=claude,java` | US-05, FR-004 |
| V7 | Ricerca + filtro | aggiungi `q=cloud`; poi una ricerca senza risultati | Intersezione corretta; messaggio "No projects match your filters." e pulsante che riporta a `/projects` | US-05, FR-004 |
| V8 | Link condivisibile | Copia l'URL filtrato, aprilo in una nuova scheda | Stesso stato; nessuno spostamento visibile del layout | US-05 sc. 5 |
| V9 | Senza JavaScript | DevTools → Disable JavaScript, apri `/projects` e `/projects#earlier-b2b-data-platform` | Elenco completo, controlli disabilitati, ancora raggiunta | Edge case spec |
| V10 | CV | Click "Download CV" da `/` e da `/about` | Download di `Francesco-Marrara-CV.pdf`; nel PDF il carattere `→` dei periodi è reso correttamente; contenuti uguali a `content/` | US-07, FR-006, SC-003 |
| V11 | CV aggiornato | Modifica un `summary` in `career.yaml`, `pnpm build`, riapri `out/cv.pdf` | La modifica è presente | SC-003 |
| V12 | Contatto | Link email in home, `/about`, footer | `mailto:` corretto; indirizzo leggibile in chiaro | US-08, FR-009 |
| V13 | How I use AI | `/how-i-use-ai`, segui ogni link | Ogni link apre un file esistente nel repo GitHub | US-09, FR-008 |
| V14 | 404 | `/projects/does-not-exist`, `/nope` | Pagina 404 con link a home e `/projects`; stato HTTP 404 | FR-015 |
| V15 | SEO | `curl -s <url>/sitemap.xml`, `/robots.txt`, `/rss.xml`; Rich Results Test su `/` e un case study | Sitemap con tutte le route pubbliche; RSS valido (W3C Feed Validator); JSON-LD `Person` e `TechArticle` validi | FR-010, FR-011 |
| V16 | Health | `curl -i <url>/api/health` | `200`, `Content-Type: application/json`, body `{"status":"ok"}` | brief |
| V17 | Header e CSP | `curl -sI <preview-url>/` e DevTools Console su ogni route | Header della sezione 7 di [ui-contracts.md](./contracts/ui-contracts.md); nessuna violazione CSP in console; `<meta http-equiv="Content-Security-Policy">` primo figlio di `<head>` | Principio VII |
| V18 | Accessibilità | `pnpm test:e2e --grep a11y` + verifica manuale con screen reader su `/projects` | Zero violazioni axe WCAG 2.1 AA; contatore risultati annunciato | NFR-002 |
| V19 | Performance | `pnpm lhci` + `pnpm test:e2e --grep inp`; PageSpeed Insights sul deploy di produzione come controllo aggiuntivo | ≥ 95 sulle 4 categorie su ogni pagina; LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms in laboratorio; interazione del filtro < 200 ms con CPU rallentata 4× | NFR-001, NFR-003, SC-004 |
| V20 | Link interni | `pnpm test:e2e --grep links` | Zero link interni rotti | SC-008 |
| V21 | Deploy | Apri una PR → preview Vercel; merge su `main` → produzione | Preview automatica con commento sulla PR; produzione aggiornata senza azioni manuali | NFR-004 |
| V22 | Costo | Dashboard Vercel → Usage; GitHub → Billing | Piano Hobby, nessun addebito; Actions gratuite (repo pubblico) | NFR-005, SC-005 |

## Verifiche da fare una sola volta, al primo deploy

1. Impostare `SITE_URL` in `src/lib/site.ts` sul dominio `*.vercel.app` assegnato.
2. Abilitare Web Analytics nella dashboard Vercel (gratuito su Hobby).
3. Verificare che i deploy di preview abbiano `X-Robots-Tag: noindex` (`curl -sI`).
4. Verificare V16 e V17 sul deploy reale: sono le due verifiche che dipendono dalla piattaforma
   e non dalla build.
