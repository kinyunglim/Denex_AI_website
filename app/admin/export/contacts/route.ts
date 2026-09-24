import { fail } from '@/src/lib/api';
import { requireAdmin } from '@/src/lib/admin-session';
import { ImportExportService } from '@/src/modules/import-export/import-export.service';

/** GET /admin/export/contacts — owner-only xlsx download of all contacts. */
export async function GET() {
  try {
    await requireAdmin('owner');
    const buffer = await ImportExportService.exportContacts();
    const date = new Date().toISOString().slice(0, 10);
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="contacts-${date}.xlsx"`,
      },
    });
  } catch (error) {
    return fail(error);
  }
}
