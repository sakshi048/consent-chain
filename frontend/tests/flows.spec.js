import { test, expect } from "@playwright/test";
async function login(page, role, username) {
  await page.goto("/" + role + "/login");
  if (role !== "aa")
    await page
      .getByLabel("Institution ID")
      .fill("BANK-" + role.toUpperCase() + "-001");
  await page
    .getByLabel("Username", { exact: true })
    .fill(username || "demo." + role);
  await page.getByLabel("Password", { exact: true }).fill("demo@1234");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name:
        role === "aa" ? "Hello, Ramlal." : "A clearer view of your activity.",
    }),
  ).toBeVisible();
}
test("FIU creates request, AA approves and executes, FIU receives, FIP validates, AA revokes", async ({
  browser,
}) => {
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext(),
  ]);
  const [fiu, aa, fip] = await Promise.all(contexts.map((c) => c.newPage()));
  const errors = [];
  for (const p of [fiu, aa, fip])
    p.on("pageerror", (e) => errors.push(e.message));
  await login(fiu, "fiu");
  await fiu.getByRole("link", { name: "Create request", exact: true }).click();
  await fiu.getByLabel("Customer PAN").fill("ABCPL1234D");
  await fiu.getByLabel("AA customer ID").fill("1");
  await fiu
    .getByLabel("Purpose", { exact: true })
    .fill("Browser credit assessment");
  await fiu.getByLabel("Data period starts").fill("2026-01-01");
  await fiu.getByLabel("Data period ends").fill("2026-09-30");
  await fiu.getByRole("checkbox", { name: "Transactions" }).check();
  await fiu.getByRole("checkbox", { name: "Loan history" }).check();
  await fiu.getByRole("button", { name: "Send for consent" }).click();
  await expect(
    fiu.getByRole("heading", { name: "Request details" }),
  ).toBeVisible();
  const id = fiu.url().split("/").pop();
  await login(aa, "aa", "ramlal.aa");
  await aa.goto("/aa/requests/" + id);
  await aa.getByRole("button", { name: "Approve consent" }).click();
  await aa.getByRole("button", { name: "Confirm approve" }).click();
  await expect(
    aa.getByRole("button", { name: "Retrieve and deliver to FIU" }),
  ).toBeVisible();
  await aa.getByRole("button", { name: "Retrieve and deliver to FIU" }).click();
  await expect(aa.getByRole("status")).toContainText("delivered");
  await fiu.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(
    fiu.getByRole("heading", { name: "Received financial information" }),
  ).toBeVisible();
  await expect(fiu.getByText("Crop sale credit - Mandi").first()).toBeVisible();
  await login(fip, "fip");
  await fip.getByRole("link", { name: "Data requests", exact: true }).click();
  await fip.getByLabel("Request ID", { exact: true }).fill(id);
  await fip.getByRole("button", { name: "Find request" }).click();
  await fip
    .getByRole("button", { name: "Validate consent", exact: true })
    .click();
  await expect(fip.getByRole("status")).toHaveText("Consent is valid");
  await aa.getByRole("button", { name: "Revoke consent", exact: true }).click();
  await aa.getByRole("button", { name: "Confirm revoke" }).click();
  await expect(aa.getByRole("status")).toHaveText("Consent revoked.");
  await fip
    .getByRole("button", { name: "Validate consent", exact: true })
    .click();
  await expect(fip.getByRole("alert")).toContainText("expired or revoked");
  expect(errors).toEqual([]);
  for (const c of contexts) await c.close();
});
test("AA registration, linking, rejection and mobile navigation", async ({
  page,
}) => {
  const name = "uitest" + Date.now();
  await page.goto("/aa/login");
  await page
    .getByRole("button", { name: "New to ConsentChain? Create an account" })
    .click();
  await page.getByLabel("Full name").fill("Ramlal Test");
  await page.getByLabel("Email address").fill(name + "@example.test");
  await page.getByLabel("Mobile number").fill("9876543210");
  await page.getByLabel("PAN", { exact: true }).fill("ABCPL1234D");
  await page.getByLabel("Username", { exact: true }).fill(name);
  await page.getByLabel("Password", { exact: true }).fill("demo@1234");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await login(page, "aa", name);
  await page.getByRole("link", { name: "Linked accounts" }).click();
  await page.getByRole("button", { name: "Link bank", exact: true }).click();
  await page.getByLabel("Bank name").fill("HDFC");
  await page.getByLabel("Netbanking username").fill("ramlal.patil");
  await page.getByLabel("Netbanking password").fill("demo@1234");
  await page.getByRole("button", { name: "Verify and link" }).click();
  await expect(page.getByText("AC1000234567", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Create request", exact: true }).click();
  await page.getByLabel("Customer PAN").fill("ABCPL1234D");
  await page.getByLabel("Requesting FIU ID").fill("BANK-FIU-001");
  await page.getByLabel("Purpose", { exact: true }).fill("Reject browser test");
  await page.getByLabel("Data period starts").fill("2026-01-01");
  await page.getByLabel("Data period ends").fill("2026-09-30");
  await page.getByRole("button", { name: "Send for consent" }).click();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await page.getByRole("button", { name: "Confirm reject" }).click();
  await expect(page.getByRole("status")).toHaveText("Consent rejected.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Ramlal." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
test("login errors and inaccessible role routes", async ({ page }) => {
  await page.goto("/fiu/requests");
  await expect(page).toHaveURL(/\/fiu\/login/);
  await page.getByLabel("Institution ID").fill("BANK-FIU-001");
  await page.getByLabel("Username", { exact: true }).fill("demo.fiu");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
