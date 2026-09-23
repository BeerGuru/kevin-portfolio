function renderHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.innerHTML = `
    ${content.hero.eyebrow ? `<p class="eyebrow" data-edit="hero.eyebrow">${escapeHtml(content.hero.eyebrow)}</p>` : ''}
    <h1 data-edit="hero.headline">${escapeHtml(content.hero.headline)}</h1>
    ${content.hero.subhead ? `<p class="hero-copy" data-edit="hero.subhead">${escapeHtml(content.hero.subhead)}</p>` : ''}
  `;
}

function renderWork() {
  const work = document.getElementById('work');
  if (!work) return;

  const cases = (content.work.cases || []).map((item) => {
    if (typeof item === 'string') {
      const meta = content.caseStudies[item];
      if (!meta) return null;
      return {
        id: item,
        tag: '',
        title: meta.title,
        challenge: meta.challenge || meta.problem || meta.context || '',
        bullets: Array.isArray(meta.outcomes) ? meta.outcomes.slice(0, 3) : [],
        href: `case-study.html?case=${encodeURIComponent(item)}`,
      };
    }
    return item;
  }).filter(Boolean);

  const featuredIndex = cases.length > 3 ? cases.length - 1 : null;

  work.innerHTML = `
    <div class="work-intro-block">
      <p class="work-label">Case studies</p>
    </div>
    <div class="card-grid">
      ${cases
        .map(
          (item, index) => {
            const isFeatured = featuredIndex !== null && index === featuredIndex && cases.length > 1;
            const cardClasses = ['case-card'];

            if (isFeatured) cardClasses.push('case-card-featured');

            return `
              <article class="${cardClasses.join(' ')}">
                <h3 data-edit="work.cases[${index}].title">${escapeHtml(item.title)}</h3>
                <p class="case-challenge" data-edit="work.cases[${index}].challenge">${escapeHtml(item.challenge)}</p>
                <ul>
                  ${item.bullets
                    .map(
                      (bullet, bulletIndex) =>
                        `<li data-edit="work.cases[${index}].bullets[${bulletIndex}]">${escapeHtml(bullet)}</li>`
                    )
                    .join('')}
                </ul>
                <a href="${escapeHtml(item.href)}">Read case study</a>
              </article>
            `;
          }
        )
        .join('')}
    </div>
  `;
}

function renderAIWork() {
  const section = document.getElementById('ai-work');
  if (!section) return;

  const phases = Array.isArray(content.aiWork.phases) ? content.aiWork.phases : [];

  section.innerHTML = `
    <div class="section-head ai-work-header">
      <p class="section-kicker" data-edit="aiWork.kicker">${escapeHtml(content.aiWork.kicker)}</p>
      <h2 data-edit="aiWork.heading">${escapeHtml(content.aiWork.heading)}</h2>
      <p class="section-intro" data-edit="aiWork.intro">${escapeHtml(content.aiWork.intro)}</p>
    </div>
    <div class="ai-activity-panel">
      <div class="ai-phase-flow" aria-label="How I use AI across project phases">
        ${phases
          .map(
            (phase, index) => `
              <div class="ai-phase-item ai-phase-${phase.color || 'neutral'}">
                <div class="ai-phase-node" data-edit="aiWork.phases[${index}].label">${escapeHtml(phase.label)}</div>
                ${index < phases.length - 1 ? '<span class="ai-phase-connector" aria-hidden="true"></span>' : ''}
              </div>
            `
          )
          .join('')}
      </div>
      <div class="ai-phase-grid">
        ${phases
          .map(
            (phase, index) => `
              <article class="ai-phase-card">
                <div class="ai-phase-card-header">
                  <span class="ai-phase-dot ai-phase-${phase.color || 'neutral'}"></span>
                  <h3>${escapeHtml(phase.label)}</h3>
                </div>
                <ul>
                  ${phase.examples
                    .map(
                      (example, exampleIndex) =>
                        `<li data-edit="aiWork.phases[${index}].examples[${exampleIndex}]">${escapeHtml(example)}</li>`
                    )
                    .join('')}
                </ul>
              </article>
            `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderWorkingStyle() {
  const section = document.getElementById('working-style');
  if (!section) return;

  const profileSignals = Array.isArray(content.workingStyle.profileSignals)
    ? content.workingStyle.profileSignals
    : [];
  const topStrengths = Array.isArray(content.workingStyle.topStrengths)
    ? content.workingStyle.topStrengths
    : [];
  const collaborationNotes = Array.isArray(content.workingStyle.collaborationNotes)
    ? content.workingStyle.collaborationNotes
    : [];

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker" data-edit="workingStyle.kicker">${escapeHtml(content.workingStyle.kicker)}</p>
      <h2 data-edit="workingStyle.heading">${escapeHtml(content.workingStyle.heading)}</h2>
      <p class="section-intro" data-edit="workingStyle.intro">${escapeHtml(content.workingStyle.intro)}</p>
    </div>
    <h3 class="working-style-subhead">How This Shows Up In My Process</h3>
    <div class="leadership-grid leadership-grid-4">
      ${content.workingStyle.pillars
        .map(
          (item, index) => `
          <article>
            <h3 data-edit="workingStyle.pillars[${index}].title">${escapeHtml(item.title)}</h3>
            <p data-edit="workingStyle.pillars[${index}].body">${escapeHtml(item.body)}</p>
          </article>
        `
        )
        .join('')}
    </div>
    ${
      collaborationNotes.length
        ? `<h3 class="working-style-subhead">How This Shows Up In Collaboration</h3>
    <div class="working-notes">
      <ul>
        ${collaborationNotes
          .map(
            (note, index) =>
              `<li data-edit="workingStyle.collaborationNotes[${index}]">${escapeHtml(note)}</li>`
          )
          .join('')}
      </ul>
    </div>`
        : ''
    }
    <div class="working-style-testimonials-wrap">
      <h3 class="working-style-subhead working-style-testimonial-head">What my partners say about working with me</h3>
      <div class="writing-list">
        ${content.testimonials
          .map(
            (item, index) => `
            <article class="testimonial-card${index >= 3 ? ' testimonial-extra' : ''}"${
              index >= 3 ? ' hidden' : ''
            }>
              <p class="testimonial-quote" data-edit="testimonials[${index}].quote">${escapeHtml(item.quote)}</p>
              <p class="testimonial-attribution" data-edit="testimonials[${index}].attribution">${escapeHtml(item.attribution)}</p>
            </article>
          `
          )
          .join('')}
      </div>
      ${
        content.testimonials.length > 3
          ? `<div class="testimonials-toggle-wrap"><button type="button" class="btn btn-ghost testimonials-toggle" id="testimonials-toggle" aria-expanded="false"><span class="toggle-label">Show more</span><span class="toggle-caret" aria-hidden="true">▾</span></button></div>`
          : ''
      }
    </div>
    ${
      profileSignals.length
        ? `<div class="profile-signal-grid">
      ${profileSignals
        .map(
          (item, index) => `
          <article class="profile-signal-card">
            <p class="profile-signal-label" data-edit="workingStyle.profileSignals[${index}].label">${escapeHtml(item.label)}</p>
            <h3 data-edit="workingStyle.profileSignals[${index}].value">${escapeHtml(item.value)}</h3>
            <p data-edit="workingStyle.profileSignals[${index}].note">${escapeHtml(item.note)}</p>
          </article>
        `
        )
        .join('')}
    </div>`
        : ''
    }
    ${
      topStrengths.length
        ? `<div class="strengths-wrap" aria-label="Top strengths">
      <p class="strengths-title">Top CliftonStrengths</p>
      <div class="strength-chips">
        ${topStrengths
          .map(
            (strength, index) =>
              `<span class="strength-chip" data-edit="workingStyle.topStrengths[${index}]">${escapeHtml(strength)}</span>`
          )
          .join('')}
      </div>
    </div>`
        : ''
    }
  `;
}

function renderTestimonials() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  section.innerHTML = '';
  section.hidden = true;
}

function setupAiNote() {
  const noteButton = document.querySelector('.header-note');
  const notePopover = document.getElementById('ai-note-popover');

  if (!noteButton || !notePopover) return;

  const setNoteState = (isOpen) => {
    noteButton.setAttribute('aria-expanded', String(isOpen));
    notePopover.hidden = !isOpen;
  };

  noteButton.addEventListener('click', () => {
    const shouldOpen = noteButton.getAttribute('aria-expanded') !== 'true';
    setNoteState(shouldOpen);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;

    if (!noteButton.contains(target) && !notePopover.contains(target)) {
      setNoteState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setNoteState(false);
    }
  });
}

function init() {
  applyFontTheme();
  applyColorTheme();
  applySeo(content.seo.title, content.seo.description, content.seo.ogTitle, content.seo.ogDescription);
  renderHeader();
  renderVariantSelector();
  setupAiNote();
  renderHero();
  renderWork();
  renderAIWork();
  renderWorkingStyle();
  renderTestimonials();
  renderContact();
  renderFooter();
  setupReveal();
}

init();
