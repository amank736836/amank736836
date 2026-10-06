(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // Reveal content as it enters the viewport. If IO is unavailable, keep everything visible.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Top reading progress, updated once per paint rather than on every scroll event.
  const progress = document.querySelector('.scroll-progress');
  let scrollQueued = false;
  const updateScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
    scrollQueued = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      window.requestAnimationFrame(updateScrollProgress);
      scrollQueued = true;
    }
  }, { passive: true });
  updateScrollProgress();

  // Small-screen navigation: keyboard, outside-click, and link selection all close the menu.
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#primary-navigation');
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (document.body.classList.contains('menu-open') &&
        !navigation.contains(event.target) &&
        !menuButton.contains(event.target)) {
      closeMenu();
    }
  });

  window.matchMedia('(min-width: 821px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });

  // Mark the section currently in view in the compact header navigation.
  const sectionLinks = [...document.querySelectorAll('.nav-link')];
  const observedSections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;

      sectionLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${current.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, { threshold: [0.15, 0.35, 0.6], rootMargin: '-20% 0px -58% 0px' });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  // Restrained pointer tilt adds depth to the hero illustration on mouse/trackpad devices.
  const heroVisual = document.querySelector('[data-tilt]');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (heroVisual && finePointer && !reducedMotion) {
    const stage = heroVisual.querySelector('.visual-stage');
    heroVisual.addEventListener('pointermove', (event) => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      stage.style.setProperty('--tilt-x', `${(x - 0.5) * 4}deg`);
      stage.style.setProperty('--tilt-y', `${(0.5 - y) * 4}deg`);
    });
    heroVisual.addEventListener('pointerleave', () => {
      stage.style.setProperty('--tilt-x', '0deg');
      stage.style.setProperty('--tilt-y', '0deg');
    });
  }

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
