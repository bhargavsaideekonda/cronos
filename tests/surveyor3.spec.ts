import { expect, test } from "@playwright/test";
import { PARTS, assemble, autopilot, explore, toBrief, toHub } from "./helpers";

test("Surveyor 3 plays from intro to debrief", async ({ page }) => {
  await toBrief(page);
  await explore(page);
  await assemble(page);

  // lose first: never fire the engine
  await expect(page.getByTestId("lose")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("lose")).toContainText("Too fast");
  await page.getByRole("button", { name: "Fly it again" }).click();
  // then win
  await autopilot(page);
  await expect(page.getByTestId("win")).toBeVisible({ timeout: 40_000 });
  await page.getByRole("button", { name: "Continue to the vault" }).click();

  // vault: restore all four files; real photos carry a credit and NASA ID
  for (let i = 0; i < 4; i++) await page.locator(`[data-file="${i}"] .ph`).click();
  await expect(page.locator(".card.lock")).toHaveCount(0);
  await expect(page.getByText("Photo credit: NASA/JSC · NASA ID as12-48-7121")).toBeVisible();
  await expect(page.getByText("NASA does not endorse this project. Images courtesy")).toBeVisible();
  await page.locator('[data-file="0"] .ph').click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Final signal" }).click();

  // last signal: verified dates shown, the unverified one is not invented
  await expect(page.getByText("NASA gives May 4, 1967 as the last contact.")).toBeVisible();
  await expect(page.getByText("Not shown: no verified date")).toBeVisible();
  const cont = page.getByRole("button", { name: "Continue" });
  await expect(cont).toBeDisabled();
  await expect(cont).toBeEnabled({ timeout: 8000 });
  await cont.click();

  await expect(page.getByRole("heading", { name: "Asha, Surveyor 3 preserved" })).toBeVisible();
  await page.getByRole("button", { name: "Return to Chronos Base" }).click();
  await expect(page.getByRole("button", { name: /2\. Surveyor 3 ✓/ })).toBeVisible();
  await expect(page.getByText("1 of 10 archives preserved")).toBeVisible();
});

test("assembly: wrong slot is a hint, drag works, keyboard works", async ({ page }) => {
  await toBrief(page);
  await explore(page);
  // wrong slot: nothing is placed, no penalty
  await page.locator('[data-part="solar"]').click();
  await page.locator('[data-slot="legs"] .sh').click({ force: true });
  await expect(page.locator('[data-slot="legs"]')).not.toHaveClass(/ok/);
  await expect(page.locator("#say")).toContainText("Not quite");
  // drag
  const part = await page.locator('[data-part="legs"]').boundingBox();
  const slot = await page.locator('[data-slot="legs"] .sh').boundingBox();
  await page.mouse.move(part!.x + 20, part!.y + 20);
  await page.mouse.down();
  await page.mouse.move(part!.x + 60, part!.y - 40, { steps: 4 });
  await page.mouse.move(slot!.x + slot!.width / 2, slot!.y + slot!.height - 12, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('[data-slot="legs"]')).toHaveClass(/ok/);
  // keyboard only
  for (const id of PARTS.filter((p) => p !== "legs")) {
    await page.locator(`[data-part="${id}"]`).focus();
    await page.keyboard.press("Enter");
    await page.locator(`[data-slot="${id}"]`).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(`[data-slot="${id}"]`)).toHaveClass(/ok/);
  }
  await expect(page.getByRole("button", { name: "Start the challenge" })).toBeVisible();
});

test("scene animates, and freezes with motion off", async ({ page }) => {
  await toHub(page);
  await page.waitForTimeout(1500);
  const shot = () => page.locator("#bgc").screenshot();
  const a = await shot();
  await page.waitForTimeout(700);
  expect(Buffer.compare(a, await shot())).not.toBe(0);
  await expect(page.locator("#bgc")).toHaveAttribute("data-scene", "moon");

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByLabel("Motion off").check();
  await page.getByRole("button", { name: "Close" }).click();
  await page.waitForTimeout(500);
  const c = await shot();
  await page.waitForTimeout(700);
  expect(Buffer.compare(c, await shot())).toBe(0);
});

test("hub switches archive sky and theme", async ({ page }) => {
  await toHub(page);
  await page.getByRole("tab", { name: "Mars" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "mars");
  await expect(page.locator("#bgc")).toHaveAttribute("data-scene", "viking1");
  await expect(page.getByRole("button", { name: /Open archive: Viking 1/ })).toBeVisible();
});

test("phone: the companion never covers the next-step button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await toBrief(page);
  for (const h of ["craft", "soil", "sky"]) await page.locator(`[data-hot="${h}"]`).click();
  const btn = (await page.getByRole("button", { name: "Open the assembly sheet" }).boundingBox())!;
  for (const sel of ["#say", "#tock"]) {
    const b = (await page.locator(sel).boundingBox())!;
    const overlap = !(b.x > btn.x + btn.width || b.x + b.width < btn.x || b.y > btn.y + btn.height || b.y + b.height < btn.y);
    expect(overlap, sel + " overlaps the button").toBe(false);
  }
  expect(btn.height).toBeGreaterThanOrEqual(44);
});

test("companion is an agent: it travels to the hotspot being discussed", async ({ page }) => {
  await toBrief(page);
  const x0 = +(await page.locator("#tock").getAttribute("data-x"))!;
  await page.locator('[data-hot="soil"]').click();
  await expect(page.locator("#tock")).toHaveAttribute("data-behaviour", "goto");
  await expect.poll(async () => +(await page.locator("#tock").getAttribute("data-x"))!, { timeout: 6000 }).toBeGreaterThan(x0 + 300);
  await expect(page.locator("#say")).toContainText("wet sand");
});
