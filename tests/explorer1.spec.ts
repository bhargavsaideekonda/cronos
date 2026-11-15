import { expect, test } from "@playwright/test";
import { toHub } from "./helpers";

test("Explorer 1 plays from intro to debrief", async ({ page }) => {
  await toHub(page, "Cadet");

  // Select Earth orbit era
  await page.getByRole("tab", { name: "Earth orbit" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "orb");
  await page.getByRole("button", { name: "Open archive: Explorer 1" }).click();
  await expect(page.locator('[data-screen="brief"]')).toBeVisible();

  // Explore 3 hotspots
  for (const h of ["craft", "orbit", "belts"]) {
    await page.locator(`[data-hot="${h}"]`).click();
  }
  await expect(page.getByTestId("found")).toHaveText("3 of 3 investigated");
  await page.getByRole("button", { name: "Open the assembly sheet" }).click();
  await expect(page.locator('[data-screen="lab"]')).toBeVisible();

  // Assemble 6 parts
  const explorerParts = ["antennas", "nose", "geiger", "battery", "electronics", "tail"];
  for (const id of explorerParts) {
    await page.locator(`[data-part="${id}"]`).click();
    await page.locator(`[data-slot="${id}"] .sh`).click({ force: true });
    await expect(page.locator(`[data-slot="${id}"]`)).toHaveClass(/ok/);
  }
  await page.getByRole("button", { name: "Start the challenge" }).click();
  await expect(page.locator('[data-screen="challenge"]')).toBeVisible();

  // Radiation belts challenge: log 3 readings
  const slider = page.getByLabel("Orbit position slider");
  const logBtn = page.getByRole("button", { name: /Log reading/ });

  // Low reading (0%)
  await slider.fill("0");
  await logBtn.click();

  // Mid reading (50%)
  await slider.fill("50");
  await logBtn.click();

  // High reading (100% -> overloaded 0 counts)
  await slider.fill("100");
  await logBtn.click();

  await expect(page.getByTestId("win")).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Continue to the vault" }).click();

  // Vault: restore 4 evidence files
  for (let i = 0; i < 4; i++) {
    await page.locator(`[data-file="${i}"] .ph`).click();
  }
  await expect(page.locator(".card.lock")).toHaveCount(0);
  await page.getByRole("button", { name: "Final signal" }).click();

  // Last signal
  await expect(page.getByText("Explorer 1")).toBeVisible();
  const cont = page.getByRole("button", { name: "Continue" });
  await expect(cont).toBeEnabled({ timeout: 8000 });
  await cont.click();

  // Debrief
  await expect(page.getByRole("heading", { name: "Cadet, Explorer 1 preserved" })).toBeVisible();
  await page.getByRole("button", { name: "Return to Chronos Base" }).click();
  await expect(page.getByRole("button", { name: /1\. Explorer 1 ✓/ })).toBeVisible();
});
