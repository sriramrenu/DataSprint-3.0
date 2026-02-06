import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database.js';
import emailService from '../services/email.service.js';
import dataService from '../services/data.service.js';

const router = express.Router();

// Helper: Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP for Registration
router.post('/send-otp', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        await prisma.registrationOTP.upsert({
            where: { email },
            update: { otp, expiresAt },
            create: { email, otp, expiresAt }
        });

        await emailService.sendEmail({
            to: email,
            subject: 'Email Verification OTP - DATASPRINT',
            textContent: `Your verification code is: ${otp}. Valid for 2 minutes.`,
            htmlContent: `
                <div style="font-family: monospace; padding: 20px; background: #000; color: #16a34a; border: 1px solid #16a34a;">
                    <h2 style="color: #4ade80;">VERIFICATION_CODE_GENERATED</h2>
                    <p style="font-size: 1.2rem;">CODE: <span style="letter-spacing: 5px; font-weight: bold; color: #fff; background: #052e16; padding: 5px 10px;">${otp}</span></p>
                    <p>VALID_FOR: 120 SECONDS</p>
                    <hr style="border-color: #16a34a;">
                    <p style="font-size: 0.8rem; opacity: 0.7;">DATA_SPRINT_SECURE_NODE_AUTOMAIL</p>
                </div>
            `
        });

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
});

// Verify OTP for Registration
router.post('/verify-registration-otp', async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

        const record = await prisma.registrationOTP.findUnique({ where: { email } });

        if (!record || record.otp !== otp || new Date() > record.expiresAt) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
});

// Register
router.post(
    '/register',
    [
        body('username').notEmpty(),
        body('password').isLength({ min: 6 }),
        body('teamName').notEmpty(),
        body('email').isEmail().normalizeEmail(), // Lead Email
        body('name').notEmpty(), // Lead Name
        // Add more validations if needed, but keeping it simple for now
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { password, ...userData } = req.body;

            // Check if username/email exists
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: userData.username },
                        { email: userData.email }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Username or Lead Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    password: hashedPassword,
                    isVerified: true // Auto-verify for hackathon
                }
            });

            // Send Confirmation Email
            await emailService.sendEmail({
                to: user.email,
                subject: 'Registration Confirmed - DATASPRINT 3.0',
                textContent: `Welcome Team ${user.teamName}! Your registration for Data Sprint 3.0 is confirmed.`,
                htmlContent: `
                    <div style="font-family: monospace; padding: 30px; background: #000; color: #16a34a; border: 2px solid #16a34a; border-radius: 8px;">
                        <h1 style="color: #4ade80; border-bottom: 1px solid #16a34a; padding-bottom: 10px;">REGISTRATION_COMPLETE</h1>
                        <p style="font-size: 1.2rem; color: #fff;">WELCOME TO THE GRID, <span style="color: #4ade80; font-weight: bold;">TEAM_${user.teamName.toUpperCase()}</span></p>
                        <p style="margin-top: 20px;">Your access to Data Sprint 3.0 has been authorized. We have localized your node in our database.</p>
                        
                        <div style="background: #052e16; padding: 15px; margin: 25px 0; border: 1px dashed #16a34a;">
                            <p style="margin: 0;"><strong>SYSTEM_STATUS:</strong> <span style="color: #4ade80;">READY</span></p>
                            <p style="margin: 5px 0 0 0;"><strong>AUTH_ID:</strong> ${user.id.split('-')[0].toUpperCase()}</p>
                        </div>

                        <p>Prepare your tools. The sprint begins soon.</p>
                        <hr style="border: 0; border-top: 1px solid #16a34a; margin: 30px 0;">
                        <p style="font-size: 0.8rem; opacity: 0.7; text-align: center;">DATA_SPRINT_SECURE_NODE_AUTOMAIL v3.0</p>
                    </div>
                `
            });

            // Sync to "Excel" (CSV)
            await dataService.logRegistration(user);

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                message: 'Team registered successfully',
                user: { id: user.id, username: user.username, teamName: user.teamName, role: user.role },
                token,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get Current User (ME)
router.get('/me', async (req, res) => {
    try {
        // Token is verified by middleware before this if applied, 
        // but here we might need to extract from header manually if no middleware used on this specific file export yet.
        // However, referencing script.js, it calls this endpoint.
        // We need to parse the header.
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Return full user object for profile display
        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Login
router.post(
    '/login',
    [
        body('username').notEmpty(),
        body('password').notEmpty(),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;

            const user = await prisma.user.findUnique({ where: { username } });

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    teamName: user.teamName,
                    name: user.name,
                    role: user.role,
                },
                token,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Forgot Password - Request OTP
router.post(
    '/forgot-password',
    [body('username').notEmpty()],
    async (req, res, next) => {
        try {
            const { username } = req.body;
            const user = await prisma.user.findUnique({ where: { username } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const otp = generateOTP();
            const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

            await prisma.user.update({
                where: { username },
                data: { otp, otpExpiresAt }
            });

            await emailService.sendEmail({
                to: user.email,
                subject: 'Password Reset OTP - DATASPRINT',
                textContent: `Your OTP for password reset is: ${otp}. Valid for 2 minutes.`,
                htmlContent: `
                    <div style="font-family: monospace; padding: 20px; background: #000; color: #16a34a; border: 1px solid #16a34a;">
                        <h2 style="color: #4ade80;">SECURITY ALERT: PASSWORD RESET</h2>
                        <p>A request was made to reset your DATASPRINT session password.</p>
                        <div style="font-size: 24px; letter-spacing: 5px; margin: 20px 0; border: 1px dashed #16a34a; padding: 10px; text-align: center;">
                            <strong>${otp}</strong>
                        </div>
                        <p>This code expires in <span style="color: #ef4444;">2 MINUTES</span>.</p>
                        <p>If you did not request this, ignore this transmission.</p>
                    </div>
                `
            });

            res.json({ message: 'OTP sent to registered email' });
        } catch (error) {
            next(error);
        }
    }
);

// Verify OTP
router.post(
    '/verify-otp',
    [
        body('username').notEmpty(),
        body('otp').isLength({ min: 6, max: 6 }),
    ],
    async (req, res, next) => {
        try {
            const { username, otp } = req.body;

            const user = await prisma.user.findUnique({ where: { username } });

            if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            res.json({ message: 'OTP verified successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// Reset Password
router.post(
    '/reset-password',
    [
        body('username').notEmpty(),
        body('otp').notEmpty(),
        body('newPassword').isLength({ min: 6 }),
    ],
    async (req, res, next) => {
        try {
            const { username, otp, newPassword } = req.body;

            const user = await prisma.user.findUnique({ where: { username } });

            if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
                return res.status(400).json({ message: 'Session expired. Request a new OTP.' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { username },
                data: {
                    password: hashedPassword,
                    otp: null,
                    otpExpiresAt: null
                }
            });

            res.json({ message: 'Password reset successfully. You can now login.' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
