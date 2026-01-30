 <!-- download gin -->

go get github.com/gin-gonic/gin

 <!-- download pq -->

go get github.com/lib/pq

 <!-- godotenv -->

go get github.com/joho/godotenv

 <!-- sqlx -->

go get github.com/jmiron/sqlx

<!-- migration menggunakan sccop -->
<!-- 1. sudah instal scoop -->
<!-- 2.  check versi migrate -->

migrate -version

<!-- 3. buat file migration -->

migrate create -ext sql -dir migrations create_users_table

<!-- 4. jalankan migrations -->

migrate -database "postgres://postgres:1950@localhost:5432/meeting_room?sslmode=disable" -path migrations up

<!-- 5. kondeksi daatabase itu buat file .env dan buat folder pgsql di folder insfratucture -->

# 1. Pastikan air sudah terinstall

scoop install air

# atau

go install github.com/cosmtrek/air@latest

# 2. Di root project Anda, jalankan:

air init
