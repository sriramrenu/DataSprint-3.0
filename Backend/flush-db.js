import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Starting database flush...');

    // Delete users where role is not admin
    const deleted = await prisma.user.deleteMany({
        where: {
            role: {
                not: 'admin'
            }
        }
    });

    // Delete all registration OTP records as well
    await prisma.registrationOTP.deleteMany({});

    console.log(`✅ Flushed ${deleted.count} non-admin users.`);
    console.log('✅ Flushed all registration OTPs.');
}

main()
    .catch((e) => {
        console.error('❌ Flush failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
