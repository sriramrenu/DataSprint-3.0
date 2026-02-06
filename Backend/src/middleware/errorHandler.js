// Custom error class for better error handling
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 403 Forbidden Error
export class ForbiddenError extends AppError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

// 500 Internal Server Error
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}

// Error response formatter
const formatErrorResponse = (statusCode, error, message, req) => {
    const response = {
        success: false,
        statusCode,
        error,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    };

    // Add detailed error page for specific status codes
    if (statusCode === 403) {
        response.details = {
            title: '403 - Forbidden',
            description: 'You do not have permission to access this resource.',
            suggestions: [
                'Check if you are logged in with the correct account',
                'Verify that you have the necessary permissions',
                'Contact an administrator if you believe this is an error',
            ],
        };
    }

    if (statusCode === 500) {
        response.details = {
            title: '500 - Internal Server Error',
            description: 'Something went wrong on our end. We are working to fix it.',
            suggestions: [
                'Try again in a few moments',
                'If the problem persists, contact support',
                'Check the service status page',
            ],
        };
    }

    return response;
};

// Main error handler middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json(
            formatErrorResponse(409, 'Conflict', 'A record with this value already exists', req)
        );
    }

    if (err.code === 'P2025') {
        return res.status(404).json(
            formatErrorResponse(404, 'Not Found', 'Record not found', req)
        );
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json(
            formatErrorResponse(401, 'Unauthorized', 'Invalid token', req)
        );
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json(
            formatErrorResponse(401, 'Unauthorized', 'Token expired', req)
        );
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            error: 'Validation Error',
            message: err.message,
            details: err.details,
            timestamp: new Date().toISOString(),
            path: req.path,
        });
    }

    // 403 Forbidden Error
    if (err.statusCode === 403 || err.name === 'ForbiddenError') {
        return res.status(403).json(
            formatErrorResponse(403, 'Forbidden', err.message || 'Access forbidden', req)
        );
    }

    // 500 Internal Server Error
    const statusCode = err.statusCode || 500;
    const response = formatErrorResponse(
        statusCode,
        err.name || 'Internal Server Error',
        err.message || 'Something went wrong',
        req
    );

    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development' && statusCode === 500) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
