import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                name: true,
                teamName: true,
                college: true,
                dept: true,
                year: true,
                m1Name: true,
                m1Email: true,
                m1Phone: true,
                m1College: true,
                m1Dept: true,
                m1Year: true,
                m2Name: true,
                m2Email: true,
                m2Phone: true,
                m2College: true,
                m2Dept: true,
                m2Year: true,
                m3Name: true,
                m3Email: true,
                m3Phone: true,
                m3College: true,
                m3Dept: true,
                m3Year: true,
                otp: true,
                otpExpiresAt: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not found',
            });
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};
