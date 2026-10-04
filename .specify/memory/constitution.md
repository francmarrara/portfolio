# Portfolio Personale Constitution

## Core Principles

### I. Statico e Semplice sopra Tutto (NON NEGOZIABILE)

- Il progetto DEVE avere un solo codebase e un solo deploy: Next.js (App Router) su Vercel.
- Il contenuto DEVE vivere in git: `content/` è la fonte di verità e viene letto a build-time.
- NON DEVONO esistere database, servizi long-running o API dinamiche.
- NON DEVONO esistere feature AI nel prodotto: l'AI è un metodo di sviluppo, non una
  funzionalità per l'utente.
- NON DEVE esistere infrastruttura gestita: niente AWS, niente container, niente VM.

Ogni aggiunta DEVE superare la domanda: "posso farlo con un file statico?". Se la risposta è
no, la feature non entra.

### II. Costo Zero, Manutenzione Zero

- Il budget è 0€/mese su Vercel Hobby.
- NON DEVONO essere usati servizi a pagamento né account esterni oltre a GitHub e Vercel.
- Il deploy DEVE avvenire tramite la GitHub integration di Vercel, senza configurazione
  infrastrutturale aggiuntiva.
- Il contatto DEVE avvenire tramite link `mailto:` o un servizio gratuito che non richieda un
  account proprietario. NON DEVE esistere un backend per l'invio.

Razionale: un portfolio che costa anche solo 5€/mese e si rompe è peggio di un portfolio gratis
che funziona sempre.

### III. Contenuto Prima dell'Estetica

- Ogni progetto mostrato DEVE includere: contesto, problema, soluzione, decisioni tecniche,
  trade-off.
- La qualità dei case study ha priorità sulle animazioni e sugli effetti visivi.
- Il contenuto DEVE vivere in `content/` al root del repo, separato da `specs/` e `src/`.
- Aggiornare il CV DEVE richiedere solo: modifica di `content/career.yaml` → commit → rebuild.

### IV. AI Agentica come Metodo di Sviluppo

- Il repo DEVE contenere gli artefatti Spec Kit (`specs/`) versionati in chiaro.
- Il README DEVE documentare come Claude, Droid e altri agenti sono stati usati per costruirlo.
- L'uso agentico è parte del valore mostrato e NON DEVE essere nascosto.

### V. Qualità del Codice e Test

- La coverage del codice TypeScript DEVE essere almeno l'80%.
- I test unitari DEVONO usare Vitest; i flussi critici DEVONO avere test E2E con Playwright.
- ESLint, Prettier e TypeScript in modalità `strict` DEVONO passare senza errori.
- NON DEVONO essere mergiati in `main` commenti `TODO` o codice commentato.

### VI. Performance e Accessibilità

- Ogni route pubblica DEVE ottenere Lighthouse ≥ 95 su Performance, Accessibility,
  Best Practices e SEO.
- Il sito DEVE rispettare almeno WCAG 2.1 AA.
- I Core Web Vitals DEVONO essere verdi: LCP < 2.5s, CLS < 0.1, INP < 200ms.

### VII. Sicurezza

- Ogni PR DEVE essere verificata contro la checklist OWASP Top 10.
- NON DEVONO esserci secrets nel repo; quando servono, DEVONO stare nelle variabili d'ambiente
  di Vercel.
- Il sito DEVE essere servito solo in HTTPS (default Vercel) con HSTS attivo.
- Le dipendenze DEVONO essere monitorate da Dependabot.
- Una Content Security Policy DEVE essere definita. Ogni direttiva permissiva (ad esempio
  `'unsafe-inline'`, `'unsafe-eval'` o wildcard) DEVE avere una giustificazione scritta.

### VIII. Manutenibilità nel Tempo

- La CI (GitHub Actions) DEVE eseguire lint, typecheck, test e build su ogni PR.
- Il progetto DEVE seguire il versionamento semantico e mantenere un `CHANGELOG` aggiornato.
- Ogni dipendenza DEVE avere una data di review registrata in un file versionato nel repo.

## Vincoli Aggiuntivi

- **Lingua**: contenuti per l'utente in inglese, commenti nel codice in inglese, documentazione
  interna in italiano.
- **Design**: mobile-first.
- **Framework**: Next.js 16 (App Router). Ogni altro framework o major version richiede un
  emendamento.
- **Stile**: Tailwind CSS + shadcn/ui.
- **Directory layout**: `content/`, `specs/`, `src/`, `public/`.

## Workflow di Sviluppo

- Ogni feature DEVE passare da `/speckit.specify` → `/speckit.plan` → `/speckit.tasks`.
- Nessuna PR può essere mergiata senza test e, se il comportamento cambia, senza aggiornamento
  del README.
- Prima di ogni merge è obbligatoria una self-review contro i principi di questa constitution.
- Ogni PR DEVE avere un preview deploy Vercel; la produzione viene deployata da `main`.

## Governance

- Questa constitution prevale su preferenze personali e mode del momento.
- Ogni emendamento DEVE includere: motivazione scritta, analisi d'impatto, bump di versione.
- Ogni conflitto tra principi si risolve a favore del principio con numero più basso
  (I > II > III > ...).
- Il versionamento segue SemVer:
  - MAJOR: rimozione o ridefinizione incompatibile di principi o regole di governance.
  - MINOR: nuovo principio o sezione, oppure espansione sostanziale delle regole.
  - PATCH: chiarimenti, wording, refusi, modifiche non semantiche.
- La conformità DEVE essere verificata in ogni self-review pre-merge e nel Constitution Check
  di ogni `/speckit.plan`.

**Version**: 2.0.0 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-03
