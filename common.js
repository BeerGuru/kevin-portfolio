const content = window.PORTFOLIO_CONTENT;

if (!content) {
  throw new Error('Missing PORTFOLIO_CONTENT. Ensure content.js loads before common.js.');
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

function renderHeader(navBase = '') {
  const brandName = document.getElementById('brand-name');
  const mainNav = document.getElementById('main-nav');
  const resumeLink = document.getElementById('resume-link');

  if (brandName) {
    brandName.textContent = content.profile.name;
    brandName.setAttribute('data-edit', 'profile.name');
  }
  if (resumeLink) resumeLink.setAttribute('href', content.profile.resumeHref);

  if (mainNav) {
    mainNav.innerHTML = content.nav
      .map(
        (item, index) =>
          `<a href="${escapeHtml(navBase + item.href)}" data-edit="nav[${index}].label">${escapeHtml(item.label)}</a>`
      )
      .join('');
  }
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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealedElements.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 70, 320)}ms`;
    observer.observe(el);
  });
}
