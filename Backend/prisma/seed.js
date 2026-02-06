import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'user1@example.com' },
        update: {},
        create: {
            email: 'user1@example.com',
            password: hashedPassword,
            name: 'John Doe',
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'user2@example.com' },
        update: {},
        create: {
            email: 'user2@example.com',
            password: hashedPassword,
            name: 'Jane Smith',
        },
    });

    // Create sample posts
    await prisma.post.createMany({
        data: [
            {
                title: 'First Post',
                content: 'This is the first post content',
                published: true,
            },
            {
                title: 'Second Post',
                content: 'This is the second post content',
                published: false,
            },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Database seeded successfully!');
    console.log('Created users:', { user1, user2 });
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
