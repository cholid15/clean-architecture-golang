# PROJECT CONTEXT - MeetingRoom App

## Stack

Backend:

- Golang
- Clean Architecture
- PostgreSQL
- JWT Authentication

Frontend:

- React + Vite
- Axios

## Backend Structure

cmd/

- main.go

internal/

- delivery/http/handler
- delivery/http/middleware
- entity
- repository
- usecase
- infrastructure/pgsql

## Existing Features

### Authentication

- Login
- JWT Token
- Profile endpoint

### Room

- Get all rooms
- Room entity:
  - id
  - name
  - capacity

### Booking

- Create booking
- Booking fields:
  - room_id
  - department
  - participant_count
  - start_time
  - end_time

## Important Notes

### JSON Tag Convention

All entities use lowercase json tags.

Example:

```go
type Room struct {
    ID int `json:"id"`
}
```

### Datetime Format

Frontend uses:

```js
new Date(value).toISOString();
```

Because Go time.Time requires RFC3339 format.

## Current API

### Login

POST /login

### Profile

GET /profile

### Rooms

GET /rooms/all

### Booking

POST /bookings

## Frontend Current State

Dashboard.jsx:

- fetch profile
- fetch rooms
- create booking
- JWT from localStorage

## Known Fixed Issues

### Fixed

- JSON uppercase/lowercase mismatch
- datetime-local parsing issue

## Run Commands

Backend:

```bash
go run cmd/main.go
```

Frontend:

```bash
npm run dev
```

Frontend URL:
http://localhost:5173

Backend URL:
http://localhost:8080
