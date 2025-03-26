import { test } from "./fixture";
import { faker } from "@faker-js/faker";

const TALOSIX_APP_URL = process.env.TALOSIX_APP_URL;

test("add patient", async ({
  aiTap,
  aiWaitFor,
  aiQuery,
  page,
  aiInput,
  aiAssert,
}) => {
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

  await aiTap("Site selection input in the registration form");
  await aiTap(
    "Random site option from the site selection dropdown in the registration form",
  );
  await page.waitForTimeout(3000);
  const patientId = await aiQuery("Generated patient ID");
  const patientEmail = faker.internet.exampleEmail();
  await aiInput(patientEmail, "Primary Email in the registration form");
  await aiTap("Submit and close in the registration form");
  await page.waitForTimeout(3000);
  await aiInput(
    patientId,
    "Patient ID search on top of the table in the patient summary page",
  );
  await aiTap("Search button on top of the table in the patient summary page");
  await aiWaitFor(
    `${patientId} exists in the patient table in the patient summary page`,
    {
      timeoutMs: 20000,
    },
  );
  await aiAssert(
    `${patientId} exists in the patient table in the patient summary page`,
  );
});
