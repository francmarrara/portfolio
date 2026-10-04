## Cosa cambia

<!-- Descrivi la modifica e il motivo. -->

## Self-review contro la constitution

- [ ] **I. Statico e semplice**: nessun database, API dinamica o servizio long-running; nessuna feature AI nel prodotto
- [ ] **II. Costo zero**: nessun servizio a pagamento né account oltre a GitHub e Vercel
- [ ] **III. Contenuto prima dell'estetica**: il contenuto resta in `content/`; i case study hanno tutte le sezioni
- [ ] **IV. AI agentica**: gli artefatti in `specs/` sono aggiornati se cambia il design
- [ ] **V. Qualità e test**: lint, typecheck e test passano; coverage ≥ 80%; nessun `TODO` né codice commentato
- [ ] **VI. Performance e accessibilità**: Lighthouse ≥ 95, WCAG 2.1 AA, Core Web Vitals verdi
- [ ] **VII. Sicurezza**: vedi la checklist OWASP qui sotto; CSP senza `unsafe-inline` per gli script
- [ ] **VIII. Manutenibilità**: `CHANGELOG.md` aggiornato; `docs/dependencies.md` aggiornato se cambiano le dipendenze

## Checklist OWASP Top 10

- [ ] **A01 Broken Access Control**: nessuna area riservata né dato non pubblico nel build
- [ ] **A02 Cryptographic Failures**: solo HTTPS con HSTS; nessun secret nel repository
- [ ] **A03 Injection**: nessun `dangerouslySetInnerHTML` su contenuto non fidato; il markdown non rende HTML raw
- [ ] **A04 Insecure Design**: nessun input dell'utente inviato a un server
- [ ] **A05 Security Misconfiguration**: header in `vercel.json` invariati o motivati in `docs/security.md`
- [ ] **A06 Vulnerable Components**: le dipendenze nuove sono nel registro; nessun avviso aperto di Dependabot
- [ ] **A07 Identification and Authentication Failures**: non applicabile (nessun login)
- [ ] **A08 Software and Data Integrity Failures**: lockfile aggiornato; `pnpm install --frozen-lockfile` passa
- [ ] **A09 Security Logging and Monitoring Failures**: non applicabile (sito statico); gli errori CSP sono verificati negli E2E
- [ ] **A10 Server-Side Request Forgery**: non applicabile (nessuna richiesta lato server a runtime)

## Altro

- [ ] `README.md` aggiornato se il comportamento cambia
- [ ] Nessun testo che prometta o venda servizi a pagamento (vincolo di Vercel Hobby, uso non commerciale)
- [ ] Ho controllato il deploy di anteprima di Vercel
