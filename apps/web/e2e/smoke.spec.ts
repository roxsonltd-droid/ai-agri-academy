import { test, expect } from "@playwright/test";

test.describe("AgriNexus web smoke", () => {
	test("home loads with hero content", async ({ page }) => {
		await page.goto("/en");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 60_000 });
	});
});
