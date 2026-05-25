import { useState } from "react";
import axios from "axios";
import logger from "../utils/logger";

function PageRuangan({ rooms, token, onRoomsChange }) {
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", capacity: "" });
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", capacity: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleTambah = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (room) => {
    setFormData({ name: room.name, capacity: room.capacity });
    setEditId(room.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
      };

      if (editId) {
        await axios.put(`http://localhost:8080/rooms/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        logger.info(`Ruangan diupdate: ${formData.name}`);
      } else {
        await axios.post("http://localhost:8080/rooms", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        logger.info(`Ruangan ditambah: ${formData.name}`);
      }

      await onRoomsChange();
      resetForm();
      alert(
        editId ? "Ruangan berhasil diupdate!" : "Ruangan berhasil ditambah!",
      );
    } catch (err) {
      const errMsg = err.response?.data?.error || "Gagal menyimpan ruangan";
      logger.error(`Gagal simpan ruangan: ${errMsg}`);
      alert("Error: " + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (room) => {
    if (!window.confirm(`Hapus ruangan "${room.name}"?`)) return;
    try {
      await axios.delete(`http://localhost:8080/rooms/${room.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logger.info(`Ruangan dihapus: ${room.name}`);
      await onRoomsChange();
      alert("Ruangan berhasil dihapus!");
    } catch (err) {
      const errMsg = err.response?.data?.error || "Gagal menghapus ruangan";
      logger.error(`Gagal hapus ruangan: ${errMsg}`);
      alert("Error: " + errMsg);
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Manajemen Ruangan</h2>
        <button onClick={handleTambah} style={styles.btnPrimary}>
          + Tambah Ruangan
        </button>
      </div>

      {/* Form Tambah / Edit */}
      {showForm && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {editId ? "Edit Ruangan" : "Tambah Ruangan Baru"}
          </h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label style={styles.label}>Nama Ruangan</label>
              <input
                type="text"
                placeholder="Contoh: Ruang Rapat A"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Kapasitas (orang)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                required
                min="1"
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={resetForm}
                style={styles.btnSecondary}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.btnPrimary,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? "Menyimpan..."
                  : editId
                    ? "Update Ruangan"
                    : "Simpan Ruangan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Ruangan */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Daftar Ruangan ({rooms.length})</h3>
        {rooms.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🚪</div>
            <div>Belum ada ruangan. Tambahkan ruangan baru.</div>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHead}>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Nama Ruangan</th>
                <th style={styles.th}>Kapasitas</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={room.id} style={styles.tableRow}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{room.name}</td>
                  <td style={styles.td}>{room.capacity} orang</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(room)}
                        style={styles.btnEdit}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        style={styles.btnDelete}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
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
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  pageTitle: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#343a40",
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
  form: {
    display: "grid",
    gap: "16px",
    maxWidth: "480px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
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
  formActions: {
    display: "flex",
    gap: "12px",
  },
  btnPrimary: {
    padding: "8px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  btnSecondary: {
    padding: "8px 20px",
    backgroundColor: "white",
    color: "#6c757d",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
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
  actionButtons: {
    display: "flex",
    gap: "8px",
  },
  btnEdit: {
    padding: "4px 12px",
    backgroundColor: "#ffc107",
    color: "#343a40",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  btnDelete: {
    padding: "4px 12px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
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

export default PageRuangan;
