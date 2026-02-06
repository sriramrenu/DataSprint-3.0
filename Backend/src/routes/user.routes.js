import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';
import emailService from '../services/email.service.js';
import dataService from '../services/data.service.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticate, async (req, res, next) => {
    try {
        res.json({
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
});

// Export all users to Excel (CSV format)
router.get('/export', async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const headers = [
            'ID', 'TEAM_NAME', 'LEAD_NAME', 'LEAD_EMAIL', 'LEAD_PHONE', 'COLLEGE', 'DEPT', 'YEAR',
            'MEMBER_1', 'MEMBER_2', 'MEMBER_3', 'REGISTERED_AT'
        ].join(',');

        const rows = users.map(u => [
            u.id,
            `"${u.teamName}"`,
            `"${u.name}"`,
            u.email,
            u.phone,
            `"${u.college}"`,
            `"${u.dept}"`,
            u.year,
            `"${u.m1Name || '---'}"`,
            `"${u.m2Name || '---'}"`,
            `"${u.m3Name || '---'}"`,
            u.createdAt.toISOString()
        ].join(',')).join('\n');

        const csvContent = headers + '\n' + rows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=DATASPRINT_REGISTRATIONS.csv');
        res.status(200).send(csvContent);
    } catch (error) {
        next(error);
    }
});

// Update current user profile
router.put('/me', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Filter out sensitive fields
        const { id, password, username, otp, otpExpiresAt, createdAt, updatedAt, ...safeData } = updateData;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: safeData
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Request Password Change OTP (Authenticated)
router.post('/me/request-password-otp', authenticate, async (req, res, next) => {
    try {
        const user = req.user;
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: { otp, otpExpiresAt }
        });

        await emailService.sendEmail({
            to: user.email,
            subject: 'Security Verification Code - DATASPRINT',
            textContent: `Your verification code is: ${otp}. Valid for 5 minutes.`,
            htmlContent: `
                <div style="font-family: monospace; padding: 20px; background: #000; color: #16a34a; border: 1px solid #16a34a;">
                    <h2 style="color: #4ade80;">SECURITY_VERIFICATION_REQUEST</h2>
                    <p style="font-size: 1.1rem;">Someone (hopefully you) requested a security code for your account.</p>
                    <p style="font-size: 1.5rem; margin: 20px 0;">CODE: <span style="letter-spacing: 5px; font-weight: bold; color: #fff; background: #052e16; padding: 5px 15px;">${otp}</span></p>
                    <p>EXPIRES_IN: 300 SECONDS</p>
                    <hr style="border-color: #16a34a;">
                    <p style="font-size: 0.8rem; opacity: 0.7;">DATA_SPRINT_SECURE_NODE_AUTOMAIL</p>
                </div>
            `
        });

        res.json({ message: 'OTP sent to your verified email' });
    } catch (error) {
        next(error);
    }
});

// Change Password with OTP (Authenticated)
router.post('/me/change-password', authenticate, async (req, res, next) => {
    try {
        const { otp, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiresAt: null
            }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});

// Get all users (protected route example)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                teamName: true,
                createdAt: true,
            },
        });

        res.json({
            users,
            count: users.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                name: true,
                teamName: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found',
            });
        }

        res.json({ user });
    } catch (error) {
        next(error);
    }
});

export default router;
