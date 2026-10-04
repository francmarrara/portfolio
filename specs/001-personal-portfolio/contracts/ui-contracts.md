# Contract: UI, Routes e File Pubblici

**Feature**: [spec.md](../spec.md) | **Model**: [data-model.md](../data-model.md)

Interfacce che il sito espone a visitatori, crawler e lettori di feed. Tutto è statico: ogni
risposta è un file in `out/` servito dalla CDN di Vercel. I testi visibili sono in inglese
(NFR-007).

## 1. Route

`trailingSlash: false`. Vercel risolve `/about` su `about.html`.

| Route | File in `out/` | Contenuto (requisiti) | JSON-LD | Sitemap |
|---|---|---|---|---|
| `/` | `index.html` | Hero: avatar o iniziali, nome, ruolo, anni di esperienza nel formato `"<N>+ years of experience"` (N = `yearsOfExperience`, arrotondato per difetto), bio breve, stack principale, CTA Download CV, link email. Progetti featured. 4 earlier work + "See all" → `/projects#earlier-work`. (FR-001, US-01) | `Person` | ✓ |
| `/projects` | `projects.html` | Filtro tech, ricerca, contatore risultati, elenco case study + sezione `#earlier-work` con le voci `#earlier-<slug>`. (FR-004, FR-005, US-05) | — | ✓ |
| `/projects/[slug]` | `projects/<slug>.html` | Header (title, subtitle, year, role, sector, `cover` con `cover_alt` se presente), stack come link a `/projects?tech=<slug>`, link repo/demo solo se non nulli, indice delle 8 sezioni, 8 sezioni con `id` = slug del titolo. (FR-003, US-03, US-04) | `TechArticle` | ✓ |
| `/about` | `about.html` | Bio lunga (body di `about.md`), availability, lingue parlate con livello, link email, CTA CV, `#career` timeline, `#skills` griglia per categoria. (FR-002, FR-007, US-02, US-06) | `Person` | ✓ |
| `/how-i-use-ai` | `how-i-use-ai.html` | Body di `content/how-i-use-ai.md`, elenco `spec_links` verso `REPO_URL/blob/main/<path>`. (FR-008, US-09) | — | ✓ |
| *qualsiasi altro* | `404.html` | Messaggio, link a `/` e `/projects`. Stato HTTP 404. (FR-015) | — | — |

`generateStaticParams()` restituisce gli slug di tutti i progetti; `dynamicParams = false`.

### Metadati per pagina

- `<title>`: `"<Page> — Francesco Marrara"`, home: `"Francesco Marrara — Senior Software Engineer"`.
- `<meta name="description">` ≤ 160 caratteri: subtitle per i progetti, `description` per
  /how-i-use-ai, `summary` del profilo (troncato a 160) per le altre.
- `<link rel="canonical">` = `SITE_URL + route`.
- Open Graph: `og:title`, `og:description`, `og:url`, `og:type` (`profile` per home/about,
  `article` per i case study).
- `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` nel layout.

## 2. File pubblici

| Path | Generato da | Contenuto | Header specifici (`vercel.json`) |
|---|---|---|---|
| `/cv.pdf` | `scripts/generate-cv.tsx` (prima di `next build`) | CV A4 (R7) | `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Francesco-Marrara-CV.pdf"` |
| `/rss.xml` | `src/app/rss.xml/route.ts` | RSS 2.0: `<channel>` con title, link, description, language `en`; un `<item>` per case study (title, link, guid = URL, description = subtitle, pubDate = 1 gen dell'anno, category = nomi stack) | `Content-Type: application/rss+xml; charset=utf-8` |
| `/sitemap.xml` | `src/app/sitemap.ts` | Le 5 tipologie di route sopra (escluso 404), URL assoluti | — |
| `/robots.txt` | `src/app/robots.ts` | `User-agent: *`, `Allow: /`, `Sitemap: <SITE_URL>/sitemap.xml` | — |
| `/api/health` | `src/app/api/health/route.ts` | `{"status":"ok"}` | `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store` |

`/api/health` è un file statico: risponde 200 se il deploy è raggiungibile e servito dalla CDN, non
verifica nient'altro.

## 3. Query string di `/projects`

```text
/projects?tech=<slug>[,<slug>...]&q=<text>
```

| Param | Grammatica | Normalizzazione | Valori non validi |
|---|---|---|---|
| `tech` | slug separati da virgola | deduplicati, ordinati alfabeticamente | gli slug che non compaiono in nessuna voce vengono ignorati e rimossi dall'URL al primo aggiornamento |
| `q` | testo libero URL-encoded | `trim`, spazi multipli → uno, max 100 caratteri | meno di 2 caratteri → ricerca disattivata |

- Altri parametri: ignorati e rimossi al primo aggiornamento.
- Nessun filtro e nessuna ricerca → URL pulito `/projects`.
- Aggiornamento con `router.replace(url, { scroll: false })`; `q` con debounce di 200 ms.
- L'URL è canonico: a parità di stato produce sempre la stessa stringa (test di round-trip).

## 4. Comportamento di filtro e ricerca

1. **Opzioni del filtro**: solo le tecnologie usate da almeno una voce (case study o earlier work),
   raggruppate per `Technology.category`, con il numero di voci per opzione.
2. **Filtro**: una voce passa se il suo `stack` contiene almeno uno degli slug selezionati (OR).
3. **Ricerca**: Fuse.js sui campi di `SearchItem` (pesi in research R6). Senza distinzione tra
   maiuscole e minuscole, corrispondenza parziale.
4. **Combinazione**: risultato = filtro ∩ ricerca.
5. **Ordine**: senza ricerca, case study per anno decrescente, poi earlier work per periodo
   decrescente. Con ricerca, per punteggio Fuse dentro ciascun gruppo.
6. **Contatore**: regione `aria-live="polite"` con `"Showing N of M items"`.
7. **Nessun risultato**: messaggio `"No projects match your filters."` + pulsante
   `"Clear filters"` che azzera tech e q.
8. **Senza JavaScript**: l'HTML statico (fallback del `<Suspense>`) contiene l'elenco completo e
   gli stessi controlli di filtro e ricerca in stato `disabled`, con le stesse dimensioni.
   Dopo l'idratazione i controlli diventano attivi senza spostare il layout (CLS < 0.1).
   Senza JavaScript i controlli restano disabilitati e l'elenco è comunque completo.
9. **Deep link**: `/projects/[slug]` → chip della tecnologia → `/projects?tech=<slug>`. In
   `/about#skills`, una skill con almeno una `Technology` collegata (via `related_skill`) usata da
   almeno una voce → `/projects?tech=<slug>`.

## 5. Navigazione e layout globali (FR-014)

- **Skip link** "Skip to content" come primo elemento focusabile.
- **Header**: nome → `/` (è la voce Home di FR-014); voci: Projects (`/projects`), About (`/about`), Skills
  (`/about#skills`), How I use AI (`/how-i-use-ai`), Download CV (`/cv.pdf`, attributo
  `download`). La voce della pagina corrente ha `aria-current="page"`.
- **Mobile (< 768px)**: menu in un elemento `<details>`/`<summary>`, funzionante senza JavaScript.
- **Footer**: email in chiaro con link `mailto:`, LinkedIn, GitHub, link RSS, anno corrente
  (calcolato alla build).

## 6. Componenti interattivi: contratto di accessibilità

| Componente | Requisiti |
|---|---|
| Ruolo di carriera espandibile | `<details>`/`<summary>` nativi, nessun JavaScript; il `<summary>` mostra azienda, ruolo e periodo; `open` sul ruolo corrente; focus visibile. Mouse, touch, Enter e Space funzionano in modo nativo, anche senza JS |
| Filtro tech | gruppo di checkbox con `<fieldset>`/`<legend>` per categoria; navigabile con Tab/Space |
| Ricerca | `<input type="search">` con `<label>` visibile o `aria-label`; Escape svuota il campo |
| Indice del case study | `<nav aria-label="Case study sections">` con link alle ancore |
| Link esterni (repo, demo, LinkedIn, GitHub) | `rel="noopener noreferrer"`, testo esplicito ("View repository"), icona con `aria-hidden` |
| Livello skill | testo visibile (es. "Expert"), non solo colore o barre |
| Immagini | `alt` dal contenuto (`cover_alt` per le cover); avatar decorativo (`alt=""`, 96×96, accanto al nome); avatar assente → iniziali con `aria-hidden` e nome nel testo adiacente; dimensioni riservate (`width`/`height` o `aspect-ratio`) per non spostare il layout |

Tutte le pagine: un solo `<h1>`, gerarchia di heading senza salti, contrasto ≥ 4.5:1, target touch
≥ 24×24 px, `prefers-reduced-motion` rispettato.

## 7. Header HTTP (`vercel.json`)

Applicati a `/(.*)`:

| Header | Valore |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` |
| `Content-Security-Policy` | `frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'; upgrade-insecure-requests` |

## 8. CSP per pagina (`<meta http-equiv>`, iniettata post-build)

```text
default-src 'self';
script-src 'self' 'sha256-<hash-1>' … 'sha256-<hash-n>';
style-src 'self' 'sha256-<hash-style-1>' … 'sha256-<hash-style-n>';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
manifest-src 'self';
worker-src 'none'
```

- Gli hash sono calcolati sul contenuto esatto di ogni `<script>` inline eseguibile della pagina
  (esclusi `type="application/ld+json"`).
- Il `<meta>` è il primo figlio di `<head>`.
- Gli hash dei `<style>` inline vanno in `style-src` (se non ce ne sono, resta `style-src 'self'`).
  `scripts/csp-hashes.ts` fallisce solo sugli attributi `style=` (vedi research R5).
- Ogni eccezione (es. `style-src-attr 'unsafe-inline'`) va motivata in `docs/security.md`.
