const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { verifyEmailDomain, sendGuestInvitationEmail } = require('../utils/emailService');

const validateGuestData = (data) => {
    const errors = {};

    if (!data.name || !data.name.trim())
    {
        errors.name = 'Guest name is required';
    }
    else if (data.name.length > 255)
    {
        errors.name = 'Name must be less than 255 characters';
    }

    if (data.email)
    {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email))
        {
            errors.email = 'Invalid email format';
        }
    }

    if (data.rsvp_status && !['pending', 'confirmed', 'declined'].includes(data.rsvp_status))
    {
        errors.rsvp_status = 'Invalid RSVP status';
    }

    return errors;
};


const checkEventOwnership = async (pool, eventId, userId) =>
{
    const result = await pool.query('SELECT user_id FROM events WHERE id = $1', [eventId]);
    if (result.rows.length === 0) return null;
    if (result.rows[0].user_id !== userId) return false;
    return true;
}

// add guest to event
router.post('/', authMiddleware, async (req, res) => {
    const { event_id, name, email } = req.body;
    const userId = req.user.userId;

    const errors = validateGuestData({ name, email });
    if (Object.keys(errors).length > 0)
    {
        return res.status(400).json({ errors });
    }

    if (!event_id)
    {
        return res.status(400).json({ error: 'Event ID is required' });
    }

    try
    {
        const pool = req.app.get('pool');

        const ownsEvent = await checkEventOwnership(pool, event_id, userId);
        if (ownsEvent === null)
        {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (ownsEvent === false)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (email)
        {
            const domainValid = await verifyEmailDomain(email);
            if (!domainValid)
            {
                return res.status(400).json({ error: 'Email domain does not exist' });
            }
        }

        const result = await pool.query(
            'INSERT INTO guests (event_id, name, email) VALUES ($1, $2, $3) RETURNING *',
            [event_id, name, email]
        );

        if (email)
        {
            const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [event_id]);
            if (eventResult.rows.length > 0)
            {
                const event = eventResult.rows[0];
                await sendGuestInvitationEmail(email, name, event.title, {
                    description: event.description,
                    location: event.location,
                    start_date: new Date(event.start_date).toLocaleString(),
                    end_date: new Date(event.end_date).toLocaleString()
                });
            }
        }

        res.status(201).json({
            message: 'Guest added successfully',
            guest: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Error adding guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// get all guests for event
router.get('/event/:event_id', authMiddleware, async (req, res) => {
    const { event_id } = req.params;
    const userId = req.user.userId;

    try
    {
        const pool = req.app.get('pool');

        const ownsEvent = await checkEventOwnership(pool, event_id, userId);
        if (ownsEvent === null)
        {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (ownsEvent === false)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'SELECT * FROM guests WHERE event_id = $1 ORDER BY created_at DESC',
            [event_id]
        );

        res.json({ guests: result.rows });
    }
    catch (error)
    {
        console.error('Get guests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// update guest RSVP status
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, rsvp_status } = req.body;
    const userId = req.user.userId;

    const errors = validateGuestData({ name, email, rsvp_status });
    if (Object.keys(errors).length > 0)
    {
        return res.status(400).json({ errors });
    }

    try
    {
        const pool = req.app.get('pool');

        const guestResult = await pool.query('SELECT event_id FROM guests WHERE id = $1', [id]);
        if (guestResult.rows.length === 0)
        {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const eventId = guestResult.rows[0].event_id;
        const ownsEvent = await checkEventOwnership(pool, eventId, userId);
        if (ownsEvent === false)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'UPDATE guests SET name = $1, email = $2, rsvp_status = $3 WHERE id = $4 RETURNING *',
            [name, email, rsvp_status, id]
        );

        res.json({
            message: 'Guest updated successfully',
            guest: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Update guest error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// delete guest
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try
    {
        const pool = req.app.get('pool');

        const guestResult = await pool.query('SELECT event_id FROM guests WHERE id = $1', [id]);
        if (guestResult.rows.length === 0)
        {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const eventId = guestResult.rows[0].event_id;
        const ownsEvent = await checkEventOwnership(pool, eventId, userId);
        if (ownsEvent === false)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'DELETE FROM guests WHERE id = $1 RETURNING *',
            [id]
        );

        res.json({
            message: 'Guest deleted successfully',
            guest: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Delete guest error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;