import { expect, test } from '@playwright/test';

const APP = 'http://localhost:3302';

test('admin: requires login, then shows the dashboard and seeded contacts', async ({ page }) => {
  await page.goto(`${APP}/admin`);
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.locator('#login-email').fill('admin');
  await page.locator('#login-password').fill('admin');
  await page.getByRole('button', { name: /登入|Sign in/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/總覽|Dashboard/);
  await page.goto(`${APP}/admin/contacts`);
  await expect(page.getByRole('link', { name: 'Mandy Ho' })).toBeVisible();
});

test('public booking lands in the admin calendar', async ({ page, request }) => {
  const services = (await (await request.get(`${APP}/api/booking/services`)).json()).data as { id: string }[];
  let slot: { start: string; staffId: string } | undefined;
  for (let i = 1; i < 10 && !slot; i++) {
    const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' }).format(new Date(Date.now() + i * 86_400_000));
    const res = await request.get(`${APP}/api/booking/availability?serviceId=${services[0].id}&date=${date}`);
    slot = ((await res.json()).data as { start: string; staffId: string }[])[0];
  }
  expect(slot).toBeDefined();
  const booked = await request.post(`${APP}/api/booking`, {
    data: { serviceId: services[0].id, start: slot!.start, name: 'E2E Customer', phone: '98887777', locale: 'en' },
  });
  expect(booked.status()).toBe(201);

  await page.goto(`${APP}/admin/login`);
  await page.locator('#login-email').fill('admin');
  await page.locator('#login-password').fill('admin');
  await page.getByRole('button', { name: /登入|Sign in/ }).click();
  await page.waitForURL(/\/admin$/);
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' }).format(new Date(slot!.start));
  await page.goto(`${APP}/admin/bookings?week=${date}`);
  await expect(page.getByRole('link', { name: 'E2E Customer' })).toBeVisible();
});
