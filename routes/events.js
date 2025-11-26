const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const validateEventData = (data) => {
    const errors = {};

    if (!data.title || !data.title.trim())
    {
        errors.title = 'Title is required';
    }
    else if (data.title.length > 255)
    {
        errors.title = 'Title must be less than 255 characters';
    }

    if (!data.description || !data.description.trim())
    {
        errors.description = 'Description is required';
    }
    else if (data.description.length > 5000)
    {
        errors.description = 'Description must be less than 5000 characters'
    }

    if (!data.location || !data.location.trim())
    {
        errors.location = 'Location is required';
    }
    else if (data.location.length > 255)
    {
        errors.location = 'Location must be less than 255 characters';
    }

    if (!data.start_date)
    {
        errors.start_date = 'Start date is required';
    }
    else if (new Date(data.start_date) < new Date())
    {
        errors.start_date = 'Start date cannot be in the past';
    }

    if (!data.end_date)
    {
        errors.end_date = 'End date is required';
    }
    else if (new Date(data.end_date) <= new Date(data.start_date))
    {
        errors.end_date = 'End date must be after start date';
    }

    if (data.status && !['upcoming', 'ongoing', 'completed', 'cancelled'].includes(data.status))
    {
        errors.status = 'Invalid status';
    }

    return errors;
};

// create event
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, location, start_date, end_date } = req.body;
    const user_id = req.user.userId;

    const errors = validateEventData({ title, description, location, start_date, end_date });
    if (Object.keys(errors).length > 0)
    {
        return res.status(400).json({ errors });
    }

    try
    {
        const pool = req.app.get('pool');

        const result = await pool.query(
            'INSERT INTO events (user_id, title, description, location, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, title, description, location, start_date, end_date]
        );

        res.status(201).json({
            message: 'Event created successfully',
            event: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// get all events for a user
router.get('/user/:user_id', authMiddleware, async (req, res) => {
    const { user_id } = req.params;
    const requestingUserId = req.user.userId;

    if (parseInt(user_id) !== requestingUserId)
    {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try
    {
        const pool = req.app.get('pool');

        const result = await pool.query(
            'SELECT * FROM events WHERE user_id = $1 ORDER BY start_date ASC',
            [user_id]
        );

        res.json({ events: result.rows });
    }
    catch (error)
    {
        console.error('Get user events error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// get single event by id
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const requestingUserId = req.user.userId;

    try
    {
        const pool = req.app.get('pool');

        const result = await pool.query(
            'SELECT * FROM events WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0)
        {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = result.rows[0];

        if (event.user_id !== requestingUserId)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json({ event });
    }
    catch (error)
    {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// update event
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, description, location, start_date, end_date, status } = req.body;
    const requestingUserId = req.user.userId;

    const errors = validateEventData({ title, description, location, start_date, end_date, status });
    if (Object.keys(errors).length > 0)
    {
        return res.status(400).json({ errors });
    }

    try
    {
        const pool = req.app.get('pool');

        const eventCheck = await pool.query('SELECT user_id FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0)
        {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== requestingUserId)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'UPDATE events SET title = $1, description = $2, location = $3, start_date = $4, end_date = $5, status = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [title, description, location, start_date, end_date, status, id]
        );

        res.json({
            message: 'Event updated successfully',
            event: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// delete event
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const requestingUserId = req.user.userId;

    try
    {
        const pool = req.app.get('pool');

        const eventCheck = await pool.query('SELECT user_id FROM events WHERE id = $1', [id]);
        if (eventCheck.rows.length === 0)
        {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (eventCheck.rows[0].user_id !== requestingUserId)
        {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'DELETE FROM events WHERE id = $1 RETURNING *',
            [id]
        );

        res.json({
            message: 'Event deleted successfully',
            event: result.rows[0]
        });
    }
    catch (error)
    {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;