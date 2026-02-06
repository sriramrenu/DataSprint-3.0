import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getOtp() {
    const email = 'test_verifier@gmail.com';
    try {
        const record = await prisma.registrationOTP.findFirst({
            where: { email },
            orderBy: { createdAt: 'desc' }
        });

        if (record) {
            console.log(`OTP_FOUND: ${record.otp}`);
        } else {
            console.log('OTP_NOT_FOUND');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

getOtp();
