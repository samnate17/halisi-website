// Pause the hero video for users who prefer reduced motion
const heroVideo = document.querySelector('.hero-photo');
if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroVideo.pause();
  heroVideo.removeAttribute('autoplay');
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Header shadow on scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.style.borderBottomColor = window.scrollY > 10
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(255,255,255,0.06)';
});

// Mix "play" demo state (visual only — wire up real audio/embeds later)
function wireMixRows() {
  const mixRows = document.querySelectorAll('[data-mix]');
  mixRows.forEach((row) => {
    row.addEventListener('click', () => {
      const wasPlaying = row.classList.contains('playing');
      mixRows.forEach((r) => r.classList.remove('playing'));
      if (!wasPlaying) row.classList.add('playing');
    });
  });
}

// Render site content from content.json (edited via /admin)
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function renderContent(data) {
  const root = document.documentElement.style;
  if (data.design?.fontHeading) root.setProperty('--font-heading', `'${data.design.fontHeading}', sans-serif`);
  if (data.design?.fontBody) root.setProperty('--font-body', `'${data.design.fontBody}', sans-serif`);
  if (data.design?.accentColor) root.setProperty('--accent', data.design.accentColor);
  if (data.design?.accentColor2) root.setProperty('--accent-2', data.design.accentColor2);

  const heroVideoSource = document.getElementById('heroVideoSource');
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideoSource && data.media?.heroVideoUrl && heroVideoSource.src !== data.media.heroVideoUrl) {
    heroVideoSource.src = data.media.heroVideoUrl;
    if (heroVideo) {
      heroVideo.load();
      // Calling .load() resets the element, and browsers don't re-honor the
      // `autoplay` attribute after that — it has to be requested explicitly.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        heroVideo.play().catch(() => {});
      }
    }
  }
  if (heroVideo && data.media?.heroPosterUrl) heroVideo.poster = data.media.heroPosterUrl;
  if (heroVideo && data.media?.heroVideoPosition) heroVideo.style.objectPosition = data.media.heroVideoPosition;

  const pressPhoto = document.getElementById('pressPhoto');
  if (pressPhoto && data.media?.pressPhotoUrl) pressPhoto.src = data.media.pressPhotoUrl;
  if (pressPhoto && data.media?.pressPhotoPosition) pressPhoto.style.objectPosition = data.media.pressPhotoPosition;

  const heroTagline = document.getElementById('heroTagline');
  if (heroTagline && data.bio?.tagline) heroTagline.textContent = data.bio.tagline;

  const bioText = document.getElementById('bioText');
  if (bioText && data.bio?.text) bioText.textContent = data.bio.text;

  const yearsActive = document.getElementById('yearsActive');
  if (yearsActive && data.bio?.yearsActive != null) yearsActive.textContent = data.bio.yearsActive;

  const mixesList = document.getElementById('mixesList');
  if (mixesList && Array.isArray(data.mixes)) {
    mixesList.innerHTML = data.mixes.map((mix) => `
      <article class="list-row" data-mix>
        <button class="play-dot" aria-label="Play mix"></button>
        <span class="list-title">${escapeHtml(mix.title)}</span>
        <span class="list-meta">${escapeHtml(mix.genre)}</span>
        <span class="list-meta">${escapeHtml(mix.duration)}</span>
        <a href="${escapeHtml(mix.listenUrl || '#')}" class="list-link" target="_blank" rel="noopener">listen</a>
      </article>
    `).join('');
  }

  const eventsList = document.getElementById('eventsList');
  if (eventsList && Array.isArray(data.events)) {
    eventsList.innerHTML = data.events.map((ev) => `
      <div class="list-row">
        <span class="list-date">${escapeHtml(ev.day)} ${escapeHtml(ev.month)}</span>
        <span class="list-title">${escapeHtml(ev.title)}</span>
        <span class="list-meta">${escapeHtml(ev.venue)}</span>
        <a href="${escapeHtml(ev.ticketUrl || '#')}" class="list-link">tickets</a>
      </div>
    `).join('');
  }

  const merchGrid = document.getElementById('merchGrid');
  if (merchGrid && Array.isArray(data.merch)) {
    merchGrid.innerHTML = data.merch.map((item) => `
      <article class="merch-item">
        <div class="merch-photo"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" style="object-position:${escapeHtml(item.imagePosition || '50% 50%')}"></div>
        <div class="merch-info">
          <span class="merch-name">${escapeHtml(item.name)}</span>
          <span class="merch-price">${escapeHtml(item.price)}</span>
        </div>
        <a href="${escapeHtml(item.buyUrl || '#')}" class="list-link">buy</a>
      </article>
    `).join('');
  }

  const bookingBlurb = document.getElementById('bookingBlurb');
  if (bookingBlurb && data.booking?.blurb) bookingBlurb.textContent = data.booking.blurb;

  const bookingEmail = document.getElementById('bookingEmail');
  if (bookingEmail && data.booking?.email) {
    bookingEmail.textContent = data.booking.email;
    bookingEmail.href = `mailto:${data.booking.email}`;
  }

  const socialYoutube = document.getElementById('socialYoutube');
  if (socialYoutube && data.socials?.youtubeUrl) socialYoutube.href = data.socials.youtubeUrl;

  const socialInstagram = document.getElementById('socialInstagram');
  if (socialInstagram && data.socials?.instagramUrl) socialInstagram.href = data.socials.instagramUrl;

  const socialFacebook = document.getElementById('socialFacebook');
  if (socialFacebook && data.socials?.facebookUrl) socialFacebook.href = data.socials.facebookUrl;

  const socialMixcloud = document.getElementById('socialMixcloud');
  if (socialMixcloud && data.socials?.mixcloudUrl) socialMixcloud.href = data.socials.mixcloudUrl;

  const socialSoundcloud = document.getElementById('socialSoundcloud');
  if (socialSoundcloud && data.socials?.soundcloudUrl) socialSoundcloud.href = data.socials.soundcloudUrl;

  unavailableDatesCache = Array.isArray(data.unavailableDates) ? data.unavailableDates : [];
  renderCalendar();

  wireMixRows();
}

// Availability calendar
let unavailableDatesCache = [];
let calendarMonthOffset = 0;

function renderCalendar() {
  const container = document.getElementById('availabilityCalendar');
  if (!container) return;

  const unavailSet = new Set(unavailableDatesCache.map((d) => d.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewDate = new Date(today.getFullYear(), today.getMonth() + calendarMonthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('en-US', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-cell cal-empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isPast = dateObj < today;
    const isUnavailable = unavailSet.has(iso);
    let cls = 'cal-cell';
    if (isPast) cls += ' cal-past';
    else if (isUnavailable) cls += ' cal-booked';
    else cls += ' cal-open';
    cells += `<div class="${cls}" data-date="${iso}">${d}</div>`;
  }

  container.innerHTML = `
    <div class="cal-header">
      <button type="button" class="cal-nav" id="calPrev" aria-label="Previous month" ${calendarMonthOffset <= 0 ? 'disabled' : ''}>&larr;</button>
      <span class="cal-month">${monthName} ${year}</span>
      <button type="button" class="cal-nav" id="calNext" aria-label="Next month" ${calendarMonthOffset >= 11 ? 'disabled' : ''}>&rarr;</button>
    </div>
    <div class="cal-weekdays"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-legend">
      <span class="cal-legend-item"><i class="cal-dot cal-dot-open"></i> Available</span>
      <span class="cal-legend-item"><i class="cal-dot cal-dot-booked"></i> Booked</span>
    </div>
  `;

  document.getElementById('calPrev')?.addEventListener('click', () => {
    if (calendarMonthOffset > 0) { calendarMonthOffset--; renderCalendar(); }
  });
  document.getElementById('calNext')?.addEventListener('click', () => {
    if (calendarMonthOffset < 11) { calendarMonthOffset++; renderCalendar(); }
  });
  container.querySelectorAll('.cal-open').forEach((cell) => {
    cell.addEventListener('click', () => {
      const dateInput = document.getElementById('eventDate');
      if (dateInput) {
        dateInput.value = cell.dataset.date;
        dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

fetch('content.json')
  .then((res) => res.json())
  .then(renderContent)
  .catch((err) => console.error('Could not load content.json', err));

// Booking form (front-end only demo — replace with real submit handler)
const bookingForm = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }
  formStatus.textContent = "Thanks! Your inquiry has been noted — connect a real form backend (e.g. Formspree, Netlify Forms) to receive these by email.";
  bookingForm.reset();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Dark / light theme toggle
const THEME_KEY = 'halisi-theme';
const themeToggle = document.getElementById('themeToggle');

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function updateThemeLabel() {
  if (themeToggle) themeToggle.textContent = currentTheme() === 'dark' ? 'light' : 'dark';
}

updateThemeLabel();

themeToggle?.addEventListener('click', () => {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  updateThemeLabel();
});

// Scroll-reveal for sections
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}
