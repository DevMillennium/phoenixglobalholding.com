import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home carrega e tem marca", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/Phoenix Global/i).first()).toBeVisible();
  });

  test("página de contacto e formulário", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
  });

  test("divisão Import & Export", async ({ page }) => {
    await page.goto("/divisions/import-export");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("privacidade", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
