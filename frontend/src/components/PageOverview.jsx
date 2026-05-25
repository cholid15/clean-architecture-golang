import { useMemo } from "react";

const toWIB = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
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

const getComputedStatus = (startStr, endStr) => {
  const now = new Date();
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (now < start) return "upcoming";
  if (now > end) return "done";
  return "ongoing";
};

const formatTime = (dateStr) => {
  const d = toWIB(dateStr);
  return d.toISOString().slice(11, 16);
};

const formatDateWIB = (dateStr) => {
  return toWIB(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

function PageOverview({ bookings, rooms }) {
  const todayBookings = useMemo(() => {
    return bookings
      .filter((b) => isTodayWIB(b.start_time))
      .map((b) => ({
        ...b,
        computedStatus: getComputedStatus(b.start_time, b.end_time),
      }))
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [bookings]);

  const ongoingCount = todayBookings.filter(
    (b) => b.computedStatus === "ongoing",
  ).length;
  const upcomingCount = todayBookings.filter(
    (b) => b.computedStatus === "upcoming",
  ).length;
  const doneCount = todayBookings.filter(
    (b) => b.computedStatus === "done",
  ).length;
  const availableRooms = rooms.length - ongoingCount;

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : `Ruang #${roomId}`;
  };

  const statusStyle = (status) => {
    if (status === "ongoing")
      return {
        backgroundColor: "#fff3cd",
        color: "#856404",
        border: "1px solid #ffc107",
      };
    if (status === "upcoming")
      return {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
        border: "1px solid #bee5eb",
      };
    return {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    };
  };

  const statusLabel = (status) => {
    if (status === "ongoing") return "Berlangsung";
    if (status === "upcoming") return "Akan Datang";
    return "Selesai";
  };

  return (
    <div>
      <h2 style={styles.pageTitle}>Overview Hari Ini</h2>

      {/* Card Statistik */}
      <div style={styles.cardGrid}>
        <div style={{ ...styles.statCard, borderTop: "4px solid #007bff" }}>
          <div style={styles.statNumber}>{rooms.length}</div>
          <div style={styles.statLabel}>Total Ruangan</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #28a745" }}>
          <div style={{ ...styles.statNumber, color: "#28a745" }}>
            {availableRooms < 0 ? 0 : availableRooms}
          </div>
          <div style={styles.statLabel}>Ruangan Tersedia</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #ffc107" }}>
          <div style={{ ...styles.statNumber, color: "#856404" }}>
            {ongoingCount}
          </div>
          <div style={styles.statLabel}>Sedang Berlangsung</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #17a2b8" }}>
          <div style={{ ...styles.statNumber, color: "#17a2b8" }}>
            {upcomingCount}
          </div>
          <div style={styles.statLabel}>Akan Datang</div>
        </div>
        <div style={{ ...styles.statCard, borderTop: "4px solid #6c757d" }}>
          <div style={{ ...styles.statNumber, color: "#6c757d" }}>
            {doneCount}
          </div>
          <div style={styles.statLabel}>Selesai Hari Ini</div>
        </div>
      </div>

      {/* Tabel Booking Hari Ini */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Jadwal Booking Hari Ini</h3>
        {todayBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div>Tidak ada booking hari ini</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Ruangan</th>
                <th style={styles.th}>Departemen</th>
                <th style={styles.th}>Waktu</th>
                <th style={styles.th}>Peserta</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((b) => (
                <tr key={b.id} style={styles.tableRow}>
                  <td style={styles.td}>{getRoomName(b.room_id)}</td>
                  <td style={styles.td}>{b.department}</td>
                  <td style={styles.td}>
                    {formatTime(b.start_time)} – {formatTime(b.end_time)} WIB
                  </td>
                  <td style={styles.td}>{b.participant_count} orang</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...statusStyle(b.computedStatus),
                      }}
                    >
                      {statusLabel(b.computedStatus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Mendatang (bukan hari ini) */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Booking Mendatang</h3>
        {bookings.filter(
          (b) =>
            !isTodayWIB(b.start_time) && new Date(b.start_time) > new Date(),
        ).length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div>Tidak ada booking mendatang</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>Ruangan</th>
                <th style={styles.th}>Departemen</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Waktu</th>
                <th style={styles.th}>Peserta</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .filter(
                  (b) =>
                    !isTodayWIB(b.start_time) &&
                    new Date(b.start_time) > new Date(),
                )
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                .map((b) => (
                  <tr key={b.id} style={styles.tableRow}>
                    <td style={styles.td}>{getRoomName(b.room_id)}</td>
                    <td style={styles.td}>{b.department}</td>
                    <td style={styles.td}>{formatDateWIB(b.start_time)}</td>
                    <td style={styles.td}>
                      {formatTime(b.start_time)} – {formatTime(b.end_time)} WIB
                    </td>
                    <td style={styles.td}>{b.participant_count} orang</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageTitle: {
    marginTop: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#343a40",
    marginBottom: "24px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#343a40",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "8px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  cardTitle: {
    marginTop: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#343a40",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f0f0f0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHead: {
    backgroundColor: "#f8f9fa",
  },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #e9ecef",
  },
  tableRow: {
    borderBottom: "1px solid #f0f0f0",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#343a40",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
    fontSize: "14px",
  },
  emptyIcon: {
    fontSize: "32px",
    marginBottom: "8px",
  },
};

export default PageOverview;
