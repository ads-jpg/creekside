/**
 * Landing page behaviour. Plain browser JavaScript, no build step, no framework.
 *
 * Three jobs:
 *   1. carry ad-click attribution into the lead form
 *   2. validate and submit the form without a page reload
 *   3. report conversions to Google Ads, GA4 and Meta
 */
(function () {
  'use strict';

  var cfg = window.__CREEKSIDE__ || {};
  var STORAGE_KEY = 'creekside_attribution';

  var ATTRIBUTION_KEYS = [
    'gclid',
    'wbraid',
    'gbraid',
    'fbclid',
    'msclkid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  /* ---------------------------------------------------------------- tracking */

  function track(event, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', event, params || {});
    }
    if (window.dataLayer) {
      window.dataLayer.push(Object.assign({ event: event }, params || {}));
    }
  }

  /** Google Ads only counts a conversion when the send_to matches AW-ID/label. */
  function reportConversion(value) {
    if (typeof window.gtag === 'function' && cfg.adsId && cfg.adsLabel) {
      window.gtag('event', 'conversion', {
        send_to: cfg.adsId + '/' + cfg.adsLabel,
        value: value || 0,
        currency: 'USD',
      });
    }
    if (cfg.hasPixel && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
    }
  }
  window.reportConversion = reportConversion;

  /* ----------------------------------------------------------- attribution */

  function readAttribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      stored = {};
    }
    // A fresh click always wins; otherwise keep what the first pageview captured,
    // so an anchor click or a back-navigation does not wipe the gclid.
    ATTRIBUTION_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) stored[key] = value.slice(0, 300);
    });
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      /* private browsing — attribution is best effort */
    }
    return stored;
  }

  /* ------------------------------------------------------------ validation */

  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

  function messageFor(input) {
    var value = (input.value || '').trim();
    var label = (input.closest('[data-field]').querySelector('label') || {}).textContent || 'This field';
    label = label.replace(/\s*\*\s*$/, '').replace(/\s*\(optional\)\s*$/, '').trim();

    if (input.type === 'checkbox') {
      return input.required && !input.checked ? 'Please tick this box to continue.' : '';
    }
    if (input.required && !value) {
      return 'Please enter your ' + label.toLowerCase() + '.';
    }
    if (!value) return '';
    if (input.type === 'email' && !EMAIL.test(value)) {
      return 'That email address does not look right.';
    }
    if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) {
      return 'Please enter a full phone number, including the area code.';
    }
    return '';
  }

  function showError(input, message) {
    var wrapper = input.closest('[data-field]');
    if (!wrapper) return !message;
    var slot = wrapper.querySelector('.field-error');
    wrapper.setAttribute('data-invalid', message ? 'true' : 'false');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message;
    return !message;
  }

  /* ------------------------------------------------------------------ form */

  function initForm() {
    var form = document.getElementById('lead-form-el');
    if (!form) return;

    var status = document.getElementById('form-status');
    var button = form.querySelector('button[type="submit"]');
    var label = form.querySelector('[data-submit-label]');
    var spinner = form.querySelector('[data-submit-spinner]');
    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea')).filter(
      function (el) {
        return el.type !== 'hidden' && el.name !== 'company_website';
      }
    );

    // Hand validation over to us now that we know scripting works. Without JS the
    // browser's own validation and a plain POST to /api/lead still get the lead through.
    form.setAttribute('novalidate', 'novalidate');

    var attribution = readAttribution();
    var setHidden = function (name, value) {
      var el = form.querySelector('input[type="hidden"][name="' + name + '"]');
      if (el) el.value = value || '';
    };
    setHidden('form_rendered_at', String(Date.now()));
    setHidden('page_path', window.location.pathname + window.location.search);
    setHidden('referrer', document.referrer);
    ATTRIBUTION_KEYS.forEach(function (key) {
      setHidden(key, attribution[key]);
    });

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        showError(input, messageFor(input));
      });
      input.addEventListener('input', function () {
        if (input.closest('[data-field]').getAttribute('data-invalid') === 'true') {
          showError(input, messageFor(input));
        }
      });
    });

    var startedReported = false;
    form.addEventListener('input', function () {
      if (!startedReported) {
        startedReported = true;
        track('form_start', { form_id: 'lead' });
      }
    });

    function setBusy(busy) {
      button.disabled = busy;
      if (label) label.hidden = busy;
      if (spinner) spinner.hidden = !busy;
    }

    function setStatus(message) {
      if (!status) return;
      status.textContent = message || '';
      status.classList.toggle('hidden', !message);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setStatus('');

      var firstBad = null;
      inputs.forEach(function (input) {
        var message = messageFor(input);
        if (!showError(input, message) && !firstBad) firstBad = input;
      });

      if (firstBad) {
        firstBad.focus();
        firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
        track('form_error', { form_id: 'lead', field: firstBad.name });
        return;
      }

      setBusy(true);

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = value;
      });

      fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response.json().catch(function () {
            return { ok: response.ok };
          });
        })
        .then(function (result) {
          if (!result || !result.ok) throw new Error((result && result.error) || 'Submission failed');
          track('generate_lead', { form_id: 'lead' });
          reportConversion();
          var next = form.getAttribute('data-success') || '/thanks';
          window.location.assign(next);
        })
        .catch(function () {
          setBusy(false);
          setStatus(
            'Sorry, something went wrong sending that. Please try again, or call us and we will take the details over the phone.'
          );
          track('form_error', { form_id: 'lead', field: 'network' });
        });
    });
  }

  /* -------------------------------------------------------------- sticky CTA */

  function initStickyCta() {
    var bar = document.getElementById('sticky-cta');
    var target = document.getElementById('lead-form');
    if (!bar) return;

    var show = function (visible) {
      bar.classList.toggle('translate-y-full', !visible);
      bar.setAttribute('data-hidden', visible ? 'false' : 'true');
    };

    // Appear once the visitor has scrolled past the hero, disappear over the form itself.
    var scrolled = false;
    var formOnScreen = false;
    var update = function () {
      show(scrolled && !formOnScreen);
    };

    window.addEventListener(
      'scroll',
      function () {
        scrolled = window.scrollY > window.innerHeight * 0.6;
        update();
      },
      { passive: true }
    );

    if (target && 'IntersectionObserver' in window) {
      new IntersectionObserver(
        function (entries) {
          formOnScreen = entries[0].isIntersecting;
          update();
        },
        { threshold: 0.15 }
      ).observe(target);
    }
  }

  /* ----------------------------------------------------------- click events */

  function initClickTracking() {
    document.addEventListener('click', function (event) {
      var el = event.target.closest('[data-track]');
      if (!el) return;
      var name = el.getAttribute('data-track');
      if (name === 'call') {
        track('phone_call_click', { link_url: el.getAttribute('href') });
        reportConversion();
      } else {
        track('cta_click', { cta: name });
      }
    });
  }

  function init() {
    readAttribution();
    initForm();
    initStickyCta();
    initClickTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
