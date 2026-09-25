/* ============================================================
   MyBank / airtime purchase page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  const networkGrid = document.querySelector("[data-network-grid]");
  let selectedNetwork = NETWORKS[0].id;

  function renderNetworks() {
    networkGrid.innerHTML = NETWORKS.map(
      (n) =>
        '<button type="button" class="biller-option' +
        (n.id === selectedNetwork ? " is-selected" : "") +
        '" data-network="' + n.id + '">' +
        '<span class="biller-mark">' + n.label.slice(0, 2).toUpperCase() + "</span>" +
        n.label +
        "</button>"
    ).join("");

    networkGrid.querySelectorAll("[data-network]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedNetwork = btn.getAttribute("data-network");
        renderNetworks();
      });
    });
  }
  renderNetworks();

  const amountInput = document.getElementById("airtimeAmount");
  document.querySelectorAll("[data-amount-chips] .amount-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("[data-amount-chips] .amount-chip").forEach((c) => c.classList.remove("is-selected"));
      chip.classList.add("is-selected");
      amountInput.value = chip.getAttribute("data-amount");
    });
  });

  function renderRecentAirtime() {
    const wrap = document.querySelector("[data-recent-airtime]");
    const purchases = user.transactions
      .filter((tx) => tx.note === "Airtime purchase")
      .slice()
      .sort((a, b) => b.date - a.date)
      .slice(0, 6);

    if (purchases.length === 0) {
      wrap.innerHTML = '<div class="empty-state">No airtime purchases yet.</div>';
      return;
    }

    wrap.innerHTML = purchases
      .map(
        (tx) =>
          '<div class="tx-row">' +
          '<span class="tx-icon is-debit">OUT</span>' +
          '<span class="tx-info">' +
          '<span class="tx-name">' + escapeHtml(tx.name) + "</span><br>" +
          '<span class="tx-meta">' + formatDate(tx.date) + "</span>" +
          "</span>" +
          '<span class="tx-amount is-debit">-&#8358;' + formatMoney(tx.amount) + "</span>" +
          "</div>"
      )
      .join("");
  }
  renderRecentAirtime();

  function setError(fieldId, message) {
    const el = document.querySelector('[data-error="' + fieldId + '"]');
    if (el) el.textContent = message || "";
  }

  const form = document.getElementById("airtimeForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setError("airtimePhone", "");
    setError("airtimeAmount", "");

    const phone = document.getElementById("airtimePhone").value.trim();
    const amount = Number(amountInput.value);

    let valid = true;
    if (phone.replace(/\D/g, "").length < 10) {
      setError("airtimePhone", "Enter a valid phone number.");
      valid = false;
    }
    if (!amount || amount < 50) {
      setError("airtimeAmount", "Enter an amount of at least 50 naira.");
      valid = false;
    } else if (amount > user.balance) {
      setError("airtimeAmount", "This amount exceeds your available balance.");
      valid = false;
    }
    if (!valid) return;

    const networkLabel = NETWORKS.find((n) => n.id === selectedNetwork).label;

    user.balance -= amount;
    user.transactions.unshift({
      id: "tx" + Date.now(),
      type: "debit",
      name: networkLabel + " Airtime",
      note: "Airtime purchase",
      amount: amount,
      date: Date.now(),
      status: "success",
    });
    pushNotification(user, "You bought \u20a6" + formatMoney(amount) + " airtime on " + networkLabel + ".");
    saveState(state);

    document.querySelector("[data-success-detail]").textContent =
      "\u20a6" + formatMoney(amount) + " airtime sent to " + phone + " on " + networkLabel + ".";
    document.querySelector("[data-success-modal]").classList.add("is-open");

    form.reset();
    document.querySelectorAll("[data-amount-chips] .amount-chip").forEach((c) => c.classList.remove("is-selected"));
    renderRecentAirtime();
  });

  document.querySelector("[data-success-close]").addEventListener("click", () => {
    document.querySelector("[data-success-modal]").classList.remove("is-open");
  });
})();
