ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN verification_token_expires TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_unverified_expired
ON users (verification_token_expires)
WHERE email_verified = FALSE;