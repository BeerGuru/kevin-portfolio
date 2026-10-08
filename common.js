function mergeDeep(base, override) {
  if (!override || typeof override !== 'object') return base;

  const result = Array.isArray(base) ? [...base] : { ...base };

  Object.entries(override).forEach(([key, value]) => {
    const existing = result[key];

    if (value && typeof value === 'object' && !Array.isArray(value) && existing && typeof existing === 'object' && !Array.isArray(existing)) {
      result[key] = mergeDeep(existing, value);
      return;
    }

    result[key] = structuredClone(value);
  });

  return result;
}

function resolveActiveContent() {
  const base = window.PORTFOLIO_CONTENT || {};
  const variants = base.variants || {};
  const requestedVariant = new URLSearchParams(window.location.search).get('variant') || 'main';
  const variantKey = variants[requestedVariant] ? requestedVariant : 'main';
  const activeVariant = variants[variantKey] || {};
  const merged = mergeDeep(base, activeVariant);
  delete merged.variants;
  return merged;
}

const content = resolveActiveContent();

if (!content || !content.profile) {
  throw new Error('Missing PORTFOLIO_CONTENT. Ensure content.js loads before common.js.');
}

function urlWithVariant(href) {
  const currentVariant = new URLSearchParams(window.location.search).get('variant');
  if (!currentVariant) return href;
  const url = new URL(href, window.location.href);
  if (!url.searchParams.has('variant')) {
    url.searchParams.set('variant', currentVariant);
  }
  return url.toString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Like escapeHtml, but first converts Markdown-style links — [label](https://example.com)
// — into real anchor tags. Everything else is still escaped, so this stays safe to use
// with untrusted/plain content.js text. Use this instead of escapeHtml for fields where
// an editor might want to link out to something (e.g. a case study reflection).
function richText(value) {
  return escapeHtml(value).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  );
}

function applySeo(title, description, ogTitle, ogDescription) {
  document.title = title;
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  const ogDescriptionEl = document.querySelector('meta[property="og:description"]');

  if (metaDescription) metaDescription.setAttribute('content', description);
  if (ogTitleEl) ogTitleEl.setAttribute('content', ogTitle);
  if (ogDescriptionEl) ogDescriptionEl.setAttribute('content', ogDescription);
}

function getActiveFontTheme() {
  const params = new URLSearchParams(window.location.search);
  const requestedTheme = params.get('font') || params.get('theme') || 'lora';
  const aliasMap = {
    default: 'default',
    sans: 'default',
    serif: 'lora',
    fraunces: 'fraunces',
    cormorant: 'cormorant',
    lora: 'lora',
    libre: 'libre-baskerville',
    'libre-baskerville': 'libre-baskerville',
  };

  return aliasMap[requestedTheme] || 'lora';
}

function applyFontTheme() {
  document.body.setAttribute('data-font', getActiveFontTheme());
}

function getActiveColorTheme() {
  const params = new URLSearchParams(window.location.search);
  const requestedTheme = params.get('palette') || params.get('color') || 'green';
  const aliasMap = {
    default: 'green',
    orange: 'warm',
    warm: 'warm',
    blue: 'blue',
    green: 'green',
    neutral: 'neutral',
    slate: 'neutral',
  };

  return aliasMap[requestedTheme] || 'green';
}

function applyColorTheme() {
  document.body.setAttribute('data-theme', getActiveColorTheme());
}

function renderHeader(navBase = '') {
  const brandName = document.getElementById('brand-name');
  const mainNav = document.getElementById('main-nav');
  const resumeLink = document.getElementById('resume-link');

  if (brandName) {
    brandName.textContent = content.profile.name;
    brandName.setAttribute('data-edit', 'profile.name');
  }
  if (resumeLink) resumeLink.setAttribute('href', urlWithVariant(content.profile.resumeHref));

  if (mainNav) {
    mainNav.innerHTML = content.nav
      .map(
        (item, index) =>
          `<a href="${escapeHtml(urlWithVariant(navBase + item.href))}" data-edit="nav[${index}].label">${escapeHtml(item.label)}</a>`
      )
      .join('');
  }
}

function isDebugModeEnabled() {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'true';
}

function renderVariantSelector() {
  if (!isDebugModeEnabled()) return;

  const wrapper = document.getElementById('variant-picker-wrap');
  const variants = window.PORTFOLIO_CONTENT && window.PORTFOLIO_CONTENT.variants
    ? Object.keys(window.PORTFOLIO_CONTENT.variants)
    : [];

  if (!wrapper || variants.length === 0) return;

  const currentVariant = new URLSearchParams(window.location.search).get('variant') || 'main';

  wrapper.innerHTML = `
    <label class="variant-picker" for="variant-select">
      <span>Variant</span>
      <select id="variant-select" aria-label="Select portfolio variant">
        ${variants
          .map(
            (variant) =>
              `<option value="${escapeHtml(variant)}" ${variant === currentVariant ? 'selected' : ''}>${escapeHtml(variant)}</option>`
          )
          .join('')}
      </select>
    </label>
  `;

  const select = document.getElementById('variant-select');
  if (!select) return;

  select.addEventListener('change', (event) => {
    const nextVariant = event.target.value;
    const url = new URL(window.location.href);

    if (nextVariant === 'main') {
      url.searchParams.delete('variant');
    } else {
      url.searchParams.set('variant', nextVariant);
    }

    window.location.href = url.toString();
  });
}

function renderContact() {
  const kicker = document.getElementById('contact-kicker');
  const heading = document.getElementById('contact-heading');
  const links = document.getElementById('contact-links');

  if (kicker) {
    kicker.textContent = content.contact.kicker;
    kicker.setAttribute('data-edit', 'contact.kicker');
  }
  if (heading) {
    heading.textContent = content.contact.heading;
    heading.setAttribute('data-edit', 'contact.heading');
  }

  if (links) {
    links.innerHTML = `
      <a class="btn btn-primary" href="mailto:${escapeHtml(content.profile.email)}" data-edit="contact.emailLabel">${escapeHtml(content.contact.emailLabel)}</a>
      <a class="btn btn-ghost" href="${escapeHtml(content.profile.linkedin)}" target="_blank" rel="noreferrer" data-edit="contact.linkedinLabel">${escapeHtml(content.contact.linkedinLabel)}</a>
    `;
  }
}

function renderFooter() {
  const left = document.getElementById('footer-left');
  const right = document.getElementById('footer-right');

  if (left) {
    left.textContent = content.footer.left;
    left.setAttribute('data-edit', 'footer.left');
  }
  if (right) {
    right.textContent = content.footer.right;
    right.setAttribute('data-edit', 'footer.right');
  }
}

function setupReveal() {
  const revealedElements = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If user prefers reduced motion, skip animation and show all sections immediately
  if (prefersReducedMotion) {
    revealedElements.forEach(el => {
      el.classList.add('is-visible');
      el.style.transition = 'none'; // remove any transition delays
    });
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
    { threshold: 0.05 } // trigger sooner
  );

  revealedElements.forEach((el, index) => {
    // Shorter, more staggered delay
    el.style.transitionDelay = `${Math.min(index * 50, 200)}ms`;
    observer.observe(el);
  });
}
