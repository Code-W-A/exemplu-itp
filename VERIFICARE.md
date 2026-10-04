# Verificare · WHITE LABEL

Verificări locale efectuate la 25 septembrie 2026. Scenariul aplicației folosește separat data de 19 octombrie 2026.

## Rezultate

| Verificare | Rezultat |
| --- | --- |
| TypeScript: pachet comun, Next.js, Expo | Trecut |
| Teste pentru domeniu și persistență | 12 / 12 trecute |
| Scenarii Playwright, Chrome | 7 / 7 trecute |
| Build producție Next.js / Webpack | Trecut, fără avertismente CSS |
| Export Expo iOS, Android, web | Trecut |
| Expo Doctor | 21 / 21 verificări trecute, fără versiuni native duplicate |
| Browser desktop 1440 × 1000 | Verificat vizual |
| Browser mobil 393 × 852 și administrare la 390 px | Verificat; fără depășirea orizontală a paginii |
| iPhone 17, iOS 26.5, Expo Go SDK 57 | Flux complet de programare verificat nativ |
| Persistență iOS după închiderea și redeschiderea Expo Go | Programarea din 21 octombrie, ora 09:00, a rămas salvată |
| Resetare iOS prin comanda de dezvoltare | Verificată; rezervarea adăugată a dispărut și datele inițiale au revenit |
| Android pe emulator/dispozitiv | Neefectuat; exportul Android nu este dovadă de funcționare pe dispozitiv |
| Build nativ semnat / publicare | Neefectuate |

## Scenarii automate

1. Client existent → vehicul nou → persistență la reîncărcare → kilometraj actualizat → 100 km rămași → flotă de zece vehicule → tahograf.
2. Schimbarea locației → filtrarea echipei → atribuirea unei locații și permisiuni → verificarea meniului și vehiculelor disponibile pentru profilul de recepție.
3. Programare manuală → confirmare → reprogramare → anulare → export CSV.
4. Aplicația Expo în browser mobil → toți cei șase pași ai programării → reîncărcare → reprogramare → anulare.
5. Deschiderea tuturor celor 11 module web, în afara tabloului principal; verificarea layoutului mobil și a erorilor de execuție.
6. Modificarea regulii de întreținere → recalculare → actualizare tahograf → reamintire → notificare programată → capacitate locație → intervale de notificare persistate.
7. Mobil → kilometraj peste prag → profil personal → preferință de notificare persistată → marcarea mesajelor ca citite; fără erori JavaScript capturate.

Testele de domeniu acoperă suplimentar: prag calendaristic independent de kilometri; final de lună/an bisect; zile închise și pauze; durată și capacitate; suprapuneri succesive; angajat ocupat; număr de înmatriculare unic; kilometraj descrescător; acces în altă locație; date invalide; dezactivarea personalului; depozite independente; mutarea datei scenariului; preferințe și deduplicarea notificărilor programate.

## Limitări cunoscute

- Persistența este locală pe fiecare dispozitiv/browser. Nu există sincronizare între mobil și administrare.
- Data de referință este fixă pentru repetabilitatea filmării. Nu reprezintă ceasul real al dispozitivului.
- Notificările, rolurile și permisiunile sunt implementări locale; nu sunt integrare cu furnizori externi sau securitate pe server.
- Expo Go include propriile controale de dezvoltare. Nu au fost realizate builduri de distribuție iOS/Android.
- Auditul npm a raportat 13 constatări de severitate moderată în lanțurile tranzitive Expo / Expo Router (`uuid`, `decode-uri-component` și dependenții acestora), fără constatări high sau critical la verificare. Nu s-a aplicat remedierea automată cu downgrade major propusă de npm.

## Comenzi

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build:web
npm run export -w expo-mobile-app
cd expo-mobile-app
npx expo-doctor
```

Instrucțiunile de pornire și traseele pentru înregistrare sunt în [README.md](README.md).

## Capturi

- [Administrare desktop](docs/images/administrare.png)
- [Aplicația Expo în browser mobil](docs/images/mobil.png)
- [Aplicația nativă în Simulator iOS](docs/images/ios.png)
