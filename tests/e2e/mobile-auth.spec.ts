import { test, expect } from "@playwright/test";

const mobile = "http://localhost:8081";

test("mobil: deconectare, rută protejată și revenire în cont", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(mobile);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("Bună ziua, Alex")).toBeVisible();

  await page.getByRole("tab", { name: "Cont" }).click();
  await page.getByRole("button", { name: "Deconectare" }).click();
  await expect(page.getByText("Bine ai revenit.")).toBeVisible();
  await page.goto(mobile + "/vehicul?id=v1");
  await expect(page.getByText("Bine ai revenit.")).toBeVisible();

  await page.getByLabel("E-mail").fill("alex.ionescu@example.com");
  await page.getByLabel("Parolă", { exact: true }).fill("greșită");
  await page.getByRole("button", { name: "Autentifică-te" }).click();
  await expect(
    page.getByText("E-mailul sau parola nu este corectă."),
  ).toBeVisible();
  await page.getByLabel("Parolă", { exact: true }).fill("WhiteLabel2026!");
  await page.getByRole("button", { name: "Autentifică-te" }).click();
  await expect(page.getByText("Bună ziua, Alex")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Bună ziua, Alex")).toBeVisible();
  await page.getByRole("tab", { name: "Cont" }).click();
  await page.getByRole("button", { name: "Deconectare" }).click();
  await page.evaluate(async () => {
    await (
      globalThis as typeof globalThis & { resetWhiteLabel: () => Promise<void> }
    ).resetWhiteLabel();
  });
  await expect(page.getByText("Bună ziua, Alex")).toBeVisible();
});

test("mobil: cont nou fără vehicule, persistență și separarea datelor", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto(mobile);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("tab", { name: "Cont" }).click();
  await page.getByRole("button", { name: "Deconectare" }).click();
  await page.getByText("Creează cont", { exact: true }).click();
  await page.getByLabel("Nume complet").fill("Irina Popescu");
  await page.getByLabel("E-mail").last().fill("irina@example.com");
  await page.getByLabel("Telefon").fill("0722 123 456");
  await page.getByLabel("Parolă", { exact: true }).last().fill("Parola123!");
  await page.getByLabel("Confirmă parola").fill("Parola123!");
  await page.getByRole("button", { name: "Creează contul" }).click();
  await expect(page.getByText("Bună ziua, Irina")).toBeVisible();
  await expect(page.getByText("Adaugă primul vehicul")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Bună ziua, Irina")).toBeVisible();
  await page.goto(mobile + "/vehicul?id=v1");
  await expect(page.getByText("Vehicul indisponibil")).toBeVisible();
  await page.goto(mobile);
  await page.getByRole("tab", { name: "Programări" }).click();
  await page.getByRole("button", { name: "Programare nouă" }).click();
  await expect(page.getByText("Mai întâi, adaugă un vehicul")).toBeVisible();
  await page.getByRole("button", { name: "Adaugă un vehicul" }).click();
  await page.getByLabel("Număr de înmatriculare").fill("B 321 IRN");
  await page.getByLabel("Marcă", { exact: true }).fill("Dacia");
  await page.getByLabel("Model", { exact: true }).fill("Sandero");
  await page.getByLabel("Kilometraj (km)").fill("10000");
  await page.getByLabel("Expirare ITP (AAAA-LL-ZZ)").fill("2027-10-19");
  await page.getByRole("button", { name: "Salvează vehiculul" }).click();
  await expect(page.getByText("Alege vehiculul")).toBeVisible();
  await page.getByLabel("Înapoi").click();
  await page.getByRole("tab", { name: "Acasă" }).click();
  await expect(page.getByText("B 321 IRN", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Cont" }).click();
  await page.getByRole("button", { name: "Deconectare" }).click();
  await page.getByLabel("E-mail").fill("alex.ionescu@example.com");
  await page.getByLabel("Parolă", { exact: true }).fill("WhiteLabel2026!");
  await page.getByRole("button", { name: "Autentifică-te" }).click();
  await expect(page.getByText("Bună ziua, Alex")).toBeVisible();
  await expect(
    page.getByText("B 123 ABC", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText("B 321 IRN", { exact: true })).toHaveCount(0);
  await page.getByRole("tab", { name: "Cont" }).click();
  await page.getByRole("button", { name: "Deconectare" }).click();
  await page.getByLabel("E-mail").fill("irina@example.com");
  await page.getByLabel("Parolă", { exact: true }).fill("Parola123!");
  await page.getByRole("button", { name: "Autentifică-te" }).click();
  await expect(page.getByText("Bună ziua, Irina")).toBeVisible();
  await expect(page.getByText("B 321 IRN", { exact: true })).toBeVisible();
});
