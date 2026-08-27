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
  const heroVideoSource = document.getElementById('heroVideoSource');
  const heroVideo = document.getElementById('heroVideo');
  if (heroVideoSource && data.media?.heroVideoUrl && heroVideoSource.src !== data.media.heroVideoUrl) {
    heroVideoSource.src = data.media.heroVideoUrl;
    if (heroVideo) heroVideo.load();
  }
  if (heroVideo && data.media?.heroPosterUrl) heroVideo.poster = data.media.heroPosterUrl;
  if (heroVideo && data.media?.heroVideoPosition) heroVideo.style.objectPosition = data.media.heroVideoPosition;

  const pressPhoto = document.getElementById('pressPhoto');
  if (pressPhoto && data.media?.pressPhotoUrl) pressPhoto.src = data.media.pressPhotoUrl;
  if (pressPhoto && data.media?.pressPhotoPosition) pressPhoto.style.objectPosition = data.media.pressPhotoPosition;

  const logoUrl = data.media?.logoUrl;
  document.querySelectorAll('.logo').forEach((el) => {
    const img = el.querySelector('.logo-img');
    const text = el.querySelector('.logo-text');
    if (!img) return;
    if (logoUrl) {
      img.src = logoUrl;
      img.classList.add('visible');
      text?.classList.add('hidden');
    } else {
      img.classList.remove('visible');
      text?.classList.remove('hidden');
    }
  });

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
        <div class="merch-photo"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>
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

  wireMixRows();
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
