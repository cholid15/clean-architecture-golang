const API_BASE = "http://localhost:8080";

const sendLog = async (level, message, data = null) => {
  // Tetap tampil di browser console untuk development
  if (level === "error")
    console.error(`[FRONTEND][${level.toUpperCase()}] ${message}`, data ?? "");
  else if (level === "warn")
    console.warn(`[FRONTEND][${level.toUpperCase()}] ${message}`, data ?? "");
  else
    console.info(`[FRONTEND][${level.toUpperCase()}] ${message}`, data ?? "");

  // Kirim ke backend agar tersimpan di file log
  try {
    await fetch(`${API_BASE}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        data: data ? JSON.stringify(data) : "",
      }),
    });
  } catch {
    // Diam saja kalau backend tidak bisa dijangkau
  }
};

const logger = {
  info: (message, data = null) => sendLog("info", message, data),
  warn: (message, data = null) => sendLog("warn", message, data),
  error: (message, data = null) => sendLog("error", message, data),
  auth: (message, data = null) => sendLog("info", `[AUTH] ${message}`, data),
};

export default logger;
