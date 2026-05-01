document.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("d-signin");
  const modal = document.getElementById("dustid-modal");
  const cancelBtn = document.getElementById("dustid-cancel");
  const submitBtn = document.getElementById("dustid-connect");
  const phoneInput = document.getElementById("dustid-phone");

  const otpModal = document.getElementById("dustid-otp-modal");
  const otpPhoneLabel = document.getElementById("dustid-otp-phone");
  const otpInputs = Array.from(document.querySelectorAll(".dustid-otp-input"));
  const verifyBtn = document.getElementById("dustid-verify");
  const otpBackBtn = document.getElementById("dustid-otp-back");

  const contactsModal = document.getElementById("dustid-contacts-modal");
  const contactList = document.getElementById("dustid-contact-list");
  const contactSearch = document.getElementById("dustid-contact-search");
  const contactsEmpty = document.getElementById("dustid-contacts-empty");
  const contactsBackBtn = document.getElementById("dustid-contacts-back");

  if (!connectBtn || !modal) return;

  // ── Step 1: Open phone modal ──────────────────────────────────────────────
  connectBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    phoneInput.value = "";
  });

  // ── Step 2: Phone → OTP ───────────────────────────────────────────────────
  submitBtn.addEventListener("click", () => {
    const phone = phoneInput.value.trim();
    if (!phone) {
      alert("Please enter a phone number");
      return;
    }
    localStorage.setItem("dustid_phone", phone);
    modal.classList.add("hidden");
    otpPhoneLabel.textContent = phone;
    otpInputs.forEach((inp) => (inp.value = ""));
    otpModal.classList.remove("hidden");
    otpInputs[0].focus();
  });

  // OTP input navigation
  otpInputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      inp.value = inp.value.replace(/\D/g, "").slice(-1);
      if (inp.value && i < otpInputs.length - 1) otpInputs[i + 1].focus();
    });

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !inp.value && i > 0) otpInputs[i - 1].focus();
    });

    inp.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, otpInputs.length);
      pasted.split("").forEach((char, idx) => {
        if (otpInputs[idx]) otpInputs[idx].value = char;
      });
      const nextEmpty = otpInputs.find((inp) => !inp.value);
      (nextEmpty || otpInputs[otpInputs.length - 1]).focus();
    });
  });

  otpBackBtn.addEventListener("click", () => {
    otpModal.classList.add("hidden");
    modal.classList.remove("hidden");
  });

  // ── Step 3: OTP → Contact selection ──────────────────────────────────────
  verifyBtn.addEventListener("click", () => {
    const otp = otpInputs.map((inp) => inp.value).join("");
    if (otp.length < otpInputs.length) {
      alert("Please enter the full OTP code");
      return;
    }

    // TODO: replace with real OTP verification API call
    otpModal.classList.add("hidden");
    loadContacts();
    contactsModal.classList.remove("hidden");
    contactSearch.value = "";
    contactSearch.focus();
  });

  // ── Contact list ──────────────────────────────────────────────────────────

  // TODO: replace with fetch("/api/dustid/contacts") after real auth
  const MOCK_CONTACTS = [
    { id: "c1", name: "Alice Johnson", initials: "AJ" },
    { id: "c2", name: "Bob Martinez", initials: "BM" },
    { id: "c3", name: "Clara Osei", initials: "CO" },
    { id: "c4", name: "David Kim", initials: "DK" },
    { id: "c5", name: "Ella Nguyen", initials: "EN" },
  ];

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
      li.dataset.id = contact.id;
      li.innerHTML = `
        <span class="dustid-contact-avatar">${contact.initials}</span>
        <span class="dustid-contact-name">${contact.name}</span>
      `;
      li.addEventListener("click", () => selectContact(contact));
      contactList.appendChild(li);
    });
  }

  function loadContacts() {
    renderContacts(MOCK_CONTACTS);
  }

  contactSearch.addEventListener("input", () => {
    const q = contactSearch.value.trim().toLowerCase();
    const filtered = MOCK_CONTACTS.filter((c) => c.name.toLowerCase().includes(q));
    renderContacts(filtered);
  });

  function selectContact(contact) {
    localStorage.setItem("dustid_selected_contact", JSON.stringify(contact));
    contactsModal.classList.add("hidden");
    connectBtn.textContent = `Sending to ${contact.name.split(" ")[0]} ✓`;
  }

  contactsBackBtn.addEventListener("click", () => {
    contactsModal.classList.add("hidden");
    otpInputs.forEach((inp) => (inp.value = ""));
    otpModal.classList.remove("hidden");
    otpInputs[0].focus();
  });
});
