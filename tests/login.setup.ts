import { test } from "./fixture";
import * as path from "node:path";

const { TALOSIX_ACCOUNT_EMAIL, TALOSIX_ACCOUNT_PASSWORD, TALOSIX_APP_URL } =
  process.env;

const LANTERN_STUDY_NAME = "TEST - LANTERN Study";

const authFile = path.join(__dirname, "../.auth/user.json");

test.beforeEach(async ({ page }) => {
  await page.goto(TALOSIX_APP_URL);
  await page.waitForLoadState("networkidle");
});

test("Login lantern study", async ({
  aiAssert,
  aiInput,
  aiTap,
  page,
  aiWaitFor,
}) => {
  await aiInput(TALOSIX_ACCOUNT_EMAIL, "Email");
  await aiInput(TALOSIX_ACCOUNT_PASSWORD, "Password");
  await aiTap("Login");
  try {
    await aiWaitFor("Your account is being used by other browser popup", {
      timeoutMs: 20000,
    });
    await aiTap("'Continue singing in' button");
  } catch (e) {}
  await aiWaitFor("Studies list", { timeoutMs: 20000 });
  await aiInput("lantern", "Search");
  await aiTap(LANTERN_STUDY_NAME);
  await aiWaitFor("Left sidebar", { timeoutMs: 20000 });
  await aiAssert(`${LANTERN_STUDY_NAME} exists on the header`);
  await page.context().storageState({ path: authFile });
});
