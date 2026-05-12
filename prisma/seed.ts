import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Sample Customers
    const alice = await prisma.customer.upsert({
        where: { phone: '94771234567' },
        update: {},
        create: {
            phone: '94771234567',
            name: 'Alice Perera',
            email: 'alice@example.com',
            address: '123 Main St',
            city: 'Colombo',
            preferences: {
                categoryAffinity: 'Electronics',
                priceSensitivity: 'MEDIUM'
            }
        },
    });

    const bob = await prisma.customer.upsert({
        where: { phone: '94777654321' },
        update: {},
        create: {
            phone: '94777654321',
            name: 'Bob Silva',
            email: 'bob@example.com',
            address: '456 Galle Rd',
            city: 'Kandy',
            preferences: {
                categoryAffinity: 'Fashion',
                priceSensitivity: 'HIGH'
            }
        },
    });

    // 2. Create Sample Knowledge
    await prisma.knowledge.createMany({
        data: [
            {
                content: 'We offer free delivery for orders over 5000 LKR within Colombo.',
                metadata: { category: 'shipping' }
            },
            {
                content: 'Our return policy allows returns within 14 days of purchase.',
                metadata: { category: 'policy' }
            },
            {
                content: 'We accept Credit Cards, Koko, and Cash on Delivery.',
                metadata: { category: 'payment' }
            }
        ],
    });

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
