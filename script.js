/* ============================================================
   PORTFOLIO — script.js
   Pure vanilla JavaScript — no frameworks or libraries
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY: Safe DOM selection
   ============================================================ */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/* ============================================================
   AUTOMATIC COPYRIGHT YEAR
   ============================================================ */
function setFooterYear() {
  const yearEl = $('#footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ============================================================
   MOBILE NAVIGATION MENU
   ============================================================ */
function initMobileNav() {
  const hamburger = $('#nav-hamburger');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');
    mobileMenu.classList.add('is-open');
    mobileMenu.removeAttribute('aria-hidden');
    // Focus first link for keyboard users
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close when a mobile nav link is clicked
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      hamburger.focus();
    }
  });

  // Close when clicking outside the nav
  document.addEventListener('click', (e) => {
    const nav = $('.nav');
    if (nav && !nav.contains(e.target) && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/* ============================================================
   SMOOTH SCROLLING
   Handles #anchor links and buttons that scroll to sections
   ============================================================ */
function initSmoothScroll() {
  // Handle all internal anchor links in nav
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        scrollToSection(target);
      }
    });
  });

  // "View My Projects" button
  const viewProjectsBtn = $('#btn-view-projects');
  if (viewProjectsBtn) {
    viewProjectsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const projects = document.getElementById('projects');
      if (projects) scrollToSection(projects);
    });
  }
}

function scrollToSection(target) {
  const navHeight = $('.site-header')?.offsetHeight || 70;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

/* ============================================================
   ACTIVE NAVIGATION HIGHLIGHTING
   Uses IntersectionObserver to detect which section is visible
   ============================================================ */
function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute('href').slice(1);
            link.classList.toggle('active', href === id);
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ============================================================
   PROJECT DETAIL MODALS
   ============================================================ */
function initModals() {
  const projectBtns = $$('.project-btn');
  const modalOverlays = $$('.modal-overlay');

  let previouslyFocusedElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    previouslyFocusedElement = document.activeElement;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = getScrollbarWidth() + 'px';

    // Focus the close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      // Small delay to ensure modal is rendered
      setTimeout(() => closeBtn.focus(), 50);
    }

    // Trap focus inside modal
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    modal.removeEventListener('keydown', trapFocus);

    // Return focus
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
      previouslyFocusedElement = null;
    }
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const modal = e.currentTarget;
    const focusableEls = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Open modals from project buttons
  projectBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  // Close button inside each modal
  modalOverlays.forEach((overlay) => {
    const closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(overlay));
    }

    // Close when clicking the backdrop (outside the modal container)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  // Escape key to close any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = modalOverlays.find((m) => !m.hasAttribute('hidden'));
      if (openModal) closeModal(openModal);
    }
  });
}

// Calculate scrollbar width to prevent layout shift when modal opens
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

/* ============================================================
   SCROLL-TO-TOP BUTTON
   ============================================================ */
function initScrollToTop() {
  const btn = $('#scroll-top-btn');
  if (!btn) return;

  function updateVisibility() {
    if (window.scrollY > 400) {
      btn.removeAttribute('hidden');
    } else {
      btn.setAttribute('hidden', '');
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Return focus to a visible element after scroll
    setTimeout(() => {
      const firstHeading = $('h1, h2, [tabindex="-1"]');
      if (firstHeading) firstHeading.focus();
    }, 600);
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
}

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
function initContactForm() {
  const form = $('#contact-form');
  const notice = $('#form-notice');

  if (!form) return;

  const fields = {
    name:    { el: $('#contact-name'),    error: $('#name-error'),    label: 'Name'    },
    email:   { el: $('#contact-email'),   error: $('#email-error'),   label: 'Email'   },
    subject: { el: $('#contact-subject'), error: $('#subject-error'), label: 'Subject' },
    message: { el: $('#contact-message'), error: $('#message-error'), label: 'Message' },
  };

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldError(field, message) {
    field.el.classList.add('is-error');
    field.el.setAttribute('aria-invalid', 'true');
    field.error.textContent = message;
  }

  function clearFieldError(field) {
    field.el.classList.remove('is-error');
    field.el.removeAttribute('aria-invalid');
    field.error.textContent = '';
  }

  function validateField(key) {
    const field = fields[key];
    const value = field.el.value.trim();

    if (!value) {
      setFieldError(field, `${field.label} is required.`);
      return false;
    }

    if (key === 'email' && !validateEmail(value)) {
      setFieldError(field, 'Please enter a valid email address.');
      return false;
    }

    clearFieldError(field);
    return true;
  }

  // Validate on blur for better UX
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field.el) return;

    field.el.addEventListener('blur', () => validateField(key));
    field.el.addEventListener('input', () => {
      if (field.el.classList.contains('is-error')) {
        validateField(key);
      }
    });
  });

  function showNotice(type, html) {
    notice.className = `form-notice is-shown form-notice--${type}`;
    notice.innerHTML = html;
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    const results = Object.keys(fields).map((key) => validateField(key));
    const allValid = results.every(Boolean);

    if (!allValid) {
      // Focus the first field with an error
      const firstError = Object.values(fields).find(
        (f) => f.el && f.el.classList.contains('is-error')
      );
      if (firstError) firstError.el.focus();
      return;
    }

    // Show informational success message
    showNotice(
      'success',
      `<strong>Thank you for your message!</strong><br>
      This portfolio form is currently a demonstration — messages are not transmitted to a server.<br>
      To get in touch directly, please email me at:
      <a href="mailto:your.email@example.com" style="color: #166534; font-weight: 600;">your.email@example.com</a>`
    );

    // Reset form fields after showing the message
    form.reset();
    Object.values(fields).forEach(clearFieldError);
  });
}

/* ============================================================
   REVEAL ON SCROLL ANIMATION
   Uses IntersectionObserver to add the is-visible class
   ============================================================ */
function initRevealOnScroll() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  // Immediately show elements if prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ============================================================
   PROJECT IMAGE FALLBACK
   Shows the SVG fallback when an image fails to load
   ============================================================ */
function initImageFallbacks() {
  $$('.project-card__img').forEach((img) => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      const fallback = this.nextElementSibling;
      if (fallback && fallback.classList.contains('project-card__img-fallback')) {
        fallback.style.display = 'flex';
      }
    });
  });
}

/* ============================================================
   INIT — run everything when DOM is ready
   ============================================================ */
function init() {
  setFooterYear();
  initMobileNav();
  initSmoothScroll();
  initActiveNav();
  initModals();
  initScrollToTop();
  initContactForm();
  initRevealOnScroll();
  initImageFallbacks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
