import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const db = new PrismaClient();

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('Bootstrap admin skipped: credentials are not configured.');
    return;
  }
  if (password.length < 12) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.');
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Bootstrap admin already exists; no password was changed.');
    return;
  }
  await db.user.create({data:{firstName:process.env.BOOTSTRAP_ADMIN_FIRST_NAME ?? 'System',lastName:process.env.BOOTSTRAP_ADMIN_LAST_NAME ?? 'Administrator',email,passwordHash:await argon2.hash(password,{type:argon2.argon2id}),role:'ADMIN',mustResetPassword:true}});
  console.log('Bootstrap admin created. Remove BOOTSTRAP_ADMIN_PASSWORD from the service environment after first deploy.');
}
main().finally(()=>db.$disconnect());
