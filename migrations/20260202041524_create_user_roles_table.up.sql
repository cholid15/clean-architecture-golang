-- User roles junction table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    created_by INTEGER,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Foreign keys
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
    SET
        NULL,
        -- Optional: Unique constraint if you want one role per user
        -- CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
        -- Check constraint for expiry
        CONSTRAINT chk_expiry CHECK (
            expires_at IS NULL
            OR expires_at > created_at
        )
);

-- Example: Assign super_developer to user with id = 1
-- INSERT INTO user_roles (user_id, role_id) 
-- SELECT 1, id FROM roles WHERE name = 'super_developer';
-- Create indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

CREATE INDEX idx_user_roles_expires ON user_roles(expires_at)
WHERE
    expires_at IS NOT NULL;