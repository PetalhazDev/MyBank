/* ============================================================
   MyBank / bill payments page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  const billerGrid = document.querySelector("[data-biller-grid]");
  let selectedBiller = BILLERS[0].id;

  function renderBillers() {
    billerGrid.innerHTML = BILLERS.map(
      (b) =>
        '<button type="button" class="biller-option' +
        (b.id === selectedBiller ? " is-selected" : "") +
        '" data-biller="' + b.id + '">' +
        '<span class="biller-mark">' + b.label.slice(0, 2).toUpperCase() + "</span>" +
        b.label +
        "</button>"
    ).join("");

    billerGrid.querySelectorAll("[data-biller]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedBiller = btn.getAttribute("data-biller");
        renderBillers();
      });
    });
  }
  renderBillers();

  function renderRecentBills() {
    const wrap = document.querySelector("[data-recent-bills]");
    const billNotes = ["Electricity bill", "Water bill", "Internet subscription", "Cable TV subscription"];
    const payments = user.transactions
      .filter((tx) => billNotes.includes(tx.note))
      .slice()
      .sort((a, b) => b.date - a.date)
      .slice(0, 6);

    if (payments.length === 0) {
      wrap.innerHTML = '<div class="empty-state">No bill payments yet.</div>';
      return;
    }

    wrap.innerHTML = payments
      .map(
        (tx) =>
          '<div class="tx-row">' +
          '<span class="tx-icon is-debit">OUT</span>' +
          '<span class="tx-info">' +
          '<span class="tx-name">' + escapeHtml(tx.name) + "</span><br>" +
          '<span class="tx-meta">' + escapeHtml(tx.note) + " &middot; " + formatDate(tx.date) + "</span>" +
          "</span>" +
          '<span class="tx-amount is-debit">-&#8358;' + formatMoney(tx.amount) + "</span>" +
          "</div>"
      )
      .join("");
  }
  renderRecentBills();

  function setError(fieldId, message) {
    const el = document.querySelector('[data-error="' + fieldId + '"]');
    if (el) el.textContent = message || "";
  }

  const billNoteMap = {
    power: "Electricity bill",
    water: "Water bill",
    internet: "Internet subscription",
    tv: "Cable TV subscription",
  };
  const billNameMap = {
    power: "PowerGrid Co",
    water: "Aqua Water Board",
    internet: "Netcom Data",
    tv: "Prime Cable TV",
  };

  const form = document.getElementById("billsForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setError("billAccount", "");
    setError("billAmount", "");

    const accountId = document.getElementById("billAccount").value.trim();
    const amount = Number(document.getElementById("billAmount").value);

    let valid = true;
    if (accountId.length < 3) {
      setError("billAccount", "Enter a valid customer or meter ID.");
      valid = false;
    }
    if (!amount || amount <= 0) {
      setError("billAmount", "Enter an amount greater than zero.");
      valid = false;
    } else if (amount > user.balance) {
      setError("billAmount", "This amount exceeds your available balance.");
      valid = false;
    }
    if (!valid) return;

    const note = billNoteMap[selectedBiller];
    const name = billNameMap[selectedBiller];

    user.balance -= amount;
    user.transactions.unshift({
      id: "tx" + Date.now(),
      type: "debit",
      name: name,
      note: note,
      amount: amount,
      date: Date.now(),
      status: "success",
    });
    pushNotification(user, note + " payment of \u20a6" + formatMoney(amount) + " was successful.");
    saveState(state);

    document.querySelector("[data-success-detail]").textContent =
      note + " of \u20a6" + formatMoney(amount) + " for " + accountId + " was successful.";
    document.querySelector("[data-success-modal]").classList.add("is-open");

    form.reset();
    renderRecentBills();
  });

  document.querySelector("[data-success-close]").addEventListener("click", () => {
    document.querySelector("[data-success-modal]").classList.remove("is-open");
  });
})();
