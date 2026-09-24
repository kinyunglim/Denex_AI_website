import { expect, test } from '@playwright/test';

const PREVIEW = 'http://localhost:3301';
const THEMES = [
  { key: 'corporate', title: '幫企業由策略走到落地' },
  { key: 'warm', title: '郁得舒服，先會郁得長久' },
  { key: 'product', title: '香港直送，全球冷鏈' },
  { key: 'bold', title: '剪得準。企得型。' },
];

for (const theme of THEMES) {
  test(`preview ${theme.key}: home renders with its own theme and copy`, async ({ page }) => {
    await page.goto(`${PREVIEW}/zh-Hant?theme=${theme.key}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(theme.title);
    await expect(page.getByText('示範模式')).toBeVisible();
    const primary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c-primary'));
    expect(primary.trim()).not.toBe('');
  });
}

test('preview: language switch keeps the page', async ({ page }) => {
  await page.goto(`${PREVIEW}/zh-Hant?theme=warm`);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Move well, for the long run');
});

test('preview: contact form accepts a message without storing it', async ({ page }) => {
  await page.goto(`${PREVIEW}/en?theme=warm#contact`);
  await page.getByLabel('Name *').fill('Visitor');
  await page.getByLabel('Email').fill('visitor@example.com');
  await page.getByLabel('Message *').fill('Hello');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('status')).toContainText('Thanks');
});

test('preview: booking flow completes', async ({ page }) => {
  await page.goto(`${PREVIEW}/en/book?theme=bold`);
  const dates = page.locator('fieldset').nth(1).getByRole('button');
  for (let i = 1; i < 8; i++) {
    await dates.nth(i).click();
    const times = page.locator('fieldset').nth(2);
    await expect(times.getByText('Loading…')).toHaveCount(0);
    const slot = times.getByRole('button').first();
    if ((await slot.count()) > 0) {
      await slot.click();
      break;
    }
  }
  await page.getByLabel('Name *').fill('Visitor');
  await page.getByLabel('Phone').fill('91234567');
  await page.getByRole('button', { name: 'Confirm booking' }).click();
  await expect(page.getByRole('status')).toContainText("You're booked!");
});
