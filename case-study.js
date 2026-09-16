function getCaseIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('case');
}

function renderNotFound() {
  const hero = document.getElementById('case-hero');
  if (!hero) return;

  hero.innerHTML = `
    <p class="eyebrow">Case Study</p>
    <h1>We couldn't find that case study.</h1>
    <p class="hero-copy">It may have moved. Head back to <a href="index.html#work">Selected Work</a> to browse available case studies.</p>
  `;

  ['case-context', 'case-gallery', 'case-approach', 'case-decisions', 'case-outcomes'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.remove();
  });
}

function renderCaseHero(caseStudy, caseId) {
  const hero = document.getElementById('case-hero');
  if (!hero) return;

  hero.innerHTML = `
    <p class="eyebrow">Case Study</p>
    <h1 data-edit="caseStudies.${caseId}.title">${escapeHtml(caseStudy.title)}</h1>
    <p class="hero-copy" data-edit="caseStudies.${caseId}.subtitle">${escapeHtml(caseStudy.subtitle)}</p>
    <div class="hero-signal" role="note" aria-label="Role and timeline"><span data-edit="caseStudies.${caseId}.role">${escapeHtml(caseStudy.role)}</span>${caseStudy.timeline ? ` &middot; <span data-edit="caseStudies.${caseId}.timeline">${escapeHtml(caseStudy.timeline)}</span>` : `<span data-edit="caseStudies.${caseId}.timeline" style="display:none">${escapeHtml(caseStudy.timeline)}</span>`}</div>
  `;
}

function renderCaseContext(caseStudy, caseId) {
  const section = document.getElementById('case-context');
  if (!section) return;

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker">Context</p>
      <h2 data-edit="caseStudies.${caseId}.context">${escapeHtml(caseStudy.context)}</h2>
    </div>
    <article class="about-card">
      <p data-edit="caseStudies.${caseId}.problem">${escapeHtml(caseStudy.problem)}</p>
    </article>
  `;
}

function renderCaseGallery(caseStudy, caseId) {
  const section = document.getElementById('case-gallery');
  if (!section) return;

  const images = caseStudy.images || [];
  if (images.length === 0) {
    section.remove();
    return;
  }

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker">Artifacts</p>
      <h2>Wireframes and visuals from the work.</h2>
    </div>
    <div class="case-gallery">
      ${images
        .map(
          (image, index) => `
          <figure class="case-gallery-item">
            <button type="button" class="case-gallery-thumb" data-gallery-index="${index}">
              <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || '')}" loading="lazy" />
            </button>
            <figcaption data-edit="caseStudies.${caseId}.images[${index}].caption">${escapeHtml(image.caption || '')}</figcaption>
          </figure>
        `
        )
        .join('')}
    </div>
  `;

  section.querySelectorAll('[data-gallery-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const image = images[Number(button.dataset.galleryIndex)];
      openLightbox(image);
    });
  });
}

function openLightbox(image) {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  if (!lightbox || !img || !caption) return;

  img.src = image.src;
  img.alt = image.alt || '';
  caption.textContent = image.caption || '';
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lightbox) return;

  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  if (img) img.src = '';
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeButton = document.getElementById('lightbox-close');
  if (!lightbox || !closeButton) return;

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

function renderCaseApproach(caseStudy, caseId) {
  const section = document.getElementById('case-approach');
  if (!section) return;

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker">Approach</p>
      <h2>How the work came together.</h2>
    </div>
    <div class="working-notes">
      <ul>
        ${caseStudy.approach
          .map(
            (step, index) =>
              `<li data-edit="caseStudies.${caseId}.approach[${index}]">${escapeHtml(step)}</li>`
          )
          .join('')}
      </ul>
    </div>
  `;
}

function renderCaseDecisions(caseStudy, caseId) {
  const section = document.getElementById('case-decisions');
  if (!section) return;

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker">Key Decisions</p>
      <h2>Where the design point of view mattered most.</h2>
    </div>
    <div class="leadership-grid">
      ${caseStudy.decisions
        .map(
          (item, index) => `
          <article>
            <h3 data-edit="caseStudies.${caseId}.decisions[${index}].title">${escapeHtml(item.title)}</h3>
            <p data-edit="caseStudies.${caseId}.decisions[${index}].detail">${escapeHtml(item.detail)}</p>
          </article>
        `
        )
        .join('')}
    </div>
  `;
}

function renderCaseOutcomes(caseStudy, caseId) {
  const section = document.getElementById('case-outcomes');
  if (!section) return;

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker">Outcomes</p>
      <h2>What changed as a result.</h2>
    </div>
    <div class="working-notes">
      <ul>
        ${caseStudy.outcomes
          .map(
            (item, index) =>
              `<li data-edit="caseStudies.${caseId}.outcomes[${index}]">${escapeHtml(item)}</li>`
          )
          .join('')}
        ${caseStudy.reflection ? `<li data-edit="caseStudies.${caseId}.reflection">${richText(caseStudy.reflection)}</li>` : ''}
      </ul>
    </div>
    <p style="margin-top: 1.5rem;"><a class="btn btn-text" href="index.html#work">&larr; Back to Selected Work</a></p>
  `;
}

function init() {
  const caseId = getCaseIdFromQuery();
  const caseStudy = caseId ? content.caseStudies[caseId] : null;

  renderHeader('index.html');

  if (!caseStudy) {
    applySeo(
      'Case Study Not Found | ' + content.profile.name,
      'This case study could not be found.',
      'Case Study Not Found',
      'This case study could not be found.'
    );
    renderNotFound();
    renderContact();
    renderFooter();
    setupReveal();
    return;
  }

  applySeo(
    `${caseStudy.title} | ${content.profile.name}`,
    caseStudy.subtitle,
    caseStudy.title,
    caseStudy.subtitle
  );
  renderCaseHero(caseStudy, caseId);
  renderCaseContext(caseStudy, caseId);
  renderCaseGallery(caseStudy, caseId);
  renderCaseApproach(caseStudy, caseId);
  renderCaseDecisions(caseStudy, caseId);
  renderCaseOutcomes(caseStudy, caseId);
  renderContact();
  renderFooter();
  setupReveal();
  setupLightbox();
}

init();
