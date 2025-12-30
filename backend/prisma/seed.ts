import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@abracann.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123456';

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin já existe: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: {
      email,
      password: passwordHash,
      role: Role.ADMIN,
      ativo: true,
      emailVerificado: true,
    },
  });

  console.log('Admin user created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
