const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { verifyEmailDomain, generateVerificationToken, sendVerificationEmail } = require('../utils/emailService');

const validateInput = (data, fields) => {
    const errors = {};
    fields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim()))
        {
            errors[field] = `${field} is required`;
        }
    });
    return errors;
};

const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-zA-Z]/.test(password)) return 'Password must contain an alphabet';
    if (!/[0-9]/.test(password)) return 'Password must contain number';
    return null;
};

const generateTokens = (userId, email) => {
    const accessToken = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId, email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

router.post('/register', async (req, res) => {
    console.log('Registration request recieved');
    console.log('Request body:', req.body);
    const { username, email, password } = req.body;

    const errors = validateInput({ username, email, password }, ['username', 'email', 'password']);

    if (Object.keys(errors).length > 0)
    {
        console.log('Validation errors:', errors);
        return res.status(400).json({ errors });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
    {
        return res.status(400).json({ error: 'Invalid email address format' });
    }

    if (username.length < 3)
    {
        return res.status(400).json({ error: 'Username must be more than 3 characters long' });
    }

    const passwordError = validatePassword(password);
    if (passwordError)
    {
        return res.status(400).json({ error: passwordError });
    }

    console.log('Input validation passed');
    console.log('Checking email domain...');

    const domainValid = await verifyEmailDomain(email);
    if (!domainValid)
    {
        console.log('Email domain verification failed:', email);
        return res.status(400).json({ error: 'Email domain does not exist' });
    }

    console.log('Email domain valid');

    try
    {
        const pool = req.app.get('pool');

        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0)
        {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        console.log('Proceeding with registration');

        const verification_token = generateVerificationToken();
        const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log('Attempting to send verification email...');
        const appUrl = process.env.FRONTEND_URL || process.env.APP_URL;
        const emailSent = await sendVerificationEmail(email, verification_token, username, appUrl);

        if (!emailSent)
        {
            console.log('Failed to send verification email');
            return res.status(400).json({ error: 'Failed to send verification email. Please check your email address and try again.' });
        }

        console.log('Verification email sent successfully \n Inserting user into database...');

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, created_at, email_verified',
            [username, email, password_hash, verification_token, verification_token_expires]
        );

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            user: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/verify-email/:token', async (req, res) => {
    const { token } = req.params;

    try
    {
        const pool = req.app.get('pool');

        const result = await pool.query(
            'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0)
        {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        await pool.query(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE verification_token = $1',
            [token]
        );

        res.json({ message: 'Email verified successfully! You can now login.' });
    }
    catch (error)
    {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const errors = validateInput({ email, password }, ['email', 'password']);
    if (Object.keys(errors).length > 0)
    {
        return res.status(400).json({ errors });
    }

    try
    {
        const pool = req.app.get('pool');

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0)
        {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        if (!user.email_verified)
        {
            return res.status(401).json({ error: 'Please verify your email before logging in' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword)
        {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens(user.id, user.email);

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        });
    }
    catch (error)
    {
        console.error('Login error details:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
    {
        return res.status(400).json({ errors: 'Refresh token required' });
    }

    try
    {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.email);

        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error)
    {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

module.exports = router;