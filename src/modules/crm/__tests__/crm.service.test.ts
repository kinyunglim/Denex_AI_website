import { describe, expect, it } from '@jest/globals';
import { setupTestDb } from '@/src/test/mongo';
import { CrmService } from '@/src/modules/crm/crm.service';
import { ContactDao } from '@/src/modules/crm/crm.dao';

setupTestDb();

describe('CrmService.findOrCreateContact', () => {
  it('creates a new contact with normalised phone and email', async () => {
    const { contact, created } = await CrmService.findOrCreateContact({
      name: 'Chan Tai Man',
      phone: '9123 4567',
      email: 'CHAN@Example.com',
      source: 'form',
    });
    expect(created).toBe(true);
    expect(contact.phone).toBe('+85291234567');
    expect(contact.email).toBe('chan@example.com');
    expect(contact.status).toBe('lead');
  });

  it('matches an existing contact by phone', async () => {
    const first = await CrmService.findOrCreateContact({ name: 'A', phone: '91234567', source: 'form' });
    const second = await CrmService.findOrCreateContact({ name: 'A2', phone: '+852 9123-4567', source: 'booking' });
    expect(second.created).toBe(false);
    expect(second.contact.id).toBe(first.contact.id);
    expect(await ContactDao.count()).toBe(1);
  });

  it('matches by email and fills in a missing phone', async () => {
    const first = await CrmService.findOrCreateContact({ name: 'B', email: 'b@x.com', source: 'form' });
    const second = await CrmService.findOrCreateContact({ name: 'B', email: 'B@X.com', phone: '61234567', source: 'booking' });
    expect(second.contact.id).toBe(first.contact.id);
    expect(second.contact.phone).toBe('+85261234567');
  });

  it('merges new tags without duplicating', async () => {
    await CrmService.findOrCreateContact({ name: 'C', email: 'c@x.com', tags: ['vip'], source: 'form' });
    const { contact } = await CrmService.findOrCreateContact({ name: 'C', email: 'c@x.com', tags: ['vip', 'yoga'], source: 'form' });
    expect(contact.tags).toEqual(['vip', 'yoga']);
  });

  it('requires phone or email', async () => {
    await expect(CrmService.findOrCreateContact({ name: 'D', source: 'form' })).rejects.toThrow('Phone or email');
  });
});

describe('CrmService admin operations', () => {
  it('refuses a manual duplicate', async () => {
    await CrmService.createContact({ name: 'E', phone: '91112222' }, 'admin');
    await expect(CrmService.createContact({ name: 'E2', phone: '9111 2222' }, 'admin')).rejects.toThrow('already exists');
  });

  it('validates manual input', async () => {
    await expect(CrmService.createContact({ name: '', phone: '1' }, 'admin')).rejects.toThrow('Invalid input');
    await expect(CrmService.createContact({ name: 'X' }, 'admin')).rejects.toThrow('Invalid input');
  });

  it('updates a contact and blocks stealing another contact phone', async () => {
    const a = await CrmService.createContact({ name: 'A', phone: '90000001' }, 'admin');
    const b = await CrmService.createContact({ name: 'B', phone: '90000002' }, 'admin');
    const updated = await CrmService.updateContact(a.id, { status: 'active', tags: ['vip'] });
    expect(updated.status).toBe('active');
    await expect(CrmService.updateContact(b.id, { phone: '90000001' })).rejects.toThrow('Another contact');
  });

  it('lists with search and pagination', async () => {
    for (let i = 0; i < 30; i++) {
      await CrmService.createContact({ name: `Person ${i}`, phone: `9000${String(i).padStart(4, '0')}` }, 'admin');
    }
    const page2 = await CrmService.listContacts({ page: 2, limit: 25 });
    expect(page2.items).toHaveLength(5);
    expect(page2.pages).toBe(2);
    const search = await CrmService.listContacts({ search: 'Person 1' });
    expect(search.total).toBe(11);
  });

  it('adds and lists notes, deletes them with the contact', async () => {
    const c = await CrmService.createContact({ name: 'N', email: 'n@x.com' }, 'admin');
    await CrmService.addNote(c.id, { body: 'Called, interested' }, 'Owner');
    const notes = await CrmService.listNotes(c.id);
    expect(notes[0].body).toBe('Called, interested');
    await CrmService.deleteContact(c.id);
    expect(await CrmService.listNotes(c.id)).toEqual([]);
  });
});
