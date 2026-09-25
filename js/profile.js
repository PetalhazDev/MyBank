/* ============================================================
   MyBank / profile settings page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  document.querySelector("[data-profile-initials]").textContent = initials(user.fullName);
  document.querySelector("[data-profile-name]").textContent = user.fullName;
  document.querySelector("[data-profile-account]").textContent =
    user.bankName + " \u00b7 " + user.accountNumber;

  document.getElementById("profileName").value = user.fullName;
  document.getElementById("profileEmail").value = user.email;
  document.getElementById("profilePhone").value = user.phone;

  function setError(fieldId, message) {
    const el = document.querySelector('[data-error="' + fieldId + '"]');
    if (el) el.textContent = message || "";
  }

  const form = document.getElementById("profileForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setError("profileName", "");
    setError("profilePhone", "");

    const name = document.getElementById("profileName").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();

    let valid = true;
    if (name.length < 2) {
      setError("profileName", "Enter your full name.");
      valid = false;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("profilePhone", "Enter a valid phone number.");
      valid = false;
    }
    if (!valid) return;

    user.fullName = name;
    user.phone = phone;
    saveState(state);

    document.querySelector("[data-profile-initials]").textContent = initials(user.fullName);
    document.querySelector("[data-profile-name]").textContent = user.fullName;
    showToast("Profile updated");
  });

  const alertsTrack = document.querySelector("[data-alerts-track]");
  if (typeof user.alertsEnabled === "undefined") user.alertsEnabled = true;
  alertsTrack.classList.toggle("is-on", user.alertsEnabled);
  alertsTrack.addEventListener("click", () => {
    user.alertsEnabled = !user.alertsEnabled;
    alertsTrack.classList.toggle("is-on", user.alertsEnabled);
    saveState(state);
  });
})();
