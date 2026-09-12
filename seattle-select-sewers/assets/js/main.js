/* Seattle Select Sewers landing page — form handling + conversion tracking */
(function () {
  'use strict';

  /* Where the lead form POSTs. Leave empty to run in demo mode (no network
     call, success message only) until a CRM / form endpoint is connected. */
  var FORM_ENDPOINT = '';

  function track(event, params) {
    if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: event }, params || {}));
  }

  /* --- Click-to-call tracking on every phone link --- */
  document.querySelectorAll('[data-track="call"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('phone_call_click', { placement: el.dataset.location || 'unknown' });
    });
  });

  /* --- Lead forms (hero and FAQ share this handler) --- */
  document.querySelectorAll('.lead-form').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    var buttonLabel = button ? button.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot: silently accept and discard bot submissions.
      if (form.elements.company && form.elements.company.value) return;

      // Every field is required.
      var required = ['first_name', 'last_name', 'phone', 'email', 'zip', 'service', 'notes'];
      var missing = [];
      required.forEach(function (key) {
        var field = form.elements[key];
        if (field && !field.value.trim()) {
          missing.push(field.previousElementSibling.textContent.replace('*', '').trim());
        }
      });

      if (missing.length) {
        show(status, 'error', 'Please fill in: ' + missing.join(', ') + '.');
        (form.elements[required.find(function (k) {
          var f = form.elements[k]; return f && !f.value.trim();
        })] || {}).focus?.();
        return;
      }

      var email = form.elements.email;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
        show(status, 'error', 'That email address looks incomplete — please check it.');
        email.focus();
        return;
      }

      button.disabled = true;
      button.textContent = 'Sending…';

      var payload = Object.fromEntries(new FormData(form).entries());
      delete payload.company;
      payload.source = form.dataset.source || form.id;
      payload.page = location.pathname + location.search;

      submit(payload)
        .then(function () {
          track('generate_lead', { service: payload.service || '', source: payload.source });
          form.reset();
          show(status, 'ok', "Thanks — we've got it. Expect a call back shortly. For an active backup, call (425) 531-4847 now.");
        })
        .catch(function () {
          show(status, 'error', "We couldn't send that. Please call (425) 531-4847 and we'll take care of it right away.");
        })
        .finally(function () {
          button.disabled = false;
          button.textContent = buttonLabel;
        });
    });
  });

  function submit(payload) {
    if (!FORM_ENDPOINT) return Promise.resolve(); // demo mode
    return fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('Request failed: ' + res.status);
    });
  }

  function show(status, state, message) {
    if (!status) return;
    status.hidden = false;
    status.dataset.state = state;
    status.textContent = message;
    status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* --- FAQ accordion: keep one panel open at a time --- */
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) { if (other !== item) other.open = false; });
    });
  });
})();
