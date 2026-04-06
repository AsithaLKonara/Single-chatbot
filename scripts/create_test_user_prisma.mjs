import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const prisma = new PrismaClient();

async function main() {
  const email = "test@system.ai";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("User already exists!");
    return;
  }
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    }
  });
  console.log("User created:", user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
