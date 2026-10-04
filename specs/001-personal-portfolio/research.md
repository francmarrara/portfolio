# Research: Portfolio Personale

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data**: 2026-10-03

Ogni voce segue il formato Decision / Rationale / Alternatives. Le fonti esterne sono state
verificate il 2026-10-03.

---

## R1. Versione di Next.js

- **Decision**: Next.js 16 (App Router), ultima minor 16.x al momento dell'implementazione.
  Constitution emendata a v2.0.0.
- **Rationale**: secondo la [support policy](https://nextjs.org/support-policy), 15.x è in
  Maintenance LTS solo fino a due anni dal rilascio (2024-10-21 → 2026-10-21). Lanciare su 15
  violerebbe il Principio VII entro tre settimane. 16.x è l'Active LTS (rilascio 2025-10-21).
- **Alternatives**: restare su 15 con migrazione pianificata (scartata: lavoro doppio per un
  progetto non ancora iniziato).
- **Impatto pratico di 16**: `next lint` non esiste più → ESLint CLI con flat config
  `eslint-config-next`; `params` delle pagine è una `Promise`; Turbopack è il bundler di default;
  Node ≥ 20.9.

## R2. Compatibilità con `output: 'export'`

Fonte: [Static Exports guide](https://nextjs.org/docs/app/guides/static-exports) (aggiornata
2026-08-25). Funzionalità **non supportate**: `headers`, `redirects`, `rewrites`, `proxy`, ISR,
image optimization con loader di default, route handler che leggono `Request`, cookies, Server
Actions, route dinamiche senza `generateStaticParams()` o con `dynamicParams: true`.

| Richiesta del brief | Compatibile? | Decisione |
|---|---|---|
| Security headers in `next.config.ts` | **No** (`headers` non supportato) | Header in `vercel.json` (R5) |
| `/api/health` | Sì, con vincoli | `route.ts` con `dynamic = 'force-static'`, solo GET; il file in `out/` è senza estensione → `Content-Type` forzato in `vercel.json` |
| `next/image` | Solo senza loader di default | `images.unoptimized: true`, immagini ottimizzate a monte (R11) |
| CSP con nonce | **No** (richiede rendering per richiesta) | CSP con hash calcolati post-build (R5) |
| CV generato in `postbuild` dentro `public/` | **No, di fatto** | `next build` copia `public/` in `out/` durante la build: un file scritto dopo non arriva in `out/` (o arriva quello vecchio). Il CV va generato **prima** di `next build` (R7) |
| `/projects/[slug]` | Sì | `generateStaticParams()` + `dynamicParams = false` |
| Stato filtri in query string | Sì, solo lato client | `useSearchParams` dentro `<Suspense>`; l'HTML statico contiene la lista completa (R6) |
| `sitemap.ts`, `robots.ts`, `rss.xml/route.ts` | Sì | Tutti con `dynamic = 'force-static'` |
| `not-found.tsx` | Sì | Emesso come `out/404.html`, servito da Vercel per gli URL inesistenti |
| `src/data/search-index.json` | Sì, ma superfluo | Vedi R6: indice passato come props, nessun file generato in `src/` |
| Redirect (es. `/cv` → `/cv.pdf`) | No in `next.config.ts` | Non previsti; se servissero, vanno in `vercel.json` |

## R3. Parsing dei contenuti

- **Decision**: pacchetto `yaml` (YAML 1.2, schema `core`) per i file `.yaml`. `gray-matter` per il
  frontmatter, configurato con un engine custom che usa lo stesso `yaml`.
- **Rationale**: `gray-matter` usa di default `js-yaml` (YAML 1.1), che converte `2019-05-06` in
  `Date` mentre lascia `2022-07` come stringa: dati misti e fusi orari imprevedibili. YAML 1.2
  `core` lascia entrambi stringhe, validabili con una regex unica.
- **Alternatives**: `js-yaml` con `JSON_SCHEMA` (scartata: si perderebbero anche i numeri come
  `since: 2019` usati in `skills.yaml`).

## R4. Validazione

- **Decision**: Zod 4. Schemi in `src/lib/schemas.ts`, contratto in
  [contracts/content-schemas.md](./contracts/content-schemas.md). Oggetti `strictObject` (le chiavi
  sconosciute fanno fallire la build, così un refuso come `featurd:` non passa inosservato).
  Le regole tra file diversi (slug tecnologie esistenti, skill correlate esistenti, unicità) sono
  verificate in un secondo passaggio dopo il parsing.
- **Rationale**: FR-013 e FR-003 richiedono build fallita con file, campo e motivo. Gli errori
  vengono raccolti tutti (non solo il primo) e stampati con il percorso del file.
- **Alternatives**: JSON Schema + Ajv (scartata: il brief fissa Zod; i tipi TypeScript derivano
  gratis da `z.infer`).

## R5. Header di sicurezza e CSP

- **Decision**:
  1. Header statici in `vercel.json`: HSTS, `X-Frame-Options: DENY`,
     `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
     `Permissions-Policy`, e una CSP "di base" con le sole direttive che non possono stare in un
     `<meta>`: `frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none';
     upgrade-insecure-requests`.
  2. CSP completa per pagina come `<meta http-equiv="Content-Security-Policy">`, iniettata da
     `scripts/csp-hashes.ts` dopo `next build`: calcola lo SHA-256 di ogni `<script>` inline
     eseguibile (Next.js inietta script inline `self.__next_f.push(...)` diversi per ogni pagina)
     e di eventuali `<style>` inline, e scrive la policy in testa all'`<head>`.
  3. Policy risultante: `default-src 'self'; script-src 'self' 'sha256-…'; style-src 'self';
     img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self';
     worker-src 'none'`. Niente `'unsafe-inline'` né `'unsafe-eval'` per gli script.
  4. Attributi `style="…"` nell'HTML: lo script fallisce la build se ne trova e la policy non li
     permette. Se un componente (es. Radix) li rende necessari, si aggiunge solo
     `style-src-attr 'unsafe-inline'` con giustificazione scritta in `docs/security.md`.
- **Rationale**: la constitution (VII) chiede la CSP più restrittiva possibile con eccezioni
  giustificate. Il nonce non è disponibile nell'export statico. Gli hash per pagina sono l'unico
  modo per evitare `'unsafe-inline'` sugli script. Un header globale in `vercel.json` non può
  contenere gli hash, perché `vercel.json` viene letto prima della build. Due policy (header +
  meta) si applicano entrambe: vale l'intersezione.
- **Alternatives**: `script-src 'self' 'unsafe-inline'` (scartata: è la scelta che la constitution
  vieta senza giustificazione); hash globali in `vercel.json` (impossibile, vedi sopra).
- **Note**: i blocchi `<script type="application/ld+json">` non sono eseguibili e non sono soggetti
  a `script-src`. Lo script di Vercel Analytics è same-origin (`/_vercel/insights/script.js`),
  quindi coperto da `'self'`.

## R6. Ricerca e filtro

- **Decision**:
  - La pagina `/projects` (Server Component) carica i contenuti a build-time e passa a un Client
    Component `ProjectExplorer` un array serializzato di `SearchItem` (vedi
    [data-model.md](./data-model.md)). L'indice Fuse.js si costruisce nel browser: con meno di 50
    voci richiede meno di 1 ms.
  - Fuse.js: `keys` pesate (title 3, subtitle 2, stack names 2, sector 1, role 1, summary 1,
    body 0.5), `threshold: 0.35`, `ignoreLocation: true`, `minMatchCharLength: 2`.
    `ignoreLocation` è indispensabile: con il default (`location: 0`, `distance: 100`) le parole
    oltre i primi ~100 caratteri del case study non verrebbero mai trovate.
  - Filtro tech in OR; ricerca e filtro in AND tra loro (FR-004).
  - Stato in URL: `?tech=java,aws&q=cloud`, aggiornato con `router.replace` (nessuna voce di
    history per carattere digitato), `q` con debounce di 200 ms.
  - `ProjectExplorer` usa `useSearchParams` e sta dentro un `<Suspense>`. Il fallback è la lista
    completa renderizzata dal server, con i controlli già presenti ma `disabled`. Risultato:
    senza JavaScript la lista è completa (edge case della spec), le ancore `#earlier-…`
    funzionano dal primo paint e l'idratazione non sposta il layout.
- **Rationale**: nessun backend (Principio I); stato condivisibile (US-05, scenario 5).
- **Deviazione dal brief**: niente `src/data/search-index.json`. Un file generato dentro `src/`
  deve esistere prima di typecheck e lint, va escluso da git e duplica dati che il Server
  Component ha già. Passare i dati come props produce lo stesso risultato (dati nel payload
  statico della pagina) con un passaggio in meno.
- **Alternatives**: indice pre-costruito con `Fuse.createIndex` a build-time (utile sopra qualche
  centinaio di voci, non qui); MiniSearch o FlexSearch (scartati: il brief fissa Fuse.js).

## R7. CV in PDF

- **Decision**:
  - `scripts/generate-cv.tsx` eseguito con `tsx` **prima** di `next build` nello script `build`,
    scrive `public/cv.pdf` (in `.gitignore`, rigenerato a ogni build → SC-003).
  - Usa `@react-pdf/renderer` (`renderToFile`) e gli stessi loader/schemi del sito
    (`src/lib/content.ts`): nessuna seconda fonte di verità.
  - Font: Inter TTF (licenza OFL) versionato in `scripts/cv/fonts/` e registrato con
    `Font.register`. I font standard PDF (Helvetica) usano la codifica WinAnsi, che non contiene
    `→` (presente in molti periodi, es. "2019 → 2020").
  - Sezioni: header (nome, titolo, località, email, LinkedIn, GitHub), bio, esperienza
    (career), earlier work compatta, skill per categoria, lingue.
  - Nessun Chromium (vincolo del brief rispettato).
- **Rationale**: in `postbuild` il file arriverebbe dopo la copia di `public/` in `out/` (R2).
  Si usa un'unica catena esplicita nello script `build`, invece degli hook `pre`/`post`: il
  comportamento non dipende dalle impostazioni di pnpm e Vercel esegue esattamente `pnpm build`.
- **Gap di contenuto**: nessun file di `content/` contiene le lingue parlate. Si introduce il
  campo obbligatorio `spoken_languages` nel frontmatter di `about.md` (deciso in
  `/speckit-clarify`), mostrato nel PDF e in /about.
- **Alternatives**: `postbuild` che scrive in `out/cv.pdf` (funziona, ma il file non esiste in
  `next dev`, quindi il link di download è rotto in sviluppo); Puppeteer (vietato dal brief).

## R8. RSS, sitemap, robots, JSON-LD

- **Decision**:
  - `src/app/rss.xml/route.ts` (`force-static`): RSS 2.0 scritto a mano (circa 40 righe, nessuna
    dipendenza), un `<item>` per case study ordinato per anno decrescente. I progetti hanno solo
    `year`: `pubDate` = 1 gennaio di quell'anno.
  - `src/app/sitemap.ts` e `src/app/robots.ts` (`force-static`): elenco generato dagli stessi
    loader (home, /projects, /projects/[slug], /about, /how-i-use-ai).
  - URL assoluti da una costante `SITE_URL` in `src/lib/site.ts`, senza variabili d'ambiente (vincolo
    del brief). Valore iniziale: il dominio `*.vercel.app` del progetto, da fissare al primo deploy.
    Un dominio custom costa e violerebbe il Principio II senza emendamento.
  - JSON-LD: `Person` su `/` e `/about`, `TechArticle` (con `author` → `Person`) su ogni
    `/projects/[slug]`. Il tipo schema.org `Project` è un sottotipo di `Organization` e non
    descrive un case study. Il JSON viene serializzato con escape di `<` per evitare la chiusura
    prematura del tag.
- **Alternatives**: pacchetti `feed` / `next-sitemap` (scartati: dipendenze in più per output
  banali).

## R9. Statistiche di visita

- **Decision**: `@vercel/analytics` (`<Analytics />` nel root layout), Web Analytics abilitato dalla
  dashboard Vercel.
- **Rationale**: [Hobby plan](https://vercel.com/docs/plans/hobby): 50.000 eventi/mese inclusi;
  superato il limite, la raccolta si sospende e non c'è alcun addebito (gli account Hobby non
  possono acquistare eventi). È cookieless → nessun banner di consenso. FR-016 soddisfatto.
- **Nota test**: fuori da Vercel lo script `/_vercel/insights/script.js` risponde 404; negli E2E le
  richieste `/_vercel/**` vengono intercettate e chiuse con risposta vuota. Per Lighthouse CI lo
  script `lhci` crea uno stub vuoto `out/_vercel/insights/script.js` (la cartella `out/` locale
  non viene mai deployata).

## R10. Markdown

- **Decision**: `mdast-util-from-markdown` + `mdast-util-to-string` per validare e dividere i case
  study per H2 e per estrarre testo semplice per la ricerca; `react-markdown` + `remark-gfm` per il
  rendering di ogni sezione. HTML raw disabilitato (nessun `rehype-raw`).
- **Rationale**: con un solo albero mdast si fanno sia la validazione (FR-003) sia la divisione in
  sezioni. `react-markdown` genera elementi React senza `dangerouslySetInnerHTML` (OWASP A03).
- **Alternatives**: split del testo per righe `## ` (scartata: fragile con blocchi di codice);
  MDX (scartato: il contenuto non deve eseguire codice).

## R11. Immagini e font del sito

- **Decision**: font di sistema per il sito (zero byte da scaricare, migliore LCP). Immagini in
  `content/assets/`, copiate in `public/assets/` da `scripts/sync-assets.ts` prima della build
  (`public/assets/` in `.gitignore`). Validazione: formati `webp|avif|png|jpg|svg`, peso ≤ 300 KB,
  `alt` obbligatorio dove l'immagine è informativa.
- **Rationale**: senza image optimization (R2) il peso va controllato a monte; il limite in build
  impedisce regressioni di LCP.
- **Stato attuale**: `content/assets/` è vuota e nessun campo la referenzia; avatar e cover sono
  campi opzionali (fallback: iniziali).

## R12. Test e qualità

- **Decision**:
  - Vitest con due `projects`: `node` (lib, script, schemi) e `jsdom` (componenti con Testing
    Library). Coverage `@vitest/coverage-v8`, soglie 80% su lines/branches/functions/statements.
  - Perimetro coverage: tutto `src/**` e `scripts/**`, esclusi solo i file `.d.ts`. Le pagine in
    `src/app/**` si testano in ambiente node con `renderToStaticMarkup` e contenuti di fixture
    (mock di `@/lib/content`, `next/navigation`, `@vercel/analytics/next`); i route handler
    chiamando `GET()`. Da `src/components/ui/` si installano solo i componenti usati.
  - Playwright su `out/` servito da `serve` (gestisce URL senza `.html` e `404.html`), progetti
    Chromium desktop + Pixel 7 (viewport mobile). `@axe-core/playwright` per WCAG 2.1 AA su ogni
    route. Listener `securitypolicyviolation`: qualsiasi violazione CSP fa fallire il test.
  - Lighthouse CI (`@lhci/cli`) su `out/` con `staticDistDir` e `maxAutodiscoverUrls: 0` (il
    default è 5 pagine), 3 run per URL, asserzioni ≥ 0.95 sulle 4 categorie e soglie su LCP
    (2500 ms), CLS (0.1) e TBT (200 ms, approssimazione di laboratorio di INP). INP vero si misura
    negli E2E del filtro con l'Event Timing API e CPU rallentata 4×. Il brief non lo prevedeva in CI, ma senza questo controllo NFR-001 e il
    Principio VI sarebbero verificati solo a mano.
  - Nessun TODO: regola ESLint `no-warning-comments` (`todo`, `fixme`) come errore.
  - Prettier in `pnpm lint` (`eslint . && prettier --check .`).
- **Alternatives**: Jest (scartato: il brief fissa Vitest); Lighthouse manuale (scartato, vedi
  sopra).

## R13. Registro dipendenze

- **Decision**: `docs/dependencies.md` con una tabella: pacchetto, tipo (prod/dev), versione
  revisionata, data di review (ISO), motivo, note. `scripts/check-dependency-registry.ts` gira in
  CI: fallisce se un pacchetto di `package.json` manca dal registro o ha una data non valida;
  stampa un warning se la review ha più di 12 mesi.
- **Rationale**: il Principio VIII chiede una data di review per ogni dipendenza. Il controllo non
  confronta la versione esatta, altrimenti ogni PR di Dependabot romperebbe la CI: la colonna
  versione indica l'ultima versione revisionata e si aggiorna alla review.
- **Alternatives**: campo custom in `package.json` (scartato: non leggibile come documentazione).

## R14. Toolchain e CI

- **Decision**: Node 24 LTS (`.nvmrc`, `engines`), pnpm 10 via `packageManager` + Corepack.
  `pnpm.onlyBuiltDependencies` dichiara esplicitamente i pacchetti che possono eseguire script di
  install (pnpm 10 li blocca di default). Tailwind CSS v4 + shadcn/ui. GitHub Actions su
  `pull_request` e `push` a `main`. Repo pubblico → minuti Actions gratuiti. Deploy solo tramite
  integrazione GitHub di Vercel.
- **Typecheck**: `next typegen && tsc --noEmit` (genera i tipi delle route prima del controllo).

## R15. Vincolo "uso non commerciale" di Vercel Hobby

- **Finding**: le [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
  limitano Hobby all'uso personale non commerciale; tra gli esempi di uso commerciale c'è
  "Advertising the sale of a product or service".
- **Decision** (confermata in `/speckit-clarify`): il sito resta un profilo professionale.
  Nessun prezzo, nessuna offerta di servizi a pagamento, nessun pagamento. La frase "open to
  technical conversations and consulting" in `about.md` va riformulata senza "consulting". Se in futuro il sito promuovesse servizi
  professionali, servirebbe il piano Pro, in conflitto con il Principio II.
