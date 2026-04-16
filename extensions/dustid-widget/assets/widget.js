(function () {
  const root = document.getElementById('dustid-widget-root');
  if (!root) return;

  if (!document.getElementById('dustid-fonts')) {
    const pc1 = document.createElement('link');
    pc1.rel = 'preconnect'; pc1.href = 'https://fonts.googleapis.com';
    const pc2 = document.createElement('link');
    pc2.rel = 'preconnect'; pc2.href = 'https://fonts.gstatic.com'; pc2.crossOrigin = '';
    const font = document.createElement('link');
    font.id = 'dustid-fonts'; font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Lato:wght@400;700&display=swap';
    document.head.append(pc1, pc2, font);
  }

  // Move the root element to the correct position in the page
  (function positionWidget() {
    const position = root.dataset.position || 'after_announcement';
    const header = document.querySelector(
      'header, #shopify-section-header, .section-header, [data-section-type="header"]'
    );
    const announcement = document.querySelector(
      '#shopify-section-announcement-bar, .announcement-bar, [data-section-type="announcement-bar"]'
    );

    if (position === 'before_header') {
      const anchor = header || document.body.firstElementChild;
      anchor.parentNode.insertBefore(root, anchor);
    } else if (position === 'after_announcement') {
      const anchor = announcement || header;
      if (anchor) anchor.insertAdjacentElement('afterend', root);
      else document.body.insertAdjacentElement('afterbegin', root);
    } else {
      // after_header
      if (header) header.insertAdjacentElement('afterend', root);
      else document.body.insertAdjacentElement('afterbegin', root);
    }
  })();

  const DUMMY_CONTACTS = [
    { id: '1', name: 'Amara Okafor' },
    { id: '2', name: 'James Whitfield' },
    { id: '3', name: 'Sofia Mendes' },
    { id: '4', name: 'Kwame Asante' },
    { id: '5', name: 'Priya Nair' },
  ];

  const DUMMY_SESSION = { userId: 'usr_demo123', token: 'demo_token', name: 'Muhammad' };

  const session = JSON.parse(localStorage.getItem('dustid_session') || 'null');
  session ? renderSelector(session) : renderSignIn();

  function renderSignIn() {
    root.innerHTML = `
      <div id="dustid-banner">
        <div class="d-icon">🎁</div>
        <div class="d-text">
          <div class="d-title">Send as a Gift</div>
          <div class="d-sub">No address needed — deliver to a saved Dustid contact</div>
        </div>
        <div class="d-actions">
          <button class="d-btn" id="d-signin">Connect to Dustid →</button>
        </div>
      </div>
    `;
    document.getElementById('d-signin').addEventListener('click', function () {
      localStorage.setItem('dustid_session', JSON.stringify(DUMMY_SESSION));
      renderSelector(DUMMY_SESSION);
    });
  }

  function renderSelector(session) {
    const saved = JSON.parse(sessionStorage.getItem('dustid_contact') || 'null');

    root.innerHTML = `
      <div id="dustid-banner" ${saved ? 'class="confirmed"' : ''}>
        <div class="d-icon">🎁</div>
        <div class="d-text">
          <div class="d-title">Send as a Gift</div>
          <div class="d-sub">Hi ${session.name} — choose who to send to</div>
        </div>
        <div class="d-actions">
          ${saved ? `
            <div class="d-pill">
              <span class="d-pill-dot"></span>
              Sending to ${saved.name}
            </div>
          ` : ''}
          <div class="d-select-wrap">
            <select class="d-select" id="d-select">
              <option value="">${saved ? 'Change contact' : 'Select contact...'}</option>
              ${DUMMY_CONTACTS.map(c => `
                <option value="${c.id}" ${saved?.id === c.id ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>
          <button class="d-ghost" id="d-signout">Sign out</button>
        </div>
      </div>
    `;

    document.getElementById('d-select').addEventListener('change', function () {
      const contact = DUMMY_CONTACTS.find(c => c.id === this.value);
      if (!contact) return;
      sessionStorage.setItem('dustid_contact', JSON.stringify({ id: contact.id, name: contact.name }));
      renderSelector(session);
    });

    document.getElementById('d-signout').addEventListener('click', function () {
      localStorage.removeItem('dustid_session');
      sessionStorage.removeItem('dustid_contact');
      renderSignIn();
    });
  }
})();
