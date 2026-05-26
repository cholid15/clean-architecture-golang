import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import logger from "../utils/logger";
import Sidebar from "../components/Sidebar";
import PageOverview from "../components/PageOverview";
import PageBooking from "../components/PageBooking";
import PageRuangan from "../components/PageRuangan";
import Toast from "../components/Toast";

function Dashboard({ onLogout }) {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState({ username: "", email: "" });
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [toasts, setToasts] = useState([]);

  const [bookingData, setBookingData] = useState({
    room_id: "",
    department: "",
    participant_count: "",
    start_time: "",
    end_time: "",
  });

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/rooms/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(Array.isArray(res.data) ? res.data : []);
      logger.info(`Berhasil fetch ${res.data?.length ?? 0} ruangan`);
    } catch (err) {
      setRooms([]);
      logger.error("Gagal mengambil data ruangan", err.message);
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/bookings/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
      logger.info(`Berhasil fetch ${res.data?.length ?? 0} booking`);
    } catch (err) {
      setBookings([]);
      logger.error("Gagal mengambil data booking", err.message);
    }
  }, [token]);

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
  }, [token, fetchRooms, fetchBookings]);

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
      showToast("Booking berhasil dibuat!", "success");
      await fetchBookings();
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
      showToast(errMsg, "error");
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
          <PageBooking
            bookings={bookings}
            rooms={rooms}
            token={token}
            onBookingChange={fetchBookings}
            onNavigate={setActivePage}
            showToast={showToast}
          />
        );

      case "booking-form":
        return (
          <div style={styles.card}>
            {/* Header form — tombol Kembali + judul */}
            <div style={styles.formHeader}>
              <button
                onClick={() => setActivePage("booking")}
                style={styles.btnBack}
              >
                ← Kembali
              </button>
              <h2 style={styles.cardTitle}>Buat Reservasi Baru</h2>
            </div>

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

              {/* Tombol submit — tidak full width */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.btnSubmit,
                    backgroundColor: loading ? "#6c757d" : "#28a745",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? "Menyimpan..." : "Konfirmasi Booking"}
                </button>
              </div>
            </form>
          </div>
        );

      case "ruangan":
        return (
          <PageRuangan
            rooms={rooms}
            token={token}
            onRoomsChange={fetchRooms}
            showToast={showToast}
          />
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
      <Toast toasts={toasts} onRemove={removeToast} />
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
    marginLeft: "220px",
    flex: 1,
    padding: "32px",
  },
  card: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderBottom: "2px solid #eee",
    paddingBottom: "12px",
    marginBottom: "8px",
  },
  btnBack: {
    padding: "6px 14px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    width: "auto", // tidak full width
    flexShrink: 0,
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 0,
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
  btnSubmit: {
    padding: "10px 28px",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontWeight: "600",
    fontSize: "14px",
    width: "auto", // tidak full width
    display: "inline-block",
  },
};

export default Dashboard;
