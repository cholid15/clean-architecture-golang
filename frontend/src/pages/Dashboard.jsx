import { useState, useEffect } from "react";
import axios from "axios";
import logger from "../utils/logger";
import Sidebar from "../components/Sidebar";
import PageOverview from "../components/PageOverview";
import PageRuangan from "../components/PageRuangan";

function Dashboard({ onLogout }) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ username: "", email: "" });
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("overview");

  const [bookingData, setBookingData] = useState({
    room_id: "",
    department: "",
    participant_count: "",
    start_time: "",
    end_time: "",
  });

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:8080/rooms/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
      logger.info(`Berhasil fetch ${res.data.length} ruangan`);
    } catch (err) {
      logger.error("Gagal mengambil data ruangan", err.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8080/bookings/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
      logger.info(`Berhasil fetch ${res.data.length} booking`);
    } catch (err) {
      logger.error("Gagal mengambil data booking", err.message);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8080/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        logger.auth(`Profil berhasil dimuat: ${res.data.email}`);
      } catch (err) {
        logger.error("Gagal mengambil profil", err.message);
      }
    };

    if (token) {
      fetchProfile();
      fetchRooms();
      fetchBookings();
    }
  }, [token]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    logger.info(
      `Mencoba buat booking: ruang ${bookingData.room_id}, dept ${bookingData.department}`,
    );
    try {
      const payload = {
        ...bookingData,
        room_id: parseInt(bookingData.room_id),
        participant_count: parseInt(bookingData.participant_count),
        start_time: new Date(bookingData.start_time).toISOString(),
        end_time: new Date(bookingData.end_time).toISOString(),
      };
      await axios.post("http://localhost:8080/bookings", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.info(
        `Booking berhasil: ruang ${bookingData.room_id}, dept ${bookingData.department}`,
      );
      await fetchBookings();
      alert("Booking Berhasil!");
      setBookingData({
        room_id: "",
        department: "",
        participant_count: "",
        start_time: "",
        end_time: "",
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Gagal menyimpan booking";
      logger.error(`Booking gagal: ${errMsg}`);
      alert("Error: " + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logoutAction = () => {
    logger.auth(`User logout: ${user.email}`);
    localStorage.removeItem("token");
    onLogout();
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return <PageOverview bookings={bookings} rooms={rooms} />;

      case "booking":
        return (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Buat Reservasi Baru</h2>
            <form
              onSubmit={handleBooking}
              style={{ display: "grid", gap: "1.2rem", marginTop: "1.5rem" }}
            >
              <div>
                <label style={styles.label}>Ruang Rapat</label>
                <select
                  value={bookingData.room_id}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, room_id: e.target.value })
                  }
                  required
                  style={styles.input}
                >
                  <option value="">-- Pilih Ruangan --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Kapasitas: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Departemen</label>
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
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Jumlah Peserta</label>
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
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <div>
                  <label style={styles.label}>Waktu Mulai</label>
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
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={bookingData.end_time}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        end_time: e.target.value,
                      })
                    }
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.btnPrimary,
                  backgroundColor: loading ? "#6c757d" : "#28a745",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Menyimpan..." : "Konfirmasi Booking"}
              </button>
            </form>
          </div>
        );

      case "ruangan":
        return (
          <PageRuangan rooms={rooms} token={token} onRoomsChange={fetchRooms} />
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={logoutAction}
      />
      <main style={styles.main}>{renderContent()}</main>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "sans-serif",
  },
  main: {
    marginLeft: "240px",
    flex: 1,
    padding: "32px",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    marginTop: 0,
    borderBottom: "2px solid #eee",
    paddingBottom: "0.5rem",
    fontSize: "18px",
    fontWeight: "600",
    color: "#343a40",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    fontSize: "14px",
    color: "#495057",
  },
  input: {
    width: "100%",
    padding: "0.7rem",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  btnPrimary: {
    padding: "1rem",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    fontSize: "1rem",
  },
};

export default Dashboard;
