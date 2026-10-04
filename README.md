# WHITE LABEL · Platformă auto

Aplicație mobilă Expo / React Native și administrare Next.js, integral în română. Datele sunt locale, cu același set inițial în ambele aplicații și persistență independentă. Niciun mesaj, SMS sau push nu este trimis către un serviciu extern.

## Pornire

Necesită Node.js 22.13+ și npm. Instalare din rădăcina proiectului:

```sh
npm ci
npm run dev:web
```

Administrare: http://localhost:3000.

Într-un alt terminal:

```sh
npm run dev:mobile
```

Aplicația Expo poate fi deschisă prin Expo Go compatibil cu SDK 57. Pentru previzualizarea web, apasă `w` în terminalul Expo sau deschide http://localhost:8081.

Pentru iOS Simulator pe macOS:

```sh
npm run ios
```

Comanda folosește portul 8082 și o adresă de bundle explicită `localhost`, pentru compatibilitate cu rezolvarea IPv6 pe acest mediu. Necesită Simulator pornit și Expo Go. La prima pornire Expo Go poate afișa introducerea meniului de dezvoltare; aceasta aparține Expo Go. Se poate închide înaintea filmării.

## Structură

- `expo-mobile-app`: Expo Router, ecrane native, AsyncStorage și SVG-uri pentru vehicule.
- `next-js`: Next.js App Router, Tailwind CSS și componente shadcn/ui bazate pe Radix, incluse ca sursă.
- `packages/core`: modele, date inițiale, autorizare locală, calculul întreținerii, disponibilitate, coadă locală de notificări, repository și store comun.
- `tests`: teste de domeniu și scenarii Playwright pentru ambele interfețe.

## Deploy administrare pe Vercel

Trimite întregul monorepo, inclusiv `package.json`, `package-lock.json` și `packages/core`; uploadul exclusiv al directorului `next-js` nu poate rezolva pachetul local `@white-label/core`.

Pentru integrarea Git, rădăcina repository-ului trebuie să fie `ITP-WHITE-LABEL`, nu `next-js`. Un repository care conține numai administrarea nu include workspace-ul core; opțiunea Vercel pentru fișiere externe nu poate recupera fișiere care lipsesc din repository.

În setările proiectului Vercel:

- **Root Directory:** `next-js`.
- Activează **Include source files outside of the Root Directory in the Build Step**.
- **Framework Preset:** Next.js.

`next-js/vercel.json` instalează workspace-urile web și core din rădăcină folosind lockfile-ul comun, apoi rulează buildul în `next-js`. `.vercelignore` exclude directoarele generate, inclusiv `.next`, din uploadul CLI.

Pentru deploy prin CLI, rulează `vercel` din rădăcina `ITP-WHITE-LABEL`, după configurarea Root Directory în proiectul Vercel. Nu rula `vercel next-js` și nu trimite `.next` pentru un build normal pe Vercel.

Documentație: https://vercel.com/docs/monorepos/monorepo-faq.

`StorageAdapter` izolează persistența, iar `Repository` oferă `load`, `save` și `reset`. Store-ul publică modificările sincron și serializează scrierile asincrone. Înlocuirea repository-ului este punctul de pornire pentru un backend ulterior. Permisiunile actuale sunt comportament local pentru prezentare, nu o barieră de securitate pe server.

Fișele folosesc identificatori comuni. O schimbare pe mobil nu apare automat în administrare și invers. Pentru filmarea în continuitate, pornește cu datele inițiale sau repetă aceeași operațiune în ambele aplicații.

## Scenariu și resetare

Data de referință este **19 octombrie 2026**, definită în `packages/core/src/scenario.ts`. Schimbarea acesteia deplasează datele inițiale cu aceeași diferență de zile; după modificare, resetează datele aplicației. Kilometrii și identificatorii rămân stabili.

Resetarea nu este afișată în interfața comercială și este disponibilă numai în dezvoltare:

- Web admin: în consola browserului aplicației, `await window.resetWhiteLabel()`.
- Expo web / React Native DevTools: `await globalThis.resetWhiteLabel()`.
- Simulator iOS: `npm run reset -- ios exp://localhost:8082`.
- `npm run reset` afișează instrucțiunile, fără a șterge automat nimic.

Datele folosesc cheia `white-label-auto-v1`, iar sesiunea mobilă folosește `white-label-mobile-auth-v1`. Resetarea afectează doar datele WHITE LABEL din aplicația respectivă, fără a dezinstala Expo Go sau a modifica alte proiecte.

## Trasee pentru filmare

1. **Client:** Acasă → Volkswagen Passat / B 123 ABC → status ITP și 1.550 km rămași → Programează acest vehicul → ITP → Locația Central → 21 octombrie → 09:00 → confirmare → Vezi programarea. Reprogramarea și anularea sunt în detaliile vizitei.
2. **Administrare:** Programări → Alex Ionescu → Adaugă vehicul (de exemplu B 555 NOU) → fișa Volkswagen Passat → Actualizează kilometrajul la 109.900 → apare „Mai ai 100 km”. La 110.100 km operațiunea devine scadentă.
3. **Locații:** Privire de ansamblu → schimbă între Central, Nord și Industrial → indicatorii și agenda se schimbă. Personal arată membrii alocați locației.
4. **Flotă:** Clienți → Flote și companii → Nord Trans Logistic SRL → unul dintre cele zece camioane → Tahograf → termen și istoric. Modulul Tahografe permite actualizarea verificării și programarea.
5. **Personal:** Personal → Andrei Popescu → Gestionează accesul → atribuie Locația Nord și Întreținere → Salvează. Selectorul de profil din antet permite verificarea meniurilor și locațiilor disponibile.

Contul mobil este Alex Ionescu. Administrarea pornește cu Cristian Pavel, administrator principal. Datele de contact sunt fictive; adresele e-mail folosesc domenii rezervate pentru exemple.

Pentru secvența de autentificare pe mobil: din **Cont** apasă **Deconectare**, apoi intră cu `alex.ionescu@example.com` și parola `WhiteLabel2026!`. Din ecranul de autentificare poți deschide **Creează cont**; un cont nou începe fără vehicule și poate folosi **Adaugă un vehicul**. Sesiunea și conturile create se păstrează local între porniri. Resetarea de mai sus readuce sesiunea inițială. Acest flux este local și nu oferă autentificare pe server.

## Reguli implementate

- Întreținere scadentă la primul prag atins: kilometraj SAU perioadă. Nu se estimează o dată viitoare din kilometraj.
- Intervalele iau în calcul locația, serviciul, programul, zilele lucrătoare, pauza, durata, capacitatea, suprapunerile vehiculului și ale angajatului.
- Reprogramarea exclude intervalul rezervării curente din verificare. Anularea eliberează capacitatea. Programările finalizate sau anulate nu se redeschid.
- Kilometrajul nu poate scădea; numărul de înmatriculare este unic în setul local.
- Coada de notificări este recalculată local după modificări, folosind intervalele din Setări și preferințele clientului. „Trimite acum” înregistrează o trimitere locală; nu face un apel extern.
- Exportul CSV conține programările filtrate după locație și perioadă, cu antet românesc și protecție pentru formule în celule.

## Verificare

```sh
npm run typecheck
npm test
npm run build:web
npm run export -w expo-mobile-app
```

Testele de browser necesită ambele servere pornite pe porturile 3000 și 8081 și Chrome instalat:

```sh
npm run test:e2e
```

Playwright folosește contexte izolate; rezultatele și capturile la eșec sunt în directoare ignorate de Git. Buildul Next.js folosește Webpack deoarece Turbopack a întâlnit o restricție IPC în mediul de lucru. Nu sunt configurate deploymenturi, conturi de producție sau baze de date.

Starea verificărilor efectuate este documentată separat în `VERIFICARE.md`.
