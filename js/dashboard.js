/* ============================================================
   MyBank / dashboard page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  document.querySelector("[data-greeting]").textContent =
    "Welcome back, " + user.fullName.split(" ")[0];
  document.querySelector("[data-account-number]").textContent = user.accountNumber;
  document.querySelector("[data-bank-name]").textContent = user.bankName;
  document.querySelector("[data-account-name]").textContent = user.fullName;

  const balanceValueEl = document.querySelector("[data-balance-value]");
  const balanceToggleBtn = document.querySelector("[data-balance-toggle]");
  let balanceVisible = true;

  function renderBalance() {
    balanceValueEl.textContent = balanceVisible ? formatMoney(user.balance) : "******";
  }
  renderBalance();

  balanceToggleBtn.addEventListener("click", () => {
    balanceVisible = !balanceVisible;
    renderBalance();
  });

  const recentTxWrap = document.querySelector("[data-recent-tx]");
  const recent = user.transactions.slice().sort((a, b) => b.date - a.date).slice(0, 5);

  if (recent.length === 0) {
    recentTxWrap.innerHTML = '<div class="empty-state">No transactions yet.</div>';
  } else {
    recentTxWrap.innerHTML = recent
      .map((tx) => {
        const sign = tx.type === "credit" ? "+" : "-";
        return (
          '<div class="tx-row">' +
          '<span class="tx-icon is-' + tx.type + '">' + (tx.type === "credit" ? "IN" : "OUT") + "</span>" +
          '<span class="tx-info">' +
          '<span class="tx-name">' + escapeHtml(tx.name) + "</span><br>" +
          '<span class="tx-meta">' + escapeHtml(tx.note) + " &middot; " + formatDate(tx.date) + "</span>" +
          "</span>" +
          '<span class="tx-amount is-' + tx.type + '">' + sign + "&#8358;" + formatMoney(tx.amount) + "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  drawSpendingChart(user.transactions);

  function drawSpendingChart(transactions) {
    const canvas = document.querySelector("[data-spending-chart]");
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 320;
    const height = 180;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);

    const styles = getComputedStyle(document.documentElement);
    const amber = styles.getPropertyValue("--color-amber").trim();
    const teal = styles.getPropertyValue("--color-teal").trim();
    const line = styles.getPropertyValue("--color-line-soft").trim();
    const textFaint = styles.getPropertyValue("--color-text-faint").trim();

    // Group transactions into the last six weekly buckets.
    const buckets = [];
    const now = Date.now();
    const week = 604800000;
    for (let i = 5; i >= 0; i--) {
      buckets.push({ start: now - week * (i + 1), end: now - week * i, out: 0, inAmt: 0 });
    }
    transactions.forEach((tx) => {
      const bucket = buckets.find((b) => tx.date >= b.start && tx.date < b.end);
      if (!bucket) return;
      if (tx.type === "debit") bucket.out += tx.amount;
      else bucket.inAmt += tx.amount;
    });

    const maxVal = Math.max(1, ...buckets.map((b) => Math.max(b.out, b.inAmt)));
    const chartHeight = height - 24;
    const groupWidth = width / buckets.length;
    const barWidth = Math.min(16, groupWidth / 4);

    ctx.clearRect(0, 0, width, height);

    // baseline
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, chartHeight + 0.5);
    ctx.lineTo(width, chartHeight + 0.5);
    ctx.stroke();

    buckets.forEach((bucket, i) => {
      const centerX = groupWidth * i + groupWidth / 2;
      const outHeight = (bucket.out / maxVal) * (chartHeight - 10);
      const inHeight = (bucket.inAmt / maxVal) * (chartHeight - 10);

      ctx.fillStyle = amber;
      ctx.fillRect(centerX - barWidth - 2, chartHeight - outHeight, barWidth, outHeight);

      ctx.fillStyle = teal;
      ctx.fillRect(centerX + 2, chartHeight - inHeight, barWidth, inHeight);

      ctx.fillStyle = textFaint;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("W" + (6 - i), centerX, height - 6);
    });
  }

  window.addEventListener("resize", () => drawSpendingChart(user.transactions));
})();
