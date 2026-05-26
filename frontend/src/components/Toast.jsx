import { useEffect } from "react";

function Toast({ toasts, onRemove }) {
  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const colorMap = {
    success: { bg: "#d4edda", border: "#28a745", text: "#155724", icon: "✅" },
    error: { bg: "#f8d7da", border: "#dc3545", text: "#721c24", icon: "❌" },
    warn: { bg: "#fff3cd", border: "#ffc107", text: "#856404", icon: "⚠️" },
    info: { bg: "#d1ecf1", border: "#17a2b8", text: "#0c5460", icon: "ℹ️" },
  };

  const color = colorMap[toast.type] || colorMap.info;

  return (
    <div
      style={{
        ...styles.toast,
        backgroundColor: color.bg,
        borderLeft: `4px solid ${color.border}`,
        color: color.text,
      }}
    >
      <span style={styles.icon}>{color.icon}</span>
      <span style={styles.message}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ ...styles.closeBtn, color: color.text }}
      >
        ×
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "360px",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontSize: "14px",
    animation: "slideIn 0.2s ease",
  },
  icon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: "1.4",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    padding: "0",
    flexShrink: 0,
    fontWeight: "700",
  },
};

export default Toast;
