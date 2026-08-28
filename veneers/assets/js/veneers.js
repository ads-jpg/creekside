/* =============================================================================
   Vida Dentistry — Veneers landing page behaviour
   No dependencies. Loaded with `defer`, so the DOM is ready on execution.

   Responsibilities
     1. Configuration
     2. Analytics: dataLayer events for every conversion action
     3. Google Ads attribution: capture gclid / UTMs for offline import
     4. UI: sticky header, sticky mobile CTA, reveal-on-scroll, anchor offset
     5. reCAPTCHA v3: lazy-loaded, fail-open token generation
     6. Lead form: validation, submission, success state, conversion event
     7. Google reviews: live rating + reviews, honest fallback
     8. Instagram: live recent posts, honest fallback
   ============================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------------
     1. CONFIGURATION
     Everything environment-specific lives here. Set these once at deploy time.
     Leaving an endpoint as null disables that feature gracefully — the page
     never shows placeholder or invented content in its place.
     --------------------------------------------------------------------------- */
  var CONFIG = {
    phone: '+19492098889',

    /* Where the lead form posts. Any endpoint that accepts a JSON POST works:
       a serverless function, a CRM webhook, or your existing form handler.
       While null, the form validates and reports a configuration notice
       instead of silently swallowing a real lead. */
    formEndpoint: null,

    /* Your own cached proxy in front of the Google Places API (New).
       Must return: { rating: Number, userRatingCount: Number, reviews: [...] }
       Never call the Places API directly from the browser — it would expose
       the API key. See docs/GOOGLE-REVIEWS-AND-INSTAGRAM.md. */
    reviewsEndpoint: null,

    /* Your own cached proxy in front of the Instagram Graph API, or a hosted
       feed provider's JSON endpoint.
       Must return: { data: [ { id, caption, media_type, media_url,
                                thumbnail_url, permalink } ] } */
    instagramEndpoint: null,
    instagramCount: 6,

    /* reCAPTCHA v3 site key. v3 is score-based and invisible — no checkbox and
       no image puzzle, so it costs nothing in conversion, unlike v2.
       While null, the form still submits and the honeypot and timing signals
       still apply; only the reCAPTCHA score is absent.
       The score is meaningless unless the token is verified SERVER-SIDE.
       See docs/SPAM-PROTECTION.md. */
    recaptchaSiteKey: null,
    recaptchaAction: 'veneers_lead',

    /* Canonical Google Business Profile link used by every review CTA. */
    googleProfileUrl: 'https://www.google.com/maps/search/?api=1&query=Vida%20Dentistry%2025270%20Marguerite%20Pkwy%20Mission%20Viejo%20CA'
  };

  var d = document;
  var $  = function (sel, ctx) { return (ctx || d).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------------------
     2. ANALYTICS
     One helper, one dataLayer event shape. Every tag in GTM keys off
     `event: 'vd_conversion_action'` plus the `action` parameter.
     --------------------------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];

  function track(action, params) {
    var payload = { event: 'vd_conversion_action', action: action, page: 'veneers' };
    if (params) {
      for (var k in params) {
        if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
      }
    }
    window.dataLayer.push(payload);
  }

  /* Bind every element carrying data-vd-cta. Click-to-call links additionally
     fire a dedicated `phone_call_click` event, which is the one imported into
     Google Ads as a conversion. */
  $$('[data-vd-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      var action = el.getAttribute('data-vd-cta');
      var href = el.getAttribute('href') || '';
      var isTel = href.indexOf('tel:') === 0;

      track(isTel ? 'phone_call_click' : 'cta_click', {
        cta_id: action,
        cta_text: (el.textContent || '').trim().slice(0, 60),
        destination: isTel ? 'phone' : (href.charAt(0) === '#' ? 'form' : 'external')
      });
    });
  });

  /* Scroll-depth milestones — useful for diagnosing where Ads traffic drops. */
  (function scrollDepth() {
    var marks = [25, 50, 75, 90];
    var fired = {};
    var ticking = false;

    function check() {
      var docH = d.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      var pct = (window.scrollY / docH) * 100;
      marks.forEach(function (m) {
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          track('scroll_depth', { depth: m });
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(check); }
    }, { passive: true });
  })();

  /* ---------------------------------------------------------------------------
     3. GOOGLE ADS ATTRIBUTION
     Capture gclid/wbraid/gbraid and UTMs on landing, persist for the session,
     and attach them to every lead. This is what makes offline conversion
     import (a booked consult, a closed veneers case) attributable back to the
     click that produced it.
     --------------------------------------------------------------------------- */
  var attribution = (function () {
    var KEYS = ['gclid', 'wbraid', 'gbraid', 'utm_source', 'utm_medium',
                'utm_campaign', 'utm_term', 'utm_content'];
    var STORE = 'vd_attribution';
    var params = new URLSearchParams(window.location.search);
    var stored = {};

    try { stored = JSON.parse(sessionStorage.getItem(STORE) || '{}'); } catch (e) { stored = {}; }

    var found = false;
    KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) { stored[k] = v; found = true; }
    });

    if (found) {
      stored.landing_page = window.location.pathname;
      stored.captured_at = new Date().toISOString();
      try { sessionStorage.setItem(STORE, JSON.stringify(stored)); } catch (e) { /* private mode */ }
    }

    if (!stored.referrer && d.referrer) stored.referrer = d.referrer;
    return stored;
  })();

  /* ---------------------------------------------------------------------------
     4. UI BEHAVIOUR
     --------------------------------------------------------------------------- */

  /* 4a. Header shadow once the page has scrolled. */
  var header = $('#vd-header');
  if (header) {
    var onScrollHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* 4b. Sticky mobile CTA: reveal once the hero CTAs are out of view, and
         hide again while a form is on screen so it never covers the fields. */
  var stickyBar = $('#vd-sticky-cta');
  if (stickyBar && 'IntersectionObserver' in window) {
    d.body.classList.add('has-sticky-cta');

    var heroCta = $('.vd-hero .vd-cta-group');
    var heroVisible = true;
    var formVisible = false;

    var sync = function () {
      stickyBar.classList.toggle('is-visible', !heroVisible && !formVisible);
    };

    if (heroCta) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        sync();
      }, { rootMargin: '-10px 0px 0px 0px' }).observe(heroCta);
    } else {
      heroVisible = false;
    }

    var formObserver = new IntersectionObserver(function (entries) {
      formVisible = entries.some(function (e) { return e.isIntersecting; });
      sync();
    }, { threshold: 0.12 });
    $$('.vd-form-card').forEach(function (el) { formObserver.observe(el); });

    sync();
  }

  /* 4c. Reveal on scroll. Elements are visible by default if the browser has
         no IntersectionObserver, so content is never hidden by a JS failure. */
  var revealables = $$('.vd-reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 4d. Anchor scrolling that accounts for the sticky header, then moves
         keyboard focus into the target so the jump is accessible. */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = d.getElementById(id.slice(1));
      if (!target) return;

      ev.preventDefault();
      var offset = header ? header.getBoundingClientRect().height + 12 : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });

      var focusTarget = $('input, select, textarea, [tabindex]', target) || target;
      window.setTimeout(function () {
        if (!focusTarget.hasAttribute('tabindex') && !/^(INPUT|SELECT|TEXTAREA)$/.test(focusTarget.tagName)) {
          focusTarget.setAttribute('tabindex', '-1');
        }
        focusTarget.focus({ preventScroll: true });
      }, 500);
    });
  });

  /* 4e. Footer year. */
  var yearEl = $('#vd-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------------
     5. reCAPTCHA v3
     Loaded lazily on first form interaction. The library is ~130 KB and most
     visitors never touch the form, so loading it upfront would cost Largest
     Contentful Paint — and therefore Ads Quality Score — for no benefit.

     Every failure path resolves to null rather than rejecting. A reCAPTCHA
     outage, an ad blocker, or a strict privacy extension must never stop a
     real patient from submitting: the server decides what to do with a
     missing score.
     --------------------------------------------------------------------------- */
  var recaptcha = (function () {
    var loadPromise = null;

    function load() {
      if (loadPromise) return loadPromise;
      if (!CONFIG.recaptchaSiteKey) return Promise.resolve(null);

      loadPromise = new Promise(function (resolve) {
        var s = d.createElement('script');
        s.src = 'https://www.google.com/recaptcha/api.js?render=' +
                encodeURIComponent(CONFIG.recaptchaSiteKey);
        s.async = true;
        s.onload = function () { resolve(window.grecaptcha || null); };
        s.onerror = function () { resolve(null); };
        d.head.appendChild(s);
      });
      return loadPromise;
    }

    function token() {
      return load().then(function (g) {
        if (!g || !g.execute) return null;
        return new Promise(function (resolve) {
          var settled = false;
          var done = function (v) { if (!settled) { settled = true; resolve(v); } };

          /* Don't let a hanging challenge strand the submit button. */
          window.setTimeout(function () { done(null); }, 6000);

          g.ready(function () {
            g.execute(CONFIG.recaptchaSiteKey, { action: CONFIG.recaptchaAction })
              .then(done, function () { done(null); });
          });
        });
      }).catch(function () { return null; });
    }

    return { preload: load, token: token };
  })();

  /* ---------------------------------------------------------------------------
     6. LEAD FORM
     --------------------------------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function digits(str) { return (str || '').replace(/\D/g, ''); }

  function validateField(input) {
    var field = input.closest('.vd-field');
    var value = input.value.trim();
    var ok = true;

    if (input.hasAttribute('required') && !value) ok = false;
    else if (input.type === 'email' && value && !EMAIL_RE.test(value)) ok = false;
    else if (input.type === 'tel' && value) {
      var n = digits(value).length;
      ok = n >= 10 && n <= 15;   // US 10-digit, tolerant of +1 and intl.
    }

    if (field) field.classList.toggle('has-error', !ok);
    input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  function renderSuccess(form) {
    var card = form.closest('.vd-form-card') || form.parentNode;
    var wrap = d.createElement('div');
    wrap.className = 'vd-form-success';
    wrap.setAttribute('role', 'status');
    wrap.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10"/><path d="m8 12.5 2.5 2.5L16 9.5"/>' +
      '</svg>' +
      '<h3>Thank you &mdash; we have your request.</h3>' +
      '<p>A member of our team will call you shortly to schedule your veneers consultation.</p>' +
      '<p style="margin-top:1.25rem">' +
        '<a class="vd-btn vd-btn--primary" href="tel:' + CONFIG.phone + '" data-vd-cta="post-submit-call">' +
          'Or call us now' +
        '</a>' +
      '</p>';

    card.innerHTML = '';
    card.appendChild(wrap);

    var callBtn = $('[data-vd-cta="post-submit-call"]', card);
    if (callBtn) {
      callBtn.addEventListener('click', function () {
        track('phone_call_click', { cta_id: 'post-submit-call', destination: 'phone' });
      });
    }
  }

  $$('[data-vd-form]').forEach(function (form) {
    var location = form.getAttribute('data-vd-form-location') || 'unknown';
    var inputs = $$('input, textarea', form).filter(function (i) { return i.name !== 'company'; });
    var status = $('.vd-form__status', form);
    var submitBtn = $('button[type="submit"]', form);
    var startedTracked = false;
    var startedAt = null;

    /* Warm reCAPTCHA as soon as there's intent to fill the form, so the token
       is ready by the time they hit submit and adds no perceptible delay. */
    form.addEventListener('focusin', function () { recaptcha.preload(); }, { once: true });

    inputs.forEach(function (input) {
      /* Fire form_start once, on first real interaction — a strong
         micro-conversion signal for optimising Ads bidding. */
      input.addEventListener('input', function () {
        if (!startedTracked) {
          startedTracked = true;
          startedAt = Date.now();
          track('form_start', { form_location: location });
        }
      });
      /* Only re-validate after the field has already errored, so the form
         never scolds someone mid-typing. */
      input.addEventListener('blur', function () {
        if (input.closest('.vd-field') && input.closest('.vd-field').classList.contains('has-error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      /* Honeypot: silently accept and discard, so bots get no feedback. */
      var hp = $('input[name="company"]', form);
      if (hp && hp.value) { renderSuccess(form); return; }

      var valid = true;
      inputs.forEach(function (input) { if (!validateField(input)) valid = false; });

      if (!valid) {
        if (status) { status.textContent = 'Please check the highlighted fields.'; status.dataset.state = 'error'; }
        var firstBad = $('.vd-field.has-error input, .vd-field.has-error textarea', form);
        if (firstBad) firstBad.focus();
        track('form_error', { form_location: location });
        return;
      }

      if (status) { status.textContent = ''; delete status.dataset.state; }

      var payload = {
        name:  $('input[name="name"]', form).value.trim(),
        phone: $('input[name="phone"]', form).value.trim(),
        email: $('input[name="email"]', form).value.trim(),
        goals: ($('textarea[name="goals"]', form) || { value: '' }).value.trim(),
        service: 'Veneers',
        form_location: location,
        page_url: window.location.href,
        attribution: attribution,
        /* Anti-spam signals. The server decides what to do with them — see
           docs/SPAM-PROTECTION.md. A human filling three fields essentially
           never completes in under ~3 seconds; scripted submissions routinely
           do. Sent as a signal, never enforced here, so a fast legitimate
           autofill is not silently rejected in the browser. */
        fill_ms: startedAt ? (Date.now() - startedAt) : null,
        recaptcha_action: CONFIG.recaptchaAction
      };

      if (submitBtn) {
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.textContent = 'Sending…';
      }

      var restore = function () {
        if (!submitBtn) return;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = submitBtn.dataset.label || 'Request My Consultation';
      };

      /* The conversion event fires only after the lead is actually accepted —
         never optimistically on click. */
      var succeed = function () {
        track('lead_form_submit', {
          form_location: location,
          service: 'Veneers',
          gclid: attribution.gclid || ''
        });
        renderSuccess(form);
      };

      var fail = function (message) {
        restore();
        if (status) {
          status.textContent = message;
          status.dataset.state = 'error';
        }
        track('form_error', { form_location: location, reason: 'submit_failed' });
      };

      if (!CONFIG.formEndpoint) {
        /* Fail loudly rather than pretending a real lead was captured. */
        fail('Form endpoint is not configured yet. Please call (949) 209-8889 — see docs/TRACKING-SETUP.md.');
        return;
      }

      /* Attach a fresh reCAPTCHA token, then post. Resolves to null on any
         reCAPTCHA failure so the lead still reaches the practice; the server
         treats a missing token as unscored rather than as spam. */
      recaptcha.token().then(function (token) {
        payload.recaptcha_token = token;

        return fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (res) {
          if (res.status === 403) {
            /* The server rejected this as spam. Say so plainly and give a
               human route through, rather than a dead end. */
            throw new Error('rejected');
          }
          if (!res.ok) throw new Error('HTTP ' + res.status);
          succeed();
        });
      }).catch(function (err) {
        fail(err && err.message === 'rejected'
          ? 'We could not verify this submission. Please call (949) 209-8889 and we will get you scheduled right away.'
          : 'Something went wrong sending your request. Please call (949) 209-8889 and we will get you scheduled.');
      });
    });
  });

  /* ---------------------------------------------------------------------------
     7. GOOGLE REVIEWS
     Renders only what the API actually returns. If the endpoint is missing or
     errors, the skeletons are removed and the section falls back to a plain,
     truthful link to the Google Business Profile.
     --------------------------------------------------------------------------- */
  function starSvg() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
           '<path d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7Z"/></svg>';
  }

  function starsMarkup(n) {
    var out = '';
    for (var i = 0; i < Math.round(n || 0); i++) out += starSvg();
    return out;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function applyGoogleProfileLinks() {
    $$('[data-vd-rating-badge]').forEach(function (el) {
      if (CONFIG.googleProfileUrl) el.setAttribute('href', CONFIG.googleProfileUrl);
    });
  }

  function paintRatingBadges(rating, count) {
    $$('[data-vd-rating-badge]').forEach(function (badge) {
      var score = $('[data-vd-rating-score]', badge);
      var stars = $('[data-vd-rating-stars]', badge);
      var label = $('[data-vd-rating-label]', badge);

      if (score) score.textContent = Number(rating).toFixed(1);
      if (stars) stars.innerHTML = starsMarkup(rating);
      if (label) {
        label.textContent = count
          ? count.toLocaleString() + ' Google reviews'
          : 'Rated on Google';
      }
      badge.setAttribute('aria-label',
        Number(rating).toFixed(1) + ' out of 5 stars on Google' +
        (count ? ' from ' + count + ' reviews' : '') + '. Opens Google in a new tab.');
    });

    /* Trust-bar tile mirrors the same live figure. */
    var trustVal = $('[data-vd-trust-rating]');
    var trustLbl = $('[data-vd-trust-label]');
    if (trustVal) trustVal.textContent = Number(rating).toFixed(1) + '★';
    if (trustLbl && count) trustLbl.textContent = count.toLocaleString() + ' Google reviews';
  }

  function renderReviews(reviews) {
    var grid = $('[data-vd-reviews]');
    if (!grid) return;

    var html = reviews.slice(0, 6).map(function (r) {
      var text   = (r.text && (r.text.text || r.text)) || '';
      var author = (r.authorAttribution && r.authorAttribution.displayName) || r.author_name || 'Google user';
      var photo  = (r.authorAttribution && r.authorAttribution.photoUri) || r.profile_photo_url || '';
      var when   = r.relativePublishTimeDescription || r.relative_time_description || '';
      var uri    = (r.authorAttribution && r.authorAttribution.uri) || r.author_url || CONFIG.googleProfileUrl;
      var rating = r.rating || 5;
      var initial = author.trim().charAt(0).toUpperCase() || 'G';

      return '' +
        '<article class="vd-review">' +
          '<span class="vd-review__stars" aria-label="' + rating + ' out of 5 stars">' + starsMarkup(rating) + '</span>' +
          '<blockquote class="vd-review__text">' + escapeHtml(text) + '</blockquote>' +
          '<div class="vd-review__meta">' +
            '<span class="vd-review__avatar">' +
              (photo ? '<img src="' + escapeHtml(photo) + '" alt="" loading="lazy" width="34" height="34">' : escapeHtml(initial)) +
            '</span>' +
            '<span>' +
              '<span class="vd-review__name">' + escapeHtml(author) + '</span>' +
              (when ? '<span class="vd-review__date">' + escapeHtml(when) + '</span>' : '') +
            '</span>' +
          '</div>' +
        '</article>';
    }).join('');

    grid.innerHTML = html;

    /* Google's Places policy requires the reviews be attributed to Google. */
    var note = $('[data-vd-reviews-note]');
    if (note) {
      note.innerHTML = 'Reviews sourced live from Google. ' +
        '<a href="' + escapeHtml(CONFIG.googleProfileUrl) + '" target="_blank" rel="noopener">See all reviews on Google</a>.';
    }
  }

  function reviewsFallback() {
    var grid = $('[data-vd-reviews]');
    if (grid) grid.remove();
    var note = $('[data-vd-reviews-note]');
    if (note) {
      note.innerHTML = '<a href="' + escapeHtml(CONFIG.googleProfileUrl) + '" target="_blank" rel="noopener">' +
        'Read our patient reviews on Google</a>';
    }
  }

  (function loadReviews() {
    applyGoogleProfileLinks();

    if (!CONFIG.reviewsEndpoint) { reviewsFallback(); return; }

    fetch(CONFIG.reviewsEndpoint, { headers: { Accept: 'application/json' } })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var rating = data.rating;
        var count  = data.userRatingCount || data.user_ratings_total;
        var list   = data.reviews || [];

        if (rating) paintRatingBadges(rating, count);
        if (list.length) renderReviews(list); else reviewsFallback();
      })
      .catch(reviewsFallback);
  })();

  /* ---------------------------------------------------------------------------
     8. INSTAGRAM
     Lazily fetched: the request only fires when the section approaches the
     viewport, so it costs nothing on first paint or for visitors who convert
     before scrolling that far.
     --------------------------------------------------------------------------- */
  function renderInstagram(items) {
    var grid = $('[data-vd-instagram]');
    if (!grid) return;

    var html = items.slice(0, CONFIG.instagramCount).map(function (post) {
      var src = post.media_type === 'VIDEO'
        ? (post.thumbnail_url || post.media_url)
        : post.media_url;
      if (!src) return '';

      var caption = (post.caption || '').slice(0, 140);
      var alt = caption
        ? 'Instagram post by @veneergoddess: ' + caption.slice(0, 90)
        : 'Recent cosmetic dentistry work posted by @veneergoddess on Instagram';

      return '' +
        '<a class="vd-ig-item" href="' + escapeHtml(post.permalink) + '" target="_blank" rel="noopener"' +
           ' data-vd-cta="instagram-post">' +
          '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async" width="400" height="400">' +
          '<span class="vd-ig-item__overlay"><span>' + escapeHtml(caption) + '</span></span>' +
        '</a>';
    }).join('');

    if (!html) { instagramFallback(); return; }

    grid.innerHTML = html;

    $$('[data-vd-cta="instagram-post"]', grid).forEach(function (el) {
      el.addEventListener('click', function () {
        track('cta_click', { cta_id: 'instagram-post', destination: 'external' });
      });
    });
  }

  function instagramFallback() {
    /* Drop the empty grid; the section keeps its heading and follow CTA, which
       are genuine. Nothing fake is substituted for the feed. */
    var grid = $('[data-vd-instagram]');
    if (grid) grid.remove();
  }

  (function loadInstagram() {
    var grid = $('[data-vd-instagram]');
    if (!grid) return;

    if (!CONFIG.instagramEndpoint) { instagramFallback(); return; }

    var fetchFeed = function () {
      fetch(CONFIG.instagramEndpoint, { headers: { Accept: 'application/json' } })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(function (data) {
          var items = data.data || data.posts || [];
          if (items.length) renderInstagram(items); else instagramFallback();
        })
        .catch(instagramFallback);
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { obs.disconnect(); fetchFeed(); }
      }, { rootMargin: '400px 0px' });
      io.observe(grid);
    } else {
      fetchFeed();
    }
  })();

})();
