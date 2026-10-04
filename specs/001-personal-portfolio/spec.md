# Feature Specification: Portfolio Personale

**Feature Branch**: `001-personal-portfolio` (non creato: la directory non è ancora un repository git)

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Crea la spec del progetto "Portfolio Personale": sito portfolio statico
per Francesco Marrara, Senior Software Engineer." Descrizione completa fornita in chat: contesto,
sorgenti di contenuto, 4 personas, user stories US-01…US-11, FR-001…FR-013, NFR-001…NFR-005,
entità, fuori scope, definizione di done, success criteria, dipendenze.

## Clarifications

### Session 2026-10-03

- Q: Quali skill mostrare come "stack principale" nella home? → A: Le skill marcate
  `highlight: true` in `skills.yaml`, da 1 a 8; fuori da questo intervallo la build fallisce.
- Q: Il sito presenta Francesco come disponibile per lavoro a pagamento o solo come profilo
  contattabile? → A: Solo profilo professionale; nessuna offerta di servizi, prezzi o "hire me".
- Q: Da dove arrivano bio breve e bio lunga? → A: Bio breve da un campo dedicato del profilo
  (obbligatorio, max 300 caratteri); bio lunga dal corpo del testo del profilo.
- Q: Le lingue parlate sono un dato obbligatorio, mostrato in CV e sul sito? → A: Sì,
  obbligatorie (almeno una, con nome e livello), mostrate nel CV e in /about. Valori forniti:
  italiano madrelingua, inglese professionale, spagnolo base.

## User Scenarios & Testing *(mandatory)*

**Personas**

- **P1 — Recruiter tecnico**: cerca rapidamente stack, seniority, aziende.
- **P2 — CTO / hiring manager**: valuta profondità tecnica e trade-off.
- **P3 — Peer developer**: legge case study e decisioni architetturali.
- **P4 — Contatto professionale**: vuole capire di cosa si occupa Francesco e avviare una
  conversazione tecnica o professionale (formerly referred to as "Cliente potenziale"). Il sito
  non vende servizi.

Gli identificativi US-xx e FR-xxx riprendono quelli della descrizione originale, per tracciabilità.

### User Story 1 - US-01 Profilo leggibile in 5 secondi (Priority: P1)

Un recruiter apre la home e vede subito nome, ruolo, seniority e stack principale, senza dover
scorrere o navigare.

**Why this priority**: è il primo filtro di ogni recruiter; se fallisce, il resto del sito non
viene visto.

**Independent Test**: aprire la home su uno schermo mobile largo 360px e verificare che nome,
ruolo, anni di esperienza e stack principale siano visibili senza scroll.

**Acceptance Scenarios**:

1. **Given** un visitatore su mobile o desktop, **When** apre la home, **Then** vede nome, ruolo,
   anni di esperienza e stack principale nella prima schermata, senza scroll.
2. **Given** la home caricata, **When** il visitatore scorre, **Then** trova bio breve, progetti
   featured, le 4 esperienze precedenti più recenti e i link di contatto.

---

### User Story 2 - US-02 Timeline di carriera (Priority: P1)

Un recruiter sfoglia la storia lavorativa dal ruolo più recente al più vecchio e può espandere
ogni ruolo per vederne dettagli, fasi e tecnologie.

**Why this priority**: progressione e aziende sono le informazioni chiave dopo il ruolo attuale.

**Independent Test**: aprire la timeline e verificare ordine, contenuto ed espansione di ogni ruolo
usando solo la tastiera.

**Acceptance Scenarios**:

1. **Given** la timeline di carriera, **When** il visitatore la apre, **Then** i ruoli sono in
   ordine cronologico inverso con azienda, ruolo e periodo visibili.
2. **Given** un ruolo chiuso, **When** il visitatore lo espande (mouse, touch o tastiera),
   **Then** vede responsabilità/achievements, fasi e tecnologie del ruolo.
3. **Given** un ruolo ancora in corso, **When** viene mostrato, **Then** il periodo indica che è
   attuale (es. "present").

---

### User Story 3 - US-03 Case study approfonditi (Priority: P1)

Un CTO apre la pagina di un progetto e legge un case study strutturato in 8 sezioni fisse.

**Why this priority**: è il contenuto che dimostra profondità tecnica (constitution, Principio III).

**Independent Test**: aprire la pagina di ogni progetto pubblicato e verificare la presenza e
l'ordine delle 8 sezioni.

**Acceptance Scenarios**:

1. **Given** un progetto pubblicato, **When** il visitatore apre la sua pagina, **Then** vede
   titolo, sottotitolo, anno, ruolo, settore, stack e le sezioni Context, Problem, Solution,
   My role, Technical decisions, Trade-offs, Impact, What I'd do differently, in quest'ordine.
2. **Given** la pagina di un progetto, **When** il visitatore usa la navigazione interna,
   **Then** può saltare direttamente a ciascuna delle 8 sezioni.

---

### User Story 4 - US-04 Stack e repository per progetto (Priority: P1)

Un peer developer vede le tecnologie usate in un progetto e, se esiste, il link al repository o
alla demo.

**Why this priority**: permette di verificare il lavoro reale oltre al racconto.

**Independent Test**: confrontare stack e link mostrati con i dati del progetto, inclusi progetti
senza repository.

**Acceptance Scenarios**:

1. **Given** un progetto con repository o demo, **When** il visitatore apre la pagina, **Then**
   vede i link funzionanti, che si aprono verso la destinazione esterna.
2. **Given** un progetto senza repository né demo, **When** il visitatore apre la pagina,
   **Then** non vede link vuoti o rotti.
3. **Given** lo stack di un progetto, **When** il visitatore seleziona una tecnologia, **Then**
   arriva all'elenco progetti filtrato per quella tecnologia.

---

### User Story 5 - US-05 Filtro e ricerca progetti (Priority: P1)

Un visitatore filtra progetti ed esperienze precedenti per una o più tecnologie e/o cerca per
testo libero.

**Why this priority**: con più progetti e voci, è il modo più rapido per trovare ciò che interessa.

**Independent Test**: applicare combinazioni di filtri e ricerche su /projects e verificare i
risultati attesi, incluso il caso senza risultati.

**Acceptance Scenarios**:

1. **Given** /projects, **When** il visitatore seleziona una o più tecnologie, **Then** vede solo
   i progetti e le esperienze precedenti che usano almeno una delle tecnologie selezionate.
2. **Given** /projects, **When** il visitatore digita un testo, **Then** i risultati si
   aggiornano senza ricaricare la pagina, con corrispondenza parziale e senza distinzione tra
   maiuscole e minuscole.
3. **Given** filtro e ricerca attivi insieme, **When** il visitatore li applica, **Then** vede
   solo le voci che soddisfano entrambi.
4. **Given** una combinazione senza risultati, **When** viene applicata, **Then** il visitatore
   vede un messaggio esplicito e un comando per azzerare filtri e ricerca.
5. **Given** filtri o ricerca attivi, **When** il visitatore copia l'URL e lo riapre, **Then**
   ritrova lo stesso stato.

---

### User Story 6 - US-06 Skill categorizzate (Priority: P1)

Un visitatore vede il quadro completo delle competenze, raggruppate per categoria e con livello.

**Why this priority**: completa lo stack della home con la visione d'insieme.

**Independent Test**: aprire la sezione skill e verificare che ogni categoria e ogni skill dei
dati siano presenti con il loro livello.

**Acceptance Scenarios**:

1. **Given** la sezione skill, **When** il visitatore la apre, **Then** vede le skill raggruppate
   per categoria (languages, frameworks, cloud, databases, devops, messaging, ai, testing), con
   il livello leggibile anche senza colori.
2. **Given** una skill collegata a una tecnologia usata nei progetti, **When** il visitatore la
   seleziona, **Then** arriva all'elenco progetti filtrato per quella tecnologia.

---

### User Story 7 - US-07 CV in PDF (Priority: P2)

Un visitatore scarica il CV in PDF, sempre allineato ai dati del sito.

**Why this priority**: utile per candidature, ma il sito resta utilizzabile senza.

**Independent Test**: scaricare il PDF e confrontarne il contenuto con i dati di carriera, skill
ed esperienze precedenti della stessa versione del sito.

**Acceptance Scenarios**:

1. **Given** la home o /about, **When** il visitatore seleziona "Download CV", **Then** riceve un
   file PDF con nome, ruolo, contatti, carriera, skill, esperienze precedenti e lingue parlate.
2. **Given** una modifica ai dati di carriera pubblicata, **When** il visitatore scarica il CV
   dopo il deploy, **Then** il PDF contiene la modifica.

---

### User Story 8 - US-08 Contatto via email (Priority: P2)

Un visitatore (in particolare il contatto professionale) contatta Francesco via email.

**Why this priority**: trasforma la visita in conversazione; non serve un backend.

**Independent Test**: verificare che il link email sia presente in home, /about e footer, e che
l'indirizzo sia leggibile anche senza client di posta.

**Acceptance Scenarios**:

1. **Given** home, /about o footer, **When** il visitatore seleziona il link email, **Then** si
   apre il client di posta con il destinatario precompilato.
2. **Given** un visitatore senza client di posta configurato, **When** guarda il link, **Then**
   l'indirizzo email è visibile in chiaro e copiabile.

---

### User Story 9 - US-09 Pagina "How I use AI" (Priority: P2)

Un peer developer legge come Spec Kit e gli agenti AI sono stati usati per costruire il sito e
consulta gli artefatti originali.

**Why this priority**: l'uso agentico è parte del valore mostrato (constitution, Principio IV).

**Independent Test**: aprire /how-i-use-ai e verificare che ogni link agli artefatti di specifica
porti a un documento esistente.

**Acceptance Scenarios**:

1. **Given** /how-i-use-ai, **When** il visitatore la legge, **Then** trova la descrizione del
   workflow (constitution → specify → plan → tasks → implement) e del ruolo degli agenti.
2. **Given** i link agli artefatti di specifica, **When** il visitatore li segue, **Then** arriva
   ai documenti versionati nel repository pubblico.

---

### User Story 10 - US-10 Feed RSS dei case study (Priority: P3)

Un visitatore si iscrive a un feed per ricevere i nuovi case study.

**Why this priority**: nice to have, con pochi case study il valore è limitato.

**Independent Test**: validare il feed con un validatore RSS standard e verificare che contenga
tutti i case study pubblicati.

**Acceptance Scenarios**:

1. **Given** il feed, **When** un lettore RSS lo legge, **Then** trova una voce per ogni case
   study pubblicato, con titolo, sottotitolo, data e link alla pagina.

---

### User Story 11 - US-11 Sito in inglese e italiano (Priority: P3, rinviata)

**Stato**: fuori dalla v1. Richiede un emendamento della regola "Lingua" della constitution; fino
ad allora gli scenari sotto non sono requisiti.

Un visitatore sceglie tra inglese e italiano e il sito ricorda la scelta.

**Why this priority**: nice to have; il pubblico principale legge l'inglese. Richiede un
emendamento della constitution (vedi Assunzioni).

**Independent Test**: cambiare lingua, ricaricare e navigare tra pagine, verificando che la
lingua scelta sia mantenuta.

**Acceptance Scenarios**:

1. **Given** il sito in inglese, **When** il visitatore seleziona l'italiano, **Then** interfaccia
   e contenuti passano all'italiano.
2. **Given** una lingua scelta, **When** il visitatore torna sul sito più tardi dallo stesso
   browser, **Then** il sito si apre nella lingua scelta.

---

### Edge Cases

- **Sezione del case study mancante o vuota**: la build fallisce indicando file e sezione, quindi
  nessuna versione del sito viene pubblicata con quel progetto incompleto (FR-003).
- **Tecnologia sconosciuta**: lo stack di un progetto o di un'esperienza precedente cita una
  tecnologia non presente nella mappa delle tecnologie → la build fallisce indicando file e valore.
- **Nessun progetto featured**: la home mostra i progetti pubblicati più recenti per anno
  (massimo 3) al posto dei featured.
- **Skill in evidenza fuori intervallo**: nessuna skill in evidenza o più di 8 → la build
  fallisce indicando il numero trovato.
- **Meno di 4 esperienze precedenti**: la home le mostra tutte; il link "see all" resta visibile.
- **Periodi approssimati** (es. "~2023") o ruolo in corso: l'ordinamento usa la fine del periodo;
  "in corso" è considerato il più recente; a parità vale l'inizio del periodo.
- **Avatar o immagini mancanti**: la pagina mostra un'alternativa testuale (es. iniziali) senza
  layout rotto né spostamenti di contenuto.
- **JavaScript disattivato**: tutti i contenuti restano leggibili e navigabili; filtro e ricerca
  non sono disponibili ma l'elenco completo è visibile.
- **URL inesistente** (es. slug di progetto sbagliato): pagina 404 con navigazione verso home e
  /projects.
- **Ancora di un'esperienza precedente**: un link condiviso verso un'esperienza resta valido tra
  un deploy e l'altro finché il titolo non cambia.
- **Parametri URL di filtro non validi** (tecnologia inesistente): vengono ignorati e il visitatore
  vede l'elenco senza quel filtro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La home DEVE mostrare nome, ruolo, anni di esperienza, bio breve, stack principale,
  progetti featured, le 4 esperienze precedenti più recenti con link "see all" e i link di
  contatto. Gli anni di esperienza DEVONO essere calcolati dalla data di inizio del primo ruolo di
  carriera. Lo stack principale DEVE essere composto dalle skill marcate come "in evidenza" nei
  dati delle skill, nell'ordine in cui compaiono; le skill in evidenza DEVONO essere almeno 1 e al
  massimo 8, altrimenti la build fallisce.
- **FR-002**: La timeline di carriera DEVE essere in ordine cronologico inverso, con ruoli
  espandibili che mostrano responsabilità/achievements, fasi e tecnologie. L'espansione DEVE
  funzionare con mouse, touch e tastiera.
- **FR-003**: Ogni progetto pubblicato DEVE avere una pagina dedicata con le sezioni Context,
  Problem, Solution, My role, Technical decisions, Trade-offs, Impact, What I'd do differently,
  in quest'ordine. Tutte le 8 sezioni sono obbligatorie; un progetto con una sezione mancante o
  vuota NON DEVE essere pubblicato: la build DEVE fallire, come per gli errori di schema
  (FR-013), indicando file e sezione. Le bozze incomplete restano fuori da `content/projects/`.
- **FR-004**: /projects DEVE offrire un filtro per tecnologia a selezione multipla (una voce
  corrisponde se usa almeno una delle tecnologie selezionate) e una ricerca testuale su titolo,
  sottotitolo, settore, ruolo, summary, nomi delle tecnologie e testo dei case study. Filtro e
  ricerca DEVONO funzionare senza richieste a un server, combinarsi tra loro (entrambi devono
  essere soddisfatti) ed essere riflessi nell'URL.
- **FR-005**: Le esperienze precedenti DEVONO apparire come lista compatta in home (4 più recenti
  + "see all") e in /projects, incluse in filtro e ricerca. Ogni voce DEVE avere un'ancora stabile
  in /projects, usata dai link della home.
- **FR-006**: Il CV in PDF DEVE essere generato a ogni build dai dati di profilo (contatti, bio
  breve, lingue parlate), carriera, skill ed esperienze precedenti, e servito come file statico a
  un URL stabile. Il link di download DEVE
  essere presente in home e in /about.
- **FR-007**: /about DEVE contenere bio lunga, lingue parlate con livello, timeline di carriera e
  sezione skill. Le lingue parlate sono obbligatorie (almeno una); se mancano, la build fallisce.
  La bio breve
  (home, CV) DEVE provenire da un campo dedicato del profilo, obbligatorio e lungo al massimo 300
  caratteri; la bio lunga DEVE provenire dal corpo del testo del profilo. La sezione
  skill DEVE essere raggiungibile direttamente da un link dedicato nella navigazione.
- **FR-008**: /how-i-use-ai DEVE spiegare il workflow Spec Kit e l'uso degli agenti e DEVE linkare
  gli artefatti di specifica versionati nel repository pubblico.
- **FR-009**: Il contatto DEVE avvenire tramite link email (mailto:) visibile in home, in /about e
  nel footer, con l'indirizzo leggibile in chiaro. NON DEVONO esistere form né backend di invio.
- **FR-010**: Il sito DEVE pubblicare una sitemap XML di tutte le route pubbliche, un robots.txt e
  dati strutturati che descrivono la persona e ciascun case study.
- **FR-011** *(P3)*: Il sito DEVE pubblicare un feed RSS statico con tutti i case study
  pubblicati, rigenerato a ogni build.
- **FR-012** *(P3, rinviato)*: selettore di lingua IT/EN che ricorda la scelta nello stesso
  browser. Non fa parte della v1 e non è obbligatorio finché la constitution non viene emendata
  (vedi Assunzioni).
- **FR-013**: Tutti i file di contenuto DEVONO essere validati contro uno schema a build-time. Se
  un file non rispetta lo schema, la build DEVE fallire con un messaggio che indica file, campo
  e motivo.
- **FR-014**: Ogni pagina DEVE avere una navigazione globale verso Home (il nome nell'header),
  Projects, About, Skills, How I use AI e Download CV, e un footer con contatti e link a LinkedIn e GitHub.
- **FR-015**: Il sito DEVE mostrare una pagina 404 con link a home e /projects per ogni URL
  inesistente.
- **FR-016**: Il sito DEVE raccogliere statistiche di visita aggregate solo tramite la soluzione
  gratuita e senza cookie della piattaforma di hosting; NON DEVONO essere usati altri strumenti
  di tracciamento.

### Non-Functional Requirements

- **NFR-001**: Ogni route pubblica DEVE ottenere un punteggio ≥ 95 in Performance, Accessibility,
  Best Practices e SEO nell'audit Lighthouse (constitution, Principio VI).
- **NFR-002**: Il sito DEVE rispettare WCAG 2.1 AA.
- **NFR-003**: Su rete mobile 4G: contenuto principale visibile entro 2,5 s, spostamento di layout
  < 0,1, risposta alle interazioni entro 200 ms.
- **NFR-004**: Ogni push sul ramo principale DEVE produrre un deploy automatico in produzione;
  ogni pull request DEVE produrre un deploy di anteprima.
- **NFR-005**: Il costo operativo DEVE restare 0€/mese.
- **NFR-006**: Il layout DEVE essere progettato mobile-first e utilizzabile da 360px di larghezza
  in su.
- **NFR-007**: Tutti i contenuti mostrati ai visitatori DEVONO essere in inglese.

### Key Entities *(include if feature involves data)*

- **Profilo**: nome, titolo, località, email, link social (LinkedIn, GitHub), disponibilità, bio
  breve (campo dedicato, max 300 caratteri), bio lunga (corpo del testo), lingue parlate (≥ 1,
  ciascuna con nome e livello), avatar (opzionale). Unico.
- **Ruolo di carriera**: azienda, periodo (inizio, fine o "in corso"), ruolo, sintesi,
  responsabilità/achievements, fasi (etichetta, periodo, settore, tecnologie), progressione
  interna opzionale.
- **Esperienza precedente (Earlier work)**: titolo, azienda, periodo, settore, ruolo, summary,
  stack. Nessun case study completo.
- **Progetto**: slug, titolo, sottotitolo, anno, ruolo, settore, stack, repository (opzionale),
  demo (opzionale), featured, immagine di copertina con testo alternativo (opzionale), 8 sezioni
  del case study.
- **Skill**: nome, categoria, livello (expert > advanced > intermediate > basic), in evidenza
  (sì/no, default no), note opzionali.
- **Tecnologia**: slug, nome mostrato, categoria, skill correlata. Collega progetti ed esperienze
  precedenti (tramite lo stack) alle skill e al filtro.

### Fuori scope

- Feature AI nel prodotto (chatbot, ricerca semantica, generazione di contenuti).
- Database, CMS, API backend.
- Autenticazione utente.
- Commenti.
- Form di contatto con invio email lato server.
- Offerta di servizi a pagamento: prezzi, pacchetti, inviti a "hire me" o "available for
  consulting", pagamenti. Il piano di hosting gratuito è riservato all'uso personale non
  commerciale.
- Analytics proprietari o di terze parti diversi da quanto previsto in FR-016.
- Sito bilingue IT/EN (US-11, FR-012): richiede un emendamento della constitution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In un test con almeno 5 persone, almeno 4 identificano ruolo e seniority di
  Francesco entro 10 secondi dall'apertura della home. I 5 secondi del titolo di US-01 sono
  l'obiettivo di design; questa è la soglia di accettazione.
- **SC-002**: Un visitatore raggiunge un case study completo in al massimo 2 click dalla home.
- **SC-003**: Il CV scaricato dopo ogni deploy riflette il 100% delle modifiche ai dati di
  carriera, skill ed esperienze precedenti incluse in quel deploy.
- **SC-004**: Il 100% delle route pubbliche ottiene ≥ 95 in tutte e quattro le categorie
  dell'audit di qualità web (NFR-001).
- **SC-005**: Il costo mensile operativo resta 0€ per ogni mese di esercizio.
- **SC-006**: Un visitatore trova tutti i progetti che usano una data tecnologia in al massimo
  3 interazioni da /projects.
- **SC-007**: Il 100% dei file di contenuto non valido usati nei test fa fallire la build con un
  messaggio che identifica file e campo.
- **SC-008**: Zero link interni rotti su tutte le route pubbliche a ogni deploy.

## Assumptions

### Assunzioni

- Il contenuto in `content/` è già popolato, è in inglese e resta l'unica fonte di verità. La spec
  descrive il comportamento del sistema, non il contenuto.
- Gli schemi di validazione dei contenuti saranno definiti in `contracts/` durante `/speckit-plan`;
  la descrizione indica Zod come strumento preferito.
- L'audit di qualità di riferimento è Lighthouse, come fissato dalla constitution.
- La sezione "pagina skill" di US-06 è soddisfatta dalla sezione skill di /about, raggiungibile
  con link diretto dalla navigazione (FR-007, FR-014). Non è prevista una route separata.
- Il filtro multi-tecnologia usa la logica "almeno una" (OR): con pochi progetti, la logica "tutte"
  (AND) produrrebbe spesso zero risultati.
- I link agli artefatti di specifica in /how-i-use-ai puntano ai file nel repository GitHub
  pubblico.
- Le statistiche di visita della piattaforma di hosting sono senza cookie, quindi non serve un
  banner di consenso. Se i limiti del piano gratuito vengono superati, si accetta la perdita di
  dati statistici, non un costo.
- Il CV in PDF è in inglese e contiene gli stessi dati di contatto mostrati sul sito.
- `/api/health` è un file statico di diagnostica previsto dal plan (V16). Non è un requisito per i
  visitatori e non è un'API dinamica (Principio I).
- **US-11 / FR-012 (bilingue)**: la constitution (v2.0.0) stabilisce che i contenuti per l'utente
  sono in inglese. Il supporto all'italiano richiede un emendamento della constitution e la
  traduzione di tutto il contenuto; per questo è fuori dalla v1.

### Definizione di done (v1)

- Tutte le user story P1 e P2 (US-01…US-09) implementate e deployate.
- Constitution rispettata, coverage ≥ 80%, Lighthouse ≥ 95 su ogni route pubblica, costo 0€/mese.
- Le user story P3 (US-10, US-11) non sono richieste per la v1.

### Dipendenze

- GitHub: repository pubblico (necessario anche per i link di /how-i-use-ai).
- Vercel: hosting, deploy e statistiche di visita sul piano gratuito Hobby.
- Nessun servizio a pagamento.
