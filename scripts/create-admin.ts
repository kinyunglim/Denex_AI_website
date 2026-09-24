// Creates (or resets the password of) an admin login:
//   yarn admin:create --email owner@client.com --name "Owner" [--password xxxxxxxxxx] [--role owner|staff]
// Without --password a strong one is generated and printed once.
import { randomBytes } from 'node:crypto';
import { AdminService } from '@/src/services/admin.service';
import { AdminDao } from '@/src/dao/admin.dao';
import { closeDatabase } from '@/src/lib/mongodb';

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const email = arg('email')?.toLowerCase();
  const name = arg('name') ?? 'Owner';
  const role = arg('role') === 'staff' ? 'staff' : 'owner';
  const password = arg('password') ?? randomBytes(9).toString('base64url');
  if (!email) throw new Error('Usage: yarn admin:create --email you@client.com --name "Name"');

  const existing = await AdminDao.findByEmail(email);
  if (existing) {
    await AdminService.update(existing._id.toHexString(), { password, role, isActive: true }, 'script');
    console.log(`✓ Updated ${email} (${role})`);
  } else {
    await AdminService.create({ email, name, password, role });
    console.log(`✓ Created ${email} (${role})`);
  }
  if (!arg('password')) console.log(`  Password: ${password}   ← give this to the client once, they can change it under Team`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
