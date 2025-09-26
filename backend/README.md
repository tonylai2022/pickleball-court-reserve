# Pickleball Court Booking Backend

A comprehensive Node.js backend for a pickleball court booking system with WeChat integration, real-time features, and payment processing.

## 🚀 Features

### Core Features
- **User Authentication**: JWT-based auth with WeChat OAuth & Mini Program login
- **Court Management**: Full CRUD operations for courts with availability tracking
- **Booking System**: Advanced booking with equipment rental and conflict prevention
- **Payment Integration**: WeChat Pay integration with refund support
- **Real-time Updates**: WebSocket-powered live notifications
- **Equipment Management**: Racquet and ball rental tracking
- **Membership System**: Tiered membership with benefits and discounts

### WeChat Integration
- **WeChat OAuth**: Web and H5 login support
- **Mini Program**: Complete mini program session management
- **WeChat Pay**: Native payment processing with webhooks
- **Template Messages**: Automated notification system

### Technical Features
- **MongoDB**: Robust data modeling with Mongoose
- **Socket.IO**: Real-time bidirectional communication
- **Express.js**: RESTful API with comprehensive middleware
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Centralized error management with logging

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.4.0
- npm >= 8.0.0

## 🛠️ Installation

### Quick Setup (Windows)
```bash
# Run the setup script
./setup.bat
```

### Quick Setup (Linux/macOS)
```bash
# Make setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Manual Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Create required directories**
   ```bash
   mkdir -p logs uploads/courts uploads/users
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

## ⚙️ Configuration

### Environment Variables

Key configuration in `.env`:

```env
# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/pickleball-booking

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# WeChat Configuration
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_MINI_APP_ID=your-mini-program-app-id
WECHAT_MINI_APP_SECRET=your-mini-program-app-secret

# WeChat Pay
WECHAT_MCH_ID=your-merchant-id
WECHAT_PAY_KEY=your-wechat-pay-key
WECHAT_NOTIFY_URL=http://localhost:3000/api/payments/wechat/notify
```

### WeChat Configuration Setup

1. **WeChat Official Account**:
   - Register at: https://mp.weixin.qq.com
   - Get App ID and App Secret
   - Set OAuth redirect URI: `{YOUR_DOMAIN}/api/auth/wechat/callback`

2. **WeChat Mini Program**:
   - Register at: https://mp.weixin.qq.com
   - Get Mini Program App ID and Secret
   - Configure server domain: `{YOUR_DOMAIN}`

3. **WeChat Pay**:
   - Apply for WeChat Pay: https://pay.weixin.qq.com
   - Get Merchant ID and API Key
   - Configure notification URL: `{YOUR_DOMAIN}/api/payments/wechat/notify`

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Available Scripts
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run test` - Run test suite
- `npm run lint` - Lint code with ESLint

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Traditional registration |
| POST | `/auth/login` | Traditional login |
| POST | `/auth/wechat/login` | WeChat OAuth login |
| POST | `/auth/wechat/decrypt` | Decrypt mini program data |
| GET | `/auth/profile` | Get user profile |
| PATCH | `/auth/profile` | Update user profile |

### Court Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courts` | List all courts |
| GET | `/courts/:id` | Get court details |
| POST | `/courts` | Create new court (admin) |
| PATCH | `/courts/:id` | Update court (admin) |
| GET | `/courts/:id/availability` | Check court availability |

### Booking System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List user bookings |
| POST | `/bookings` | Create new booking |
| GET | `/bookings/:id` | Get booking details |
| PATCH | `/bookings/:id` | Update booking status |
| GET | `/bookings/stats/summary` | Booking statistics (admin) |

### Payment Processing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/wechat/notify` | WeChat payment webhook |
| GET | `/payments/:id/status` | Check payment status |
| POST | `/payments/:id/refund` | Process refund |
| GET | `/payments/history` | Payment history |

### WebSocket Events

#### Client Events
- `join:bookings` - Subscribe to booking updates
- `subscribe:court` - Subscribe to specific court updates
- `booking:status` - Request booking status update

#### Server Events
- `booking:new` - New booking created
- `booking:updated` - Booking status changed
- `court:availability_changed` - Court availability updated
- `payment:updated` - Payment status changed

## 📊 Database Schema

### Collections
- **users** - User profiles with WeChat integration
- **courts** - Court information and pricing
- **bookings** - Booking records with equipment
- **payments** - Payment transactions and refunds
- **equipment** - Equipment inventory tracking
- **memberships** - Membership plans and instances

## 🔐 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (user, admin, manager)
- WeChat OAuth integration
- Session management for mini programs

### API Security
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- XSS protection

### Data Security
- Bcrypt password hashing (12 rounds)
- MongoDB injection prevention
- Sensitive data exclusion in responses
- Audit logging for critical operations

## 🚨 Error Handling

### Error Types
- `ValidationError` - Input validation failures
- `AuthenticationError` - Authentication issues
- `AuthorizationError` - Access denied
- `NotFoundError` - Resource not found
- `ConflictError` - Business logic conflicts
- `PaymentError` - Payment processing issues
- `WeChatError` - WeChat API errors

### Error Response Format
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Valid email required",
        "value": "invalid-email"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Monitoring & Logging

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "connectedUsers": 5
}
```

### Logging
- Morgan HTTP request logging
- Custom error logging
- File-based logs in `./logs/app.log`
- Console logging in development

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- auth.test.js
```

### Test Categories
- Unit tests for models and utilities
- Integration tests for API endpoints
- Authentication and authorization tests
- Payment processing tests
- WebSocket functionality tests

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set up HTTPS with SSL certificates
4. Configure WeChat Pay with production credentials
5. Set up reverse proxy (nginx recommended)

### Docker Deployment
```bash
# Build Docker image
docker build -t pickleball-backend .

# Run container
docker run -p 3000:3000 --env-file .env pickleball-backend
```

### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## 📈 Performance Optimization

### Database Optimization
- MongoDB indexes for frequently queried fields
- Aggregation pipelines for statistics
- Connection pooling
- Query optimization with explain plans

### API Optimization
- Response compression with gzip
- Request rate limiting
- Caching strategies (Redis integration ready)
- Pagination for large datasets

### Real-time Features
- Socket.IO clustering support
- Room-based event broadcasting
- Connection management and cleanup

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- ESLint configuration for code quality
- Prettier for code formatting
- Conventional commit messages
- JSDoc documentation for functions

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**MongoDB Connection Issues**:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

**Port Already in Use**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**WeChat Configuration Issues**:
- Verify domain whitelist in WeChat console
- Check SSL certificates for HTTPS
- Validate webhook URLs are accessible

### Getting Help
- Create an issue on GitHub
- Check existing documentation
- Review API logs in `./logs/app.log`

---

**Built with ❤️ for the Pickleball community**