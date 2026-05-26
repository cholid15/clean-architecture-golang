import { useState } from "react";

function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  const menuItems = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "booking", label: "Booking", icon: "📅" },
    { key: "ruangan", label: "Ruangan", icon: "🚪" },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoText}>MeetingRoom</div>
        <div style={styles.logoSub}>Rumah Tangga</div>
      </div>

      {/* Menu */}
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
            style={{
              ...styles.menuItem,
              backgroundColor:
                activePage === item.key
                  ? "rgba(255,255,255,0.15)"
                  : hoveredKey === item.key
                    ? "rgba(255,255,255,0.08)"
                    : "transparent",
              color: "white",
              fontWeight:
                activePage === item.key || hoveredKey === item.key
                  ? "700"
                  : "400",
              borderLeft:
                activePage === item.key
                  ? "3px solid white"
                  : "3px solid transparent",
            }}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div style={styles.bottomSection}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user.username ? user.username[0].toUpperCase() : "U"}
          </div>
          <div style={styles.userTextWrap}>
            <div style={styles.userName}>{user.username || "User"}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
  },
  logo: {
    padding: "20px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
  },
  logoSub: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.7)",
    marginTop: "2px",
  },
  nav: {
    padding: "12px 0",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 16px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
    width: "100%",
    transition: "all 0.15s ease",
  },
  menuIcon: {
    fontSize: "16px",
    width: "20px",
    textAlign: "center",
    flexShrink: 0,
  },
  bottomSection: {
    padding: "14px 16px",
    borderTop: "1px solid rgba(255,255,255,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0,
  },
  userTextWrap: {
    overflow: "hidden",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.7)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    width: "100%",
    padding: "7px",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};

export default Sidebar;
