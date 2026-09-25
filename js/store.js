/* ============================================================
   MyBank / shared state layer
   All pages load this file before their own script.
   ============================================================ */

const STORAGE_KEY = "mybank_state_v1";

const BILLERS = [
  { id: "power", label: "Electricity" },
  { id: "water", label: "Water" },
  { id: "internet", label: "Internet" },
  { id: "tv", label: "Cable TV" },
];

const NETWORKS = [
  { id: "mtn", label: "MTN" },
  { id: "airtel", label: "Airtel" },
  { id: "glo", label: "Glo" },
  { id: "9mobile", label: "9mobile" },
];

function seedTransactions() {
  const now = Date.now();
  const day = 86400000;
  return [
    { id: "tx1001", type: "credit", name: "Chidinma Eze", note: "Transfer received", amount: 45000, date: now - day * 1, status: "success" },
    { id: "tx1002", type: "debit", name: "Netcom Data", note: "Internet subscription", amount: 8500, date: now - day * 2, status: "success" },
    { id: "tx1003", type: "debit", name: "MTN Airtime", note: "Airtime purchase", amount: 2000, date: now - day * 2, status: "success" },
    { id: "tx1004", type: "debit", name: "PowerGrid Co", note: "Electricity bill", amount: 12300, date: now - day * 4, status: "success" },
    { id: "tx1005", type: "credit", name: "Tunde Bakare", note: "Transfer received", amount: 90000, date: now - day * 6, status: "success" },
    { id: "tx1006", type: "debit", name: "Ngozi Umeh", note: "Transfer sent", amount: 15000, date: now - day * 7, status: "success" },
    { id: "tx1007", type: "debit", name: "Aqua Water Board", note: "Water bill", amount: 4200, date: now - day * 9, status: "success" },
    { id: "tx1008", type: "credit", name: "Salary from Vertex Ltd", note: "Monthly salary", amount: 320000, date: now - day * 12, status: "success" },
    { id: "tx1009", type: "debit", name: "Glo Airtime", note: "Airtime purchase", amount: 1000, date: now - day * 13, status: "failed" },
    { id: "tx1010", type: "debit", name: "Femi Adisa", note: "Transfer sent", amount: 6000, date: now - day * 15, status: "pending" },
  ];
}

function seedNotifications() {
  const now = Date.now();
  return [
    { id: "n1", text: "Your account was credited with 45000 naira from Chidinma Eze.", time: now - 3600000, read: false },
    { id: "n2", text: "Electricity bill payment of 12300 naira was successful.", time: now - 86400000 * 4, read: false },
    { id: "n3", text: "New login detected on this device.", time: now - 86400000 * 8, read: true },
  ];
}

function defaultState() {
  return {
    session: null,
    users: {
      "ada@example.com": {
        password: "password123",
        fullName: "Ada Obiora",
        email: "ada@example.com",
        phone: "08031234567",
        accountNumber: "2201558493",
        bankName: "MyBank",
        balance: 486200,
        beneficiaries: [
          { name: "Chidinma Eze", accountNumber: "0192837465", bank: "First Coastal Bank" },
          { name: "Tunde Bakare", accountNumber: "3345678921", bank: "Unity Trust Bank" },
          { name: "Ngozi Umeh", accountNumber: "5567891234", bank: "MyBank" },
        ],
        transactions: seedTransactions(),
        notifications: seedNotifications(),
        theme: "dark",
      },
    },
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = defaultState();
    saveState(fresh);
    return fresh;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    const fresh = defaultState();
    saveState(fresh);
    return fresh;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentUser(state) {
  if (!state.session) return null;
  return state.users[state.session] || null;
}

function formatMoney(amount) {
  const parts = Math.abs(amount).toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts[0] + "." + parts[1];
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const hour = 3600000;
  const day = 86400000;
  if (diff < hour) return Math.max(1, Math.round(diff / 60000)) + "m ago";
  if (diff < day) return Math.round(diff / hour) + "h ago";
  if (diff < day * 7) return Math.round(diff / day) + "d ago";
  return formatDate(timestamp);
}

function initials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/* ------------------------------------------------------------
   Auth guard / every authenticated page calls this on load
   ------------------------------------------------------------ */

function requireAuth() {
  const state = loadState();
  const user = currentUser(state);
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  return { state, user };
}

/* ------------------------------------------------------------
   Theme
   ------------------------------------------------------------ */

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function initThemeToggle(user, state) {
  applyTheme(user.theme || "dark");
  const tracks = document.querySelectorAll("[data-theme-track], [data-theme-track-profile]");
  if (tracks.length === 0) return;

  function syncTracks() {
    tracks.forEach((track) => track.classList.toggle("is-on", user.theme === "light"));
  }
  syncTracks();

  tracks.forEach((track) => {
    track.addEventListener("click", () => {
      user.theme = user.theme === "light" ? "dark" : "light";
      applyTheme(user.theme);
      syncTracks();
      saveState(state);
    });
  });
}

/* ------------------------------------------------------------
   Notifications panel
   ------------------------------------------------------------ */

function initNotifications(user, state) {
  const btn = document.querySelector("[data-notif-btn]");
  const panel = document.querySelector("[data-notif-panel]");
  const dot = document.querySelector("[data-notif-dot]");
  if (!btn || !panel) return;

  function render() {
    const unread = user.notifications.filter((n) => !n.read).length;
    dot.classList.toggle("is-visible", unread > 0);
    if (user.notifications.length === 0) {
      panel.innerHTML = '<div class="notif-item">No notifications yet.</div>';
      return;
    }
    panel.innerHTML = user.notifications
      .slice()
      .sort((a, b) => b.time - a.time)
      .map(
        (n) =>
          '<div class="notif-item"><div>' +
          escapeHtml(n.text) +
          '</div><div class="notif-item-time">' +
          formatRelativeTime(n.time) +
          "</div></div>"
      )
      .join("");
  }

  btn.addEventListener("click", () => {
    panel.classList.toggle("is-open");
    if (panel.classList.contains("is-open")) {
      user.notifications.forEach((n) => (n.read = true));
      saveState(state);
      render();
    }
  });

  document.addEventListener("click", (event) => {
    if (!panel.contains(event.target) && !btn.contains(event.target)) {
      panel.classList.remove("is-open");
    }
  });

  render();
}

function pushNotification(user, text) {
  user.notifications.unshift({
    id: "n" + Date.now(),
    text: text,
    time: Date.now(),
    read: false,
  });
}

/* ------------------------------------------------------------
   Toast
   ------------------------------------------------------------ */

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

/* ------------------------------------------------------------
   Mobile sidebar
   ------------------------------------------------------------ */

function initMobileNav() {
  const toggleBtn = document.querySelector("[data-topbar-toggle]");
  const sidebar = document.querySelector(".app-sidebar");
  if (!toggleBtn || !sidebar) return;
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("is-open");
  });
  document.addEventListener("click", (event) => {
    if (
      sidebar.classList.contains("is-open") &&
      !sidebar.contains(event.target) &&
      !toggleBtn.contains(event.target)
    ) {
      sidebar.classList.remove("is-open");
    }
  });
}

/* ------------------------------------------------------------
   Small helpers
   ------------------------------------------------------------ */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function logout() {
  const state = loadState();
  state.session = null;
  saveState(state);
  window.location.href = "index.html";
}

function initHeaderChrome(user, state) {
  initThemeToggle(user, state);
  initNotifications(user, state);
  initMobileNav();
  document.querySelectorAll("[data-logout]").forEach((logoutLink) => {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  });
}
