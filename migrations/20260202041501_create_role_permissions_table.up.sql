-- Role permissions junction table
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Foreign keys with cascade delete
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    -- Ensure unique combination
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

-- ==================== SUPER DEVELOPER ====================
-- Give ALL permissions to super_developer
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    (
        SELECT
            id
        FROM
            roles
        WHERE
            name = 'super_developer'
    ),
    id
FROM
    permissions;

-- ==================== SUPER ADMIN ====================
-- Give all application permissions (except system/database)
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    (
        SELECT
            id
        FROM
            roles
        WHERE
            name = 'super_admin'
    ),
    p.id
FROM
    permissions p
WHERE
    p.code NOT LIKE 'system.%'
    AND p.code NOT LIKE 'api.%'
    AND p.code NOT IN ('system.db.manage', 'system.migration.run');

-- ==================== ADMIN ====================
-- Limited admin permissions
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    (
        SELECT
            id
        FROM
            roles
        WHERE
            name = 'admin'
    ),
    p.id
FROM
    permissions p
WHERE
    p.module IN ('user', 'post', 'category', 'tag', 'file')
    AND p.code NOT LIKE '%.any'
    AND p.code NOT IN (
        'user.impersonate',
        'user.toggle.active',
        'user.password.reset'
    );

-- ==================== MODERATOR ====================
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    (
        SELECT
            id
        FROM
            roles
        WHERE
            name = 'moderator'
    ),
    p.id
FROM
    permissions p
WHERE
    p.module IN ('post', 'category', 'tag')
    AND p.code LIKE 'post.moderate'
    OR p.code IN ('category.manage', 'tag.manage');

-- ==================== USER ====================
-- Basic permissions for regular users
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    (
        SELECT
            id
        FROM
            roles
        WHERE
            name = 'user'
    ),
    p.id
FROM
    permissions p
WHERE
    p.code IN (
        'user.read.any',
        'post.create.any',
        'post.read.any',
        'post.update.any',
        'file.upload.any',
        'file.read.any'
    );

-- ==================== GUEST ====================
-- Read-only permissions
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT
    (
        SELECT
            id
        FROM
            roles
        WHERE
            name = 'guest'
    ),
    p.id
FROM
    permissions p
WHERE
    p.code IN (
        'user.read.any',
        'post.read.any',
        'file.read.any'
    );

-- Create indexes for performance
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

CREATE INDEX idx_role_permissions_composite ON role_permissions(role_id, permission_id);