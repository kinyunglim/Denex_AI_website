'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/src/lib/admin-session';
import { ActionResult, runAction, str } from '@/src/lib/action';
import { OrdersService } from '@/src/modules/orders/orders.service';

/** Owner-only order decisions. Approve captures the deposit and queues production. */
export async function approveOrderAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    const o = await OrdersService.approve(id, s.name);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    return `✓ ${o.ref}`;
  });
}

export async function rejectOrderAction(id: string, _: ActionResult | null, form: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    const o = await OrdersService.reject(id, s.name, str(form, 'reason'));
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${id}`);
    return `✓ ${o.ref}`;
  });
}

export async function retryOrderAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    const s = await requireAdmin('owner');
    const o = await OrdersService.retry(id, s.name);
    revalidatePath(`/admin/orders/${id}`);
    return `✓ ${o.ref}`;
  });
}
