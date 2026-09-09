function renderHero() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.innerHTML = `
    ${content.hero.eyebrow ? `<p class="eyebrow" data-edit="hero.eyebrow">${escapeHtml(content.hero.eyebrow)}</p>` : ''}
    <h1 data-edit="hero.headline">${escapeHtml(content.hero.headline)}</h1>
    <p class="hero-copy" data-edit="hero.subhead">${escapeHtml(content.hero.subhead)}</p>
  `;
}

function renderWork() {
  const work = document.getElementById('work');
  if (!work) return;

  work.innerHTML = `
    <div class="work-intro-block">
      <p class="work-label">Case studies</p>
    </div>
    <div class="card-grid">
      ${content.work.cases
        .map(
          (item, index) => `
          <article class="case-card">
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
        `
        )
        .join('')}
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
  `;
}

function renderTestimonials() {
  const section = document.getElementById('testimonials');
  if (!section) return;

  const VISIBLE_COUNT = 3;
  const hasMore = content.testimonials.length > VISIBLE_COUNT;

  section.innerHTML = `
    <div class="section-head">
      <p class="section-kicker">Partner Feedback</p>
      <h2>Signals from cross-functional collaboration.</h2>
    </div>
    <div class="writing-list">
      ${content.testimonials
        .map(
          (item, index) => `
          <article class="testimonial-card${index >= VISIBLE_COUNT ? ' testimonial-extra' : ''}"${
            index >= VISIBLE_COUNT ? ' hidden' : ''
          }>
            <p class="testimonial-quote" data-edit="testimonials[${index}].quote">${escapeHtml(item.quote)}</p>
            <p class="testimonial-attribution" data-edit="testimonials[${index}].attribution">${escapeHtml(item.attribution)}</p>
          </article>
        `
        )
        .join('')}
    </div>
    ${
      hasMore
        ? `<div class="testimonials-toggle-wrap"><button type="button" class="btn btn-ghost testimonials-toggle" id="testimonials-toggle">Show more feedback</button></div>`
        : ''
    }
  `;

  const toggleButton = document.getElementById('testimonials-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const extras = section.querySelectorAll('.testimonial-extra');
      const expanded = toggleButton.getAttribute('aria-expanded') === 'true';
      extras.forEach((el) => {
        if (expanded) {
          el.setAttribute('hidden', '');
        } else {
          el.removeAttribute('hidden');
        }
      });
      toggleButton.setAttribute('aria-expanded', String(!expanded));
      toggleButton.textContent = expanded ? 'Show more feedback' : 'Show less';
    });
  }
}

function init() {
  applySeo(content.seo.title, content.seo.description, content.seo.ogTitle, content.seo.ogDescription);
  renderHeader();
  renderHero();
  renderWork();
  renderWorkingStyle();
  renderTestimonials();
  renderContact();
  renderFooter();
  setupReveal();
}

init();
