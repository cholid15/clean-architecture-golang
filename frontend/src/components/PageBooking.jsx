import { useState } from "react";
import axios from "axios";
import logger from "../utils/logger";

const toWIB = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
};

const formatTime = (dateStr) => {
  const d = toWIB(dateStr);
  return d.toISOString().slice(11, 16);
};

const formatDateWIB = (dateStr) => {
  return toWIB(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const toLocalDatetime = (dateStr) => {
  const d = toWIB(dateStr);
  return d.toISOString().slice(0, 16);
};

const getComputedStatus = (startStr, endStr) => {
  const now = new Date();
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (now < start) return "upcoming";
  if (now > end) return "done";
  return "ongoing";
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

function PageBooking({
  bookings,
  rooms,
  token,
  onBookingChange,
  onNavigate,
  showToast,
}) {
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRoom, setFilterRoom] = useState("all");
  const [editData, setEditData] = useState({
    room_id: "",
    department: "",
    participant_count: "",
    start_time: "",
    end_time: "",
  });

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : `Ruang #${roomId}`;
  };

  const handleEditClick = (booking) => {
    setEditId(booking.id);
    setEditData({
      room_id: booking.room_id,
      department: booking.department,
      participant_count: booking.participant_count,
      start_time: toLocalDatetime(booking.start_time),
      end_time: toLocalDatetime(booking.end_time),
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        room_id: parseInt(editData.room_id),
        department: editData.department,
        participant_count: parseInt(editData.participant_count),
        start_time: new Date(editData.start_time).toISOString(),
        end_time: new Date(editData.end_time).toISOString(),
      };
      await axios.put(`http://localhost:8080/bookings/${editId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.info(`Booking diupdate: id ${editId}`);
      showToast("Booking berhasil diupdate!", "success");
      setEditId(null);
      await onBookingChange();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Gagal update booking";
      logger.error(`Gagal update booking: ${errMsg}`);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (booking) => {
    if (!window.confirm(`Hapus booking "${booking.department}"?`)) return;
    try {
      await axios.delete(`http://localhost:8080/bookings/${booking.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.info(`Booking dihapus: id ${booking.id}`);
      showToast("Booking berhasil dihapus!", "success");
      await onBookingChange();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Gagal menghapus booking";
      logger.error(`Gagal hapus booking: ${errMsg}`);
      showToast(errMsg, "error");
    }
  };

  // Filter booking
  const filteredBookings = bookings
    .map((b) => ({
      ...b,
      computedStatus: getComputedStatus(b.start_time, b.end_time),
    }))
    .filter((b) => filterStatus === "all" || b.computedStatus === filterStatus)
    .filter((b) => filterRoom === "all" || b.room_id === parseInt(filterRoom))
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Daftar Booking</h2>
        <button
          onClick={() => onNavigate("booking-form")}
          style={styles.btnTambah}
        >
          + Buat Booking Baru
        </button>
      </div>

      {/* Filter */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">Semua Status</option>
            <option value="upcoming">Akan Datang</option>
            <option value="ongoing">Berlangsung</option>
            <option value="done">Selesai</option>
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Ruangan</label>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">Semua Ruangan</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.filterInfo}>
          {filteredBookings.length} booking ditemukan
        </div>
      </div>

      {/* Tabel */}
      <div style={styles.card}>
        {filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div>Tidak ada booking ditemukan</div>
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
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <>
                  {/* Baris data */}
                  <tr key={b.id} style={styles.tableRow}>
                    <td style={styles.td}>{getRoomName(b.room_id)}</td>
                    <td style={styles.td}>{b.department}</td>
                    <td style={styles.td}>{formatDateWIB(b.start_time)}</td>
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
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleEditClick(b)}
                          style={styles.btnEdit}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          style={styles.btnDelete}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Form edit inline */}
                  {editId === b.id && (
                    <tr key={`edit-${b.id}`}>
                      <td colSpan={7} style={styles.editRow}>
                        <form
                          onSubmit={handleEditSubmit}
                          style={styles.editForm}
                        >
                          <div style={styles.editTitle}>Edit Booking</div>
                          <div style={styles.editGrid}>
                            <div>
                              <label style={styles.label}>Ruangan</label>
                              <select
                                value={editData.room_id}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    room_id: e.target.value,
                                  })
                                }
                                required
                                style={styles.input}
                              >
                                {rooms.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={styles.label}>Departemen</label>
                              <input
                                type="text"
                                value={editData.department}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
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
                                value={editData.participant_count}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    participant_count: e.target.value,
                                  })
                                }
                                required
                                min="0"
                                style={styles.input}
                              />
                            </div>
                            <div>
                              <label style={styles.label}>Waktu Mulai</label>
                              <input
                                type="datetime-local"
                                value={editData.start_time}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
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
                                value={editData.end_time}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    end_time: e.target.value,
                                  })
                                }
                                required
                                style={styles.input}
                              />
                            </div>
                          </div>
                          <div style={styles.editActions}>
                            <button
                              type="button"
                              onClick={() => setEditId(null)}
                              style={styles.btnBatal}
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              style={{
                                ...styles.btnSimpan,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                              }}
                            >
                              {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  pageTitle: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#343a40",
  },
  btnTambah: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    width: "auto",
    display: "inline-block",
  },
  filterBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "20px",
    backgroundColor: "white",
    padding: "16px 20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6c757d",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  filterSelect: {
    padding: "7px 12px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "14px",
    color: "#343a40",
    cursor: "pointer",
  },
  filterInfo: {
    fontSize: "13px",
    color: "#6c757d",
    alignSelf: "flex-end",
    marginLeft: "auto",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHead: {
    backgroundColor: "#f8f9fa",
  },
  th: {
    padding: "12px 14px",
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
    padding: "12px 14px",
    fontSize: "14px",
    color: "#343a40",
    verticalAlign: "middle",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  actionButtons: {
    display: "flex",
    gap: "6px",
  },
  btnEdit: {
    padding: "4px 10px",
    backgroundColor: "#ffc107",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  btnDelete: {
    padding: "4px 10px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  editRow: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderBottom: "1px solid #e9ecef",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  editTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#343a40",
  },
  editGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#495057",
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    boxSizing: "border-box",
    fontSize: "13px",
    color: "#343a40",
  },
  editActions: {
    display: "flex",
    gap: "10px",
  },
  btnBatal: {
    padding: "7px 16px",
    backgroundColor: "white",
    color: "#6c757d",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnSimpan: {
    padding: "7px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "500",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "#6c757d",
    fontSize: "14px",
  },
  emptyIcon: {
    fontSize: "36px",
    marginBottom: "10px",
  },
};

export default PageBooking;
