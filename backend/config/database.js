import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI;

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        });

        console.log(`🗄️  MongoDB Connected: ${conn.connection.host}`);

        // Handle connection errors
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        // Graceful shutdown - but don't exit on SIGINT for demo
        // process.on('SIGINT', async () => {
        //     await mongoose.connection.close();
        //     console.log('MongoDB connection closed through app termination');
        //     process.exit(0);
        // });

    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;