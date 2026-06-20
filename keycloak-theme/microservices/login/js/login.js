/**
 * Microservices Platform – Keycloak Login JS
 * Injects the left-panel branding and enhances UX
 */
(function () {
  'use strict';

  /* ── Inject left-panel branding ── */
  function injectBranding() {
    var brand = document.querySelector('.login-pf-brand');
    if (!brand) return;

    brand.innerHTML = [
      '<div class="kc-brand-title">Microservices<br>Platform</div>',
      '<div class="kc-brand-subtitle">Plateforme d\'apprentissage en ligne<br>propulsée par Spring Cloud & Angular</div>',
      '<div class="kc-brand-badges">',
      '  <span class="kc-brand-badge">Angular</span>',
      '  <span class="kc-brand-badge">Spring Boot</span>',
      '  <span class="kc-brand-badge">Node.js</span>',
      '  <span class="kc-brand-badge">PostgreSQL</span>',
      '  <span class="kc-brand-badge">Keycloak</span>',
      '  <span class="kc-brand-badge">RabbitMQ</span>',
      '</div>'
    ].join('');
  }

  /* ── Password visibility toggle ── */
  function addPasswordToggle() {
    var passwordFields = document.querySelectorAll('input[type="password"]');
    passwordFields.forEach(function (field) {
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;';

      field.parentNode.insertBefore(wrapper, field);
      wrapper.appendChild(field);

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Afficher/masquer le mot de passe');
      toggle.style.cssText = [
        'position:absolute;right:12px;top:50%;transform:translateY(-50%);',
        'background:none;border:none;cursor:pointer;padding:4px;',
        'color:#9ca3af;transition:color 200ms;display:flex;align-items:center;'
      ].join('');

      toggle.innerHTML = eyeIcon();

      toggle.addEventListener('click', function () {
        var isPassword = field.type === 'password';
        field.type = isPassword ? 'text' : 'password';
        toggle.innerHTML = isPassword ? eyeOffIcon() : eyeIcon();
        toggle.style.color = isPassword ? '#10b981' : '#9ca3af';
      });

      wrapper.appendChild(toggle);
    });
  }

  function eyeIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  }

  function eyeOffIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  }

  /* ── Auto-focus first input ── */
  function autoFocus() {
    var firstInput = document.querySelector('input[type="text"], input[type="email"]');
    if (firstInput) {
      setTimeout(function () { firstInput.focus(); }, 100);
    }
  }

  /* ── Add loading state to submit button ── */
  function addLoadingState() {
    var form = document.querySelector('form');
    var submitBtn = document.querySelector('#kc-login, input[type="submit"], button[type="submit"]');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', function () {
      submitBtn.disabled = true;
      var originalText = submitBtn.value || submitBtn.textContent;
      if (submitBtn.tagName === 'INPUT') {
        submitBtn.value = 'Connexion en cours…';
      } else {
        submitBtn.textContent = 'Connexion en cours…';
      }
      submitBtn.style.opacity = '0.8';
    });
  }

  /* ── Animate card on load ── */
  function animateCard() {
    var card = document.querySelector('#kc-container-wrapper, .card-pf');
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    injectBranding();
    addPasswordToggle();
    autoFocus();
    addLoadingState();
    animateCard();
  });
})();
