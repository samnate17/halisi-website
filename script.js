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

// Applies a focal-point position and zoom to an <img>/<video> — shared by
// hero media, press photo, merch photos, and event covers.
function applyFocal(el, position, zoom) {
  if (!el) return;
  const pos = position || '50% 50%';
  const z = Number(zoom) || 1;
  el.style.objectPosition = pos;
  el.style.transformOrigin = pos;
  el.style.transform = z !== 1 ? `scale(${z})` : '';
  el.classList.toggle('is-zoomed', z !== 1);
}

function focalStyleAttr(position, zoom) {
  const pos = position || '50% 50%';
  const z = Number(zoom) || 1;
  return `object-position:${pos};transform-origin:${pos};${z !== 1 ? `transform:scale(${z});` : ''}`;
}

// Optional full-page background media (image or video), set from the admin
// panel. Video vs. image is inferred from the file extension.
function applySiteBackground(media) {
  const siteBg = document.getElementById('siteBg');
  const siteBgMedia = document.getElementById('siteBgMedia');
  const siteBgOverlay = document.getElementById('siteBgOverlay');
  if (!siteBg || !siteBgMedia || !siteBgOverlay) return;

  const url = media?.siteBackgroundUrl;
  if (!url) {
    siteBgMedia.innerHTML = '';
    siteBg.classList.remove('is-active');
    document.body.classList.remove('has-site-bg');
    return;
  }

  const isVideo = /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
  const pos = media.siteBackgroundPosition || '50% 50%';
  const zoom = Number(media.siteBackgroundZoom) || 1;
  const styleAttr = `object-position:${pos};transform-origin:${pos};transform:scale(${zoom})`;

  if (siteBgMedia.dataset.url !== url) {
    siteBgMedia.dataset.url = url;
    siteBgMedia.innerHTML = isVideo
      ? `<video autoplay muted loop playsinline style="${styleAttr}"><source src="${escapeHtml(url)}"></video>`
      : `<img src="${escapeHtml(url)}" alt="" style="${styleAttr}">`;
    if (isVideo) {
      const v = siteBgMedia.querySelector('video');
      if (v && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        v.muted = true;
        v.play().catch(() => {});
      }
    }
  } else {
    const el = siteBgMedia.querySelector('img, video');
    if (el) el.setAttribute('style', styleAttr);
  }

  const overlay = media.siteBackgroundOverlay != null ? Number(media.siteBackgroundOverlay) : 0.55;
  siteBgOverlay.style.opacity = String(overlay);
  siteBg.classList.add('is-active');
  document.body.classList.add('has-site-bg');
}

// Optional looping background audio, set from the admin panel. Starts muted/
// paused — browsers block audible autoplay, and a visitor should choose to
// turn it on — the speaker button (wired once, below) toggles it.
function applyHomepageAudio(media) {
  const audio = document.getElementById('homepageAudio');
  const toggle = document.getElementById('audioToggle');
  if (!audio || !toggle) return;

  const url = media?.homepageAudioUrl;
  if (!url) {
    toggle.hidden = true;
    toggle.classList.remove('is-playing');
    audio.pause();
    audio.removeAttribute('src');
    delete audio.dataset.src;
    return;
  }

  if (audio.dataset.src !== url) {
    const wasPlaying = !audio.paused;
    audio.dataset.src = url;
    audio.src = url;
    if (wasPlaying) audio.play().catch(() => {});
  }
  toggle.hidden = false;
}

function renderContent(data) {
  applySiteBackground(data.media || {});
  applyHomepageAudio(data.media || {});
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
      // Setting `.muted` as a property (not just relying on the HTML attribute)
      // is what Chrome/Safari's own autoplay-policy docs recommend for a
      // programmatic play() call to reliably bypass autoplay restrictions.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        heroVideo.muted = true;
        heroVideo.play().catch(() => {});
      }
    }
  }
  if (heroVideo && data.media?.heroPosterUrl) heroVideo.poster = data.media.heroPosterUrl;
  applyFocal(heroVideo, data.media?.heroVideoPosition, data.media?.heroVideoZoom);

  const pressPhoto = document.getElementById('pressPhoto');
  if (pressPhoto && data.media?.pressPhotoUrl) pressPhoto.src = data.media.pressPhotoUrl;
  applyFocal(pressPhoto, data.media?.pressPhotoPosition, data.media?.pressPhotoZoom);

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
      <div class="list-row${ev.imageUrl ? ' has-thumb' : ''}">
        <span class="list-date">${escapeHtml(ev.day)} ${escapeHtml(ev.month)}</span>
        <span class="list-title">${escapeHtml(ev.title)}</span>
        <span class="list-meta">${escapeHtml(ev.venue)}</span>
        ${ev.imageUrl ? `<span class="list-thumb-wrap"><img class="list-thumb" src="${escapeHtml(ev.imageUrl)}" alt="" style="${focalStyleAttr(ev.imagePosition, ev.imageZoom)}"></span>` : ''}
        <a href="${escapeHtml(ev.ticketUrl || '#')}" class="list-link">tickets</a>
      </div>
    `).join('');
  }

  const merchGrid = document.getElementById('merchGrid');
  if (merchGrid && Array.isArray(data.merch)) {
    merchGrid.innerHTML = data.merch.map((item) => `
      <article class="merch-item">
        <div class="merch-photo"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" style="${focalStyleAttr(item.imagePosition, item.imageZoom)}"></div>
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

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const eventType = document.getElementById('eventType').value;
  const eventDate = document.getElementById('eventDate').value;
  const message = document.getElementById('message').value;

  // Send via the visitor's own email app rather than a backend —
  // targets whatever booking email is currently set in content.json.
  const bookingEmailAddr = document.getElementById('bookingEmail').href.replace(/^mailto:/, '');
  const subject = `Booking inquiry — ${eventType}${eventDate ? ' on ' + eventDate : ''}`;
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Event type: ${eventType}`,
    `Event date: ${eventDate || 'Not specified'}`,
    '',
    'Details:',
    message
  ].join('\n');
  window.location.href = `mailto:${bookingEmailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  formStatus.textContent = "Opening your email app with this inquiry pre-filled — hit send there to complete it.";
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

// Homepage background-audio toggle
const audioToggle = document.getElementById('audioToggle');
const homepageAudio = document.getElementById('homepageAudio');
audioToggle?.addEventListener('click', () => {
  if (!homepageAudio.src) return;
  if (homepageAudio.paused) {
    audioToggle.classList.add('is-playing');
    homepageAudio.play().catch(() => { audioToggle.classList.remove('is-playing'); });
  } else {
    homepageAudio.pause();
    audioToggle.classList.remove('is-playing');
  }
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
