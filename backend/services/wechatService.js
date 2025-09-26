import axios from 'axios';
import crypto from 'crypto';
import xml2js from 'xml2js';
import { AppError, handleWechatError } from '../middleware/errorHandler.js';

class WeChatService {
    constructor() {
        this.appId = process.env.WECHAT_APP_ID;
        this.appSecret = process.env.WECHAT_APP_SECRET;
        this.mchId = process.env.WECHAT_MCH_ID;
        this.payKey = process.env.WECHAT_PAY_KEY;
        this.notifyUrl = process.env.WECHAT_NOTIFY_URL;

        // Mini Program credentials
        this.miniAppId = process.env.WECHAT_MINI_APP_ID;
        this.miniAppSecret = process.env.WECHAT_MINI_APP_SECRET;

        // API endpoints
        this.apiBaseUrl = 'https://api.weixin.qq.com';
        this.payApiUrl = 'https://api.mch.weixin.qq.com';

        // Access token cache
        this.accessToken = null;
        this.accessTokenExpiry = null;
    }

    // Get WeChat access token
    async getAccessToken() {
        try {
            // Check if we have a valid cached token
            if (this.accessToken && this.accessTokenExpiry && Date.now() < this.accessTokenExpiry) {
                return this.accessToken;
            }

            const response = await axios.get(`${this.apiBaseUrl}/cgi-bin/token`, {
                params: {
                    grant_type: 'client_credential',
                    appid: this.appId,
                    secret: this.appSecret
                }
            });

            if (response.data.errcode) {
                throw handleWechatError(response.data);
            }

            this.accessToken = response.data.access_token;
            this.accessTokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000; // 5min buffer

            return this.accessToken;
        } catch (error) {
            throw new AppError('Failed to get WeChat access token', 500, 'WECHAT_AUTH_ERROR');
        }
    }

    // OAuth - Get user info by authorization code
    async getUserByCode(code) {
        try {
            // Exchange code for access token
            const tokenResponse = await axios.get(`${this.apiBaseUrl}/sns/oauth2/access_token`, {
                params: {
                    appid: this.appId,
                    secret: this.appSecret,
                    code: code,
                    grant_type: 'authorization_code'
                }
            });

            if (tokenResponse.data.errcode) {
                throw handleWechatError(tokenResponse.data);
            }

            const { access_token, openid, unionid, refresh_token, expires_in, scope } = tokenResponse.data;

            // Get user info
            const userResponse = await axios.get(`${this.apiBaseUrl}/sns/userinfo`, {
                params: {
                    access_token: access_token,
                    openid: openid,
                    lang: 'zh_CN'
                }
            });

            if (userResponse.data.errcode) {
                throw handleWechatError(userResponse.data);
            }

            return {
                openid,
                unionid,
                nickname: userResponse.data.nickname,
                avatarUrl: userResponse.data.headimgurl,
                gender: userResponse.data.sex,
                city: userResponse.data.city,
                province: userResponse.data.province,
                country: userResponse.data.country,
                language: userResponse.data.language,
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: expires_in,
                scope: scope
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to get user info from WeChat', 400, 'WECHAT_USER_ERROR');
        }
    }

    // Mini Program - Get session by js_code
    async getMiniProgramSession(jsCode) {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/sns/jscode2session`, {
                params: {
                    appid: this.miniAppId,
                    secret: this.miniAppSecret,
                    js_code: jsCode,
                    grant_type: 'authorization_code'
                }
            });

            if (response.data.errcode) {
                throw handleWechatError(response.data);
            }

            return {
                openid: response.data.openid,
                unionid: response.data.unionid,
                sessionKey: response.data.session_key
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to get mini program session', 400, 'WECHAT_MINI_SESSION_ERROR');
        }
    }

    // Decrypt mini program encrypted data
    decryptData(encryptedData, iv, sessionKey) {
        try {
            const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
            const encryptedBuffer = Buffer.from(encryptedData, 'base64');
            const ivBuffer = Buffer.from(iv, 'base64');

            const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
            decipher.setAutoPadding(true);

            let decrypted = decipher.update(encryptedBuffer, null, 'utf8');
            decrypted += decipher.final('utf8');

            const decryptedData = JSON.parse(decrypted);

            // Verify app id
            if (decryptedData.watermark.appid !== this.miniAppId) {
                throw new Error('Invalid app id in decrypted data');
            }

            return decryptedData;
        } catch (error) {
            throw new AppError('Failed to decrypt WeChat data', 400, 'WECHAT_DECRYPT_ERROR');
        }
    }

    // Generate WeChat Pay unified order
    async createUnifiedOrder(orderData) {
        try {
            const {
                outTradeNo,
                body,
                totalFee,
                openid,
                tradeType = 'JSAPI',
                attach = '',
                timeExpire = null
            } = orderData;

            const params = {
                appid: this.appId,
                mch_id: this.mchId,
                nonce_str: this.generateNonceStr(),
                body: body,
                out_trade_no: outTradeNo,
                total_fee: totalFee,
                spbill_create_ip: '127.0.0.1', // Should be actual client IP
                notify_url: this.notifyUrl,
                trade_type: tradeType
            };

            if (openid && tradeType === 'JSAPI') {
                params.openid = openid;
            }

            if (attach) {
                params.attach = attach;
            }

            if (timeExpire) {
                params.time_expire = timeExpire;
            }

            // Generate signature
            params.sign = this.generateSignature(params);

            // Convert to XML
            const xml = this.objectToXml(params);

            const response = await axios.post(`${this.payApiUrl}/pay/unifiedorder`, xml, {
                headers: {
                    'Content-Type': 'application/xml'
                }
            });

            const result = await this.xmlToObject(response.data);

            if (result.return_code !== 'SUCCESS') {
                throw new AppError(result.return_msg || 'WeChat Pay API error', 400, 'WECHAT_PAY_ERROR');
            }

            if (result.result_code !== 'SUCCESS') {
                throw new AppError(result.err_code_des || 'WeChat Pay order creation failed', 400, 'WECHAT_PAY_ORDER_ERROR');
            }

            // For JSAPI, generate payment parameters for frontend
            if (tradeType === 'JSAPI') {
                const paymentParams = this.generatePaymentParams(result.prepay_id);
                return {
                    ...result,
                    paymentParams
                };
            }

            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to create WeChat Pay order', 500, 'WECHAT_PAY_CREATE_ERROR');
        }
    }

    // Generate payment parameters for JSAPI
    generatePaymentParams(prepayId) {
        const params = {
            appId: this.appId,
            timeStamp: Math.floor(Date.now() / 1000).toString(),
            nonceStr: this.generateNonceStr(),
            package: `prepay_id=${prepayId}`,
            signType: 'MD5'
        };

        params.paySign = this.generateSignature(params);

        return params;
    }

    // Query WeChat Pay order status
    async queryOrder(outTradeNo, transactionId = null) {
        try {
            const params = {
                appid: this.appId,
                mch_id: this.mchId,
                nonce_str: this.generateNonceStr()
            };

            if (transactionId) {
                params.transaction_id = transactionId;
            } else {
                params.out_trade_no = outTradeNo;
            }

            params.sign = this.generateSignature(params);

            const xml = this.objectToXml(params);

            const response = await axios.post(`${this.payApiUrl}/pay/orderquery`, xml, {
                headers: {
                    'Content-Type': 'application/xml'
                }
            });

            const result = await this.xmlToObject(response.data);

            if (result.return_code !== 'SUCCESS') {
                throw new AppError(result.return_msg || 'WeChat Pay query error', 400, 'WECHAT_PAY_QUERY_ERROR');
            }

            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to query WeChat Pay order', 500, 'WECHAT_PAY_QUERY_FAILED');
        }
    }

    // Process WeChat Pay refund
    async refund(refundData) {
        try {
            const {
                outTradeNo,
                outRefundNo,
                totalFee,
                refundFee,
                refundDesc = 'Refund'
            } = refundData;

            const params = {
                appid: this.appId,
                mch_id: this.mchId,
                nonce_str: this.generateNonceStr(),
                out_trade_no: outTradeNo,
                out_refund_no: outRefundNo,
                total_fee: totalFee,
                refund_fee: refundFee,
                refund_desc: refundDesc
            };

            params.sign = this.generateSignature(params);

            const xml = this.objectToXml(params);

            const response = await axios.post(`${this.payApiUrl}/secapi/pay/refund`, xml, {
                headers: {
                    'Content-Type': 'application/xml'
                }
                // Note: In production, you need to configure client certificates for refund API
            });

            const result = await this.xmlToObject(response.data);

            if (result.return_code !== 'SUCCESS') {
                throw new AppError(result.return_msg || 'WeChat Pay refund error', 400, 'WECHAT_REFUND_ERROR');
            }

            if (result.result_code !== 'SUCCESS') {
                throw new AppError(result.err_code_des || 'WeChat Pay refund failed', 400, 'WECHAT_REFUND_FAILED');
            }

            return result;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to process WeChat Pay refund', 500, 'WECHAT_REFUND_PROCESS_ERROR');
        }
    }

    // Verify WeChat Pay notification signature
    verifyNotification(data) {
        try {
            const receivedSign = data.sign;
            delete data.sign;

            const calculatedSign = this.generateSignature(data);

            return receivedSign === calculatedSign;
        } catch (error) {
            return false;
        }
    }

    // Generate random string
    generateNonceStr() {
        return crypto.randomBytes(16).toString('hex');
    }

    // Generate WeChat Pay signature
    generateSignature(params) {
        // Sort parameters
        const sortedKeys = Object.keys(params).sort();
        const stringA = sortedKeys
            .filter(key => params[key] !== '' && params[key] != null)
            .map(key => `${key}=${params[key]}`)
            .join('&');

        const stringSignTemp = `${stringA}&key=${this.payKey}`;

        return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
    }

    // Convert object to XML
    objectToXml(obj) {
        const builder = new xml2js.Builder({
            rootName: 'xml',
            headless: true,
            renderOpts: { pretty: false }
        });
        return builder.buildObject(obj);
    }

    // Convert XML to object
    async xmlToObject(xml) {
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(xml);
        return result.xml;
    }

    // Send template message
    async sendTemplateMessage(templateData) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.post(
                `${this.apiBaseUrl}/cgi-bin/message/template/send?access_token=${accessToken}`,
                templateData
            );

            if (response.data.errcode && response.data.errcode !== 0) {
                throw handleWechatError(response.data);
            }

            return response.data;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to send WeChat template message', 500, 'WECHAT_TEMPLATE_ERROR');
        }
    }

    // Create QR code for WeChat
    async createQRCode(sceneData, expireSeconds = 2592000) {
        try {
            const accessToken = await this.getAccessToken();

            const requestData = {
                expire_seconds: expireSeconds,
                action_name: 'QR_STR_SCENE',
                action_info: {
                    scene: {
                        scene_str: sceneData
                    }
                }
            };

            const response = await axios.post(
                `${this.apiBaseUrl}/cgi-bin/qrcode/create?access_token=${accessToken}`,
                requestData
            );

            if (response.data.errcode) {
                throw handleWechatError(response.data);
            }

            return {
                ticket: response.data.ticket,
                expireSeconds: response.data.expire_seconds,
                url: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(response.data.ticket)}`
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to create WeChat QR code', 500, 'WECHAT_QR_ERROR');
        }
    }
}

export default new WeChatService();