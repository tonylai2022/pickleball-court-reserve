import express from 'express';
import crypto from 'crypto';
import { validateRequest } from '../middleware/validation.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import WeChatService from '../services/wechatService.js';
import SocketHandler from '../services/socketHandler.js';

const router = express.Router();

// WeChat Pay notification webhook
router.post('/wechat/notify', async (req, res, next) => {
    try {
        // Parse XML data from WeChat
        const xmlData = req.body;
        const data = await WeChatService.xmlToObject(xmlData);

        // Verify signature
        const isValid = WeChatService.verifyNotification(data);
        if (!isValid) {
            throw new AppError('Invalid notification signature', 400);
        }

        const {
            out_trade_no,
            transaction_id,
            total_fee,
            return_code,
            result_code,
            attach
        } = data;

        // Parse attach data to get booking info
        let attachData = {};
        try {
            attachData = JSON.parse(attach || '{}');
        } catch (error) {
            console.error('Failed to parse attach data:', error);
        }

        // Find payment record
        const payment = await Payment.findOne({
            $or: [
                { 'wechatData.outTradeNo': out_trade_no },
                { _id: attachData.bookingId }
            ]
        }).populate('booking user');

        if (!payment) {
            console.error('Payment not found for notification:', out_trade_no);
            return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Payment not found]]></return_msg></xml>');
        }

        // Process payment based on result
        if (return_code === 'SUCCESS' && result_code === 'SUCCESS') {
            // Payment successful
            payment.status = 'completed';
            payment.wechatData = {
                ...payment.wechatData,
                transactionId: transaction_id,
                outTradeNo: out_trade_no,
                totalFee: total_fee,
                completedAt: new Date()
            };

            await payment.save();

            // Update booking status
            if (payment.booking) {
                const booking = await Booking.findById(payment.booking);
                if (booking && booking.status === 'pending') {
                    booking.status = 'confirmed';
                    booking.confirmedAt = new Date();
                    await booking.save();

                    // Notify via WebSocket
                    if (req.app.socketHandler) {
                        req.app.socketHandler.notifyBookingUpdate(booking, 'pending');
                        req.app.socketHandler.notifyPaymentUpdate(payment);
                    }
                }
            }

            console.log(`Payment completed: ${out_trade_no}`);
        } else {
            // Payment failed
            payment.status = 'failed';
            payment.wechatData = {
                ...payment.wechatData,
                failureReason: data.err_code_des || 'Payment failed',
                failedAt: new Date()
            };

            await payment.save();

            // Update booking status
            if (payment.booking) {
                const booking = await Booking.findById(payment.booking);
                if (booking && booking.status === 'pending') {
                    booking.status = 'cancelled';
                    booking.cancelledAt = new Date();
                    booking.cancellationReason = 'Payment failed';
                    await booking.save();
                }
            }

            console.log(`Payment failed: ${out_trade_no} - ${data.err_code_des}`);
        }

        // Return success response to WeChat
        res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');

    } catch (error) {
        console.error('WeChat payment notification error:', error);
        res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[System error]]></return_msg></xml>');
    }
});

// WeChat refund notification webhook
router.post('/wechat/refund-notify', async (req, res, next) => {
    try {
        const xmlData = req.body;
        const data = await WeChatService.xmlToObject(xmlData);

        // Verify signature
        const isValid = WeChatService.verifyNotification(data);
        if (!isValid) {
            throw new AppError('Invalid refund notification signature', 400);
        }

        const {
            out_trade_no,
            out_refund_no,
            refund_id,
            refund_fee,
            refund_status
        } = data;

        // Find payment record
        const payment = await Payment.findOne({
            'wechatData.outTradeNo': out_trade_no
        }).populate('booking user');

        if (!payment) {
            console.error('Payment not found for refund notification:', out_trade_no);
            return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Payment not found]]></return_msg></xml>');
        }

        // Update refund status
        if (refund_status === 'SUCCESS') {
            payment.status = 'refunded';
            payment.refund = {
                ...payment.refund,
                wechatRefundId: refund_id,
                outRefundNo: out_refund_no,
                amount: refund_fee / 100, // Convert from cents
                status: 'completed',
                completedAt: new Date()
            };

            await payment.save();

            // Notify via WebSocket
            if (req.app.socketHandler) {
                req.app.socketHandler.notifyPaymentUpdate(payment);
            }

            console.log(`Refund completed: ${out_refund_no}`);
        } else {
            console.log(`Refund failed: ${out_refund_no}`);
        }

        res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');

    } catch (error) {
        console.error('WeChat refund notification error:', error);
        res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[System error]]></return_msg></xml>');
    }
});

// Get payment status
router.get('/:id/status', async (req, res, next) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate('booking', 'status date startTime endTime')
            .populate('user', 'name phone');

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        // If payment is still pending, check with WeChat
        if (payment.status === 'pending' && payment.wechatData?.outTradeNo) {
            try {
                const wechatStatus = await WeChatService.queryOrder(payment.wechatData.outTradeNo);

                if (wechatStatus.trade_state === 'SUCCESS') {
                    // Update payment status
                    payment.status = 'completed';
                    payment.wechatData.transactionId = wechatStatus.transaction_id;
                    payment.wechatData.completedAt = new Date();
                    await payment.save();

                    // Update booking if needed
                    if (payment.booking && payment.booking.status === 'pending') {
                        const booking = await Booking.findById(payment.booking._id);
                        booking.status = 'confirmed';
                        booking.confirmedAt = new Date();
                        await booking.save();
                    }
                } else if (wechatStatus.trade_state === 'CLOSED' || wechatStatus.trade_state === 'PAYERROR') {
                    payment.status = 'failed';
                    payment.wechatData.failureReason = wechatStatus.trade_state_desc;
                    await payment.save();
                }
            } catch (error) {
                console.error('Failed to check WeChat payment status:', error);
            }
        }

        res.json({
            success: true,
            data: {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                method: payment.method,
                createdAt: payment.createdAt,
                booking: payment.booking,
                refund: payment.refund
            }
        });

    } catch (error) {
        next(error);
    }
});

// Initiate refund
router.post('/:id/refund', async (req, res, next) => {
    try {
        const { reason, amount } = req.body;

        const payment = await Payment.findById(req.params.id)
            .populate('booking')
            .populate('user');

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        if (payment.status !== 'completed') {
            throw new AppError('Can only refund completed payments', 400);
        }

        if (payment.refund && payment.refund.status === 'completed') {
            throw new AppError('Payment already refunded', 400);
        }

        const refundAmount = amount || payment.amount;
        if (refundAmount > payment.amount) {
            throw new AppError('Refund amount cannot exceed payment amount', 400);
        }

        // Process WeChat refund
        const refundResult = await WeChatService.refund({
            outTradeNo: payment.wechatData.outTradeNo,
            outRefundNo: `REFUND_${payment._id}_${Date.now()}`,
            totalFee: Math.round(payment.amount * 100),
            refundFee: Math.round(refundAmount * 100),
            refundDesc: reason || 'Booking cancellation'
        });

        // Update payment record
        payment.refund = {
            amount: refundAmount,
            reason: reason || 'Booking cancellation',
            wechatRefundId: refundResult.refund_id,
            outRefundNo: refundResult.out_refund_no,
            status: 'processing',
            initiatedAt: new Date()
        };

        if (refundResult.result_code === 'SUCCESS') {
            payment.status = 'refunded';
            payment.refund.status = 'completed';
            payment.refund.completedAt = new Date();
        }

        await payment.save();

        res.json({
            success: true,
            data: {
                paymentId: payment._id,
                refundAmount,
                status: payment.refund.status,
                refundId: refundResult.refund_id
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get payment history (for user or admin)
router.get('/history', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, method, userId } = req.query;

        let query = {};

        // Regular users can only see their own payments
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'manager') {
            query.user = req.user.id;
        } else if (userId) {
            query.user = userId;
        }

        if (status) {
            query.status = status;
        }

        if (method) {
            query.method = method;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            populate: [
                { path: 'user', select: 'name phone wechatInfo.nickname' },
                { path: 'booking', select: 'date startTime endTime status', populate: { path: 'court', select: 'name' } }
            ],
            sort: { createdAt: -1 }
        };

        const result = await Payment.paginate(query, options);

        res.json({
            success: true,
            data: result.docs,
            pagination: {
                total: result.totalDocs,
                pages: result.totalPages,
                page: result.page,
                limit: result.limit,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage
            }
        });

    } catch (error) {
        next(error);
    }
});

export default router;