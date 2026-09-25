/* ============================================================
   MyBank / receive money page logic
   ============================================================ */

(function () {
  const auth = requireAuth();
  if (!auth) return;
  const { state, user } = auth;

  initHeaderChrome(user, state);

  document.querySelector("[data-recv-account]").textContent = user.accountNumber;
  document.querySelector("[data-recv-bank]").textContent = user.bankName;
  document.querySelector("[data-recv-name]").textContent = user.fullName;

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      /* ignore */
    }
    document.body.removeChild(temp);
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.getAttribute("data-copy");
      const values = { account: user.accountNumber, bank: user.bankName, name: user.fullName };
      copyText(values[field]);
      showToast("Copied to clipboard");
    });
  });

  document.querySelector("[data-copy-all]").addEventListener("click", () => {
    const text =
      "Account number: " + user.accountNumber + "\n" +
      "Bank name: " + user.bankName + "\n" +
      "Account holder: " + user.fullName;
    copyText(text);
    showToast("Account details copied");
  });
})();
