CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO
    roles (name, description)
VALUES
    (
        'super_developer',
        'Super Developer - Full system access including database and migrations'
    ),
    (
        'super_admin',
        'Super Administrator - Full application access'
    ),
    (
        'admin',
        'Administrator - Manage users and content'
    ),
    ('user', 'Regular user - Basic access'),
    ('moderator', 'Moderator - Manage content'),
    ('guest', 'Guest - Read-only access');

-- Create updated_at trigger function
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_roles_updated_at BEFORE
UPDATE
    ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();