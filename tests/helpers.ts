import { expect, type Page } from "@playwright/test";

export const PARTS = ["solar", "antenna", "camera", "frame", "legs", "sampler"];

export async function toHub(page: Page, name = "Asha") {
  await page.goto("/");
  await page.getByRole("button", { name: /Skip intro|Begin/ }).click();
  await page.getByLabel("Cadet, what should I call you?").fill(name);
  await page.getByRole("button", { name: "Join the Corps" }).click();
  await expect(page.getByRole("heading", { name: "Chronos Base" })).toBeVisible();
}
export async function toBrief(page: Page) {
  await toHub(page);
  await page.getByRole("button", { name: "Open archive: Surveyor 3" }).click();
  await expect(page.locator('[data-screen="brief"]')).toBeVisible();
}
export async function explore(page: Page) {
  for (const h of ["craft", "soil", "sky"]) await page.locator(`[data-hot="${h}"]`).click();
  await expect(page.getByTestId("found")).toHaveText("3 of 3 investigated");
  await page.getByRole("button", { name: "Open the assembly sheet" }).click();
  await expect(page.locator('[data-screen="lab"]')).toBeVisible();
}
export async function assemble(page: Page) {
  for (const id of PARTS) {
    await page.locator(`[data-part="${id}"]`).click();
    await page.locator(`[data-slot="${id}"] .sh`).click({ force: true });
    await expect(page.locator(`[data-slot="${id}"]`)).toHaveClass(/ok/);
  }
  await page.getByRole("button", { name: "Start the challenge" }).click();
  await expect(page.locator('[data-screen="challenge"]')).toBeVisible();
}
/** Plays the lander like a careful pilot: brake late, never above the safe speed for the height left. */
export async function autopilot(page: Page) {
  await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('[data-testid="lander"]')!;
    let down = false;
    const id = setInterval(() => {
      if (!c.isConnected) return clearInterval(id);
      const alt = +c.dataset.alt!, v = +c.dataset.v!;
      const want = v > 2.2 && alt <= (v * v) / (2 * 2.1) + 2;
      if (want !== down) {
        down = want;
        window.dispatchEvent(new KeyboardEvent(want ? "keydown" : "keyup", { code: "Space" }));
      }
    }, 10);
  });
}
