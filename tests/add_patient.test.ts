import { test } from "./fixture";

const TALOSIX_APP_URL = process.env.TALOSIX_APP_URL;

test("add patient", async ({ aiTap, aiWaitFor, aiAssert, page }) => {
  await page.goto(TALOSIX_APP_URL);
  await aiTap("Patient Management menu item in the left sidebar");
  await aiTap("Patient Summary menu item");
  await aiWaitFor("Patient table", {
    timeoutMs: 20000,
  });
  await aiTap("Add Patient button");
  await aiWaitFor("Patient Registration form", {
    timeoutMs: 20000,
  });

  await aiAssert("Patient Registration form is visible");
});
