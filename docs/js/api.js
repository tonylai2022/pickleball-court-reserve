/**
 * API Client for Pickleball Court Booking Backend
 * Handles all backend communication with proper error handling
 */
class ApiClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.socket = null;

        // Initialize WeChat SDK if available
        this.initializeWeChat();
    }

    // Initialize WeChat Mini Program or Web SDK
    initializeWeChat() {
        // Check if we're in WeChat environment
        this.isWeChat = /MicroMessenger/i.test(navigator.userAgent);
        this.isMiniProgram = window.wx && window.wx.miniProgram;

        if (this.isMiniProgram) {
            console.log('WeChat Mini Program environment detected');
        } else if (this.isWeChat) {
            console.log('WeChat Web environment detected');
        }
    }

    // HTTP request wrapper with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async loginWithWeChat(code, type = 'oauth') {
        try {
            const data = await this.request('/auth/wechat/login', {
                method: 'POST',
                body: JSON.stringify({ code, type })
            });

            if (data.success) {
                this.setAuthData(data.data);
                this.connectSocket();
                return data.data;
            }
            throw new Error('Login failed');
        } catch (error) {
            console.error('WeChat login failed:', error);
            throw error;
        }
    }

    async loginTraditional(phone, password) {
        try {
            const data = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ phone, password })
            });

            if (data.success) {
                this.setAuthData(data.data);
                this.connectSocket();
                return data.data;
            }
            throw new Error('Login failed');
        } catch (error) {
            console.error('Traditional login failed:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const data = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (data.success) {
                this.setAuthData(data.data);
                this.connectSocket();
                return data.data;
            }
            throw new Error('Registration failed');
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    async demoLogin() {
        try {
            const data = await this.request('/auth/demo-login', {
                method: 'POST'
            });
            if (data.success) {
                this.setAuthData(data.data);
                this.connectSocket();
                return data.data;
            }
            throw new Error('Demo login failed');
        } catch (error) {
            console.error('Demo login failed:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            const data = await this.request('/auth/profile');
            if (data.success) {
                this.user = data.data;
                localStorage.setItem('user', JSON.stringify(this.user));
                return data.data;
            }
            throw new Error('Failed to get profile');
        } catch (error) {
            console.error('Get profile failed:', error);
            throw error;
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    setAuthData({ user, token }) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Court methods
    async getCourts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/courts${queryString ? `?${queryString}` : ''}`;

        try {
            const data = await this.request(endpoint);
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Get courts failed:', error);
            return [];
        }
    }

    async getCourt(courtId) {
        try {
            const data = await this.request(`/courts/${courtId}`);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Get court failed:', error);
            return null;
        }
    }

    async getCourtAvailability(courtId, date) {
        try {
            const data = await this.request(`/courts/${courtId}/availability?date=${date}`);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Get court availability failed:', error);
            return null;
        }
    }

    // Booking methods
    async createBooking(bookingData) {
        try {
            const data = await this.request('/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            if (data.success) {
                return data.data;
            }
            throw new Error(data.error?.message || 'Booking creation failed');
        } catch (error) {
            console.error('Create booking failed:', error);
            throw error;
        }
    }

    async getBookings(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/bookings${queryString ? `?${queryString}` : ''}`;

        try {
            const data = await this.request(endpoint);
            return data.success ? data.data : [];
        } catch (error) {
            console.error('Get bookings failed:', error);
            return [];
        }
    }

    async getBooking(bookingId) {
        try {
            const data = await this.request(`/bookings/${bookingId}`);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Get booking failed:', error);
            return null;
        }
    }

    async updateBooking(bookingId, updates) {
        try {
            const data = await this.request(`/bookings/${bookingId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });

            if (data.success) {
                return data.data;
            }
            throw new Error('Booking update failed');
        } catch (error) {
            console.error('Update booking failed:', error);
            throw error;
        }
    }

    async cancelBooking(bookingId) {
        return this.updateBooking(bookingId, { status: 'cancelled' });
    }

    async getAvailableSlots(courtId, date) {
        try {
            const data = await this.request(`/bookings/availability/${courtId}?date=${date}`);
            return data.success ? data.data.availableSlots : [];
        } catch (error) {
            console.error('Get available slots failed:', error);
            return [];
        }
    }

    // Payment methods
    async getPaymentStatus(paymentId) {
        try {
            const data = await this.request(`/payments/${paymentId}/status`);
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Get payment status failed:', error);
            return null;
        }
    }

    async processRefund(paymentId, reason) {
        try {
            const data = await this.request(`/payments/${paymentId}/refund`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });

            if (data.success) {
                return data.data;
            }
            throw new Error('Refund processing failed');
        } catch (error) {
            console.error('Process refund failed:', error);
            throw error;
        }
    }

    // WeChat Pay integration
    async initiateWeChatPay(bookingData) {
        try {
            // This will be called when creating a booking
            // The backend will return payment parameters for WeChat Pay
            const booking = await this.createBooking(bookingData);

            if (booking.paymentParams) {
                return this.processWeChatPayment(booking.paymentParams);
            }

            throw new Error('Payment parameters not received');
        } catch (error) {
            console.error('WeChat Pay initiation failed:', error);
            throw error;
        }
    }

    async processWeChatPayment(paymentParams) {
        return new Promise((resolve, reject) => {
            if (this.isMiniProgram && window.wx) {
                // WeChat Mini Program payment
                wx.requestPayment({
                    timeStamp: paymentParams.timeStamp,
                    nonceStr: paymentParams.nonceStr,
                    package: paymentParams.package,
                    signType: paymentParams.signType,
                    paySign: paymentParams.paySign,
                    success: (res) => {
                        console.log('WeChat payment success:', res);
                        resolve(res);
                    },
                    fail: (err) => {
                        console.error('WeChat payment failed:', err);
                        reject(new Error('Payment failed'));
                    }
                });
            } else if (this.isWeChat) {
                // WeChat Browser payment - redirect to WeChat Pay
                // In real implementation, this would use WeixinJSBridge
                console.log('WeChat browser payment not fully implemented in demo');
                // Simulate payment success for demo
                setTimeout(() => resolve({ success: true }), 1000);
            } else {
                // Non-WeChat environment - show QR code or redirect
                console.log('Non-WeChat payment not implemented');
                reject(new Error('WeChat payment only supported in WeChat environment'));
            }
        });
    }

    // WebSocket connection for real-time updates
    connectSocket() {
        if (!this.token) return;

        try {
            // Use Socket.IO client
            this.socket = io('http://localhost:3000', {
                auth: {
                    token: this.token
                }
            });

            this.socket.on('connect', () => {
                console.log('WebSocket connected');
                // Join booking updates room
                this.socket.emit('join:bookings');
            });

            this.socket.on('disconnect', () => {
                console.log('WebSocket disconnected');
            });

            // Listen for booking updates
            this.socket.on('booking:new', (data) => {
                console.log('New booking received:', data);
                this.handleBookingUpdate(data);
            });

            this.socket.on('booking:updated', (data) => {
                console.log('Booking updated:', data);
                this.handleBookingUpdate(data);
            });

            this.socket.on('court:availability_changed', (data) => {
                console.log('Court availability changed:', data);
                this.handleAvailabilityUpdate(data);
            });

            this.socket.on('payment:updated', (data) => {
                console.log('Payment updated:', data);
                this.handlePaymentUpdate(data);
            });

            this.socket.on('notification', (data) => {
                console.log('Notification received:', data);
                this.handleNotification(data);
            });

        } catch (error) {
            console.error('Socket connection failed:', error);
        }
    }

    // Event handlers for real-time updates
    handleBookingUpdate(data) {
        // Emit custom event for the app to handle
        window.dispatchEvent(new CustomEvent('bookingUpdate', { detail: data }));
    }

    handleAvailabilityUpdate(data) {
        window.dispatchEvent(new CustomEvent('availabilityUpdate', { detail: data }));
    }

    handlePaymentUpdate(data) {
        window.dispatchEvent(new CustomEvent('paymentUpdate', { detail: data }));
    }

    handleNotification(data) {
        window.dispatchEvent(new CustomEvent('notification', { detail: data }));
    }

    // Subscribe to court updates
    subscribeToCourtUpdates(courtId) {
        if (this.socket) {
            this.socket.emit('subscribe:court', { courtId });
        }
    }

    unsubscribeFromCourtUpdates(courtId) {
        if (this.socket) {
            this.socket.emit('unsubscribe:court', { courtId });
        }
    }

    // Health check
    async healthCheck() {
        try {
            const response = await fetch('http://localhost:3000/health');
            const data = await response.json();
            return data.status === 'OK';
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    formatDate(date) {
        return date instanceof Date ? date.toISOString().split('T')[0] : date;
    }

    formatTime(time) {
        return time.padStart(5, '0'); // Ensure HH:MM format
    }
}

// Create global API client instance
window.apiClient = new ApiClient();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}