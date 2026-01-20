require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

const isDevelopment = process.env.NODE_ENV === 'development';

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : (isDevelopment ? ['http://localhost:3000', 'http://localhost:5173'] : [process.env.FRONTEND_URL]);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin))
        {
            callback(null, true);
        }
        else
        {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.'
});

app.use(express.json({ limit: '10kb' }));

app.use(limiter);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

app.set('pool', pool);

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const guestRoutes = require('./routes/guests');
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/guests', guestRoutes);

app.get('/health', async (req, res) => {
    try
    {
        await pool.query('SELECT 1');
        res.json({
            status: 'ok',
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });
    }
    catch (error)
    {
        res.status(503).json({
            status: 'error',
            message: 'Database connection failed'
        });
    }
});

app.get('/api/test-email', async (req, res) => {
    try
    {
        console.log('Testing SMTP connection to:', process.env.EMAIL_USER);
        await transporter.verify();
        res.json({ success: true, message: 'SMTP connection successful' });
    }
    catch (error)
    {
        console.error('SMTP test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code,
            config: {
                host: transporter.options.host,
                port: transporter.options.port,
                user: process.env.EMAIL_USER ? '***' : 'NOT SET'
            }
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    if (err.message === 'Not allowed by CORS')
    {
        return res.status(403).json({ error: 'CORS policy violation' });
    }

    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing gracefully...');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);