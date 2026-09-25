/* ============================================================
   MyBank / auth page logic
   ============================================================ */

(function () {
  const state = loadState();

  // If already signed in, skip straight to the dashboard.
  if (currentUser(state)) {
    window.location.href = "dashboard.html";
    return;
  }

  const tabButtons = document.querySelectorAll("[data-tab-btn]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab-btn");
      tabButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      tabPanels.forEach((p) =>
        p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === target)
      );
    });
  });

  function setError(fieldId, message) {
    const el = document.querySelector('[data-error="' + fieldId + '"]');
    if (el) el.textContent = message || "";
  }

  function clearErrors(ids) {
    ids.forEach((id) => setError(id, ""));
  }

  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(["loginEmail", "loginPassword"]);

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    let valid = true;
    if (!email) {
      setError("loginEmail", "Enter your email address.");
      valid = false;
    }
    if (!password) {
      setError("loginPassword", "Enter your password.");
      valid = false;
    }
    if (!valid) return;

    const record = state.users[email];
    if (!record || record.password !== password) {
      setError("loginPassword", "Email or password is incorrect.");
      return;
    }

    state.session = email;
    saveState(state);
    window.location.href = "dashboard.html";
  });

  const registerForm = document.getElementById("registerForm");
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(["registerName", "registerEmail", "registerPhone", "registerPassword"]);

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const phone = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value;

    let valid = true;
    if (name.length < 2) {
      setError("registerName", "Enter your full name.");
      valid = false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("registerEmail", "Enter a valid email address.");
      valid = false;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("registerPhone", "Enter a valid phone number.");
      valid = false;
    }
    if (password.length < 6) {
      setError("registerPassword", "Password must be at least 6 characters.");
      valid = false;
    }
    if (state.users[email]) {
      setError("registerEmail", "An account with this email already exists.");
      valid = false;
    }
    if (!valid) return;

    const accountNumber = String(Math.floor(1000000000 + Math.random() * 8999999999));

    state.users[email] = {
      password: password,
      fullName: name,
      email: email,
      phone: phone,
      accountNumber: accountNumber,
      bankName: "MyBank",
      balance: 50000,
      beneficiaries: [],
      transactions: [
        {
          id: "tx" + Date.now(),
          type: "credit",
          name: "MyBank",
          note: "Welcome bonus",
          amount: 50000,
          date: Date.now(),
          status: "success",
        },
      ],
      notifications: [
        {
          id: "n" + Date.now(),
          text: "Welcome to MyBank. Your account is ready to use.",
          time: Date.now(),
          read: false,
        },
      ],
      theme: "dark",
    };

    state.session = email;
    saveState(state);
    window.location.href = "dashboard.html";
  });
})();
