-- Permissions table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    module VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert comprehensive permissions for super_developer
INSERT INTO
    permissions (name, code, module, description)
VALUES
    -- ==================== SYSTEM PERMISSIONS ====================
    -- Database
    (
        'Manage Database',
        'system.db.manage',
        'system',
        'Can manage database directly'
    ),
    (
        'Run Migrations',
        'system.migration.run',
        'system',
        'Can run database migrations'
    ),
    (
        'Backup Database',
        'system.db.backup',
        'system',
        'Can backup database'
    ),
    (
        'Restore Database',
        'system.db.restore',
        'system',
        'Can restore database'
    ),
    -- Server
    (
        'Server Configuration',
        'system.server.config',
        'system',
        'Can configure server settings'
    ),
    (
        'View Server Logs',
        'system.logs.view',
        'system',
        'Can view server logs'
    ),
    (
        'Manage Services',
        'system.services.manage',
        'system',
        'Can manage system services'
    ),
    -- ==================== USER MANAGEMENT ====================
    (
        'User: Create Any',
        'user.create.any',
        'user',
        'Can create any user'
    ),
    (
        'User: Read Any',
        'user.read.any',
        'user',
        'Can read any user'
    ),
    (
        'User: Update Any',
        'user.update.any',
        'user',
        'Can update any user'
    ),
    (
        'User: Delete Any',
        'user.delete.any',
        'user',
        'Can delete any user'
    ),
    (
        'User: Deactivate/Activate',
        'user.toggle.active',
        'user',
        'Can activate/deactivate users'
    ),
    (
        'User: Reset Password',
        'user.password.reset',
        'user',
        'Can reset user passwords'
    ),
    (
        'User: Impersonate',
        'user.impersonate',
        'user',
        'Can impersonate other users'
    ),
    -- ==================== ROLE MANAGEMENT ====================
    (
        'Role: Create',
        'role.create',
        'role',
        'Can create roles'
    ),
    (
        'Role: Read',
        'role.read',
        'role',
        'Can read roles'
    ),
    (
        'Role: Update',
        'role.update',
        'role',
        'Can update roles'
    ),
    (
        'Role: Delete',
        'role.delete',
        'role',
        'Can delete roles'
    ),
    (
        'Role: Assign',
        'role.assign',
        'role',
        'Can assign roles to users'
    ),
    (
        'Role: Permissions Manage',
        'role.permission.manage',
        'role',
        'Can manage role permissions'
    ),
    -- ==================== PERMISSION MANAGEMENT ====================
    (
        'Permission: Create',
        'permission.create',
        'permission',
        'Can create permissions'
    ),
    (
        'Permission: Read',
        'permission.read',
        'permission',
        'Can read permissions'
    ),
    (
        'Permission: Update',
        'permission.update',
        'permission',
        'Can update permissions'
    ),
    (
        'Permission: Delete',
        'permission.delete',
        'permission',
        'Can delete permissions'
    ),
    -- ==================== CONTENT MANAGEMENT ====================
    -- Posts
    (
        'Post: Create Any',
        'post.create.any',
        'post',
        'Can create posts for any user'
    ),
    (
        'Post: Read Any',
        'post.read.any',
        'post',
        'Can read any posts'
    ),
    (
        'Post: Update Any',
        'post.update.any',
        'post',
        'Can update any posts'
    ),
    (
        'Post: Delete Any',
        'post.delete.any',
        'post',
        'Can delete any posts'
    ),
    (
        'Post: Moderate',
        'post.moderate',
        'post',
        'Can moderate posts'
    ),
    -- Categories
    (
        'Category: Manage',
        'category.manage',
        'category',
        'Can manage categories'
    ),
    -- Tags
    (
        'Tag: Manage',
        'tag.manage',
        'tag',
        'Can manage tags'
    ),
    -- ==================== FILE MANAGEMENT ====================
    (
        'File: Upload Any',
        'file.upload.any',
        'file',
        'Can upload files'
    ),
    (
        'File: Read Any',
        'file.read.any',
        'file',
        'Can read any files'
    ),
    (
        'File: Delete Any',
        'file.delete.any',
        'file',
        'Can delete any files'
    ),
    (
        'File: Manage Storage',
        'file.storage.manage',
        'file',
        'Can manage file storage'
    ),
    -- ==================== SETTINGS ====================
    (
        'Settings: General',
        'settings.general',
        'settings',
        'Can manage general settings'
    ),
    (
        'Settings: Email',
        'settings.email',
        'settings',
        'Can manage email settings'
    ),
    (
        'Settings: Security',
        'settings.security',
        'settings',
        'Can manage security settings'
    ),
    (
        'Settings: Payment',
        'settings.payment',
        'settings',
        'Can manage payment settings'
    ),
    -- ==================== AUDIT & LOGS ====================
    (
        'Audit: View All',
        'audit.view.all',
        'audit',
        'Can view all audit logs'
    ),
    (
        'Audit: Export',
        'audit.export',
        'audit',
        'Can export audit logs'
    ),
    -- ==================== API MANAGEMENT ====================
    (
        'API: Manage Keys',
        'api.key.manage',
        'api',
        'Can manage API keys'
    ),
    (
        'API: Monitor Usage',
        'api.usage.monitor',
        'api',
        'Can monitor API usage'
    ),
    (
        'API: Rate Limit Manage',
        'api.ratelimit.manage',
        'api',
        'Can manage API rate limits'
    ),
    -- ==================== NOTIFICATION ====================
    (
        'Notification: Send Any',
        'notification.send.any',
        'notification',
        'Can send notifications to any user'
    ),
    (
        'Notification: Template Manage',
        'notification.template.manage',
        'notification',
        'Can manage notification templates'
    ),
    -- ==================== BATCH OPERATIONS ====================
    (
        'Batch: User Operations',
        'batch.user.ops',
        'batch',
        'Can perform batch user operations'
    ),
    (
        'Batch: Content Operations',
        'batch.content.ops',
        'batch',
        'Can perform batch content operations'
    ),
    (
        'Batch: Data Export',
        'batch.export',
        'batch',
        'Can export data in batches'
    );

-- Add index for faster lookups
CREATE INDEX idx_permissions_module ON permissions(module);

CREATE INDEX idx_permissions_code ON permissions(code);