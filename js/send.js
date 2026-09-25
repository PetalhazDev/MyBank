/* ============================================================
   MyBank / send money page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  const select = document.getElementById("beneficiarySelect");
  const nameInput = document.getElementById("recipientName");
  const accountInput = document.getElementById("recipientAccount");
  const bankInput = document.getElementById("recipientBank");
  const amountInput = document.getElementById("sendAmount");
  const noteInput = document.getElementById("sendNote");

  function renderBeneficiaryOptions() {
    select.innerHTML = '<option value="">Enter a new recipient</option>';
    user.beneficiaries.forEach((b, index) => {
      const opt = document.createElement("option");
      opt.value = String(index);
      opt.textContent = b.name + " at " + b.bank;
      select.appendChild(opt);
    });
  }
  renderBeneficiaryOptions();

  select.addEventListener("change", () => {
    if (select.value === "") return;
    const b = user.beneficiaries[Number(select.value)];
    nameInput.value = b.name;
    accountInput.value = b.accountNumber;
    bankInput.value = b.bank;
  });

  function renderBeneficiaryList() {
    const wrap = document.querySelector("[data-beneficiary-list]");
    if (user.beneficiaries.length === 0) {
      wrap.innerHTML = '<div class="empty-state">You have not saved any beneficiaries yet.</div>';
      return;
    }
    wrap.innerHTML = user.beneficiaries
      .map(
        (b, index) =>
          '<div class="tx-row">' +
          '<span class="tx-icon is-credit">' + escapeHtml(initials(b.name)) + "</span>" +
          '<span class="tx-info">' +
          '<span class="tx-name">' + escapeHtml(b.name) + "</span><br>" +
          '<span class="tx-meta">' + escapeHtml(b.bank) + " &middot; " + escapeHtml(b.accountNumber) + "</span>" +
          "</span>" +
          '<button class="btn btn-ghost btn-sm" data-use-beneficiary="' + index + '" type="button">Use</button>' +
          "</div>"
      )
      .join("");

    wrap.querySelectorAll("[data-use-beneficiary]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const b = user.beneficiaries[Number(btn.getAttribute("data-use-beneficiary"))];
        nameInput.value = b.name;
        accountInput.value = b.accountNumber;
        bankInput.value = b.bank;
        amountInput.focus();
      });
    });
  }
  renderBeneficiaryList();

  function setError(fieldId, message) {
    const el = document.querySelector('[data-error="' + fieldId + '"]');
    if (el) el.textContent = message || "";
  }

  let pendingTransfer = null;

  const form = document.getElementById("sendForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ["recipientName", "recipientAccount", "recipientBank", "sendAmount"].forEach((id) => setError(id, ""));

    const name = nameInput.value.trim();
    const accountNumber = accountInput.value.trim();
    const bank = bankInput.value.trim();
    const amount = Number(amountInput.value);
    const note = noteInput.value.trim() || "Transfer";

    let valid = true;
    if (name.length < 2) {
      setError("recipientName", "Enter the recipient's full name.");
      valid = false;
    }
    if (accountNumber.replace(/\D/g, "").length < 10) {
      setError("recipientAccount", "Enter a valid account number.");
      valid = false;
    }
    if (bank.length < 2) {
      setError("recipientBank", "Enter the recipient's bank.");
      valid = false;
    }
    if (!amount || amount <= 0) {
      setError("sendAmount", "Enter an amount greater than zero.");
      valid = false;
    } else if (amount > user.balance) {
      setError("sendAmount", "This amount exceeds your available balance.");
      valid = false;
    }
    if (!valid) return;

    pendingTransfer = { name, accountNumber, bank, amount, note };
    showConfirmModal(pendingTransfer);
  });

  const confirmModal = document.querySelector("[data-confirm-modal]");
  const successModal = document.querySelector("[data-success-modal]");

  function showConfirmModal(transfer) {
    document.querySelector("[data-confirm-summary]").innerHTML =
      '<div class="modal-summary-row"><span>Recipient</span><span>' + escapeHtml(transfer.name) + "</span></div>" +
      '<div class="modal-summary-row"><span>Account number</span><span>' + escapeHtml(transfer.accountNumber) + "</span></div>" +
      '<div class="modal-summary-row"><span>Bank</span><span>' + escapeHtml(transfer.bank) + "</span></div>" +
      '<div class="modal-summary-row"><span>Amount</span><span>&#8358;' + formatMoney(transfer.amount) + "</span></div>" +
      '<div class="modal-summary-row"><span>Note</span><span>' + escapeHtml(transfer.note) + "</span></div>";
    confirmModal.classList.add("is-open");
  }

  function closeModal(modal) {
    modal.classList.remove("is-open");
  }

  document.querySelectorAll("[data-modal-close], [data-modal-cancel]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(confirmModal));
  });

  document.querySelector("[data-modal-confirm]").addEventListener("click", () => {
    if (!pendingTransfer) return;
    user.balance -= pendingTransfer.amount;

    user.transactions.unshift({
      id: "tx" + Date.now(),
      type: "debit",
      name: pendingTransfer.name,
      note: pendingTransfer.note,
      amount: pendingTransfer.amount,
      date: Date.now(),
      status: "success",
    });

    const exists = user.beneficiaries.some((b) => b.accountNumber === pendingTransfer.accountNumber);
    if (!exists) {
      user.beneficiaries.unshift({
        name: pendingTransfer.name,
        accountNumber: pendingTransfer.accountNumber,
        bank: pendingTransfer.bank,
      });
    }

    pushNotification(
      user,
      "You sent " + "\u20a6" + formatMoney(pendingTransfer.amount) + " to " + pendingTransfer.name + "."
    );

    saveState(state);

    closeModal(confirmModal);
    document.querySelector("[data-success-detail]").textContent =
      "You sent \u20a6" + formatMoney(pendingTransfer.amount) + " to " + pendingTransfer.name + ".";
    successModal.classList.add("is-open");

    form.reset();
    renderBeneficiaryOptions();
    renderBeneficiaryList();
    pendingTransfer = null;
  });

  document.querySelector("[data-success-close]").addEventListener("click", () => {
    closeModal(successModal);
    window.location.href = "dashboard.html";
  });
})();
