// Custom error class
export class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.errorCode = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Handle Mongoose CastError (invalid ObjectId)
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400, 'INVALID_ID');
};

// Handle Mongoose duplicate key error
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400, 'DUPLICATE_FIELD');
};

// Handle Mongoose validation error
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400, 'VALIDATION_ERROR');
};

// Handle JWT invalid token error
const handleJWTError = () =>
    new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');

// Handle JWT expired token error
const handleJWTExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');

// Send error response in development
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err,
        message: err.message,
        errorCode: err.errorCode,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
};

// Send error response in production
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            errorCode: err.errorCode,
            timestamp: new Date().toISOString()
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥:', err);

        res.status(500).json({
            success: false,
            status: 'error',
            message: 'Something went wrong!',
            errorCode: 'INTERNAL_SERVER_ERROR',
            timestamp: new Date().toISOString()
        });
    }
};

// Main error handling middleware
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

// Async error handler wrapper
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// 404 handler for unmatched routes
export const notFound = (req, res, next) => {
    const err = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
    next(err);
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
    const formatted = {};

    Object.keys(errors).forEach(key => {
        const error = errors[key];

        if (error.kind === 'required') {
            formatted[key] = `${key} is required`;
        } else if (error.kind === 'unique') {
            formatted[key] = `${key} must be unique`;
        } else if (error.kind === 'minlength') {
            formatted[key] = `${key} must be at least ${error.properties.minlength} characters`;
        } else if (error.kind === 'maxlength') {
            formatted[key] = `${key} must be no more than ${error.properties.maxlength} characters`;
        } else if (error.kind === 'min') {
            formatted[key] = `${key} must be at least ${error.properties.min}`;
        } else if (error.kind === 'max') {
            formatted[key] = `${key} must be no more than ${error.properties.max}`;
        } else if (error.kind === 'enum') {
            formatted[key] = `${key} must be one of: ${error.properties.enumValues.join(', ')}`;
        } else {
            formatted[key] = error.message;
        }
    });

    return formatted;
};

// WeChat API error handler
export const handleWechatError = (error) => {
    const wechatErrorCodes = {
        '-1': 'System busy, please try again later',
        '0': 'Success',
        '40001': 'Invalid app_secret',
        '40002': 'Invalid grant_type',
        '40003': 'Invalid openid',
        '40013': 'Invalid appid',
        '40014': 'Invalid access_token',
        '40029': 'Invalid code',
        '45011': 'API minute-quota reach limit',
        '40125': 'Invalid app_secret',
        '41002': 'Missing appid parameter',
        '41004': 'Missing app_secret parameter',
        '41008': 'Missing code parameter'
    };

    const errorCode = error.errcode || error.error_code;
    const message = wechatErrorCodes[errorCode] || error.errmsg || 'WeChat API error';

    return new AppError(message, 400, `WECHAT_ERROR_${errorCode}`);
};

// Payment error handler
export const handlePaymentError = (error, paymentMethod = 'unknown') => {
    const errorMessages = {
        'INVALID_AMOUNT': 'Invalid payment amount',
        'INSUFFICIENT_FUNDS': 'Insufficient funds',
        'PAYMENT_FAILED': 'Payment processing failed',
        'REFUND_FAILED': 'Refund processing failed',
        'PAYMENT_EXPIRED': 'Payment session expired',
        'DUPLICATE_PAYMENT': 'Duplicate payment detected'
    };

    const message = errorMessages[error.code] || `Payment error: ${error.message}`;
    return new AppError(message, 400, `PAYMENT_ERROR_${paymentMethod.toUpperCase()}`);
};

// Booking conflict error
export const bookingConflictError = (conflictDetails) => {
    return new AppError(
        `Booking conflict: ${conflictDetails.message}`,
        409,
        'BOOKING_CONFLICT'
    );
};

// Resource not found error
export const resourceNotFound = (resourceType, id) => {
    return new AppError(
        `${resourceType} not found with id: ${id}`,
        404,
        'RESOURCE_NOT_FOUND'
    );
};

// Validation helper for request body
export const validateRequiredFields = (requiredFields, body) => {
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
        throw new AppError(
            `Missing required fields: ${missingFields.join(', ')}`,
            400,
            'MISSING_REQUIRED_FIELDS'
        );
    }
};

// Rate limit error
export const rateLimitError = (retryAfter) => {
    return new AppError(
        'Too many requests, please try again later',
        429,
        'RATE_LIMIT_EXCEEDED',
        { retryAfter }
    );
};

// Business logic error
export const businessLogicError = (message, code = 'BUSINESS_LOGIC_ERROR') => {
    return new AppError(message, 422, code);
};