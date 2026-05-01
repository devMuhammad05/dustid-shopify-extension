document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("d-signin");
  const modal = document.getElementById("dustid-modal");
  const cancelBtn = document.getElementById("dustid-cancel");
  const submitBtn = document.getElementById("dustid-connect");
  const phoneInput = document.getElementById("dustid-phone");

  const otpModal = document.getElementById("dustid-otp-modal");
  const otpPhoneLabel = document.getElementById("dustid-otp-phone");
  const otpCells = Array.from(document.querySelectorAll(".dustid-otp-cell"));
  const verifyBtn = document.getElementById("dustid-verify");
  const otpBackBtn = document.getElementById("dustid-otp-back");
  const resendBtn = document.getElementById("dustid-resend");

  const contactsModal = document.getElementById("dustid-contacts-modal");
  const contactList = document.getElementById("dustid-contact-list");
  const contactSearch = document.getElementById("dustid-contact-search");
  const contactsEmpty = document.getElementById("dustid-contacts-empty");
  const contactsBackBtn = document.getElementById("dustid-contacts-back");

  const phoneError      = document.getElementById("dustid-phone-error");
  const otpError        = document.getElementById("dustid-otp-error");
  const contactsError   = document.getElementById("dustid-contacts-error");

  const selectedChip   = document.getElementById("dustid-selected");
  const chipAvatar     = document.getElementById("dustid-chip-avatar");
  const chipName       = document.getElementById("dustid-chip-name");
  const chipChangeBtn  = document.getElementById("dustid-chip-change");

  if (!connectBtn || !modal) return;

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }

  function clearError(el) {
    el.textContent = "";
    el.classList.add("hidden");
  }

  // Move overlays to <body> so they escape the section's stacking context.
  // Any ancestor with transform/will-change/filter traps position:fixed children,
  // causing theme product sections to paint on top regardless of z-index.
  [modal, otpModal, contactsModal].forEach((el) => {
    if (el) document.body.appendChild(el);
  });

  // ── Step 1: phone ────────────────────────────────────────────────
  connectBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    phoneInput.focus();
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    phoneInput.value = "";
  });

  submitBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();
    if (!phone) {
      phoneInput.focus();
      return;
    }

    clearError(phoneError);
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showError(phoneError, data.message || "Failed to send OTP. Please try again.");
        return;
      }

      localStorage.setItem("dustid_phone", phone);
      modal.classList.add("hidden");
      otpPhoneLabel.textContent = phone;
      otpCells.forEach((c) => (c.value = ""));
      otpModal.classList.remove("hidden");
      otpCells[0].focus();
    } catch {
      showError(phoneError, "Network error. Please check your connection.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send code";
    }
  });

  phoneInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitBtn.click();
  });

  // ── Step 2: OTP ──────────────────────────────────────────────────
  otpCells.forEach((cell, i) => {
    cell.addEventListener("input", () => {
      cell.value = cell.value.replace(/\D/g, "").slice(-1);
      if (cell.value && i < otpCells.length - 1) otpCells[i + 1].focus();
      if (otpCells.every((c) => c.value)) verifyBtn.click();
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !cell.value && i > 0) {
        otpCells[i - 1].value = "";
        otpCells[i - 1].focus();
      }
    });

    cell.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, otpCells.length);
      pasted.split("").forEach((char, idx) => {
        if (otpCells[idx]) otpCells[idx].value = char;
      });
      const nextEmpty = otpCells.find((c) => !c.value);
      (nextEmpty || otpCells[otpCells.length - 1]).focus();
    });
  });

  otpBackBtn.addEventListener("click", () => {
    clearError(otpError);
    otpModal.classList.add("hidden");
    modal.classList.remove("hidden");
    phoneInput.focus();
  });

  resendBtn.addEventListener("click", async () => {
    const phone = localStorage.getItem("dustid_phone");
    if (!phone) return;

    clearError(otpError);
    resendBtn.disabled = true;
    resendBtn.textContent = "Resending…";

    try {
      const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (res.ok) {
        otpCells.forEach((c) => (c.value = ""));
        otpCells[0].focus();
        resendBtn.textContent = "Code resent";
        setTimeout(() => {
          resendBtn.textContent = "Resend code";
          resendBtn.disabled = false;
        }, 3000);
      } else {
        showError(otpError, "Failed to resend OTP. Please try again.");
        resendBtn.disabled = false;
        resendBtn.textContent = "Resend code";
      }
    } catch {
      showError(otpError, "Network error. Please check your connection.");
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend code";
    }
  });

  // ── Step 3: contact selection ────────────────────────────────────
  verifyBtn.addEventListener("click", async () => {
    const otp = otpCells.map((c) => c.value).join("");
    if (otp.length < otpCells.length) {
      otpCells.find((c) => !c.value)?.focus();
      return;
    }

    const phone = localStorage.getItem("dustid_phone");
    clearError(otpError);
    verifyBtn.disabled = true;
    verifyBtn.textContent = "Verifying…";

    try {
      const res = await fetch("http://127.0.0.1:5000/validate-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        otpCells.forEach((c) => (c.value = ""));
        otpCells[0].focus();
        showError(otpError, data.message || "Invalid code. Please try again.");
        return;
      }

      if (data.token) {
        sessionStorage.setItem("dustid_token", data.token);
      }

      otpModal.classList.add("hidden");
      loadContacts();
      contactsModal.classList.remove("hidden");
      contactSearch.value = "";
      contactSearch.focus();
    } catch {
      showError(otpError, "Network error. Please check your connection.");
    } finally {
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify";
    }
  });

  // ── Contacts ─────────────────────────────────────────────────────

  let cachedContacts = [];

  function initials(name) {
    return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  }

  function renderContacts(contacts) {
    contactList.innerHTML = "";
    if (!contacts.length) {
      contactsEmpty.classList.remove("hidden");
      return;
    }
    contactsEmpty.classList.add("hidden");
    contacts.forEach((contact) => {
      const li = document.createElement("li");
      li.className = "dustid-contact-item";
      li.setAttribute("role", "option");
      li.dataset.id = contact.id;
      li.innerHTML = `
        <span class="dustid-contact-avatar" aria-hidden="true">${contact.initials}</span>
        <span class="dustid-contact-name">${contact.name}</span>
      `;
      li.addEventListener("click", () => selectContact(contact));
      contactList.appendChild(li);
    });
  }

  async function loadContacts() {
    const token = sessionStorage.getItem("dustid_token");
    clearError(contactsError);

    try {
      const res = await fetch("http://127.0.0.1:5000/friends", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showError(contactsError, data.message || "Failed to load contacts.");
        renderContacts([]);
        return;
      }

      cachedContacts = (data.friends || []).map((f) => ({
        ...f,
        initials: initials(f.name),
      }));
      renderContacts(cachedContacts);
    } catch {
      showError(contactsError, "Network error. Could not load contacts.");
      renderContacts([]);
    }
  }

  contactSearch.addEventListener("input", () => {
    const q = contactSearch.value.trim().toLowerCase();
    renderContacts(
      q ? cachedContacts.filter((c) => c.name.toLowerCase().includes(q)) : cachedContacts
    );
  });

  function selectContact(contact) {
    localStorage.setItem("dustid_selected_contact", JSON.stringify(contact));
    contactsModal.classList.add("hidden");

    chipAvatar.textContent = contact.initials;
    chipName.textContent   = contact.name;
    connectBtn.classList.add("hidden");
    selectedChip.classList.remove("hidden");
  }

  chipChangeBtn.addEventListener("click", () => {
    loadContacts();
    contactsModal.classList.remove("hidden");
    contactSearch.value = "";
    contactSearch.focus();
  });

  contactsBackBtn.addEventListener("click", () => {
    contactsModal.classList.add("hidden");
    otpCells.forEach((c) => (c.value = ""));
    otpModal.classList.remove("hidden");
    otpCells[0].focus();
  });
});
