import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res, next) => {
    try {
        const posts = await prisma.post.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            posts,
            count: posts.length,
        });
    } catch (error) {
        next(error);
    }
});

// Get post by ID
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Post not found',
            });
        }

        res.json({ post });
    } catch (error) {
        next(error);
    }
});

// Create post (protected)
router.post(
    '/',
    authenticate,
    [
        body('title').notEmpty().trim(),
        body('content').optional().trim(),
        body('published').optional().isBoolean(),
    ],
    async (req, res, next) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, content, published } = req.body;

            const post = await prisma.post.create({
                data: {
                    title,
                    content,
                    published: published || false,
                },
            });

            res.status(201).json({
                message: 'Post created successfully',
                post,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Update post (protected)
router.put(
    '/:id',
    authenticate,
    [
        body('title').optional().trim(),
        body('content').optional().trim(),
        body('published').optional().isBoolean(),
    ],
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, content, published } = req.body;

            const post = await prisma.post.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    ...(content !== undefined && { content }),
                    ...(published !== undefined && { published }),
                },
            });

            res.json({
                message: 'Post updated successfully',
                post,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Delete post (protected)
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.post.delete({
            where: { id },
        });

        res.json({
            message: 'Post deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
