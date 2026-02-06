import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, ForbiddenError, InternalServerError } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://data-sprint-3-0.vercel.app',
    'https://datasprint-frontend.vercel.app',
    'http://localhost:5173'
];

// Add environment variable origins
if (process.env.CORS_ORIGIN) {
    if (process.env.CORS_ORIGIN === '*') {
        // Handle wildcard separately in the function or just rely on the array logic?
        // Actually, if it's *, we should just set origin: true or let the function handle it.
        // But the function below checks the array.
    } else {
        process.env.CORS_ORIGIN.split(',').forEach(origin => {
            const trimmed = origin.trim();
            if (trimmed && !allowedOrigins.includes(trimmed)) {
                allowedOrigins.push(trimmed);
            }
        });
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if Wildcard is enabled in env
        if (process.env.CORS_ORIGIN === '*') return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'DATASPRINT 2K26 Backend is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Test error routes (for demonstration)
app.get('/api/test/403', (req, res, next) => {
    next(new ForbiddenError('You do not have permission to access this resource'));
});

app.get('/api/test/500', (req, res, next) => {
    next(new InternalServerError('An unexpected error occurred on the server'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server if not in Vercel (Serverless)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
}

export default app;
