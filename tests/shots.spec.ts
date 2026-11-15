import { test } from "@playwright/test";
import { assemble, autopilot, explore, toBrief } from "./helpers";

// Not a gate: captures each screen for visual review. Run with SHOTS=1.
test.skip(!process.env.SHOTS, "visual review only");
for (const [label, w, h] of [["desktop", 1280, 800], ["phone", 390, 780]] as const) {
  test(`screens ${label}`, async ({ page }) => {
    const snap = (n: string) => page.screenshot({ path: `test-results/shots/${label}-${n}.png` });
    await page.setViewportSize({ width: w, height: h });
    await toBrief(page);
    await page.waitForTimeout(1200);
    await page.locator('[data-hot="soil"]').click();
    await page.waitForTimeout(2500);
    await snap("2-brief");
    await page.locator('[data-hot="craft"]').click();
    await page.locator('[data-hot="sky"]').click();
    await page.getByRole("button", { name: "Open the assembly sheet" }).click();
    await page.waitForTimeout(1200);
    await page.locator('[data-part="solar"]').click();
    await page.locator('[data-slot="solar"] .sh').click({ force: true });
    await page.locator('[data-part="legs"]').click();
    await page.locator('[data-slot="legs"] .sh').click({ force: true });
    await page.waitForTimeout(900);
    await snap("3-lab");
    for (const id of ["antenna", "camera", "frame", "sampler"]) {
      await page.locator(`[data-part="${id}"]`).click();
      await page.locator(`[data-slot="${id}"] .sh`).click({ force: true });
    }
    await page.waitForTimeout(1500);
    await snap("3-lab-done");
    await page.getByRole("button", { name: "Start the challenge" }).click();
    await page.waitForTimeout(3000);
    await snap("4-challenge");
    await autopilot(page);
    await page.getByTestId("win").waitFor({ timeout: 40000 });
    await snap("4-win");
    await page.getByRole("button", { name: "Continue to the vault" }).click();
    for (let i = 0; i < 3; i++) await page.locator(`[data-file="${i}"] .ph`).click();
    await page.waitForTimeout(1500);
    await snap("5-vault");
    await page.getByRole("button", { name: "Final signal" }).click();
    await page.waitForTimeout(5500);
    await snap("6-signal");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.waitForTimeout(1500);
    await snap("7-debrief");
    await page.getByRole("button", { name: "Return to Chronos Base" }).click();
    await page.waitForTimeout(2000);
    await snap("1-hub");
  });
}
