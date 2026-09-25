/* ============================================================
   MyBank / transactions page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  const searchInput = document.getElementById("txSearch");
  const typeFilter = document.getElementById("txTypeFilter");
  const statusFilter = document.getElementById("txStatusFilter");
  const tbody = document.querySelector("[data-tx-table-body]");
  const emptyWrap = document.querySelector("[data-tx-empty]");
  const table = document.querySelector(".data-table");

  function statusBadgeClass(status) {
    if (status === "success") return "is-success";
    if (status === "pending") return "is-pending";
    return "is-failed";
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const type = typeFilter.value;
    const status = statusFilter.value;

    const filtered = user.transactions
      .slice()
      .sort((a, b) => b.date - a.date)
      .filter((tx) => {
        if (type !== "all" && tx.type !== type) return false;
        if (status !== "all" && tx.status !== status) return false;
        if (query) {
          const haystack = (tx.name + " " + tx.note).toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      });

    if (filtered.length === 0) {
      table.classList.add("is-hidden");
      emptyWrap.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon"><svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg></div>No transactions match your search.</div>';
      return;
    }

    table.classList.remove("is-hidden");
    emptyWrap.innerHTML = "";

    tbody.innerHTML = filtered
      .map((tx) => {
        const sign = tx.type === "credit" ? "+" : "-";
        return (
          "<tr>" +
          '<td data-label="Date">' + formatDate(tx.date) + "</td>" +
          '<td data-label="Description"><strong>' + escapeHtml(tx.name) + "</strong><br><span class=\"tx-meta\">" + escapeHtml(tx.note) + "</span></td>" +
          '<td data-label="Type">' + (tx.type === "credit" ? "Money in" : "Money out") + "</td>" +
          '<td data-label="Status"><span class="badge ' + statusBadgeClass(tx.status) + '">' + tx.status + "</span></td>" +
          '<td data-label="Amount"><span class="tx-amount is-' + tx.type + '">' + sign + "&#8358;" + formatMoney(tx.amount) + "</span></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  searchInput.addEventListener("input", render);
  typeFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);

  render();
})();
