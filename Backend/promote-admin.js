import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function promoteAdmin() {
    const email = 'test_verifier@gmail.com';
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'admin' }
        });
        console.log(`✅ User promoted to ADMIN: ${user.username}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

promoteAdmin();
