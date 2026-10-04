import { test, expect, type Page } from "@playwright/test";
const web = "http://localhost:3000",
  mobile = "http://localhost:8081";
async function reset(page: Page, url: string) {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}
const close = async (page: Page) => {
  await page
    .getByRole("button", { name: "Închide", exact: true })
    .last()
    .click();
};
test("administrare: client, vehicul, kilometraj, persistență, flotă", async ({
  page,
}) => {
  await reset(page, web + "/clienti");
  await page
    .getByRole("button", { name: "Deschide clientul Alex Ionescu" })
    .click();
  await page
    .getByRole("button", { name: "Adaugă vehicul", exact: true })
    .click();
  const dialog = page.getByRole("dialog").last();
  await dialog.getByLabel("Număr de înmatriculare").fill("B 555 NOU");
  await dialog.getByLabel("Marcă", { exact: true }).fill("Toyota");
  await dialog.getByLabel("Model", { exact: true }).fill("RAV4");
  await dialog.getByLabel("Kilometraj", { exact: true }).fill("32000");
  await dialog.getByLabel("Expirare ITP").fill("2027-11-18");
  await dialog.getByRole("button", { name: "Salvează", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByText("B 555 NOU", { exact: true }),
  ).toBeVisible();
  await close(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Deschide clientul Alex Ionescu" })
    .click();
  await expect(
    page.getByRole("dialog").getByText("B 555 NOU", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /B 123 ABC/ }).click();
  await page.getByRole("button", { name: "Actualizează kilometrajul" }).click();
  await page.getByLabel("Kilometraj actual (km)").fill("109900");
  await page.getByRole("button", { name: "Salvează", exact: true }).click();
  await expect(page.getByText("Mai ai 100 km", { exact: true })).toBeVisible();
  await close(page);
  await close(page);
  await page
    .getByRole("button", { name: "Deschide clientul Nord Trans Logistic SRL" })
    .click();
  await expect(page.getByRole("button", { name: /NTR/ })).toHaveCount(10);
  await page.getByRole("button", { name: /IF 210 NTR/ }).click();
  await expect(
    page.getByRole("heading", { name: "Tahograf", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("DTCO-824612", { exact: false })).toBeVisible();
});
test("administrare: locații, personal și restricții", async ({ page }) => {
  await reset(page, web);
  await page.getByLabel("Locație activă").selectOption("nord");
  await expect(page.locator(".metric").first()).toContainText("3");
  await page.getByRole("link", { name: "Personal", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Andrei Popescu" }),
  ).toHaveCount(0);
  await page.getByLabel("Locație activă").selectOption("all");
  const card = page
    .locator(".staff-card")
    .filter({ has: page.getByRole("heading", { name: "Andrei Popescu" }) });
  await card.getByRole("button", { name: "Gestionează accesul" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Locația Nord", { exact: true }).check();
  await dialog.getByLabel("Întreținere", { exact: true }).check();
  await dialog.getByRole("button", { name: "Salvează", exact: true }).click();
  await expect(card).toContainText("Întreținere");
  await page.getByLabel("Profil activ").selectOption("s1");
  await expect(
    page.getByRole("link", { name: "Personal", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Întreținere", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Locație activă").selectOption("nord");
  await page.getByRole("link", { name: "Vehicule", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /B 456 XYZ/ }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /IF 210 NTR/ })).toHaveCount(0);
});
test("administrare: programare manuală, reprogramare, anulare, export", async ({
  page,
}) => {
  await reset(page, web + "/programari");
  await page
    .getByRole("button", { name: "Programare nouă", exact: true })
    .click();
  await page.getByLabel("Data vizitei").fill("2026-10-21");
  await page.getByRole("button", { name: "09:00", exact: true }).click();
  await page.getByRole("button", { name: "Confirmă programarea" }).click();
  await expect(
    page.getByRole("heading", { name: "Programare confirmată" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Vezi programările" }).click();
  await page.getByLabel("Data programărilor").fill("2026-10-21");
  await page
    .getByRole("button", { name: "Deschide programarea 09:00 B 123 ABC" })
    .click();
  await page
    .getByRole("button", { name: "Reprogramează", exact: true })
    .click();
  await page.getByRole("button", { name: "09:30", exact: true }).click();
  await page.getByRole("button", { name: "Confirmă programarea" }).click();
  await page.getByRole("button", { name: "Vezi programările" }).click();
  await page
    .getByRole("button", { name: "Deschide programarea 09:30 B 123 ABC" })
    .click();
  await page.getByRole("button", { name: "Anulează programarea" }).click();
  await page.getByRole("button", { name: "Confirmă", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("Anulată");
  await page.getByRole("link", { name: "Rapoarte", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportă CSV" }).click();
  expect((await download).suggestedFilename()).toBe("raport-programari.csv");
});
test("mobil: programare completă, persistență, reprogramare și anulare", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await reset(page, mobile);
  await page.getByRole("button", { name: "Detalii B 123 ABC" }).click();
  await expect(
    page.getByText("Mai ai 1.550 km", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Programează acest vehicul" }).click();
  await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByRole("radio", { name: /ITP/ }).click();
  await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByRole("radio", { name: /Locația Central/ }).click();
  await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByLabel("21 octombrie 2026", { exact: true }).click();
  await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByRole("radio", { name: "09:00", exact: true }).click();
  await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByRole("button", { name: "Confirmă programarea" }).click();
  await expect(
    page.getByText("Programare confirmată", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Vezi programarea" }).click();
  await page.reload();
  await expect(page.getByText("09:00", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reprogramează vizita" }).click();
  for (let i = 0; i < 4; i++)
    await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByRole("radio", { name: "09:30", exact: true }).click();
  await page.getByRole("button", { name: "Continuă", exact: true }).click();
  await page.getByRole("button", { name: "Confirmă programarea" }).click();
  await page.getByRole("button", { name: "Vezi programarea" }).click();
  await expect(page.getByText("09:30", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Anulează programarea" }).click();
  await page.getByRole("button", { name: "Confirmă anularea" }).click();
  await expect(page.getByText("Anulată", { exact: true }).last()).toBeVisible();
});
test("toate modulele web, layout mobil și erori de execuție", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await reset(page, web);
  for (const route of [
    "programari",
    "clienti",
    "vehicule",
    "itp",
    "intretinere",
    "tahografe",
    "locatii",
    "personal",
    "notificari",
    "rapoarte",
    "setari",
  ]) {
    await page.goto(web + "/" + route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).not.toContainText("Acces restricționat");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(web);
  await expect(
    page.getByRole("button", { name: "Deschide meniul" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("reguli, verificări tahograf, reamintiri și setări de locație", async ({
  page,
}) => {
  await reset(page, web + "/intretinere");
  await page
    .getByRole("button", { name: "Editează regula B 123 ABC Ulei și filtre" })
    .click();
  await page.getByLabel("Interval kilometri").fill("12000");
  await page.getByRole("button", { name: "Salvează", exact: true }).click();
  await expect(
    page
      .locator("tr")
      .filter({ hasText: "B 123 ABC" })
      .filter({ hasText: "Ulei și filtre" }),
  ).toContainText("3.550 km");
  await page.getByRole("link", { name: "Tahografe", exact: true }).click();
  await page
    .getByRole("button", { name: "Actualizează tahograful B 789 VAN" })
    .click();
  await page.getByLabel("Ultima verificare").fill("2026-10-19");
  await page.getByLabel("Următoarea verificare").fill("2028-10-19");
  await page.getByRole("button", { name: "Salvează", exact: true }).click();
  await expect(
    page.locator("tr").filter({ hasText: "B 789 VAN" }),
  ).toContainText("19 oct. 2028");
  await page
    .getByRole("button", { name: "Reamintește verificarea B 789 VAN" })
    .click();
  await page.getByRole("link", { name: "Notificări", exact: true }).click();
  await expect(
    page
      .getByRole("button", { name: "Verificarea tahografului se apropie" })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Trimite acum" }).first().click();
  await page.getByRole("link", { name: "Locații", exact: true }).click();
  await page.getByRole("button", { name: "Editează Locația Nord" }).click();
  await page.getByLabel("Capacitate simultană").fill("4");
  await page.getByRole("button", { name: "Salvează", exact: true }).click();
  await expect(
    page
      .locator(".location-cards .panel")
      .filter({ hasText: "Locația Nord" })
      .locator(".location-stats"),
  ).toContainText("4");
  await page.getByRole("link", { name: "Setări", exact: true }).click();
  await page.getByLabel("Zile înainte de expirare").fill("14, 7, 1");
  await page.getByRole("button", { name: "Salvează preferințele" }).click();
  await page.reload();
  await expect(page.getByLabel("Zile înainte de expirare")).toHaveValue(
    "14, 7, 1",
  );
});
test("mobil: kilometraj, notificări, preferințe și profil", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.setViewportSize({ width: 393, height: 852 });
  await reset(page, mobile);
  await page.getByRole("button", { name: "Detalii B 123 ABC" }).click();
  await page.getByLabel("Actualizează kilometrajul", { exact: true }).click();
  await page
    .getByLabel("Kilometraj actual (km)", { exact: true })
    .fill("110100");
  await page.getByRole("button", { name: "Salvează kilometrajul" }).click();
  await expect(
    page.getByText("Prag atins · 100 km depășire", { exact: true }),
  ).toBeVisible();
  await page.goto(mobile + "/cont");
  await page.getByLabel("Editează profilul", { exact: true }).click();
  await page.getByLabel("Nume complet").fill("Alex Ionescu");
  await page.getByRole("button", { name: "Salvează datele" }).click();
  await page
    .getByRole("switch", { name: "Noutăți și oferte", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Noutăți și oferte", exact: true }),
  ).toBeChecked();
  await page.goto(mobile + "/notificari");
  await page.getByLabel("Marchează toate ca citite", { exact: true }).click();
  await expect(page.getByText("Nouă", { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
