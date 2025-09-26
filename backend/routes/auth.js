import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import WeChatService from '../services/wechatService.js';

const router = express.Router();

// Validation schemas
const registerValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('phone').isMobilePhone('zh-CN').withMessage('Valid Chinese phone number required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('phone').isMobilePhone('zh-CN').withMessage('Valid phone number required'),
    body('password').isLength({ min: 1 }).withMessage('Password required')
];

const wechatLoginValidation = [
    body('code').isString().isLength({ min: 1 }).withMessage('WeChat code required'),
    body('type').isIn(['oauth', 'miniprogram']).withMessage('Valid login type required')
];

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Traditional registration with phone and password
router.post('/register', registerValidation, validateRequest, async (req, res, next) => {
    try {
        const { name, phone, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            throw new AppError('User with this phone number already exists', 409);
        }

        if (email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                throw new AppError('User with this email already exists', 409);
            }
        }

        // Use phone as username to guarantee uniqueness and avoid nickname conflicts
        const username = phone;

        // Create user (let pre-save hook hash password)
        const user = new User({
            username,
            phone,
            email,
            password: password || undefined,
            // Preserve display name in profile for frontend friendliness
            profile: {
                firstName: name
            }
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response and add a friendly display name
        const userResponse = user.toObject();
        userResponse.name = name || user.profile?.firstName || user.username;
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// Traditional login with phone and password
router.post('/login', loginValidation, validateRequest, async (req, res, next) => {
    try {
        const { phone, password } = req.body;

        // Find user and include password for verification
        const user = await User.findOne({ phone }).select('+password');

        if (!user || !user.password) {
            throw new AppError('Invalid credentials', 401);
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError('Invalid credentials', 401);
        }

        // Account status handling (disabled for demo to avoid blocking logins)
        // In production, consider blocking banned/suspended accounts here.

        // Update last login info
        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response and add a friendly display name
        const userResponse = user.toObject();
        userResponse.name = user.profile?.firstName || user.username;
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// Demo login: upsert a known active demo user and issue a token
router.post('/demo-login', async (req, res, next) => {
    try {
        const demoPhone = '13800138000';
        const demoPassword = 'password123';
        const demoName = 'Demo User';

        let user = await User.findOne({ phone: demoPhone }).select('+password');

        if (user) {
            // If user exists, ensure they are active and password is correct
            user.status = 'active';
            if (!user.password) {
                user.password = demoPassword;
            }
            await user.save();
        } else {
            // Create a new demo user if one doesn't exist
            user = new User({
                username: demoPhone,
                phone: demoPhone,
                profile: { firstName: demoName },
                password: demoPassword,
                status: 'active',
            });
            await user.save();
        }

        // Generate token
        const token = generateToken(user._id);

        const userResponse = user.toObject();
        userResponse.name = user.profile?.firstName || user.username;
        delete userResponse.password;

        res.json({
            success: true,
            data: {
                user: userResponse,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

// WeChat OAuth login (for web and H5)
router.post('/wechat/login', wechatLoginValidation, validateRequest, async (req, res, next) => {
    try {
        const { code, type } = req.body;

        let wechatUserData;

        if (type === 'oauth') {
            // WeChat OAuth for web/H5
            wechatUserData = await WeChatService.getUserByCode(code);
        } else if (type === 'miniprogram') {
            // WeChat Mini Program login
            wechatUserData = await WeChatService.getMiniProgramSession(code);
        }

        if (!wechatUserData || !wechatUserData.openid) {
            throw new AppError('Failed to get WeChat user information', 400);
        }

        // Find user by openid or unionid
        let user = await User.findOne({
            $or: [
                { 'wechatInfo.openid': wechatUserData.openid },
                { 'wechatInfo.unionid': wechatUserData.unionid }
            ]
        });

        if (user) {
            // Update existing user's WeChat info
            user.wechatInfo = {
                ...user.wechatInfo,
                openid: wechatUserData.openid,
                unionid: wechatUserData.unionid,
                nickname: wechatUserData.nickname || user.wechatInfo.nickname,
                avatarUrl: wechatUserData.avatarUrl || user.wechatInfo.avatarUrl,
                gender: wechatUserData.gender || user.wechatInfo.gender,
                city: wechatUserData.city || user.wechatInfo.city,
                province: wechatUserData.province || user.wechatInfo.province,
                country: wechatUserData.country || user.wechatInfo.country,
                language: wechatUserData.language || user.wechatInfo.language
            };

            user.lastLogin = new Date();
            await user.save();
        } else {
            // Create new user
            // Ensure required fields align with schema
            const wxNickname = wechatUserData.nickname || 'WeChat User';
            const generatedUsername = `wx_${wechatUserData.openid}`;

            user = new User({
                username: generatedUsername,
                status: 'active',
                wechatInfo: {
                    openid: wechatUserData.openid,
                    unionid: wechatUserData.unionid,
                    nickname: wxNickname,
                    avatarUrl: wechatUserData.avatarUrl,
                    gender: wechatUserData.gender,
                    city: wechatUserData.city,
                    province: wechatUserData.province,
                    country: wechatUserData.country,
                    language: wechatUserData.language
                },
                profile: {
                    firstName: wxNickname
                }
            });

            await user.save();
        }

        // Generate token
        const token = generateToken(user._id);

        const wechatUserResponse = user.toObject();
        wechatUserResponse.name = user.profile?.firstName || user.wechatInfo?.nickname || user.username;

        res.json({
            success: true,
            data: {
                user: wechatUserResponse,
                token,
                isNewUser: !user.phone // If no phone, it's likely a new user
            }
        });

    } catch (error) {
        next(error);
    }
});

// WeChat Mini Program decrypt user info
router.post('/wechat/decrypt', authenticate, validateRequest, async (req, res, next) => {
    try {
        const { encryptedData, iv } = req.body;

        if (!encryptedData || !iv) {
            throw new AppError('Encrypted data and IV are required', 400);
        }

        const user = await User.findById(req.user.id);
        if (!user || !user.wechatInfo?.sessionKey) {
            throw new AppError('WeChat session not found', 400);
        }

        // Decrypt user info
        const decryptedData = WeChatService.decryptData(
            encryptedData,
            iv,
            user.wechatInfo.sessionKey
        );

        // Update user information
        user.wechatInfo = {
            ...user.wechatInfo,
            nickname: decryptedData.nickName,
            avatarUrl: decryptedData.avatarUrl,
            gender: decryptedData.gender,
            city: decryptedData.city,
            province: decryptedData.province,
            country: decryptedData.country,
            language: decryptedData.language
        };

        // Update name if not set
        if (!user.name || user.name === 'WeChat User') {
            user.name = decryptedData.nickName;
        }

        await user.save();

        res.json({
            success: true,
            data: {
                user: user.toObject()
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('membership.plan', 'name benefits')
            .select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
});

// Update user profile
router.patch('/profile', authenticate, validateRequest, async (req, res, next) => {
    try {
        const allowedUpdates = ['name', 'email', 'preferences', 'emergencyContact'];
        const updates = {};

        // Filter allowed updates
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        // Validate email if provided
        if (updates.email) {
            const existingUser = await User.findOne({
                email: updates.email,
                _id: { $ne: req.user.id }
            });

            if (existingUser) {
                throw new AppError('Email already in use', 409);
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
});

// Bind phone number to WeChat account
router.post('/bind-phone', authenticate, validateRequest, async (req, res, next) => {
    try {
        const { phone, code } = req.body;

        if (!phone) {
            throw new AppError('Phone number required', 400);
        }

        // In production, verify SMS code here
        if (!code || code !== '123456') { // Mock verification
            throw new AppError('Invalid verification code', 400);
        }

        // Check if phone is already bound to another account
        const existingUser = await User.findOne({
            phone,
            _id: { $ne: req.user.id }
        });

        if (existingUser) {
            throw new AppError('Phone number already bound to another account', 409);
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { phone, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
});

// Refresh token
router.post('/refresh', authenticate, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user || !user.isActive) {
            throw new AppError('User not found or inactive', 401);
        }

        // Generate new token
        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                user,
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

// Logout (mainly for logging purposes)
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        // In a more sophisticated setup, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        next(error);
    }
});

export default router;