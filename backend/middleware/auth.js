import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// JWT authentication middleware
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided.'
            });
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token missing.'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user and exclude password
            const user = await User.findById(decoded.id)
                .select('-password')
                .populate('membership');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }

            if (user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Account is not active. Please contact support.'
                });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please log in again.'
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token format.'
                });
            } else {
                throw jwtError;
            }
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication'
        });
    }
};

// Optional authentication - sets user if token is valid, but doesn't require it
export const optionalAuth = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No token provided, continue without user
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id)
            .select('-password')
            .populate('membership');

        if (user && user.status === 'active') {
            req.user = user;
        }
    } catch (error) {
        // Silently ignore token errors for optional auth
    }

    next();
};

// Role-based authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Permission-based authorization
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!req.user.hasPermission(permission)) {
            return res.status(403).json({
                success: false,
                message: `Permission '${permission}' required`
            });
        }

        next();
    };
};

// Membership requirement middleware
export const requireMembership = (membershipTypes = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!req.user.isMember) {
            return res.status(403).json({
                success: false,
                message: 'Active membership required'
            });
        }

        if (membershipTypes.length > 0 && !membershipTypes.includes(req.user.membership.type)) {
            return res.status(403).json({
                success: false,
                message: `Membership type must be one of: ${membershipTypes.join(', ')}`
            });
        }

        next();
    };
};

// Self or admin authorization (user can access their own data or admin can access any)
export const selfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const userId = req.params.userId || req.params.id;

    if (req.user.id === userId || ['admin', 'super_admin'].includes(req.user.role)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied. Can only access own data.'
    });
};

// WeChat Mini Program authentication
export const wechatMiniAuth = async (req, res, next) => {
    try {
        const { code, encryptedData, iv } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'WeChat authorization code required'
            });
        }

        // This will be implemented in the WeChat service
        // For now, just pass through
        req.wechatCode = code;
        req.wechatEncryptedData = encryptedData;
        req.wechatIv = iv;

        next();
    } catch (error) {
        console.error('WeChat Mini Program auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'WeChat authentication failed'
        });
    }
};

// Rate limiting per user
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next(); // Skip rate limiting for unauthenticated requests
        }

        const userId = req.user.id;
        const now = Date.now();
        const windowStart = now - windowMs;

        if (!userRequests.has(userId)) {
            userRequests.set(userId, []);
        }

        const requests = userRequests.get(userId);

        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => timestamp > windowStart);

        if (validRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        validRequests.push(now);
        userRequests.set(userId, validRequests);

        next();
    };
};

// Check if user owns the resource or is admin
export const resourceOwner = (resourceIdParam = 'id', userField = 'user') => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Admins can access any resource
            if (['admin', 'super_admin'].includes(req.user.role)) {
                return next();
            }

            const resourceId = req.params[resourceIdParam];

            // If checking user resource directly
            if (resourceIdParam === 'userId' || resourceIdParam === 'id') {
                if (req.user.id === resourceId) {
                    return next();
                }
            } else {
                // For other resources, we need to check the resource's user field
                // This would require loading the resource and checking ownership
                // Implementation depends on the specific resource model
                req.resourceId = resourceId;
                req.userField = userField;
                return next(); // Let the route handler verify ownership
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        } catch (error) {
            console.error('Resource owner check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};