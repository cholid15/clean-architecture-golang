import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8080";
const REFRESH_INTERVAL = 60000;

const toWIB = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
};

const formatTime = (dateStr) => {
  const d = toWIB(dateStr);
  return d.toISOString().slice(11, 16);
};

const formatDate = (date) => {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  });
};

const formatClock = (date) => {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Jakarta",
  });
};

const getStatus = (startStr, endStr) => {
  const now = new Date();
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (now < start) return "upcoming";
  if (now > end) return "done";
  return "ongoing";
};

const isTodayWIB = (dateStr) => {
  const nowWIB = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
  const dateWIB = toWIB(dateStr);
  return (
    nowWIB.getUTCFullYear() === dateWIB.getUTCFullYear() &&
    nowWIB.getUTCMonth() === dateWIB.getUTCMonth() &&
    nowWIB.getUTCDate() === dateWIB.getUTCDate()
  );
};

export default function Display() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [clock, setClock] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [roomRes, bookingRes] = await Promise.all([
        fetch(`${API_BASE}/display/rooms`),
        fetch(`${API_BASE}/display/bookings`),
      ]);
      const roomData = await roomRes.json();
      const bookingData = await bookingRes.json();
      setRooms(roomData);
      setBookings(bookingData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const dataInterval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(dataInterval);
  }, [fetchData]);

  useEffect(() => {
    const clockInterval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const getTodayBookingsForRoom = (roomId) => {
    return bookings
      .filter((b) => b.room_id === roomId && isTodayWIB(b.start_time))
      .map((b) => ({
        ...b,
        computedStatus: getStatus(b.start_time, b.end_time),
      }))
      .filter((b) => b.computedStatus !== "done")
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  const getRoomCurrentStatus = (roomId) => {
    const todayBookings = getTodayBookingsForRoom(roomId);
    const ongoing = todayBookings.find((b) => b.computedStatus === "ongoing");
    if (ongoing) return { status: "ongoing", booking: ongoing };
    const upcoming = todayBookings.find((b) => b.computedStatus === "upcoming");
    if (upcoming) return { status: "upcoming", booking: upcoming };
    return { status: "kosong", booking: null };
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgPattern} />

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoMark}>●</div>
          <div>
            <div style={styles.orgName}>SISTEM INFORMASI RUANG RAPAT</div>
            <div style={styles.orgSub}>Bagian Rumah Tangga</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.clockDisplay}>{formatClock(clock)}</div>
          <div style={styles.dateDisplay}>{formatDate(clock)}</div>
        </div>
      </header>

      <div style={styles.divider} />

      <main style={styles.main}>
        {rooms.length === 0 ? (
          <div style={styles.loadingText}>Memuat data ruangan...</div>
        ) : (
          <div
            style={{
              ...styles.roomGrid,
              gridTemplateColumns:
                rooms.length === 1
                  ? "1fr"
                  : rooms.length === 2
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)",
            }}
          >
            {rooms.map((room) => {
              const { status, booking } = getRoomCurrentStatus(room.id);
              const todayBookings = getTodayBookingsForRoom(room.id);
              const upcomingList = todayBookings.filter(
                (b) => b.computedStatus === "upcoming",
              );

              const borderColor =
                status === "ongoing"
                  ? "#ef4444"
                  : status === "upcoming"
                    ? "#f59e0b"
                    : "#22c55e";
              const glowColor =
                status === "ongoing"
                  ? "rgba(239,68,68,0.25)"
                  : status === "upcoming"
                    ? "rgba(245,158,11,0.2)"
                    : "rgba(34,197,94,0.2)";
              const badgeColor =
                status === "ongoing"
                  ? "#ef4444"
                  : status === "upcoming"
                    ? "#f59e0b"
                    : "#22c55e";
              const badgeLabel =
                status === "ongoing"
                  ? "SEDANG DIGUNAKAN"
                  : status === "upcoming"
                    ? "AKAN DIGUNAKAN"
                    : "TERSEDIA";

              return (
                <div
                  key={room.id}
                  style={{
                    ...styles.roomCard,
                    borderColor,
                    boxShadow: `0 0 40px ${glowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
                  }}
                >
                  <div
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: badgeColor,
                    }}
                  >
                    <span style={styles.statusDot} />
                    {badgeLabel}
                  </div>

                  <div style={styles.roomName}>{room.name}</div>
                  <div style={styles.roomCapacity}>
                    Kapasitas: {room.capacity} orang
                  </div>

                  <div style={styles.cardDivider} />

                  {status === "ongoing" && booking && (
                    <div style={styles.bookingInfo}>
                      <div style={styles.bookingLabel}>SEDANG BERLANGSUNG</div>
                      <div style={styles.bookingDept}>{booking.department}</div>
                      <div style={styles.bookingTime}>
                        {formatTime(booking.start_time)} –{" "}
                        {formatTime(booking.end_time)} WIB
                      </div>
                      <div style={styles.bookingParticipant}>
                        {booking.participant_count} peserta
                      </div>
                    </div>
                  )}

                  {status === "upcoming" && booking && (
                    <div style={styles.bookingInfo}>
                      <div style={styles.bookingLabel}>JADWAL BERIKUTNYA</div>
                      <div style={styles.bookingDept}>{booking.department}</div>
                      <div style={styles.bookingTime}>
                        {formatTime(booking.start_time)} –{" "}
                        {formatTime(booking.end_time)} WIB
                      </div>
                      <div style={styles.bookingParticipant}>
                        {booking.participant_count} peserta
                      </div>
                    </div>
                  )}

                  {status === "kosong" && (
                    <div style={styles.kosongInfo}>
                      <div style={styles.kosongIcon}>✓</div>
                      <div style={styles.kosongText}>
                        Tidak ada jadwal rapat hari ini
                      </div>
                    </div>
                  )}

                  {status === "ongoing" && upcomingList.length > 0 && (
                    <div style={styles.upcomingSection}>
                      <div style={styles.upcomingLabel}>
                        Jadwal Selanjutnya:
                      </div>
                      {upcomingList.slice(0, 2).map((b) => (
                        <div key={b.id} style={styles.upcomingItem}>
                          <span style={styles.upcomingTime}>
                            {formatTime(b.start_time)}–{formatTime(b.end_time)}
                          </span>
                          <span style={styles.upcomingDept}>
                            {b.department}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLeft}>
          <span style={styles.refreshDot} />
          Diperbarui otomatis setiap 60 detik
        </div>
        <div style={styles.footerRight}>
          Terakhir diperbarui: {formatClock(lastRefresh)} WIB
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0a0f1e",
    color: "#e2e8f0",
    fontFamily: "'Segoe UI', 'Noto Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  bgPattern: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 48px",
    position: "relative",
    zIndex: 1,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logoMark: {
    fontSize: "32px",
    color: "#6366f1",
    lineHeight: 1,
  },
  orgName: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    color: "#f1f5f9",
  },
  orgSub: {
    fontSize: "13px",
    color: "#94a3b8",
    letterSpacing: "0.08em",
    marginTop: "2px",
  },
  headerRight: {
    textAlign: "right",
  },
  clockDisplay: {
    fontSize: "52px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "#f1f5f9",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  },
  dateDisplay: {
    fontSize: "15px",
    color: "#94a3b8",
    marginTop: "4px",
    textTransform: "capitalize",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(99,102,241,0.3)",
    margin: "0 48px",
    position: "relative",
    zIndex: 1,
  },
  main: {
    flex: 1,
    padding: "32px 48px",
    position: "relative",
    zIndex: 1,
  },
  loadingText: {
    textAlign: "center",
    fontSize: "20px",
    color: "#64748b",
    marginTop: "80px",
  },
  roomGrid: {
    display: "grid",
    gap: "28px",
    height: "100%",
  },
  roomCard: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: "16px",
    border: "2px solid",
    padding: "32px",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.1em",
    color: "#fff",
    alignSelf: "flex-start",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.8)",
    display: "inline-block",
  },
  roomName: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#f1f5f9",
    lineHeight: 1.2,
    marginTop: "4px",
  },
  roomCapacity: {
    fontSize: "14px",
    color: "#64748b",
    letterSpacing: "0.05em",
  },
  cardDivider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.06)",
    margin: "4px 0",
  },
  bookingInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bookingLabel: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    color: "#64748b",
  },
  bookingDept: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#e2e8f0",
    lineHeight: 1.2,
  },
  bookingTime: {
    fontSize: "20px",
    color: "#94a3b8",
    fontVariantNumeric: "tabular-nums",
    fontWeight: "600",
  },
  bookingParticipant: {
    fontSize: "14px",
    color: "#64748b",
  },
  kosongInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 0",
    gap: "12px",
    flex: 1,
  },
  kosongIcon: {
    fontSize: "48px",
    color: "#22c55e",
    lineHeight: 1,
  },
  kosongText: {
    fontSize: "16px",
    color: "#64748b",
    textAlign: "center",
  },
  upcomingSection: {
    marginTop: "8px",
    padding: "12px 16px",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  upcomingLabel: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    color: "#64748b",
    marginBottom: "4px",
  },
  upcomingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  upcomingTime: {
    color: "#94a3b8",
    fontVariantNumeric: "tabular-nums",
    fontWeight: "600",
  },
  upcomingDept: {
    color: "#cbd5e1",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 48px",
    borderTop: "1px solid rgba(99,102,241,0.15)",
    fontSize: "13px",
    color: "#475569",
    position: "relative",
    zIndex: 1,
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  refreshDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    display: "inline-block",
  },
  footerRight: {
    fontVariantNumeric: "tabular-nums",
  },
};
