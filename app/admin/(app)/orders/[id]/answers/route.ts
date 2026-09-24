import { fail } from '@/src/lib/api';
import { requireAdmin } from '@/src/lib/admin-session';
import { OrdersService, toAnswers } from '@/src/modules/orders/orders.service';

/** GET /admin/orders/:id/answers — the answers.json for /new-client or manual scaffolding. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin('owner');
    const { id } = await params;
    const order = await OrdersService.getRaw(id);
    return new Response(JSON.stringify(toAnswers(order), null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${order.ref}.answers.json"`,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
