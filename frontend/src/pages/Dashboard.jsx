import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard({ onLogout }) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ username: "", email: "" });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    room_id: "",
    department: "",
    participant_count: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    // 1. Ambil data profil user untuk ditampilkan di pojok kanan atas
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8080/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data); // Asumsi backend mengembalikan {username, email}
      } catch (err) {
        console.error("Gagal mengambil profil", err);
      }
    };

    // 2. Ambil data ruangan
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:8080/rooms/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(res.data);
      } catch (err) {
        console.error("Gagal mengambil data ruangan", err);
      }
    };

    if (token) {
      fetchProfile();
      fetchRooms();
    }
  }, [token]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...bookingData,
        room_id: parseInt(bookingData.room_id),
        participant_count: parseInt(bookingData.participant_count),
      };
      await axios.post("http://localhost:8080/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Booking Berhasil!");
      setBookingData({
        room_id: "",
        department: "",
        participant_count: "",
        start_time: "",
        end_time: "",
      });
    } catch (err) {
      alert(
        "Error: " + (err.response?.data?.error || "Gagal menyimpan booking"),
      );
    } finally {
      setLoading(false);
    }
  };

  const logoutAction = () => {
    localStorage.removeItem("token");
    onLogout();
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "sans-serif",
      }}
    >
      {/* TOP NAVBAR */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 2rem",
          height: "60px",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#007bff" }}
        >
          MeetingRoom App
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
              {user.username || "User"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
              {user.email}
            </div>
          </div>
          <button
            onClick={logoutAction}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              borderBottom: "2px solid #eee",
              paddingBottom: "0.5rem",
            }}
          >
            Buat Reservasi Baru
          </h2>

          <form
            onSubmit={handleBooking}
            style={{ display: "grid", gap: "1.2rem", marginTop: "1.5rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Ruang Rapat
              </label>
              <select
                value={bookingData.room_id}
                onChange={(e) =>
                  setBookingData({ ...bookingData, room_id: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "0.7rem",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                }}
              >
                <option value="">-- Pilih Ruangan --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} (Kaps: {r.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Departemen
                </label>
                <input
                  type="text"
                  placeholder="Nama Departemen"
                  value={bookingData.department}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      department: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Jumlah Peserta
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={bookingData.participant_count}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      participant_count: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Waktu Mulai
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.start_time}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      start_time: e.target.value,
                    })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Waktu Selesai
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.end_time}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, end_time: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "4px",
                    border: "1px solid #ced4da",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "1rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {loading ? "Menyimpan..." : "Konfirmasi Booking"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
