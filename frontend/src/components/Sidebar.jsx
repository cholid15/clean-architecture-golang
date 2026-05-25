function Sidebar({ activePage, onNavigate, user, onLogout }) {
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
            style={{
              ...styles.menuItem,
              backgroundColor:
                activePage === item.key ? "#e8f4fd" : "transparent",
              color: activePage === item.key ? "#007bff" : "#495057",
              fontWeight: activePage === item.key ? "600" : "400",
              borderLeft:
                activePage === item.key
                  ? "3px solid #007bff"
                  : "3px solid transparent",
            }}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Info & Logout di bawah */}
      <div style={styles.bottomSection}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user.username ? user.username[0].toUpperCase() : "U"}
          </div>
          <div>
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
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
  },
  logo: {
    padding: "24px 20px",
    borderBottom: "1px solid #f0f0f0",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#007bff",
  },
  logoSub: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "2px",
  },
  nav: {
    padding: "16px 0",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
    width: "100%",
    transition: "all 0.2s ease",
    borderRadius: "0",
  },
  menuIcon: {
    fontSize: "18px",
    width: "24px",
    textAlign: "center",
  },
  bottomSection: {
    padding: "16px 20px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#007bff",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#343a40",
  },
  userEmail: {
    fontSize: "11px",
    color: "#6c757d",
    wordBreak: "break-all",
  },
  logoutBtn: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#fff",
    color: "#dc3545",
    border: "1px solid #dc3545",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};

export default Sidebar;
