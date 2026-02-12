package pgsql

import (
	"clean/internal/entity"
	"clean/internal/repository"
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx"
)

type userRepo struct {
    db *sqlx.DB
}

func NewUserRepoPG(db *sqlx.DB) repository.UserRepo {
    return &userRepo{db: db}
}

// ========================
// GET ALL USERS
// ========================
func (r *userRepo) GetAll() ([]*entity.User, error) {
    users := []*entity.User{}
    err := r.db.Select(&users, `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
    `)
    if err != nil {
        return nil, err
    }
    return users, nil
}

// ========================
// GET BY EMAIL
// ========================
func (r *userRepo) GetByEmail(email string) (*entity.User, error) {
    user := &entity.User{}
    err := r.db.Get(user, `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE email = $1
    `, email)
    if err != nil {
        if err == sql.ErrNoRows {
            return nil, err
        }
        return nil, err
    }
    return user, nil
}

// ========================
// GET BY ID
// ========================
func (r *userRepo) GetById(id int) (*entity.User, error) {
    user := &entity.User{}
    err := r.db.Get(user, `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE id = $1
    `, id)
    if err != nil {
        return nil, err
    }
    return user, nil
}

// ========================
// CREATE USER - FIXED VERSION
// ========================
func (r *userRepo) Create(user *entity.User) error {
    now := time.Now()
    user.CreatedAt = now
    user.UpdatedAt = now

    query := `
        INSERT INTO users (username, email, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `
    
    // ✅ FIX: Gunakan QueryRowx untuk scan dengan struct tags
    err := r.db.QueryRowx(
        query,
        user.Username,
        user.Email,
        user.Password,
        user.CreatedAt,
        user.UpdatedAt,
    ).Scan(&user.ID)
    
    return err
}

// ========================
// ASSIGN ROLE TO USER
// ========================
func (r *userRepo) AssignRole(userID, roleID int) error {
    query := `
        INSERT INTO user_roles (user_id, role_id, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, role_id) DO NOTHING
    `
    
    _, err := r.db.Exec(query, userID, roleID)
    return err
}

// ========================
// GET USER WITH ROLES AND PERMISSIONS
// ========================
func (r *userRepo) GetUserWithRolesAndPermissions(userID int) (*entity.UserWithRoles, error) {
	// Get user basic info
	user := &entity.User{}
	err := r.db.Get(user, `
		SELECT id, username, email
		FROM users
		WHERE id = $1
	`, userID)
	if err != nil {
		return nil, err
	}

	// Get user roles with their permissions
	query := `
		SELECT 
			r.id,
			r.name,
			r.description,
			r.created_at,
			r.updated_at,
			p.id as permission_id,
			p.name as permission_name,
			p.code,
			p.module,
			p.description as permission_description,
			p.created_at as permission_created_at
		FROM roles r
		LEFT JOIN user_roles ur ON r.id = ur.role_id
		LEFT JOIN role_permissions rp ON r.id = rp.role_id
		LEFT JOIN permissions p ON rp.permission_id = p.id
		WHERE ur.user_id = $1
		ORDER BY r.id, p.id
	`

	rows, err := r.db.Queryx(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Map to store roles and their permissions
	rolesMap := make(map[int]*entity.Role)
	var roleOrder []int

	for rows.Next() {
		var roleID int
		var roleName string
		var roleDesc sql.NullString
		var roleCreatedAt time.Time
		var roleUpdatedAt time.Time
		var permID sql.NullInt64
		var permName sql.NullString
		var permCode sql.NullString
		var permModule sql.NullString
		var permDesc sql.NullString
		var permCreatedAt sql.NullTime

		err := rows.Scan(
			&roleID,
			&roleName,
			&roleDesc,
			&roleCreatedAt,
			&roleUpdatedAt,
			&permID,
			&permName,
			&permCode,
			&permModule,
			&permDesc,
			&permCreatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Initialize role if not exists
		if _, ok := rolesMap[roleID]; !ok {
			rolesMap[roleID] = &entity.Role{
				ID:          roleID,
				Name:        roleName,
				Description: roleDesc.String,
				CreatedAt:   roleCreatedAt,
				UpdatedAt:   roleUpdatedAt,
				Permissions: []entity.Permission{},
			}
			roleOrder = append(roleOrder, roleID)
		}

		// Add permission if exists
		if permID.Valid {
			perm := entity.Permission{
				ID:          int(permID.Int64),
				Name:        permName.String,
				Code:        permCode.String,
				Module:      permModule.String,
				Description: permDesc.String,
				CreatedAt:   permCreatedAt.Time,
			}
			rolesMap[roleID].Permissions = append(rolesMap[roleID].Permissions, perm)
		}
	}

	// Build final roles array in order
	var roles []entity.Role
	for _, id := range roleOrder {
		roles = append(roles, *rolesMap[id])
	}

	// Return user with roles
	return &entity.UserWithRoles{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Roles:    roles,
	}, nil
}

// reset password
func (r *userRepo) SaveResetToken(userID int, token string, expiry time.Time) error {
	query := `
	UPDATE users 
	SET reset_token=$1, reset_token_expiry=$2 WHERE id=$3
	`
	_, err := r.db.Exec(query, token, expiry, userID)
	return err
}

func (r *userRepo) GetByResetToken(token string) (*entity.User, error) {
	var user entity.User
	query := `
	SELECT * FROM users
	WHERE reset_token=$1
	`

	err := r.db.Get(&user, query, token)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *userRepo) UpdatePassword(userID int, hashedpassword string) error {
	query := `
	UPDATE users Set password=$1, updated_at=NOW()
	WHERE id=$2
	`

	_, err := r.db.Exec(query, hashedpassword, userID)
	return err
}

func (r *userRepo) ClearResetToken(userID int) error {
	query := `
	UPDATE users SET reset_token=NULL, reset_token_expiry=NULL
	WHERE id=$1	
	`

	_, err := r.db.Exec(query,userID)
	return err
}