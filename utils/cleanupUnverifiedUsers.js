const cron = require('node-cron');

const cleanupUnverifiedUsers = (pool) => {
    cron.schedule('0 * * * *', async () => {
        console.log('Running cleanup of expired unverified users...');

        try
        {
            const result = await pool.query(
                `DELETE FROM users
                WHERE email_verified = FALSE
                AND verification_token_expires < NOW()
                RETURNING id, email, username, created_at`
            );

            if (result.rows.length > 0)
            {
                console.log(`Deleted ${result.rows.length} expired unverified users:`);
                result.rows.forEach(user => {
                    console.log(`  - ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Created: ${user.created_at}`);
                });
            }
            else
            {
                console.log('No expired unverified users to delete');
            }
        }
        catch (error)
        {
            console.error('Error cleaning up unverified users:', error);
        }
    });
};

module.exports = cleanupUnverifiedUsers;