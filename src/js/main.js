/* INÍCIO: Estado do cabeçalho e menu móvel */
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.classList.remove('is-open');
  document.body.style.overflow = '';
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  mobileMenu.classList.toggle('is-open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
/* FIM: Estado do cabeçalho e menu móvel */

/* INÍCIO: Revelação suave das seções */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => observer.observe(element));
}
/* FIM: Revelação suave das seções */

/* INÍCIO: Ano automático do rodapé */
document.querySelector('[data-year]').textContent = new Date().getFullYear();
/* FIM: Ano automático do rodapé */

/* INÍCIO: Revelação gradual dos vídeos (hero e destaques de projeto) */
const revealVideos = document.querySelectorAll('[data-reveal-video]');

revealVideos.forEach((videoEl) => {
  if (reducedMotion) return;

  const revealVideo = () => {
    requestAnimationFrame(() => {
      setTimeout(() => videoEl.classList.add('is-visible'), 500);
    });
  };

  if (videoEl.readyState >= 2) {
    revealVideo();
  } else {
    videoEl.addEventListener('canplay', revealVideo, { once: true });
  }

  videoEl.play().catch(() => {
    /* autoplay pode ser bloqueado até haver interação; a imagem por trás permanece visível */
  });
});
/* FIM: Revelação gradual dos vídeos (hero e destaques de projeto) */

/* INÍCIO: Carrossel de projetos */
const gallery = document.querySelector('[data-gallery]');

if (gallery) {
  const track = gallery.querySelector('[data-gallery-track]');
  const slides = Array.from(gallery.querySelectorAll('.project-gallery-slide'));
  const prevButton = gallery.querySelector('[data-gallery-prev]');
  const nextButton = gallery.querySelector('[data-gallery-next]');
  const currentLabel = gallery.querySelector('[data-gallery-current]');
  const totalLabel = gallery.querySelector('[data-gallery-total]');

  const pad = (n) => String(n).padStart(2, '0');
  totalLabel.textContent = pad(slides.length);

  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    slides[clamped].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
  };

  const updateFromScroll = () => {
    const trackRect = track.getBoundingClientRect();
    let closestIndex = 0;
    let closestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentLabel.textContent = pad(closestIndex + 1);
    prevButton.disabled = closestIndex === 0;
    nextButton.disabled = closestIndex === slides.length - 1;

    return closestIndex;
  };

  let scrollTimeout;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateFromScroll, 90);
    },
    { passive: true },
  );

  prevButton.addEventListener('click', () => goTo(updateFromScroll() - 1));
  nextButton.addEventListener('click', () => goTo(updateFromScroll() + 1));

  updateFromScroll();
}
/* FIM: Carrossel de projetos */

/* INÍCIO: Comparador antes / depois */
document.querySelectorAll('[data-compare]').forEach((compare) => {
  const range = compare.querySelector('.compare-range');
  if (!range) return;

  const setPosition = (value) => {
    const clamped = Math.min(100, Math.max(0, value));
    compare.style.setProperty('--pos', `${clamped}%`);
    range.value = clamped;
  };

  const updateFromClientX = (clientX) => {
    const rect = compare.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(ratio);
  };

  let dragging = false;

  /* arraste a partir de qualquer ponto do card, sem precisar acertar a linha/foto */
  compare.addEventListener('pointerdown', (event) => {
    dragging = true;
    compare.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  });

  compare.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    updateFromClientX(event.clientX);
  });

  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    if (compare.hasPointerCapture(event.pointerId)) {
      compare.releasePointerCapture(event.pointerId);
    }
  };

  compare.addEventListener('pointerup', stopDragging);
  compare.addEventListener('pointercancel', stopDragging);

  /* mantém suporte a teclado (setas ←/→) através do input escondido */
  range.addEventListener('input', () => setPosition(range.value));

  setPosition(range.value);
});
/* FIM: Comparador antes / depois */
