/**
 * Simple API Key Authentication Middleware
 * For production use with OpenAI Apps SDK
 */

import { Request, Response, NextFunction } from 'express';

// Simple API key validation
// In production, this should be an environment variable
const VALID_API_KEY = process.env.MCP_API_KEY || '';

// Skip auth in development mode
const SKIP_AUTH = process.env.NODE_ENV !== 'production' || !VALID_API_KEY;

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Skip auth for health check and root endpoints
    if (req.path === '/health' || req.path === '/') {
        return next();
    }

    // Skip auth in development mode
    if (SKIP_AUTH) {
        return next();
    }

    // Check for API key in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing Authorization header',
            code: 'MISSING_AUTH'
        });
        return;
    }

    // Expected format: "Bearer <api_key>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid Authorization header format. Expected: Bearer <api_key>',
            code: 'INVALID_AUTH_FORMAT'
        });
        return;
    }

    const apiKey = parts[1];
    
    if (apiKey !== VALID_API_KEY) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key',
            code: 'INVALID_API_KEY'
        });
        return;
    }

    // API key is valid, proceed
    next();
}

