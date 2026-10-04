# Sicurezza

Riferimenti: Principio VII della constitution, [research.md R5](../specs/001-personal-portfolio/research.md)
e [ui-contracts.md §7–8](../specs/001-personal-portfolio/contracts/ui-contracts.md).

Il sito è statico: non ha server applicativo, database, sessioni, form o API che scrivono dati. La
superficie d'attacco è quindi quella del browser del visitatore (XSS, clickjacking, risorse di
terze parti) e quella della supply chain (dipendenze).

## Due livelli di policy

Con `output: 'export'` Next.js non può inviare header (`headers()` non è supportato) né un nonce per
richiesta. La protezione sta quindi su due livelli, e il browser applica l'intersezione:

1. **Header HTTP in `vercel.json`**, uguali per tutte le pagine.
2. **`<meta http-equiv="Content-Security-Policy">` per pagina**, scritto da
   `scripts/csp-hashes.ts` dopo `next build`. Contiene gli hash SHA-256 degli script inline di
   quella pagina, che cambiano da pagina a pagina e non si possono mettere in un header statico.

### Header (`vercel.json`)

| Header                      | Valore                                                                                                      | Perché                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                                                              | Solo HTTPS (Principio VII)                                     |
| `X-Frame-Options`           | `DENY`                                                                                                      | Anti-clickjacking per i browser che ignorano `frame-ancestors` |
| `X-Content-Type-Options`    | `nosniff`                                                                                                   | Il browser non indovina il tipo MIME                           |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                           | Non invia il percorso completo ai siti esterni                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), browsing-topics=()`                                              | Il sito non usa queste API                                     |
| `Content-Security-Policy`   | `frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests` | Le sole direttive che non funzionano in un `<meta>`            |

### Policy per pagina (meta)

```text
default-src 'self';
script-src 'self' 'sha256-…';
style-src 'self' ['sha256-…' per gli eventuali <style> inline];
img-src 'self' data:;
font-src 'self';
connect-src 'self';
manifest-src 'self';
worker-src 'none'
```

| Direttiva                      | Motivo                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default-src 'self'`           | Tutto ciò che non è elencato arriva solo dallo stesso dominio                                                                                                             |
| `script-src 'self' 'sha256-…'` | Gli script esterni vengono dal sito; quelli inline (payload di Next.js) sono ammessi solo se il loro hash è nella pagina. **Nessun `'unsafe-inline'` né `'unsafe-eval'`** |
| `style-src 'self'`             | I CSS sono file dello stesso dominio. Gli `<style>` inline, se compaiono, entrano con il loro hash                                                                        |
| `img-src 'self' data:`         | Immagini del sito; `data:` per eventuali icone SVG incorporate                                                                                                            |
| `font-src 'self'`              | Il sito usa font di sistema; il font Inter serve solo al PDF                                                                                                              |
| `connect-src 'self'`           | Lo script di Vercel Analytics è dello stesso dominio (`/_vercel/insights/*`)                                                                                              |
| `manifest-src 'self'`          | Eventuale web manifest                                                                                                                                                    |
| `worker-src 'none'`            | Nessun service worker                                                                                                                                                     |

Il `<meta>` è il **primo figlio di `<head>`**, così vale prima di qualsiasi risorsa. I blocchi
`<script type="application/ld+json">` sono dati e non sono soggetti a `script-src`.

### Attributi `style="…"`

La policy non ammette `style-src-attr 'unsafe-inline'`, quindi un attributo `style` presente
nell'HTML statico verrebbe bloccato. `scripts/csp-hashes.ts` fa **fallire la build** se ne trova
(il payload degli script non conta). Il `Checkbox` di Radix, per esempio, ne genera uno nell'input
nascosto: per questo il filtro usa checkbox nativi (R-05). Gli stili impostati da React a runtime
tramite le proprietà CSS (`element.style.x = …`) non sono bloccati.

## Come aggiungere un'eccezione

Ogni direttiva permissiva (`'unsafe-inline'`, `'unsafe-eval'`, wildcard, domini esterni) richiede
una giustificazione scritta, come prevede la constitution.

1. Verifica che non esista un'alternativa: un hash, una classe Tailwind al posto dello `style`, un
   file locale al posto di una risorsa esterna.
2. Limita l'eccezione alla direttiva più stretta possibile. Per gli attributi di stile è
   `style-src-attr 'unsafe-inline'`, non `style-src 'unsafe-inline'`.
3. Modifica `buildCsp()` in `scripts/csp-hashes.ts` e il relativo test in
   `tests/unit/scripts/csp-hashes.test.ts`.
4. Aggiungi qui sotto una riga con data, direttiva, motivo e chi ha approvato.
5. Se l'eccezione cambia il comportamento, aggiorna `CHANGELOG.md`.

### Eccezioni attive

Nessuna.

## Vercel Toolbar nei preview

Nei deploy di anteprima Vercel può caricare la sua toolbar da un dominio esterno, che la policy
blocca (R-14). L'errore compare solo nei preview, mai in produzione. Disattiva la toolbar nelle
impostazioni del progetto Vercel (Settings → General → Vercel Toolbar) oppure ignora quell'errore
nei preview. Gli E2E girano su `out/` servito in locale, quindi non lo vedono.

## Corrispondenza con l'OWASP Top 10 (2021)

| Rischio                                        | Come è coperto                                                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 Broken Access Control                      | Nessuna area riservata: tutto il contenuto è pubblico per scelta                                                                                          |
| A02 Cryptographic Failures                     | Solo HTTPS con HSTS; nessun dato personale raccolto; nessun secret nel repository                                                                         |
| A03 Injection                                  | `react-markdown` senza HTML raw; la build rifiuta HTML raw nel markdown; JSON-LD serializzato con escape di `<`; CSP senza `unsafe-inline` per gli script |
| A04 Insecure Design                            | Sito statico: nessun input dell'utente raggiunge un server; stato di filtro e ricerca solo nell'URL, validato e normalizzato                              |
| A05 Security Misconfiguration                  | Header in `vercel.json`, CSP per pagina, verifica V17 su ogni preview                                                                                     |
| A06 Vulnerable and Outdated Components         | Dependabot settimanale, registro con data di review (`docs/dependencies.md`), controllo in CI                                                             |
| A07 Identification and Authentication Failures | Non applicabile: nessun login                                                                                                                             |
| A08 Software and Data Integrity Failures       | Lockfile con `--frozen-lockfile`, script di install di pnpm bloccati, deploy solo dall'integrazione GitHub di Vercel                                      |
| A09 Security Logging and Monitoring Failures   | Non applicabile a un sito statico; gli E2E falliscono su qualsiasi violazione CSP                                                                         |
| A10 Server-Side Request Forgery                | Non applicabile: nessuna richiesta lato server a runtime                                                                                                  |

I link esterni usano `rel="noopener noreferrer"`. Il contatto avviene con un link `mailto:`, senza
form né backend.

## Verifica V17

Su ogni preview e sulla produzione (vedi [quickstart.md](../specs/001-personal-portfolio/quickstart.md)):

```bash
curl -sI <url>/ | grep -iE "strict-transport|x-frame|x-content-type|referrer-policy|permissions-policy|content-security"
```

Poi apri la Console del browser su ogni route: nessuna violazione CSP. Il `<meta>` deve essere il
primo figlio di `<head>` (lo controlla anche `tests/e2e/security.spec.ts`).
